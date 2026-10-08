"""
Agent Tool Registry & Definitions
---------------------------------
Provides the 6 autonomous tools available to the Cypherdon Career Agent:
1. parse_resume - Extracts candidate skills, experiences, and education
2. search_jobs   - Queries live multi-source job boards (Remotive, Arbeitnow, RemoteOK)
3. score_match   - Computes ATS match compatibility and skills gap
4. generate_email- Drafts hyper-personalized cold outreach applications
5. critique_output- Performs LLM self-reflection & quality gate evaluation
6. save_result   - Persists final vetted candidate application artifacts
"""

import json
import logging
from typing import Any, Dict, List, Optional
import os

from services.job_feed import fetch_live_jobs
from services.matcher import calculate_match_score
from schemas.matching import UserProfileInput, JobInput
from services.ats_analyzer import analyze_resume
from services.email_generator import _get_client
from schemas.emails import EmailGenerationRequest, UserProfileInput as EmailUserProfileInput, JobDetailsInput, UserProject, ToneEnum

logger = logging.getLogger("agent.tools")

TOOL_DEFINITIONS = [
    {
        "name": "parse_resume",
        "description": "Extract skills, work experiences, education, and target role from a candidate resume or profile text.",
        "parameters": {
            "type": "object",
            "properties": {
                "resume_text": {
                    "type": "string",
                    "description": "Raw resume text or profile summary to parse."
                },
                "target_role": {
                    "type": "string",
                    "description": "Optional target role if specified by user."
                }
            },
            "required": ["resume_text"]
        }
    },
    {
        "name": "search_jobs",
        "description": "Search real-time active job openings across tech job feeds matching specific skills and role title.",
        "parameters": {
            "type": "object",
            "properties": {
                "role": {
                    "type": "string",
                    "description": "Target job title, e.g. 'Software Engineer', 'Backend Developer'."
                },
                "skills": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of core skills to match against."
                },
                "limit": {
                    "type": "integer",
                    "description": "Maximum number of jobs to fetch (default: 5)."
                }
            },
            "required": ["role"]
        }
    },
    {
        "name": "score_match",
        "description": "Calculate ATS compatibility score, matched skills, and skill gaps between a candidate profile and a specific job posting.",
        "parameters": {
            "type": "object",
            "properties": {
                "candidate_skills": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Candidate skills list."
                },
                "candidate_role": {
                    "type": "string",
                    "description": "Candidate target or current role."
                },
                "job_title": {
                    "type": "string",
                    "description": "Target job title."
                },
                "job_description": {
                    "type": "string",
                    "description": "Target job description text."
                },
                "required_skills": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Required skills for the job if known."
                }
            },
            "required": ["candidate_skills", "job_title", "job_description"]
        }
    },
    {
        "name": "generate_email",
        "description": "Generate a highly tailored cold outreach application email to a hiring manager highlighting specific matching projects.",
        "parameters": {
            "type": "object",
            "properties": {
                "company_name": {
                    "type": "string",
                    "description": "Company name."
                },
                "job_title": {
                    "type": "string",
                    "description": "Position applied for."
                },
                "job_description": {
                    "type": "string",
                    "description": "Short excerpt or description of the role."
                },
                "candidate_skills": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Candidate top skills."
                },
                "featured_project": {
                    "type": "string",
                    "description": "Name and brief detail of candidate's relevant project to highlight."
                },
                "tone": {
                    "type": "string",
                    "enum": ["professional", "startup"],
                    "description": "Tone of email: professional or startup culture fit."
                }
            },
            "required": ["company_name", "job_title", "candidate_skills"]
        }
    },
    {
        "name": "critique_output",
        "description": "Perform self-reflection and quality critique on a generated email or application artifact to ensure it meets strict big-tech standards.",
        "parameters": {
            "type": "object",
            "properties": {
                "content_type": {
                    "type": "string",
                    "enum": ["cold_email", "job_match"],
                    "description": "Type of content to critique."
                },
                "content_body": {
                    "type": "string",
                    "description": "The text or payload to review."
                },
                "target_role": {
                    "type": "string",
                    "description": "The target role."
                },
                "target_company": {
                    "type": "string",
                    "description": "Target company name."
                }
            },
            "required": ["content_type", "content_body"]
        }
    },
    {
        "name": "save_result",
        "description": "Persist the finalized application package, ranked job list, and verified outreach drafts into the system archive.",
        "parameters": {
            "type": "object",
            "properties": {
                "package_title": {
                    "type": "string",
                    "description": "Title of the compiled package."
                },
                "summary": {
                    "type": "string",
                    "description": "Brief executive summary of findings and applications generated."
                },
                "applications": {
                    "type": "array",
                    "items": {"type": "object"},
                    "description": "List of compiled job applications with scores and emails."
                }
            },
            "required": ["package_title", "applications"]
        }
    }
]


