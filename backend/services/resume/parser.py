"""
Resume PDF Parser — Optimized.

- Runs PyMuPDF extraction in a thread pool (CPU-bound → doesn't block event loop)
- Uses list join instead of string concatenation (O(n) vs O(n²))
"""
import fitz  # PyMuPDF
import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import HTTPException

# Dedicated thread pool for PDF parsing (CPU-bound work)
_pdf_executor = ThreadPoolExecutor(max_workers=3)


def _extract_sync(file_bytes: bytes) -> str:
    """Synchronous PDF extraction — runs inside thread pool."""
    pages = []
    try:
        pdf_document = fitz.open(stream=file_bytes, filetype="pdf")

        for page in pdf_document:
            page_text = page.get_text()
            if page_text:
                pages.append(page_text)

        pdf_document.close()

        if not pages:
            raise ValueError("empty")

        # Normalize whitespace — single pass
        text = " ".join(" ".join(pages).split())
        return text

    except ValueError:
        raise
    except Exception as e:
        raise RuntimeError(str(e))


async def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Async wrapper — offloads CPU-bound PDF parsing to a dedicated thread pool
    so the FastAPI event loop remains free for other requests.
    """
    loop = asyncio.get_event_loop()
    try:
        text = await loop.run_in_executor(_pdf_executor, _extract_sync, file_bytes)
        return text
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail="Could not extract text from PDF. It may be image-based."
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse PDF: {str(e)}"
        )
