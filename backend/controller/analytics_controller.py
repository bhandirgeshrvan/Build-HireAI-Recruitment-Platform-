from sqlalchemy.orm import Session
from sqlalchemy import func
from models.models import User, Job, Candidate, Application


def get_admin_stats(db: Session):
    total_users = db.query(User).count()
    recruiters = db.query(User).filter(User.role == "recruiter").count()
    candidates = db.query(User).filter(User.role == "candidate").count()
    jobs_posted = db.query(Job).count()
    active_jobs = db.query(Job).filter(Job.status == "Active").count()
    applications = db.query(Application).count()
    hires = db.query(Application).filter(Application.status == "Hired").count()

    return {
        "total_users": total_users,
        "recruiters": recruiters,
        "candidates": candidates,
        "jobs_posted": jobs_posted,
        "active_jobs": active_jobs,
        "applications": applications,
        "hires": hires,
    }


def get_pipeline_funnel(db: Session):
    stages = ["Applied", "Screening", "Interview", "Offer", "Hired"]
    colors = ["#2563eb", "#7c3aed", "#f59e0b", "#10b981", "#22c55e"]
    return [
        {"stage": s, "count": db.query(Application).filter(Application.status == s).count(), "fill": c}
        for s, c in zip(stages, colors)
    ]
