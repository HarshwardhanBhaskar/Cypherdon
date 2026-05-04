from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from enum import Enum

class ToneEnum(str, Enum):
    formal = "formal"
    startup = "startup"

class UserProject(BaseModel):
    name: str
    description: str

class UserProfileInput(BaseModel):
    skills: List[str] = Field(..., description="List of user's skills")
    projects: List[UserProject] = Field(..., description="List of user's past projects")

class JobDetailsInput(BaseModel):
    role: str = Field(..., description="Target job title")
    company: str = Field(..., description="Target company name")
    description: str = Field(..., description="Brief description of the job posting")

class EmailGenerationRequest(BaseModel):
    user_profile: UserProfileInput
    job_details: JobDetailsInput
    tone: ToneEnum = Field(default=ToneEnum.formal, description="Desired tone of the email")

class EmailGenerationResponse(BaseModel):
    subject_line: str = Field(..., description="The generated subject line")
    body: str = Field(..., description="The generated email body")
