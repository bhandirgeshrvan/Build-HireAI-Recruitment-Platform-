from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.models import Job


def get_all_jobs(db: Session, status: str = None):
    q = db.query(Job)
    if status:
        q = q.filter(Job.status == status)
    return q.all()


def get_job(db: Session, job_id: int):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return job


def create_job(db: Session, data: dict):
    job = Job(**data)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def update_job(db: Session, job_id: int, data: dict):
    job = get_job(db, job_id)
    for k, v in data.items():
        setattr(job, k, v)
    db.commit()
    db.refresh(job)
    return job


def delete_job(db: Session, job_id: int):
    job = get_job(db, job_id)
    db.delete(job)
    db.commit()
    return {"detail": "Job deleted."}
