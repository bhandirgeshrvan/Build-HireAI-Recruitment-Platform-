from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from database_config import get_db
from controller import job_controller
from core.dependencies import get_current_user, require_role
from models.models import User

router = APIRouter(prefix="/jobs", tags=["Jobs"])


class JobCreate(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    type: Optional[str] = None
    experience: Optional[str] = None
    skills: Optional[List[str]] = []
    status: Optional[str] = "Active"


class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    type: Optional[str] = None
    experience: Optional[str] = None
    skills: Optional[List[str]] = None
    status: Optional[str] = None


@router.get("/", summary="List all jobs (public)")
def list_jobs(status: Optional[str] = None, db: Session = Depends(get_db)):
    return job_controller.get_all_jobs(db, status)


@router.get("/mine", summary="List jobs posted by the authenticated recruiter")
def my_jobs(
    current_user: User = Depends(require_role("recruiter", "admin")),
    db: Session = Depends(get_db),
):
    return job_controller.get_jobs_by_recruiter(db, current_user.id)


@router.get("/{job_id}", summary="Get a single job by ID (public)")
def get_job(job_id: int, db: Session = Depends(get_db)):
    return job_controller.get_job(db, job_id)


@router.post("/", summary="Create a job posting (recruiter only)")
def create_job(
    body: JobCreate,
    current_user: User = Depends(require_role("recruiter", "admin")),
    db: Session = Depends(get_db),
):
    return job_controller.create_job(db, body.model_dump(), current_user.id)


@router.put("/{job_id}", summary="Update a job posting (owner recruiter only)")
def update_job(
    job_id: int,
    body: JobUpdate,
    current_user: User = Depends(require_role("recruiter", "admin")),
    db: Session = Depends(get_db),
):
    return job_controller.update_job(db, job_id, body.model_dump(exclude_none=True), current_user.id)


@router.delete("/{job_id}", summary="Delete a job posting (owner recruiter only)")
def delete_job(
    job_id: int,
    current_user: User = Depends(require_role("recruiter", "admin")),
    db: Session = Depends(get_db),
):
    return job_controller.delete_job(db, job_id, current_user.id)
