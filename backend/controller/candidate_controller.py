from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.models import Candidate, Job


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


def _calculate_tie_breaker_score(candidate: Candidate, job: Job, matched_skills: list) -> float:
    """
    Calculate a tie-breaker score for candidates with the same ATS score.
    Uses multiple factors with weighted importance.
    Returns a score between 0-100 for fine-grained ranking.
    """
    tie_score = 0.0
    
    # Factor 1: Experience relevance (30% weight)
    if candidate.experience:
        exp_score = min(candidate.experience / 10.0, 1.0) * 30
        tie_score += exp_score
    
    # Factor 2: Number of matched skills (25% weight)
    if matched_skills:
        job_skills_count = len(job.skills or [])
        if job_skills_count > 0:
            skill_match_ratio = len(matched_skills) / job_skills_count
            tie_score += skill_match_ratio * 25
    
    # Factor 3: Education level (15% weight)
    education_scores = {
        "phd": 15, "doctorate": 15, "ph.d": 15,
        "masters": 12, "master": 12, "ms": 12, "mba": 12, "m.s": 12,
        "bachelors": 9, "bachelor": 9, "bs": 9, "ba": 9, "b.s": 9, "b.a": 9,
        "associate": 6, "diploma": 4,
    }
    if candidate.education:
        edu_lower = candidate.education.lower()
        for key, score in education_scores.items():
            if key in edu_lower:
                tie_score += score
                break
        else:
            tie_score += 3
    
    # Factor 4: Salary alignment (15% weight)
    if candidate.salary_exp and job.salary_min and job.salary_max:
        salary_mid = (job.salary_min + job.salary_max) / 2
        salary_range = job.salary_max - job.salary_min
        if salary_range > 0:
            deviation = abs(candidate.salary_exp - salary_mid) / salary_range
            alignment_score = max(0, 1.0 - deviation) * 15
            tie_score += alignment_score
        elif job.salary_min <= candidate.salary_exp <= job.salary_max:
            tie_score += 15
    
    # Factor 5: Location match (10% weight)
    if candidate.location and job.location:
        if candidate.location.lower() == job.location.lower():
            tie_score += 10
        elif "remote" in candidate.location.lower() or "remote" in job.location.lower():
            tie_score += 8
        elif any(part.lower() in job.location.lower() for part in candidate.location.split(",") if len(part.strip()) > 2):
            tie_score += 5
    
    # Factor 6: Total skills count (5% weight)
    # More skills generally = more capable candidate
    if candidate.skills:
        skill_count_score = min(len(candidate.skills) / 20.0, 1.0) * 5
        tie_score += skill_count_score
    
    return round(tie_score, 2)


def rank_candidates(db: Session, job_id: int):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    job_skills = set(s.lower() for s in (job.skills or []))
    candidates = db.query(Candidate).all()

    ranked = []
    for c in candidates:
        c_skills = set(s.lower() for s in (c.skills or []))
        matched = sorted(c_skills & job_skills)
        score = round((len(matched) / len(job_skills) * 100) if job_skills else 0, 1)
        
        # Calculate tie-breaker score
        tie_breaker = _calculate_tie_breaker_score(c, job, matched)
        
        ranked.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "role": c.role,
            "experience": c.experience,
            "skills": c.skills,
            "matched_skills": matched,
            "missing_skills": sorted(job_skills - c_skills),
            "match_score": score,
            "tie_breaker_score": tie_breaker,
            "status": c.status,
            "location": c.location,
            "salary_exp": c.salary_exp,
        })

    # Sort by match_score first, then tie_breaker_score for same scores
    return sorted(ranked, key=lambda x: (x["match_score"], x["tie_breaker_score"]), reverse=True)
