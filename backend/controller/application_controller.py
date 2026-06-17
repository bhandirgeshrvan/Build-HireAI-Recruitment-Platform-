from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.models import Application, Job, Candidate
from datetime import date


def _compute_match(candidate: Candidate, job: Job) -> tuple[float, list, list]:
    c_skills = set(s.lower() for s in (candidate.skills or []))
    j_skills = set(s.lower() for s in (job.skills or []))
    matched = sorted(c_skills & j_skills)
    missing = sorted(j_skills - c_skills)
    score = round((len(matched) / len(j_skills) * 100) if j_skills else 0, 1)
    return score, matched, missing


def apply_to_job(db: Session, candidate_id: int, job_id: int):
    if db.query(Application).filter(
        Application.candidate_id == candidate_id, Application.job_id == job_id
    ).first():
        raise HTTPException(status_code=400, detail="Already applied to this job.")

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    score, matched, missing = _compute_match(candidate, job)

    app = Application(
        candidate_id=candidate_id,
        job_id=job_id,
        status="Applied",
        score=score,
        matched_skills=matched,
        missing_skills=missing,
        date=str(date.today()),
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
                "application_id": a.id,
                "name": a.candidate.name,
                "role": a.candidate.role,
                "company": a.job.company,
                "score": a.score,
                "matched_skills": a.matched_skills,
                "date": a.date,
            }
            for a in apps
        ]
    return result
