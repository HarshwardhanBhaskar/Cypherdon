from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from services.supabase import supabase

router = APIRouter()

class ApplicationRequest(BaseModel):
    user_id: str
    job_id: int
    match_score: int

@router.post("/apply", summary="Trigger the Apply Assist system")
def apply_for_job(req: ApplicationRequest):
    """
    This endpoint registers that a user clicked 'apply'.
    In a real system, this would queue a background task for Playwright to 
    start the autocompletion flow. But here, we just log it in the database and 
    return a flag to let the frontend know the automation has begun.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    # Insert applying status
    insert_data = {
        "user_id": req.user_id,
        "job_id": req.job_id,
        "match_score": req.match_score,
        "status": "pending_captcha"  # Automation needs human-in-the-loop
    }
    db_res = supabase.table("applications").insert(insert_data).execute()
    
    # Normally we'd call the scraper here using Celery or background tasks
    # For MVP, frontend will manage pausing the automation state

    return {
        "message": "Apply assist started.",
        "status": "pending_captcha",
        "application_record": db_res.data
    }