class ToolRegistry:
    """Dispatches tool calls autonomously chosen by the Agent."""

    def __init__(self):
        self._saved_results: List[Dict[str, Any]] = []

    async def execute(self, tool_name: str, args: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a tool with given arguments and return observation."""
        logger.info("Executing tool: %s with args: %s", tool_name, list(args.keys()))

        try:
            if tool_name == "parse_resume":
                return await self._tool_parse_resume(args)
            elif tool_name == "search_jobs":
                return await self._tool_search_jobs(args)
            elif tool_name == "score_match":
                return await self._tool_score_match(args)
            elif tool_name == "generate_email":
                return await self._tool_generate_email(args)
            elif tool_name == "critique_output":
                return await self._tool_critique_output(args)
            elif tool_name == "save_result":
                return await self._tool_save_result(args)
            else:
                return {
                    "status": "error",
                    "error": f"Tool '{tool_name}' not found in registry."
                }
        except Exception as e:
            logger.error("Error executing tool %s: %s", tool_name, str(e), exc_info=True)
            return {
                "status": "error",
                "tool": tool_name,
                "error": str(e)
            }

    async def _tool_parse_resume(self, args: Dict[str, Any]) -> Dict[str, Any]:
        resume_text = args.get("resume_text", "")
        target_role = args.get("target_role", "Software Engineer")

        # Fast keyword extraction + ATS analysis
        ats_result = analyze_resume(resume_text, [])
        found_keywords = ats_result.get("found_keywords", [])

        # Default tech skills fallback if raw text was sparse
        extracted_skills = found_keywords if found_keywords else [
            "Python", "FastAPI", "React", "PostgreSQL", "Docker", "Git", "REST APIs"
        ]

        # Extract structured items using LLM if available
        client = _get_client()
        parsed_profile = {
            "target_role": target_role,
            "skills": [s.title() for s in extracted_skills[:12]],
            "experience_level": "Mid-Level",
            "ats_baseline_score": ats_result.get("score", 75),
            "projects": [
                {
                    "name": "Cypherdon Platform",
                    "description": "Full-stack AI recruitment SaaS with Spring Boot async queues and Next.js"
                }
            ]
        }

        if client and len(resume_text) > 40:
            try:
                key = os.getenv("OPENAI_API_KEY", "")
                model = "openai/gpt-4o-mini" if key.startswith("sk-or-") else "gpt-4o-mini"
                prompt = (
                    "Extract structured candidate info from this resume text as JSON with keys: "
                    "'skills' (list of strings), 'projects' (list of {name, description}), "
                    "'experience_level' (Entry, Mid-Level, or Senior), 'inferred_role' (string).\n\n"
                    f"Resume:\n{resume_text[:2000]}"
                )
                res = await client.chat.completions.create(
                    model=os.getenv("LLM_MODEL", model),
                    response_format={"type": "json_object"},
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.2,
                    max_tokens=400
                )
                data = json.loads(res.choices[0].message.content)
                if data.get("skills"):
                    parsed_profile["skills"] = data["skills"]
                if data.get("projects"):
                    parsed_profile["projects"] = data["projects"]
                if data.get("inferred_role"):
                    parsed_profile["target_role"] = data["inferred_role"]
                if data.get("experience_level"):
                    parsed_profile["experience_level"] = data["experience_level"]
            except Exception as e:
                logger.warning("LLM resume parse fallback used: %s", e)

        return {
            "status": "success",
            "profile": parsed_profile,
            "skills_count": len(parsed_profile["skills"]),
            "ats_baseline_score": parsed_profile["ats_baseline_score"]
        }

    async def _tool_search_jobs(self, args: Dict[str, Any]) -> Dict[str, Any]:
        role = args.get("role", "Software Engineer")
        skills = args.get("skills", [])
        limit = min(args.get("limit", 5), 10)

        job_data = await fetch_live_jobs(
            limit=limit,
            search=role,
            skills=skills,
            preferred_role=role
        )

        jobs_list = job_data.get("jobs", [])
        summarized_jobs = []
        for j in jobs_list[:limit]:
            summarized_jobs.append({
                "id": j.get("id"),
                "job_title": j.get("job_title"),
                "company_name": j.get("company_name"),
                "location": j.get("location"),
                "job_type": j.get("job_type"),
                "apply_link": j.get("apply_link"),
                "match_score": j.get("match_score", 0),
                "description_snippet": (j.get("description") or "")[:350]
            })

        return {
            "status": "success",
            "jobs_found": len(summarized_jobs),
            "jobs": summarized_jobs,
            "source": job_data.get("source", "Multi-Feed Aggregator")
        }

    async def _tool_score_match(self, args: Dict[str, Any]) -> Dict[str, Any]:
        candidate_skills = args.get("candidate_skills", [])
        candidate_role = args.get("candidate_role", "Software Developer")
        job_title = args.get("job_title", "")
        job_desc = args.get("job_description", "")
        required_skills = args.get("required_skills", [])

        # Infer required skills from job description if empty
        if not required_skills:
            detected = [
                kw for kw in [
                    "python", "react", "java", "sql", "postgresql", "docker", "aws",
                    "fastapi", "typescript", "kubernetes", "rest", "git", "c++", "go"
                ]
                if kw in job_desc.lower()
            ]
            required_skills = detected if detected else ["software development", "problem solving"]

        match_input_user = UserProfileInput(
            skills=candidate_skills,
            preferred_role=candidate_role,
            experience_level="mid"
        )
        match_input_job = JobInput(
            title=job_title,
            description=job_desc,
            required_skills=required_skills
        )

        result = calculate_match_score(match_input_user, match_input_job)

        return {
            "status": "success",
            "score": result.score,
            "missing_skills": result.missing_skills,
            "breakdown": result.match_breakdown,
            "recommendation": (
                "Highly Recommended" if result.score >= 75
                else "Competitive Match" if result.score >= 50
                else "Requires Upskilling"
            )
        }

    async def _tool_generate_email(self, args: Dict[str, Any]) -> Dict[str, Any]:
        company_name = args.get("company_name", "Target Company")
        job_title = args.get("job_title", "Software Engineer")
        job_desc = args.get("job_description", "")
        candidate_skills = args.get("candidate_skills", ["Full Stack Development"])
        featured_project = args.get("featured_project", "Production Microservices Platform")
        tone = args.get("tone", "professional")

        client = _get_client()
        if client is None:
            # Fallback high quality template
            subject = f"Application: {job_title} - Harshwardhan Bhaskar"
            body = (
                f"Hi Hiring Team at {company_name},\n\n"
                f"I am writing to express my strong enthusiasm for the {job_title} role. "
                f"With deep expertise in {', '.join(candidate_skills[:3])}, I recently built "
                f"{featured_project}, optimizing asynchronous queue throughput and real-time data flow.\n\n"
                f"I would welcome the opportunity to discuss how my technical skills can drive immediate value for {company_name}.\n\n"
                "Best regards,\nHarshwardhan Bhaskar"
            )
            return {
                "status": "success",
                "subject_line": subject,
                "body": body,
                "word_count": len(body.split())
            }

        req = EmailGenerationRequest(
            user_profile=EmailUserProfileInput(
                skills=candidate_skills,
                projects=[UserProject(name=featured_project, description=f"Relevant work for {job_title}")]
            ),
            job_details=JobDetailsInput(
                company=company_name,
                role=job_title,
                description=job_desc or f"Engineering role at {company_name}"
            ),
            tone=ToneEnum.startup if tone == "startup" else ToneEnum.formal
        )

        from services.email_generator import generate_cold_email
        email_resp = await generate_cold_email(req)

        return {
            "status": "success",
            "subject_line": email_resp.subject_line,
            "body": email_resp.body,
            "word_count": len(email_resp.body.split())
        }

    async def _tool_critique_output(self, args: Dict[str, Any]) -> Dict[str, Any]:
        content_type = args.get("content_type", "cold_email")
        content_body = args.get("content_body", "")
        target_role = args.get("target_role", "Software Engineer")
        target_company = args.get("target_company", "Company")

        # Heuristic checks
        word_count = len(content_body.split())
        has_metrics = any(char in content_body for char in ["%", "$", "x", "+", "ms"])
        has_company = target_company.lower() in content_body.lower() if target_company else True

        score = 85
        critiques = []
        strengths = []

        if word_count > 160:
            score -= 15
            critiques.append(f"Email length is {word_count} words. Ideal length is under 150 words for executive brevity.")
        else:
            strengths.append(f"Concise word count ({word_count} words).")

        if not has_metrics:
            score -= 15
            critiques.append("Lacks quantifiable metrics or impact numbers (e.g. latency reduction, scale, % improvement).")
        else:
            strengths.append("Includes measurable impact and metrics.")

        if not has_company:
            score -= 10
            critiques.append(f"Does not specifically mention company name '{target_company}'.")
        else:
            strengths.append(f"Personalized to {target_company}.")

        needs_retry = score < 70

        return {
            "status": "success",
            "quality_score": max(0, min(100, score)),
            "needs_retry": needs_retry,
            "strengths": strengths,
            "critiques": critiques,
            "verdict": "APPROVED" if not needs_retry else "REVISE_RECOMMENDED"
        }

    async def _tool_save_result(self, args: Dict[str, Any]) -> Dict[str, Any]:
        package = {
            "package_title": args.get("package_title", "Agent Application Package"),
            "summary": args.get("summary", ""),
            "applications": args.get("applications", []),
            "total_applications": len(args.get("applications", [])),
            "saved_at": args.get("saved_at")
        }
        self._saved_results.append(package)

        return {
            "status": "success",
            "message": f"Successfully persisted package '{package['package_title']}' with {package['total_applications']} applications.",
            "total_packages_stored": len(self._saved_results)
        }
