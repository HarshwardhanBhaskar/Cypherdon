from fastapi import APIRouter
from schemas.emails import EmailGenerationRequest, EmailGenerationResponse
from services.email_generator import generate_cold_email

router = APIRouter()

@router.post("/generate", response_model=EmailGenerationResponse)
async def generate_email_endpoint(request: EmailGenerationRequest):
    """
    Generates a personalized cold email for a job application using AI.
    """
    response = generate_cold_email(request)
    return response
