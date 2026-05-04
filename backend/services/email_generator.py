import os
import json
from fastapi import HTTPException
from openai import OpenAI
from schemas.emails import EmailGenerationRequest, EmailGenerationResponse

# Lazy-initialized OpenAI client with connection pooling
_client = None

def _get_client():
    """Lazily initializes the OpenAI client. Returns None if no API key is set."""
    global _client
    if _client is None:
        key = os.getenv("OPENAI_API_KEY")
        if not key:
            return None
        _client = OpenAI(api_key=key, timeout=15.0, max_retries=2)
    return _client

def generate_cold_email(request: EmailGenerationRequest) -> EmailGenerationResponse:
    """
    Calls the OpenAI API to generate a personalized cold email.
    Forces JSON output containing 'subject_line' and 'body'.
    """
    client = _get_client()
    if client is None:
        return _mock_generate_cold_email(request)

    # 1. Prepare User Context
    skills_str = ", ".join(request.user_profile.skills)
    projects_str = "\n".join([f"- {p.name}: {p.description}" for p in request.user_profile.projects])
    
    # 2. Define Tone
    tone_instruction = "professional, formal, and highly respectful."
    if request.tone == "startup":
        tone_instruction = "energetic, concise, confident, and slightly informal (startup culture fit)."

    # 3. Construct the Prompt Template
    system_prompt = f"""
    You are an expert career coach and executive copywriter. 
    Your job is to write a highly personalized cold email for a job application.
    
    CRITICAL INSTRUCTIONS:
    1. You MUST adopt a tone that is: {tone_instruction}
    2. You MUST address the email to the hiring manager at {request.job_details.company}.
    3. You MUST explicitly state the user is applying for the "{request.job_details.role}" role.
    4. You MUST align the user's skills ({skills_str}) with the job description.
    5. You MUST mention exactly ONE of the user's projects to prove their competence.
    6. Keep it concise (under 150 words).
    
    OUTPUT FORMAT:
    You must return a valid JSON object with exactly two keys: "subject_line" and "body".
    """

    user_prompt = f"""
    JOB DETAILS:
    Role: {request.job_details.role}
    Company: {request.job_details.company}
    Description: {request.job_details.description}
    
    USER PROFILE:
    Skills: {skills_str}
    Projects: 
    {projects_str}
    
    Write the email now and return it as JSON.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        result_json = json.loads(response.choices[0].message.content)
        
        return EmailGenerationResponse(
            subject_line=result_json.get("subject_line", "Application for role"),
            body=result_json.get("body", "Email body here")
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Email Generation failed: {str(e)}")

def _mock_generate_cold_email(request: EmailGenerationRequest) -> EmailGenerationResponse:
    """Mock generator used when no OPENAI_API_KEY is found."""
    company = request.job_details.company
    role = request.job_details.role
    project_name = request.user_profile.projects[0].name if request.user_profile.projects else "my recent project"
    
    if request.tone == "startup":
        subject = f"Let's scale {company} - {role} applicant"
        body = f"Hi Team,\n\nI love what {company} is doing. I'm a {role} with deep skills in {', '.join(request.user_profile.skills[:3])}. I recently built {project_name}, which aligns perfectly with your goals. Let's chat!\n\nCheers,"
    else:
        subject = f"Application for {role} position at {company}"
        body = f"Dear Hiring Manager,\n\nI am writing to express my strong interest in the {role} position at {company}. My technical background in {', '.join(request.user_profile.skills[:3])} positions me perfectly for this role. Specifically, my work on {project_name} demonstrates my ability to deliver results.\n\nI look forward to discussing my qualifications.\n\nBest regards,"
        
    return EmailGenerationResponse(subject_line=subject, body=body)
