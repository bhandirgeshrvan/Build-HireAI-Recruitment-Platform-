from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from database_config import engine, Base
from router.auth_router import router as auth_router
from router.job_router import router as job_router
from router.candidate_router import router as candidate_router
from router.application_router import router as application_router
from router.resume_router import router as resume_router
from router.interview_router import router as interview_router
from router.analytics_router import router as analytics_router

import models.models  # noqa — ensures all tables are registered with Base

app = FastAPI(
    title="HireAI Recruitment API",
    description="JWT-authenticated recruitment platform — resume upload, skill matching, job posting, application tracking, interview scheduling.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)


app.include_router(auth_router)
app.include_router(job_router)
app.include_router(candidate_router)
app.include_router(application_router)
app.include_router(resume_router)
app.include_router(interview_router)
app.include_router(analytics_router)


@app.get("/", tags=["Health"])
def health():
    return {"status": "HireAI backend running", "version": "2.0.0"}
