from pydantic import BaseModel
from typing import List, Optional

class UserProfileUpdateRequest(BaseModel):
    """Payload for PUT /profile."""
    phone: Optional[str] = None
    skills: List[str] = []
    experience_level: Optional[str] = "entry"
    resume_url: Optional[str] = None
    
    # Personal Details
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    
    # Professional Links
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    
    # Skills & Languages
    languages_known: List[str] = []
    
    # Preferences
    preferred_role: Optional[str] = None
    preferred_location: Optional[str] = None
    job_type: Optional[str] = None
    salary_expectation: Optional[str] = None

class UserProfileResponse(BaseModel):
    """Payload for GET /profile."""
    id: str
    email: str
    full_name: str
    phone: Optional[str] = None
    skills: List[str] = []
    experience_level: str = "entry"
    resume_url: Optional[str] = None
    
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    languages_known: List[str] = []
    preferred_role: Optional[str] = None
    preferred_location: Optional[str] = None
    job_type: Optional[str] = None
    salary_expectation: Optional[str] = None
