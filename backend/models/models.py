from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, ARRAY, Enum as PgEnum
from sqlalchemy.orm import relationship
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


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(PgEnum(RoleEnum), nullable=False)

    candidate = relationship("Candidate", back_populates="user", uselist=False)


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String)
    salary_min = Column(Integer)
    salary_max = Column(Integer)
    type = Column(PgEnum(JobTypeEnum))
    experience = Column(String)
    skills = Column(ARRAY(String))
    posted_days = Column(Integer, default=0)
    applicants = Column(Integer, default=0)
    match_score = Column(Float, default=0)
    status = Column(PgEnum(JobStatusEnum), default=JobStatusEnum.Active)

    applications = relationship("Application", back_populates="job")


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
    status = Column(PgEnum(StatusEnum), default=StatusEnum.Applied)
    salary_exp = Column(Integer)

    user = relationship("User", back_populates="candidate")
    applications = relationship("Application", back_populates="candidate")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    status = Column(PgEnum(StatusEnum), default=StatusEnum.Applied)
    score = Column(Float, default=0)
    date = Column(String)

    candidate = relationship("Candidate", back_populates="applications")
    job = relationship("Job", back_populates="applications")
