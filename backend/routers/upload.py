from fastapi import APIRouter, UploadFile, File, Form, Depends, Header, HTTPException
from services.cloudinary_service import upload_resume, upload_image
import os
import json
import logging
from openai import AsyncOpenAI

router = APIRouter()
logger = logging.getLogger("api.upload")

# Lazy-initialized OpenAI client
_ai_client = None

def get_ai_client():
    global _ai_client
    if _ai_client is None:
        key = os.getenv("OPENAI_API_KEY")
        if not key:
            return None
        if key.startswith("sk-or-"):
            logger.info("Initializing upload AI client with OpenRouter base URL")
            _ai_client = AsyncOpenAI(
                api_key=key,
                base_url="https://openrouter.ai/api/v1",
                timeout=20.0,
                max_retries=2
            )
        else:
            _ai_client = AsyncOpenAI(api_key=key, timeout=20.0, max_retries=2)
    return _ai_client

# Securing the upload endpoint to only allow requests from authorized clients
async def verify_service_token(x_internal_secret: str = Header(...)):
    expected_secret = os.getenv("INTERNAL_SERVICE_KEY", "cypherdon_internal_123")
    if x_internal_secret != expected_secret:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid service key")

@router.post("/upload-resume")
async def handle_resume_upload(
    user_id: str = Form(...),
    file: UploadFile = File(...),
    dependencies: str = Depends(verify_service_token)
):
    """
    Handles secure resume uploads.
    Uploads the PDF to Cloudinary, extracts metadata (skills, projects, work_experience, education)
    via OpenRouter, and automatically populates the user's Supabase developer profile.
    """
    # 1. Upload the resume PDF to Cloudinary
    secure_url = await upload_resume(user_id, file)

    # 2. Extract profile details via AI parser
    try:
        # Reset file pointer to read raw bytes
        await file.seek(0)
        file_bytes = await file.read()

        from services.resume.parser import extract_text_from_pdf
        text = await extract_text_from_pdf(file_bytes)

        client = get_ai_client()
        if client and text:
            key = os.getenv("OPENAI_API_KEY", "")
            default_model = "openai/gpt-4o-mini" if key.startswith("sk-or-") else "gpt-4o-mini"
            model_name = os.getenv("LLM_MODEL", default_model)

            logger.info("Extracting structured developer profile from resume using model: %s", model_name)

            system_prompt = """
            You are an expert resume parser. Extract the candidate's skills, projects, work experience, and education as a clean, structured JSON object.

            OUTPUT FORMAT:
            You must return a valid JSON object with the following exact keys:
            1. "skills": A flat list of technical/soft skills (list of strings).
            2. "projects": A list of projects where each project has:
               - "name": Project name (string)
               - "description": Concise description of what was built (string)
               - "role": Candidate's role, e.g. "Lead Developer" (string, optional)
               - "technologies": Technologies used (list of strings)
            3. "work_experience": A list of work experiences where each has:
               - "company": Company name (string)
               - "role": Job title (string)
               - "duration": Duration, e.g. "Jun 2022 - Present" (string)
               - "description": Concise details of achievements (string)
            4. "education": A list of education items where each has:
               - "institution": School/University name (string)
               - "degree": Degree name, e.g. "B.Tech in Computer Science" (string)
               - "duration": Duration, e.g. "2018 - 2022" (string)
            """

            response = await client.chat.completions.create(
                model=model_name,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Parse this resume:\n\n{text}"}
                ],
                temperature=0.2
            )

            parsed_data = json.loads(response.choices[0].message.content)

            # Update Supabase user profile
            from services.supabase import supabase
            if supabase and user_id != "default":
                update_payload = {}
                if "skills" in parsed_data and parsed_data["skills"]:
                    update_payload["skills"] = parsed_data["skills"]
                if "projects" in parsed_data and parsed_data["projects"]:
                    update_payload["projects"] = parsed_data["projects"]
                if "work_experience" in parsed_data and parsed_data["work_experience"]:
                    update_payload["work_experience"] = parsed_data["work_experience"]
                if "education" in parsed_data and parsed_data["education"]:
                    update_payload["education"] = parsed_data["education"]

                # Save Cloudinary URL too
                update_payload["resume_url"] = secure_url

                supabase.table("users").update(update_payload).eq("id", user_id).execute()
                logger.info("Successfully auto-populated profile fields for user: %s", user_id)

        else:
            logger.warning("AI client or text extraction not available for profile parsing.")

    except Exception as e:
        # Log failure but do not crash the request (Cloudinary URL upload remains successful)
        logger.error("Failed to auto-populate developer profile from resume: %s", str(e))

    return {"url": secure_url}

@router.post("/upload-image")
async def handle_image_upload(
    user_id: str = Form(...),
    file: UploadFile = File(...),
    dependencies: str = Depends(verify_service_token)
):
    """
    Handles secure image uploads forwarded by the frontend.
    Uploads the image to Cloudinary and returns the secure URL.
    """
    secure_url = await upload_image(user_id, file)
    return {"url": secure_url}
