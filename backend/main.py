"""
Cypherdon AI Engine — Core FastAPI Application Entrypoint
---------------------------------------------------------
Microservice orchestrating:
- Autonomous ReAct Career Copilot Agent & Multi-Tool Registry
- Asynchronous Resume ATS Parsing & Keyword Extraction
- Multi-feed Live Job Aggregation & Profile Matching
- AI Cold Email Generation & Self-Reflection Quality Gates
- Prometheus Performance Instrumentation & Health Diagnostics
"""

import os
import time
import uuid
import logging
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from prometheus_fastapi_instrumentator import Instrumentator

from routers import (
    auth,
    jobs,
    applications,
    resume,
    profile,
    matching,
    emails,
    upload,
    agent,
)

# Configure rich structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(name)-18s │ %(levelname)-7s │ %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("cypherdon")

# Track startup timestamp for uptime metrics
_STARTUP_TIME = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle hooks: boots services, verifies external APIs, and graceful teardown."""
    logger.info("=" * 65)
    logger.info("🚀 Cypherdon AI Engine booting up...")
    
    # 1. Check AI Provider Key
    openai_key = os.getenv("OPENAI_API_KEY", "")
    if openai_key:
        provider = "OpenRouter" if openai_key.startswith("sk-or-") else "OpenAI"
        masked = openai_key[:8] + "..." + openai_key[-4:]
        logger.info("   ✓ LLM Provider: %s (%s)", provider, masked)
    else:
        logger.warning("   ⚠ LLM Provider: Missing OPENAI_API_KEY (mock fallbacks active)")

    # 2. Check Supabase
    supabase_url = os.getenv("SUPABASE_URL", "")
    if supabase_url:
        logger.info("   ✓ Database: Supabase Cloud (%s)", supabase_url)
    else:
        logger.warning("   ⚠ Database: SUPABASE_URL not configured")

    # 3. Check Autonomous Agent Toolset
    from services.agent.tools import TOOL_DEFINITIONS
    logger.info("   ✓ Agentic AI: ReAct Engine online with %d tools", len(TOOL_DEFINITIONS))
    for t in TOOL_DEFINITIONS:
        logger.info("     └─ Tool: %-16s │ %s", t["name"], t["description"][:45] + "...")

    logger.info("   ✓ Metrics: Prometheus instrumentator exposed at /metrics")
    logger.info("=" * 65)

    yield

    logger.info("👋 Cypherdon AI Engine shutting down gracefully.")


TAGS_METADATA = [
    {"name": "Agentic AI", "description": "Autonomous ReAct Agent for multi-tool job search and tailored outreach."},
    {"name": "Jobs", "description": "Multi-source live tech job aggregation (Remotive, Arbeitnow, RemoteOK)."},
    {"name": "Resume", "description": "High-performance PDF parsing and ATS resume scoring engine."},
    {"name": "Emails", "description": "AI cold email synthesis with tone control and self-reflection."},
    {"name": "Matching", "description": "Algorithmic candidate-to-job compatibility scoring."},
    {"name": "Profile", "description": "Candidate profile management and URL sanitization."},
    {"name": "Authentication", "description": "User login, registration, and token management."},
    {"name": "Applications", "description": "Candidate job application tracking and status management."},
    {"name": "Uploads", "description": "Resume and media uploads via Cloudinary."},
    {"name": "Health", "description": "System health diagnostics, uptime, and cache observability."},
]

app = FastAPI(
    title="Cypherdon AI Engine",
    description=(
        "Next-generation AI recruitment and autonomous job application platform. "
        "Featuring autonomous ReAct agents, real-time WebSocket thought streaming, "
        "and distributed B2B vetting pipelines."
    ),
    version="2.1.0",
    lifespan=lifespan,
    openapi_tags=TAGS_METADATA,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── Dynamic CORS Configuration ────────────────────────────────────────────────
raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8080",
)
allowed_origins = [orig.strip() for orig in raw_origins.split(",") if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time-Ms", "X-Request-ID"],
)


# ── Middleware: Request Timing, Correlation Tracing & Slow Request Detection ───
@app.middleware("http")
async def add_process_time_and_tracing(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
    start_time = time.perf_counter()

    try:
        response = await call_next(request)
    except Exception as exc:
        process_time_ms = (time.perf_counter() - start_time) * 1000.0
        logger.error(
            "Unhandled Exception [%s] %s %s (%.2fms): %s",
            request_id,
            request.method,
            request.url.path,
            process_time_ms,
            exc,
            exc_info=True,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Internal Server Error",
                "request_id": request_id,
                "detail": "An unexpected error occurred during request execution.",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )

    process_time_ms = (time.perf_counter() - start_time) * 1000.0
    response.headers["X-Process-Time-Ms"] = f"{process_time_ms:.2f}"
    response.headers["X-Request-ID"] = request_id

    # Log slow requests to highlight bottlenecks
    if process_time_ms > 1500 and not request.url.path.startswith("/api/agent"):
        logger.warning(
            "Slow Request [%s] %s %s took %.2fms",
            request_id,
            request.method,
            request.url.path,
            process_time_ms,
        )

    return response


# ── Instrument Prometheus Metrics ──────────────────────────────────────────────
Instrumentator().instrument(app).expose(app)


# ── Route Registration ─────────────────────────────────────────────────────────
app.include_router(agent.router, prefix="/api/agent", tags=["Agentic AI"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(emails.router, prefix="/api/emails", tags=["Emails"])
app.include_router(matching.router, prefix="/api/match-jobs", tags=["Matching"])
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(applications.router, prefix="/api/applications", tags=["Applications"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(upload.router, prefix="/api", tags=["Uploads"])


# ── System Diagnostics & Health Endpoints ──────────────────────────────────────
@app.get("/", tags=["Health"])
def root_info() -> Dict[str, Any]:
    """Root health and service identity banner."""
    uptime_sec = int(time.time() - _STARTUP_TIME)
    return {
        "service": "Cypherdon AI Engine",
        "version": "2.1.0",
        "status": "OPERATIONAL",
        "uptime_seconds": uptime_sec,
        "docs": "/docs",
        "metrics": "/metrics",
    }


@app.get("/health", tags=["Health"])
def health_check() -> Dict[str, Any]:
    """Comprehensive service health and cache diagnostics."""
    from services.cache import cache_stats
    from services.agent.tools import TOOL_DEFINITIONS

    uptime_sec = int(time.time() - _STARTUP_TIME)
    hours, remainder = divmod(uptime_sec, 3600)
    minutes, seconds = divmod(remainder, 60)

    return {
        "status": "healthy",
        "service": "fastapi-ai-engine",
        "version": "2.1.0",
        "uptime": f"{hours}h {minutes}m {seconds}s",
        "uptime_seconds": uptime_sec,
        "agent": {
            "status": "ready",
            "tools_count": len(TOOL_DEFINITIONS),
        },
        "cache": cache_stats(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
