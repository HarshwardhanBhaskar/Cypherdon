from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserRegisterRequest(BaseModel):
    """Minimal signup: name + email + password only."""
    email: EmailStr
    password: str
    full_name: str

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdateRequest(BaseModel):
    """Sent from /profile to update full profile info."""
    user_id: str
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
    
    # Skills & Languages (languages added)
    languages_known: List[str] = []
    
    # Preferences
    preferred_role: Optional[str] = None
    preferred_location: Optional[str] = None
    job_type: Optional[str] = None
    salary_expectation: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str] = None
    skills: List[str] = []
    experience_level: str = "entry"
    resume_url: Optional[str] = None
    tier: str = "free"
    
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
