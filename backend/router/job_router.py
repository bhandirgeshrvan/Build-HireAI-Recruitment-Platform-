from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from database_config import get_db
from controller import job_controller

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


@router.get("/")
def list_jobs(status: Optional[str] = None, db: Session = Depends(get_db)):
    return job_controller.get_all_jobs(db, status)


@router.get("/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db)):
    return job_controller.get_job(db, job_id)


@router.post("/")
def create_job(body: JobCreate, db: Session = Depends(get_db)):
    return job_controller.create_job(db, body.model_dump())


@router.put("/{job_id}")
def update_job(job_id: int, body: JobUpdate, db: Session = Depends(get_db)):
    return job_controller.update_job(db, job_id, body.model_dump(exclude_none=True))


@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    return job_controller.delete_job(db, job_id)
