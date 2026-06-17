from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.models import Application, Job, Candidate
from datetime import date


def apply_to_job(db: Session, candidate_id: int, job_id: int):
    existing = db.query(Application).filter(
        Application.candidate_id == candidate_id,
        Application.job_id == job_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job.")

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    app = Application(
        candidate_id=candidate_id,
        job_id=job_id,
        status="Applied",
        score=candidate.match_score,
        date=str(date.today())
    )
    job.applicants = (job.applicants or 0) + 1
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


def get_applications_by_candidate(db: Session, candidate_id: int):
    return db.query(Application).filter(Application.candidate_id == candidate_id).all()


def get_applications_by_job(db: Session, job_id: int):
    return db.query(Application).filter(Application.job_id == job_id)\
        .order_by(Application.score.desc()).all()


def update_application_status(db: Session, app_id: int, status: str):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    app.status = status
    app.candidate.status = status
    db.commit()
    db.refresh(app)
    return app


def get_kanban(db: Session):
    stages = ["Applied", "Screening", "Interview", "Offer", "Hired"]
    result = {}
    for stage in stages:
        apps = db.query(Application).filter(Application.status == stage).all()
        result[stage] = [
            {
                "name": a.candidate.name,
                "role": a.candidate.role,
                "company": a.job.company,
                "score": a.score,
                "date": a.date,
            }
            for a in apps
        ]
    return result
