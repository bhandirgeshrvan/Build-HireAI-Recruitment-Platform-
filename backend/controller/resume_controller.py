import os
import shutil
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from models.models import Resume, Candidate, Job
from dotenv import load_dotenv

load_dotenv()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc"}

SKILLS_POOL = [
    "python", "javascript", "typescript", "react", "node.js", "nodejs", "sql",
    "postgresql", "mysql", "mongodb", "aws", "docker", "kubernetes", "machine learning",
    "tensorflow", "pytorch", "fastapi", "django", "flask", "spring boot", "java",
    "go", "golang", "graphql", "redis", "kafka", "spark", "ci/cd", "terraform",
    "figma", "product management", "data analysis", "c++", "c#", "rust", "php",
    "vue", "angular", "linux", "git", "agile", "scrum",
]


def _extract_text(file_path: str, ext: str) -> str:
    if ext == ".pdf":
        try:
            import PyPDF2
            text = []
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text.append(page.extract_text() or "")
            return " ".join(text)
        except Exception:
            return ""
    elif ext in (".docx", ".doc"):
        try:
            import docx
            doc = docx.Document(file_path)
            return " ".join(p.text for p in doc.paragraphs)
        except Exception:
            return ""
    return ""


def _parse_skills(text: str) -> list[str]:
    text_lower = text.lower()
    return [skill for skill in SKILLS_POOL if skill in text_lower]


def upload_resume(db: Session, candidate_id: int, file: UploadFile) -> dict:
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are accepted.")

    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    safe_name = f"candidate_{candidate_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    raw_text = _extract_text(file_path, ext)
    parsed_skills = _parse_skills(raw_text)

    resume = Resume(
        candidate_id=candidate_id,
        filename=file.filename,
        file_path=file_path,
        parsed_skills=parsed_skills,
        raw_text=raw_text[:5000],
    )
    db.add(resume)

    # Update candidate skills and resume_path
    candidate.resume_path = file_path
    if parsed_skills:
        candidate.skills = parsed_skills

    db.commit()
    db.refresh(resume)
    return {
        "resume_id": resume.id,
        "filename": resume.filename,
        "parsed_skills": resume.parsed_skills,
        "uploaded_at": resume.uploaded_at,
    }


def match_skills(db: Session, candidate_id: int, job_id: int) -> dict:
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    candidate_skills = set(s.lower() for s in (candidate.skills or []))
    job_skills = set(s.lower() for s in (job.skills or []))

    matched = sorted(candidate_skills & job_skills)
    missing = sorted(job_skills - candidate_skills)
    score = round((len(matched) / len(job_skills) * 100) if job_skills else 0, 1)

    return {
        "candidate_id": candidate_id,
        "job_id": job_id,
        "match_score": score,
        "matched_skills": matched,
        "missing_skills": missing,
        "total_job_skills": len(job_skills),
    }


def get_resumes(db: Session, candidate_id: int):
    return db.query(Resume).filter(Resume.candidate_id == candidate_id).all()
