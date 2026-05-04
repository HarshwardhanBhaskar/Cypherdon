"""
Email Generation Router — Async endpoint.
"""
import logging
from fastapi import APIRouter
from schemas.emails import EmailGenerationRequest, EmailGenerationResponse
from services.email_generator import generate_cold_email

logger = logging.getLogger("api.emails")

router = APIRouter()


@router.post("/generate", response_model=EmailGenerationResponse)
async def generate_email_endpoint(request: EmailGenerationRequest):
    """
    Generates a personalized cold email for a job application using AI.
    Uses async OpenAI client + in-memory cache for repeated prompts.
    """
    response = await generate_cold_email(request)
    logger.info("Email generated for %s @ %s", request.job_details.role, request.job_details.company)
    return response
