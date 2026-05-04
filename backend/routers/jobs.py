from fastapi import APIRouter, HTTPException
from typing import List
from schemas.jobs import JobResponse, MatchRequest
from services.supabase import supabase

router = APIRouter()

@router.get("/", summary="Get list of jobs")
def get_jobs(limit: int = 50):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    res = supabase.table("jobs").select("*").limit(limit).execute()
    return res.data

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
