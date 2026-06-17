from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from database_config import get_db
from controller import resume_controller
from controller.candidate_controller import get_candidate_by_user
from core.dependencies import require_role, get_current_user
from models.models import User

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post("/upload", summary="Upload resume PDF/DOCX — parses and extracts skills automatically")
def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role("candidate")),
    db: Session = Depends(get_db),
):
    candidate = get_candidate_by_user(db, current_user.id)
    return resume_controller.upload_resume(db, candidate.id, file)


@router.get("/mine", summary="Get all resumes for the current candidate")
def my_resumes(
    current_user: User = Depends(require_role("candidate")),
    db: Session = Depends(get_db),
):
    candidate = get_candidate_by_user(db, current_user.id)
    return resume_controller.get_resumes(db, candidate.id)


@router.get("/match/{job_id}", summary="Compute skill match score between my resume and a job")
def match_job(
    job_id: int,
    current_user: User = Depends(require_role("candidate")),
    db: Session = Depends(get_db),
):
    candidate = get_candidate_by_user(db, current_user.id)
    return resume_controller.match_skills(db, candidate.id, job_id)


@router.get("/candidate/{candidate_id}", summary="Get resumes for a candidate (recruiter/admin only)")
def candidate_resumes(
    candidate_id: int,
    current_user: User = Depends(require_role("recruiter", "admin")),
    db: Session = Depends(get_db),
):
    return resume_controller.get_resumes(db, candidate_id)
