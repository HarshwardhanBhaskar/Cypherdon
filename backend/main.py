from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from datetime import datetime
from routers import auth, jobs, applications, resume, profile, matching, emails

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Cypherdon API",
    description="MVP Backend for AI Job Application Assistant",
    version="1.0.0"
)

# Allow Frontend running locally or on Vercel to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(applications.router, prefix="/api/applications", tags=["Applications"])
app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(matching.router, prefix="/api/match-jobs", tags=["Matching"])
app.include_router(emails.router, prefix="/api/emails", tags=["Emails"])

@app.get("/", tags=["Health"])
def read_root():
    return {"status": "ok", "message": "Cypherdon Backend is running"}

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "fastapi-ai-engine", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
