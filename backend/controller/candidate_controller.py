from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.models import Candidate, Job


def get_all_candidates(db: Session, status: str = None):
    q = db.query(Candidate)
    if status:
        q = q.filter(Candidate.status == status)
    return q.order_by(Candidate.match_score.desc()).all()


def get_candidate(db: Session, candidate_id: int):
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found.")
    return c


def get_candidate_by_user(db: Session, user_id: int):
    c = db.query(Candidate).filter(Candidate.user_id == user_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate profile not found.")
    return c


def update_candidate(db: Session, candidate_id: int, data: dict):
    c = get_candidate(db, candidate_id)
    for k, v in data.items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return c


def rank_candidates(db: Session, job_id: int):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    job_skills = set(s.lower() for s in (job.skills or []))
    candidates = db.query(Candidate).all()

    ranked = []
    for c in candidates:
        c_skills = set(s.lower() for s in (c.skills or []))
        matched = sorted(c_skills & job_skills)
        score = round((len(matched) / len(job_skills) * 100) if job_skills else 0, 1)
        ranked.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "role": c.role,
            "experience": c.experience,
            "skills": c.skills,
            "matched_skills": matched,
            "missing_skills": sorted(job_skills - c_skills),
            "match_score": score,
            "status": c.status,
            "location": c.location,
            "salary_exp": c.salary_exp,
        })

    return sorted(ranked, key=lambda x: x["match_score"], reverse=True)
