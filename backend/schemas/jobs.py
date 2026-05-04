from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class JobBase(BaseModel):
    job_title: str
    description: str
    location: str
    apply_link: str
    company_name: Optional[str] = None

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    created_at: datetime
    match_score: Optional[int] = None

class MatchRequest(BaseModel):
    job_description: str
    user_skills: List[str]
