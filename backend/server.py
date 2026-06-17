from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database_config import engine, Base
from router.auth_router import router as auth_router
from router.job_router import router as job_router
from router.candidate_router import router as candidate_router
from router.application_router import router as application_router
from router.analytics_router import router as analytics_router

# Import models so Base knows about them before create_all
import models.models  # noqa

app = FastAPI(title="HireAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
app.include_router(analytics_router)


@app.get("/")
def health():
    return {"status": "HireAI backend running"}
