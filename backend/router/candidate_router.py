from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from database_config import get_db
from controller import candidate_controller
from controller.enhanced_matching_controller import calculate_comprehensive_match
from core.dependencies import get_current_user, require_role
from models.models import User

router = APIRouter(prefix="/candidates", tags=["Candidates"])


class CandidateUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    role: Optional[str] = None
    experience: Optional[int] = None
    education: Optional[str] = None
    skills: Optional[List[str]] = None
    location: Optional[str] = None
    salary_exp: Optional[int] = None
    match_score: Optional[float] = None


@router.get("/", summary="List all candidates (recruiter/admin only)")
def list_candidates(
    status: Optional[str] = None,
    current_user: User = Depends(require_role("recruiter", "admin")),
    db: Session = Depends(get_db),
):
    return candidate_controller.get_all_candidates(db, status)


@router.get("/me", summary="Get my candidate profile")
def my_profile(
    current_user: User = Depends(require_role("candidate")),
    db: Session = Depends(get_db),
):
    return candidate_controller.get_candidate_by_user(db, current_user.id)


@router.put("/me", summary="Update my candidate profile")
def update_my_profile(
    body: CandidateUpdate,
    current_user: User = Depends(require_role("candidate")),
    db: Session = Depends(get_db),
):
    candidate = candidate_controller.get_candidate_by_user(db, current_user.id)
    return candidate_controller.update_candidate(db, candidate.id, body.model_dump(exclude_none=True))


@router.get("/ranking/{job_id}", summary="Rank all candidates for a job (recruiter/admin only)")
def rank_for_job(
    job_id: int,
    current_user: User = Depends(require_role("recruiter", "admin")),
    db: Session = Depends(get_db),
):
    return candidate_controller.rank_candidates(db, job_id)


@router.get("/user/{user_id}", summary="Get candidate profile by user ID")
def get_by_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return candidate_controller.get_candidate_by_user(db, user_id)


@router.get("/{candidate_id}", summary="Get candidate by candidate ID (recruiter/admin only)")
def get_candidate(
    candidate_id: int,
    current_user: User = Depends(require_role("recruiter", "admin")),
    db: Session = Depends(get_db),
):
    return candidate_controller.get_candidate(db, candidate_id)


@router.put("/{candidate_id}", summary="Update candidate profile")
def update_candidate(
    candidate_id: int,
    body: CandidateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return candidate_controller.update_candidate(db, candidate_id, body.model_dump(exclude_none=True))


@router.get("/{candidate_id}/match/{job_id}", summary="Get comprehensive match analysis for candidate and job")
def comprehensive_match(
    candidate_id: int,
    job_id: int,
    current_user: User = Depends(require_role("recruiter", "admin")),
    db: Session = Depends(get_db),
):
    """
    Comprehensive matching considering:
    - Technical skills (25%)
    - Experience (20%)
    - Projects relevance (20%)
    - Leadership & ownership (15%)
    - Soft skills (10%)
    - Achievements (10%)
    """
    return calculate_comprehensive_match(db, candidate_id, job_id)
