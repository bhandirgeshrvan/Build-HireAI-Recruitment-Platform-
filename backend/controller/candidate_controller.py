from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.models import Candidate


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
    candidates = db.query(Candidate).order_by(Candidate.match_score.desc()).all()
    return candidates
