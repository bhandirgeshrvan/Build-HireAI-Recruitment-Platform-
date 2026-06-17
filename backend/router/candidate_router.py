from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from database_config import get_db
from controller import candidate_controller

router = APIRouter(prefix="/candidates", tags=["Candidates"])


class CandidateUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    experience: Optional[int] = None
    education: Optional[str] = None
    skills: Optional[List[str]] = None
    location: Optional[str] = None
    salary_exp: Optional[int] = None
    match_score: Optional[float] = None


@router.get("/")
def list_candidates(status: Optional[str] = None, db: Session = Depends(get_db)):
    return candidate_controller.get_all_candidates(db, status)


@router.get("/ranking/{job_id}")
def rank_for_job(job_id: int, db: Session = Depends(get_db)):
    return candidate_controller.rank_candidates(db, job_id)


@router.get("/user/{user_id}")
def get_by_user(user_id: int, db: Session = Depends(get_db)):
    return candidate_controller.get_candidate_by_user(db, user_id)


@router.get("/{candidate_id}")
def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    return candidate_controller.get_candidate(db, candidate_id)


@router.put("/{candidate_id}")
def update_candidate(candidate_id: int, body: CandidateUpdate, db: Session = Depends(get_db)):
    return candidate_controller.update_candidate(db, candidate_id, body.model_dump(exclude_none=True))
