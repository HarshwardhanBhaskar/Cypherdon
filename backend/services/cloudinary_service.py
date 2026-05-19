import os
import time
from fastapi import UploadFile, HTTPException
import cloudinary
import cloudinary.uploader
from typing import Dict, Any

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB in bytes

async def upload_resume(user_id: str, file: UploadFile) -> str:
    """
    Validates and uploads a resume to Cloudinary.
    Returns the secure URL.
    """
    # 1. Validate File Type
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed for resumes.")

    # 2. Validate File Size
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds the 2MB limit.")

    # Reset file cursor for any future reads (though Cloudinary takes bytes)
    await file.seek(0)

    # 3. Generate Secure Name
    timestamp = int(time.time())
    public_id = f"{user_id}_{timestamp}_resume"

    try:
        # 4. Upload to Cloudinary
        response: Dict[str, Any] = cloudinary.uploader.upload(
            file_bytes,
            folder="cypherdon/resumes",
            public_id=public_id,
            resource_type="raw", # Use 'raw' or 'auto' for PDFs. 'raw' prevents Cloudinary from trying to render it as an image.
            overwrite=True
        )
        
        secure_url = response.get("secure_url")
        if not secure_url:
            raise Exception("Cloudinary did not return a secure URL")
            
        return secure_url

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload resume: {str(e)}")

async def upload_image(user_id: str, file: UploadFile) -> str:
    """
    Validates and uploads an image to Cloudinary.
    Returns the secure URL.
    """
    # 1. Validate File Type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed.")

    # 2. Validate File Size
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds the 2MB limit.")

    # Reset file cursor for any future reads
    await file.seek(0)

    # 3. Generate Secure Name
    timestamp = int(time.time())
    public_id = f"{user_id}_{timestamp}_image"

    try:
        # 4. Upload to Cloudinary
        response: Dict[str, Any] = cloudinary.uploader.upload(
            file_bytes,
            folder="cypherdon/images",
            public_id=public_id,
            resource_type="image",
            overwrite=True
        )
        
        secure_url = response.get("secure_url")
        if not secure_url:
            raise Exception("Cloudinary did not return a secure URL")
            
        return secure_url

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")
