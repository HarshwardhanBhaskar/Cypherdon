"""
Resume Router — Async Pipeline.
PDF parsing runs in a thread pool, scoring is synchronous (fast CPU work).
"""
import logging
from fastapi import APIRouter, HTTPException, UploadFile, File, Form

logger = logging.getLogger("api.resume")

router = APIRouter()


@router.post("/analyze", summary="Upload and analyze a resume PDF")
async def analyze_resume_endpoint(
    file: UploadFile = File(...),
    target_role: str = Form(default="software engineer"),
):
    """
    Accepts a PDF resume and target role.
    Returns ATS score, missing skills, and improvement suggestions.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    try:
        from services.resume.parser import extract_text_from_pdf
        from services.resume.scorer import analyze_resume_text
        from services.resume.suggestions import generate_suggestions

        contents = await file.read()

        # 1. Parse PDF (async — runs in thread pool, doesn't block event loop)
        text = await extract_text_from_pdf(contents)

        # 2. Score Resume (sync — pure CPU, microseconds)
        score, missing_keywords, metrics = analyze_resume_text(text, target_role)

        # 3. Generate Suggestions (sync — pure CPU)
        suggestions = generate_suggestions(missing_keywords, metrics)

        logger.info("Resume analyzed for '%s' role — score: %d/100", target_role, score)

        return {
            "score": score,
            "breakdown": {
                "skill_match": metrics.get("keyword_score", 0),
                "keyword_presence": metrics.get("sections_score", 0),
                "structure": metrics.get("quant_score", 0),
            },
            "matched_skills": [],
            "missing_skills": missing_keywords,
            "found_keywords": [],
            "missing_keywords": missing_keywords,
            "found_sections": metrics.get("found_sections", []),
            "suggestions": suggestions,
            "metrics": metrics,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Resume analysis failed: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
