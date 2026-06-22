from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database_config import get_db
from controller import application_controller
from controller.candidate_controller import get_candidate_by_user
from core.dependencies import get_current_user, require_role
from models.models import User

router = APIRouter(prefix="/applications", tags=["Applications"])


class ApplyRequest(BaseModel):
    job_id: int


class StatusUpdate(BaseModel):
    status: str


@router.post("/", summary="Apply to a job (candidate only)")
def apply(
    body: ApplyRequest,
    current_user: User = Depends(require_role("candidate")),
    db: Session = Depends(get_db),
):
    candidate = get_candidate_by_user(db, current_user.id)
    return application_controller.apply_to_job(db, candidate.id, body.job_id)


@router.get("/ranking", summary="All jobs with applicants ranked by ATS score (recruiter/admin only)")
def ranking(
    current_user: User = Depends(require_role("recruiter", "admin")),
    db: Session = Depends(get_db),
):
    return application_controller.get_ranking_by_job(db)


@router.get("/kanban", summary="Kanban board grouped by pipeline stage (recruiter/admin only)")
def kanban(
    current_user: User = Depends(require_role("recruiter", "admin")),
    db: Session = Depends(get_db),
):
    return application_controller.get_kanban(db)


@router.get("/mine", summary="Get my applications (candidate only)")
def my_applications(
    current_user: User = Depends(require_role("candidate")),
    db: Session = Depends(get_db),
):
    candidate = get_candidate_by_user(db, current_user.id)
    return application_controller.get_applications_by_candidate(db, candidate.id)


@router.get("/candidate/{candidate_id}", summary="Get applications by candidate ID (recruiter/admin only)")
def by_candidate(
    candidate_id: int,
    current_user: User = Depends(require_role("recruiter", "admin")),
    db: Session = Depends(get_db),
):
    return application_controller.get_applications_by_candidate(db, candidate_id)


@router.get("/job/{job_id}", summary="Get applications for a job, sorted by match score (recruiter/admin only)")
def by_job(
    job_id: int,
    current_user: User = Depends(require_role("recruiter", "admin")),
    db: Session = Depends(get_db),
):
    return application_controller.get_applications_by_job(db, job_id)


@router.put("/{app_id}/status", summary="Update application pipeline status (recruiter/admin only)")
def update_status(
    app_id: int,
    body: StatusUpdate,
    current_user: User = Depends(require_role("recruiter", "admin")),
    db: Session = Depends(get_db),
):
    return application_controller.update_application_status(db, app_id, body.status)
