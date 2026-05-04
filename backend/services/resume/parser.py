import fitz  # PyMuPDF
import io
from fastapi import HTTPException

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts raw text from a PDF file using PyMuPDF (fitz).
    Returns a single string containing all normalized text.
    """
    text = ""
    try:
        # Open PDF from bytes
        pdf_document = fitz.open(stream=file_bytes, filetype="pdf")
        
        for page_num in range(len(pdf_document)):
            page = pdf_document[page_num]
            page_text = page.get_text()
            if page_text:
                text += page_text + "\n"
                
        pdf_document.close()
        
        # Normalize whitespace
        text = " ".join(text.split())
        
        if not text.strip():
            raise HTTPException(
                status_code=422,
                detail="Could not extract text from PDF. It may be image-based."
            )
            
        return text
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse PDF: {str(e)}"
        )
