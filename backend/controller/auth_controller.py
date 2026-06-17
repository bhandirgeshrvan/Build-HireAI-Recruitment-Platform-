from sqlalchemy.orm import Session
from fastapi import HTTPException
from passlib.context import CryptContext
from models.models import User, Candidate, RoleEnum

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def register_user(db: Session, name: str, email: str, password: str, role: str):
    if db.query(User).filter(User.email == email.lower()).first():
        raise HTTPException(status_code=400, detail="Email already registered.")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    hashed = pwd_context.hash(password)
    user = User(name=name, email=email.lower(), password=hashed, role=role)
    db.add(user)
    db.flush()

    if role == RoleEnum.candidate:
        candidate = Candidate(user_id=user.id, name=name, email=email.lower(), status="Applied")
        db.add(candidate)

    db.commit()
    db.refresh(user)
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role}


def login_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email.lower()).first()
    if not user or not pwd_context.verify(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
