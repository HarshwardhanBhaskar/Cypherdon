from fastapi import APIRouter, HTTPException
from schemas.jobs import MatchRequest
from services.job_feed import fetch_live_jobs
from services.supabase import supabase

router = APIRouter()

@router.get("/", summary="Get list of jobs")
def get_jobs(limit: int = 50):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    res = supabase.table("jobs").select("*").limit(limit).execute()
    return res.data


@router.get("/live", summary="Get fresh real-world jobs")
async def get_live_jobs(
    limit: int = 30,
    search: str | None = None,
    preferred_role: str | None = None,
    skills: str | None = None,
    force_refresh: bool = False,
):
    """
    Fetch real software jobs from a public job feed and cache results briefly.
    The frontend can call this periodically to keep matches fresh.
    """
    skill_list = [skill.strip() for skill in (skills or "").split(",") if skill.strip()]
    try:
        return await fetch_live_jobs(
            limit=limit,
            search=search,
            skills=skill_list,
            preferred_role=preferred_role,
            force_refresh=force_refresh,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Could not fetch live jobs: {exc}")

@router.post("/match", summary="Calculate match percentage")
def match_skills(req: MatchRequest):
    """
    Simple keyword matching engine to determine how well user skills
    match the job description.
    """
    desc = req.job_description.lower()
    matched = [skill for skill in req.user_skills if skill.lower() in desc]
    score = int((len(matched) / len(req.user_skills)) * 100) if req.user_skills else 0
    return {"match_percentage": score, "matched_skills": matched}
