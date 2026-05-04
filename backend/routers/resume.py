"""
Resume Router
--------------
Handles resume upload, PDF text extraction, and ATS analysis.
"""
import io
import logging
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional

logger = logging.getLogger("api")

router = APIRouter()


@router.post("/analyze", summary="Upload and analyze a resume PDF")
async def analyze_resume_endpoint(
    file: UploadFile = File(...),
    target_role: str = Form(default="software engineer"),
):
    """
    Accepts a PDF resume file and a target job role.
    Returns ATS score, missing skills, and suggestions.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    try:
        from services.resume.parser import extract_text_from_pdf
        from services.resume.scorer import analyze_resume_text
        from services.resume.suggestions import generate_suggestions

        contents = await file.read()
        
        # 1. Parse PDF
        text = extract_text_from_pdf(contents)

        # 2. Score Resume
        score, missing_keywords, metrics = analyze_resume_text(text, target_role)

        # 3. Generate Suggestions
        suggestions = generate_suggestions(missing_keywords, metrics)

        return {
            "score": score,
            "missing_skills": missing_keywords,
            "suggestions": suggestions,
            "metrics": metrics
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resume analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
