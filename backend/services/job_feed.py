from datetime import datetime, timezone
import asyncio
import hashlib
import re
from typing import Any

import httpx

from services.cache import cache_get, cache_set

REMOTIVE_URL = "https://remotive.com/api/remote-jobs"
ARBEITNOW_URL = "https://www.arbeitnow.com/api/job-board-api"
REMOTEOK_URL = "https://remoteok.com/api"
JOB_CACHE_TTL_SECONDS = 900


def _infer_job_type(title: str, description: str) -> str:
    text = f"{title} {description}".lower()
    if "intern" in text:
        return "Internship"
    if "contract" in text or "freelance" in text:
        return "Contract"
    if "part-time" in text or "part time" in text:
        return "Part-time"
    if "full-time" in text or "full time" in text:
        return "Full-time"
    return "Remote"


def _clean_text(value: str) -> str:
    return re.sub(r"<[^>]+>", " ", value or "").strip()


def _stable_id(source: str, value: Any) -> int:
    digest = hashlib.sha256(f"{source}:{value}".encode()).hexdigest()[:12]
    return int(digest, 16)


def _job_id(source: str, value: Any) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return _stable_id(source, value)


def _dedupe_key(job: dict[str, Any]) -> str:
    company = re.sub(r"\W+", "", (job.get("company_name") or "").lower())
    title = re.sub(r"\W+", "", (job.get("job_title") or "").lower())
    return f"{company}:{title}"


def _matches_query(job: dict[str, Any], query: str) -> bool:
    if not query:
        return True
    words = [word for word in query.lower().split() if len(word) > 2]
    haystack = f"{job.get('job_title', '')} {job.get('company_name', '')} {_clean_text(job.get('description', ''))}".lower()
    return not words or any(word in haystack for word in words)


def _score_job(job: dict[str, Any], skills: list[str], preferred_role: str | None) -> int:
    haystack = f"{job.get('job_title', '')} {_clean_text(job.get('description', ''))}".lower()
    normalized_skills = [skill.strip().lower() for skill in skills if skill.strip()]
    matched_skills = sum(1 for skill in normalized_skills if skill in haystack)
    skill_score = int((matched_skills / len(normalized_skills)) * 45) if normalized_skills else 20

    role_score = 20
    if preferred_role:
        role_words = [word for word in preferred_role.lower().split() if len(word) > 2]
        role_score = 35 if any(word in haystack for word in role_words) else 15

    freshness_score = 15 if job.get("published_at") else 10
    return max(35, min(98, skill_score + role_score + freshness_score + 20))


async def _fetch_remotive(client: httpx.AsyncClient, limit: int, query: str) -> list[dict[str, Any]]:
    params = {"category": "software-dev", "limit": limit}
    if query:
        params["search"] = query

    response = await client.get(REMOTIVE_URL, params=params)
    response.raise_for_status()
    payload = response.json()

    jobs = []
    for item in payload.get("jobs", [])[:limit]:
        title = item.get("title") or "Untitled role"
        description = item.get("description") or ""
        jobs.append({
            "id": _job_id("Remotive", item.get("id") or item.get("url") or title),
            "job_title": title,
            "description": description,
            "location": item.get("candidate_required_location") or "Remote",
            "apply_link": item.get("url") or "#",
            "company_name": item.get("company_name") or "Unknown company",
            "published_at": item.get("publication_date"),
            "job_type": _infer_job_type(title, description),
            "source": "Remotive",
        })
    return jobs


async def _fetch_arbeitnow(client: httpx.AsyncClient, limit: int, query: str) -> list[dict[str, Any]]:
    response = await client.get(ARBEITNOW_URL)
    response.raise_for_status()
    payload = response.json()

    jobs = []
    for item in payload.get("data", []):
        title = item.get("title") or "Untitled role"
        description = item.get("description") or ""
        job_type = ", ".join(item.get("job_types") or []) or _infer_job_type(title, description)
        mapped = {
            "id": _job_id("Arbeitnow", item.get("slug") or item.get("url") or title),
            "job_title": title,
            "description": description,
            "location": item.get("location") or "Remote",
            "apply_link": item.get("url") or "#",
            "company_name": item.get("company_name") or "Unknown company",
            "published_at": item.get("created_at"),
            "job_type": job_type.title() if job_type else "Remote",
            "source": "Arbeitnow",
        }
        if _matches_query(mapped, query):
            jobs.append(mapped)
        if len(jobs) >= limit:
            break
    return jobs


async def _fetch_remoteok(client: httpx.AsyncClient, limit: int, query: str) -> list[dict[str, Any]]:
    response = await client.get(REMOTEOK_URL, headers={"User-Agent": "CypherdonJobAggregator/1.0"})
    response.raise_for_status()
    payload = response.json()

    jobs = []
    for item in payload:
        if not isinstance(item, dict) or "position" not in item:
            continue
        title = item.get("position") or "Untitled role"
        description = item.get("description") or ""
        mapped = {
            "id": _job_id("RemoteOK", item.get("id") or item.get("url") or title),
            "job_title": title,
            "description": description,
            "location": item.get("location") or "Remote",
            "apply_link": item.get("url") or "#",
            "company_name": item.get("company") or "Unknown company",
            "published_at": item.get("date"),
            "job_type": _infer_job_type(title, description),
            "source": "RemoteOK",
        }
        if _matches_query(mapped, query):
            jobs.append(mapped)
        if len(jobs) >= limit:
            break
    return jobs


async def _fetch_source(name: str, fetcher: Any, client: httpx.AsyncClient, limit: int, query: str) -> tuple[str, list[dict[str, Any]]]:
    try:
        return name, await fetcher(client, limit, query)
    except Exception:
        return name, []


async def fetch_live_jobs(
    limit: int = 30,
    search: str | None = None,
    skills: list[str] | None = None,
    preferred_role: str | None = None,
    force_refresh: bool = False,
) -> dict[str, Any]:
    query = {
        "limit": max(1, min(limit, 50)),
        "search": (search or preferred_role or "").strip(),
    }
    cache_key = {"source": "multi", **query, "skills": skills or [], "role": preferred_role or ""}

    if not force_refresh:
        cached = await cache_get("live_jobs", cache_key)
        if cached:
            return cached

    per_source_limit = max(query["limit"], 20)
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        source_results = await asyncio.gather(
            _fetch_source("Remotive", _fetch_remotive, client, per_source_limit, query["search"]),
            _fetch_source("Arbeitnow", _fetch_arbeitnow, client, per_source_limit, query["search"]),
            _fetch_source("RemoteOK", _fetch_remoteok, client, per_source_limit, query["search"]),
        )

    deduped: dict[str, dict[str, Any]] = {}
    source_counts: dict[str, int] = {}
    for source_name, source_jobs in source_results:
        source_counts[source_name] = len(source_jobs)
        for job in source_jobs:
            key = _dedupe_key(job)
            if key and key in deduped:
                continue
            job["match_score"] = _score_job(job, skills or [], preferred_role)
            deduped[key or f"{job['source']}:{job['id']}"] = job

    jobs = sorted(
        deduped.values(),
        key=lambda item: (item.get("match_score") or 0, str(item.get("published_at") or "")),
        reverse=True,
    )[: query["limit"]]

    active_sources = [source for source, count in source_counts.items() if count > 0]

    result = {
        "jobs": jobs,
        "source": ", ".join(active_sources) if active_sources else "No live source available",
        "sources": source_counts,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "refresh_after_seconds": JOB_CACHE_TTL_SECONDS,
    }
    await cache_set("live_jobs", cache_key, result, ttl=JOB_CACHE_TTL_SECONDS)
    return result
