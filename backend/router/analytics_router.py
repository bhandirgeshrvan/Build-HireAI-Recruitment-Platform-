from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database_config import get_db
from controller import analytics_controller

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/stats")
def admin_stats(db: Session = Depends(get_db)):
    return analytics_controller.get_admin_stats(db)


@router.get("/funnel")
def pipeline_funnel(db: Session = Depends(get_db)):
    return analytics_controller.get_pipeline_funnel(db)
