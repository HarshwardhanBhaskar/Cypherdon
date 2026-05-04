from pydantic import BaseModel, Field
from typing import List, Dict

class UserProfileInput(BaseModel):
    skills: List[str] = Field(..., description="List of skills the user possesses")
    experience_level: str = Field(..., description="E.g., 'entry', 'mid', 'senior'")
    preferred_role: str = Field(..., description="E.g., 'Frontend Engineer', 'Backend Developer'")

class JobInput(BaseModel):
    title: str = Field(..., description="Job title")
    description: str = Field(..., description="Full job description")
    required_skills: List[str] = Field(..., description="List of skills required for the job")

class MatchRequest(BaseModel):
    user: UserProfileInput
    job: JobInput

class MatchResponse(BaseModel):
    score: int = Field(..., description="Total match score from 0 to 100")
    missing_skills: List[str] = Field(..., description="Skills required by the job that the user lacks")
    match_breakdown: Dict[str, int] = Field(..., description="Breakdown of score: skill, role, experience")
