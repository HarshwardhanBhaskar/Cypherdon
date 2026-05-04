from fastapi import APIRouter
from schemas.matching import MatchRequest, MatchResponse
from services.matcher import calculate_match_score

router = APIRouter()

@router.post("", response_model=MatchResponse)
async def match_jobs(request: MatchRequest):
    """
    Evaluates a user's profile against a job description.
    Returns a deterministic score (0-100) and missing skills.
    """
    response = calculate_match_score(user=request.user, job=request.job)
    return response
