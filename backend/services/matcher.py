import re
from typing import List, Set
from schemas.matching import UserProfileInput, JobInput, MatchResponse

def calculate_match_score(user: UserProfileInput, job: JobInput) -> MatchResponse:
    # 1. Skill Match (50 Points)
    user_skills_set = {skill.strip().lower() for skill in user.skills}
    job_skills_set = {skill.strip().lower() for skill in job.required_skills}
    
    if not job_skills_set:
        skill_score = 50 # If job requires no skills, free 50 points
        missing_skills = []
    else:
        matched_skills = job_skills_set.intersection(user_skills_set)
        missing_skills_set = job_skills_set.difference(user_skills_set)
        
        # Preserve original casing for missing skills
        missing_skills = [skill for skill in job.required_skills if skill.strip().lower() in missing_skills_set]
        
        skill_ratio = len(matched_skills) / len(job_skills_set)
        skill_score = int(skill_ratio * 50)
        
    # 2. Role Match (30 Points)
    role_score = 0
    pref_role = user.preferred_role.strip().lower()
    job_title = job.title.strip().lower()
    job_desc = job.description.strip().lower()
    
    # Exact or highly similar match in title
    if pref_role in job_title or job_title in pref_role:
        role_score = 30
    else:
        # Partial overlap of words in title
        pref_words = set(pref_role.split())
        title_words = set(job_title.split())
        
        if pref_words.intersection(title_words):
            role_score = 15
        elif pref_role in job_desc:
            role_score = 10 # Mentioned in description but not title
            
    # 3. Experience Match (20 Points)
    exp_levels = {"entry": 1, "mid": 2, "senior": 3, "lead": 4}
    
    # Infer Job Experience Required
    job_text = f"{job_title} {job_desc}"
    inferred_job_exp = 1 # Default to entry
    
    if re.search(r'\b(senior|snr|sr|expert|principal)\b', job_text):
        inferred_job_exp = 3
    elif re.search(r'\b(mid|intermediate|experienced)\b', job_text):
        inferred_job_exp = 2
    elif re.search(r'\b(lead|manager|director)\b', job_text):
        inferred_job_exp = 4
        
    # Normalize User Experience
    user_exp_raw = user.experience_level.strip().lower()
    user_exp = 1 # default
    if "senior" in user_exp_raw or "sr" in user_exp_raw:
        user_exp = 3
    elif "mid" in user_exp_raw:
        user_exp = 2
    elif "lead" in user_exp_raw or "manager" in user_exp_raw:
        user_exp = 4
        
    # Calculate difference
    exp_diff = user_exp - inferred_job_exp
    
    if exp_diff >= 0:
        exp_score = 20 # Meets or exceeds requirements
    elif exp_diff == -1:
        exp_score = 10 # Slightly under-qualified, still possible
    else:
        exp_score = 0  # Severely under-qualified
        
    # 4. Total Calculation
    total_score = skill_score + role_score + exp_score
    
    # Ensure bounds
    total_score = max(0, min(100, total_score))
    
    return MatchResponse(
        score=total_score,
        missing_skills=missing_skills,
        match_breakdown={
            "skill_match_score": skill_score,
            "role_match_score": role_score,
            "experience_match_score": exp_score
        }
    )
