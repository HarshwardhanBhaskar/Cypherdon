"""
AI Cold Email Generator — Async + Cached.

- Uses OpenAI's async client for non-blocking I/O
- Caches identical prompts for 10 minutes to avoid redundant API calls
- Lazy-initialized client with timeout and retry config
"""
import os
import json
import logging
from fastapi import HTTPException
from openai import AsyncOpenAI
from schemas.emails import EmailGenerationRequest, EmailGenerationResponse
from services.cache import cache_get, cache_set

logger = logging.getLogger("email_generator")

# Lazy-initialized async OpenAI client
_client = None

def _get_client():
    """Lazily initializes the async OpenAI client."""
    global _client
    if _client is None:
        key = os.getenv("OPENAI_API_KEY")
        if not key:
            return None
        _client = AsyncOpenAI(api_key=key, timeout=15.0, max_retries=2)
    return _client


def _build_cache_key(request: EmailGenerationRequest) -> dict:
    """Builds a hashable dict from the request for cache lookups."""
    return {
        "company": request.job_details.company,
        "role": request.job_details.role,
        "tone": request.tone,
        "skills": sorted(request.user_profile.skills),
        "projects": [p.name for p in request.user_profile.projects],
    }


async def generate_cold_email(request: EmailGenerationRequest) -> EmailGenerationResponse:
    """
    Generates a personalized cold email using OpenAI.
    Returns cached result if an identical prompt was made within the last 10 minutes.
    """
    # 1. Check cache first
    cache_key_data = _build_cache_key(request)
    cached = await cache_get("email", cache_key_data)
    if cached:
        logger.info("Cache HIT for email generation (%s @ %s)", request.job_details.role, request.job_details.company)
        return EmailGenerationResponse(**cached)

    # 2. Check if client is available
    client = _get_client()
    if client is None:
        return _mock_generate_cold_email(request)

    # 3. Build prompts
    skills_str = ", ".join(request.user_profile.skills)
    projects_str = "\n".join([f"- {p.name}: {p.description}" for p in request.user_profile.projects])

    tone_instruction = "professional, formal, and highly respectful."
    if request.tone == "startup":
        tone_instruction = "energetic, concise, confident, and slightly informal (startup culture fit)."

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

    # 4. Call OpenAI (async — non-blocking)
    try:
        response = await client.chat.completions.create(
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

        result = EmailGenerationResponse(
            subject_line=result_json.get("subject_line", "Application for role"),
            body=result_json.get("body", "Email body here")
        )

        # 5. Cache the result for 10 minutes
        await cache_set("email", cache_key_data, result.model_dump(), ttl=600)
        logger.info("Cache MISS — generated and cached email for %s @ %s",
                     request.job_details.role, request.job_details.company)

        return result

    except Exception as e:
        logger.error("AI Email Generation failed: %s", str(e))
        raise HTTPException(status_code=500, detail=f"AI Email Generation failed: {str(e)}")


def _mock_generate_cold_email(request: EmailGenerationRequest) -> EmailGenerationResponse:
    """Mock generator used when no OPENAI_API_KEY is found."""
    company = request.job_details.company
    role = request.job_details.role
    project_name = request.user_profile.projects[0].name if request.user_profile.projects else "my recent project"

    if request.tone == "startup":
        subject = f"Let's scale {company} - {role} applicant"
        body = (f"Hi Team,\n\nI love what {company} is doing. I'm a {role} with deep skills in "
                f"{', '.join(request.user_profile.skills[:3])}. I recently built {project_name}, "
                f"which aligns perfectly with your goals. Let's chat!\n\nCheers,")
    else:
        subject = f"Application for {role} position at {company}"
        body = (f"Dear Hiring Manager,\n\nI am writing to express my strong interest in the {role} position "
                f"at {company}. My technical background in {', '.join(request.user_profile.skills[:3])} positions "
                f"me perfectly for this role. Specifically, my work on {project_name} demonstrates my ability to "
                f"deliver results.\n\nI look forward to discussing my qualifications.\n\nBest regards,")

    return EmailGenerationResponse(subject_line=subject, body=body)
