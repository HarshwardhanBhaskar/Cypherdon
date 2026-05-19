from fastapi import APIRouter, UploadFile, File, Form, Depends, Header, HTTPException
from services.cloudinary_service import upload_resume, upload_image

router = APIRouter()

# Securing the upload endpoint to only allow requests from Spring Boot
async def verify_service_token(x_internal_secret: str = Header(...)):
    import os
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
    Handles secure resume uploads forwarded by the Spring Boot gateway.
    Uploads the PDF to Cloudinary and returns the secure URL.
    """
    secure_url = await upload_resume(user_id, file)
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
