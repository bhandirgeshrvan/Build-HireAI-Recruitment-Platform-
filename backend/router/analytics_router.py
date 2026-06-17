from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database_config import get_db
from controller import analytics_controller
from core.dependencies import require_role
from models.models import User

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/stats", summary="Platform-wide admin stats (admin only)")
def admin_stats(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    return analytics_controller.get_admin_stats(db)


@router.get("/funnel", summary="Hiring pipeline funnel data (recruiter/admin only)")
def pipeline_funnel(
    current_user: User = Depends(require_role("recruiter", "admin")),
    db: Session = Depends(get_db),
):
    return analytics_controller.get_pipeline_funnel(db)
