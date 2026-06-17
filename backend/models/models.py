from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, ARRAY, Enum as PgEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database_config import Base


class RoleEnum(str, enum.Enum):
    candidate = "candidate"
    recruiter = "recruiter"
    admin = "admin"


class StatusEnum(str, enum.Enum):
    Applied = "Applied"
    Screening = "Screening"
    Interview = "Interview"
    Offer = "Offer"
    Hired = "Hired"


class JobStatusEnum(str, enum.Enum):
    Active = "Active"
    Closed = "Closed"


class JobTypeEnum(str, enum.Enum):
    full_time = "Full-time"
    part_time = "Part-time"
    contract = "Contract"


class InterviewStatusEnum(str, enum.Enum):
    Scheduled = "Scheduled"
    Completed = "Completed"
    Cancelled = "Cancelled"


# ── User ──────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(PgEnum(RoleEnum, name="roleenum"), nullable=False)

    candidate = relationship("Candidate", back_populates="user", uselist=False)
    jobs_posted = relationship("Job", back_populates="recruiter")


# ── Job ───────────────────────────────────────────────────────────────────
class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String)
    salary_min = Column(Integer)
    salary_max = Column(Integer)
    type = Column(PgEnum(JobTypeEnum, name="jobtypeenum"))
    experience = Column(String)
    skills = Column(ARRAY(String))
    posted_days = Column(Integer, default=0)
    applicants = Column(Integer, default=0)
    match_score = Column(Float, default=0)
    status = Column(PgEnum(JobStatusEnum, name="jobstatusenum"), default=JobStatusEnum.Active)
    created_at = Column(DateTime, default=datetime.utcnow)

    recruiter = relationship("User", back_populates="jobs_posted")
    applications = relationship("Application", back_populates="job")
    interviews = relationship("Interview", back_populates="job")


# ── Candidate ─────────────────────────────────────────────────────────────
class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True)
    role = Column(String)
    experience = Column(Integer)
    education = Column(String)
    skills = Column(ARRAY(String))
    match_score = Column(Float, default=0)
    location = Column(String)
    status = Column(PgEnum(StatusEnum, name="statusenum"), default=StatusEnum.Applied)
    salary_exp = Column(Integer)
    resume_path = Column(String, nullable=True)

    user = relationship("User", back_populates="candidate")
    applications = relationship("Application", back_populates="candidate")
    resumes = relationship("Resume", back_populates="candidate")
    interviews = relationship("Interview", back_populates="candidate")


# ── Resume ────────────────────────────────────────────────────────────────
class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    parsed_skills = Column(ARRAY(String), default=[])
    raw_text = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="resumes")


# ── Application ───────────────────────────────────────────────────────────
class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    status = Column(PgEnum(StatusEnum, name="statusenum"), default=StatusEnum.Applied)
    score = Column(Float, default=0)
    matched_skills = Column(ARRAY(String), default=[])
    missing_skills = Column(ARRAY(String), default=[])
    date = Column(String)

    candidate = relationship("Candidate", back_populates="applications")
    job = relationship("Job", back_populates="applications")
    interviews = relationship("Interview", back_populates="application")


# ── Interview ─────────────────────────────────────────────────────────────
class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"))
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    recruiter_id = Column(Integer, ForeignKey("users.id"))
    scheduled_at = Column(DateTime, nullable=False)
    location = Column(String)
    notes = Column(String)
    status = Column(PgEnum(InterviewStatusEnum, name="interviewstatusenum"), default=InterviewStatusEnum.Scheduled)
    created_at = Column(DateTime, default=datetime.utcnow)

    application = relationship("Application", back_populates="interviews")
    candidate = relationship("Candidate", back_populates="interviews")
    job = relationship("Job", back_populates="interviews")
