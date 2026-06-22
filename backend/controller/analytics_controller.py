from sqlalchemy.orm import Session
from sqlalchemy import func
from models.models import User, Job, Candidate, Application


def get_admin_stats(db: Session):
    from models.models import Interview
    total_users = db.query(User).count()
    recruiters = db.query(User).filter(User.role == "recruiter").count()
    candidates = db.query(User).filter(User.role == "candidate").count()
    jobs_posted = db.query(Job).count()
    active_jobs = db.query(Job).filter(Job.status == "Active").count()
    applications = db.query(Application).count()
    hires = db.query(Application).filter(Application.status == "Hired").count()
    total_interviews = db.query(Interview).count()

    return {
        "total_users": total_users,
        "recruiters": recruiters,
        "candidates": candidates,
        "jobs_posted": jobs_posted,
        "active_jobs": active_jobs,
        "applications": applications,
        "hires": hires,
        "total_interviews": total_interviews,
    }


def get_pipeline_funnel(db: Session):
    stages = ["Applied", "Screening", "Interview", "Offer", "Hired"]
    colors = ["#2563eb", "#7c3aed", "#f59e0b", "#10b981", "#22c55e"]
    return [
        {"stage": s, "count": db.query(Application).filter(Application.status == s).count(), "fill": c}
        for s, c in zip(stages, colors)
    ]


def get_recruiter_analytics(db: Session, user_id: int, user_role: str):
    """Get analytics for recruiter including job-wise breakdown"""
    from collections import defaultdict

    # If admin, show all jobs; if recruiter, show only their jobs
    if user_role == "admin":
        jobs_query = db.query(Job)
    else:
        jobs_query = db.query(Job).filter(Job.recruiter_id == user_id)

    all_jobs = jobs_query.all()
    total_jobs = len(all_jobs)
    active_jobs = sum(1 for j in all_jobs if j.status == "Active")

    # Get all applications for these jobs
    job_ids = [j.id for j in all_jobs]
    applications_list = (
        db.query(Application).filter(Application.job_id.in_(job_ids)).all()
        if job_ids else []
    )

    total_applications = len(applications_list)

    # Average ATS score
    ats_scores = [a.score for a in applications_list if a.score]
    avg_ats_score = round(sum(ats_scores) / len(ats_scores), 1) if ats_scores else 0.0

    # Job-wise breakdown
    job_wise_stats = []
    for job in all_jobs:
        job_apps = [a for a in applications_list if a.job_id == job.id]
        status_counts = {"Applied": 0, "Screening": 0, "Interview": 0, "Offer": 0, "Hired": 0, "Rejected": 0}
        for app in job_apps:
            if app.status in status_counts:
                status_counts[app.status] += 1
        job_ats = [a.score for a in job_apps if a.score]
        job_wise_stats.append({
            "job_id": job.id,
            "job_title": job.title,
            "company": job.company,
            "status": job.status,
            "total_applications": len(job_apps),
            "avg_ats_score": round(sum(job_ats) / len(job_ats), 1) if job_ats else 0.0,
            "status_breakdown": status_counts,
            "posted_days": job.posted_days if hasattr(job, 'posted_days') else 0,
        })

    # Pipeline funnel
    stages = ["Applied", "Screening", "Interview", "Offer", "Hired"]
    pipeline = [{"stage": s, "count": sum(1 for a in applications_list if a.status == s)} for s in stages]

    # Applications over time — group by application date string (YYYY-MM-DD)
    date_counts: dict = defaultdict(int)
    for a in applications_list:
        if a.date:
            date_counts[str(a.date)[:10]] += 1
    applications_over_time = [
        {"date": d, "count": c}
        for d, c in sorted(date_counts.items())
    ]

    # Top skills from matched_skills on actual applications (NOT candidate profile skills)
    skill_counts: dict = defaultdict(int)
    for a in applications_list:
        for skill in (a.matched_skills or []):
            if skill:
                skill_counts[skill.lower()] += 1
    top_skills = [
        {"skill": s, "count": c}
        for s, c in sorted(skill_counts.items(), key=lambda x: -x[1])[:8]
    ]

    return {
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
        "total_applications": total_applications,
        "avg_ats_score": avg_ats_score,
        "job_wise_stats": job_wise_stats,
        "pipeline": pipeline,
        "applications_over_time": applications_over_time,
        "top_skills": top_skills,
        "summary": {
            "applications_per_job": round(total_applications / total_jobs, 1) if total_jobs > 0 else 0,
            "active_job_rate": round((active_jobs / total_jobs) * 100, 1) if total_jobs > 0 else 0,
        },
    }
