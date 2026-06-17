from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database_config import get_db
from controller import application_controller

router = APIRouter(prefix="/applications", tags=["Applications"])


class ApplyRequest(BaseModel):
    candidate_id: int
    job_id: int


class StatusUpdate(BaseModel):
    status: str


@router.post("/")
def apply(body: ApplyRequest, db: Session = Depends(get_db)):
    return application_controller.apply_to_job(db, body.candidate_id, body.job_id)


@router.get("/kanban")
def kanban(db: Session = Depends(get_db)):
    return application_controller.get_kanban(db)


@router.get("/candidate/{candidate_id}")
def by_candidate(candidate_id: int, db: Session = Depends(get_db)):
    return application_controller.get_applications_by_candidate(db, candidate_id)


@router.get("/job/{job_id}")
def by_job(job_id: int, db: Session = Depends(get_db)):
    return application_controller.get_applications_by_job(db, job_id)


@router.put("/{app_id}/status")
def update_status(app_id: int, body: StatusUpdate, db: Session = Depends(get_db)):
    return application_controller.update_application_status(db, app_id, body.status)
