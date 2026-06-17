from sqlalchemy.orm import Session
from fastapi import HTTPException
from passlib.context import CryptContext
from models.models import User, Candidate
from core.jwt import create_access_token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

VALID_ROLES = {"candidate", "recruiter", "admin"}


def _token_response(user: User) -> dict:
    token = create_access_token({"sub": user.id, "role": user.role, "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role},
    }


def register_user(db: Session, name: str, email: str, password: str, role: str):
    if role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}")
    if db.query(User).filter(User.email == email.lower()).first():
        raise HTTPException(status_code=400, detail="Email already registered.")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    hashed = pwd_context.hash(password)
    user = User(name=name, email=email.lower(), password=hashed, role=role)
    db.add(user)
    db.flush()

    if role == "candidate":
        db.add(Candidate(user_id=user.id, name=name, email=email.lower(), status="Applied"))

    db.commit()
    db.refresh(user)
    return _token_response(user)


def login_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email.lower()).first()
    if not user or not pwd_context.verify(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return _token_response(user)


def get_me(user: User) -> dict:
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
