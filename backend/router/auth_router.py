from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from database_config import get_db
from controller.auth_controller import register_user, login_user

router = APIRouter(prefix="/auth", tags=["Auth"])


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # candidate | recruiter | admin


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    return register_user(db, body.name, body.email, body.password, body.role)


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    return login_user(db, body.email, body.password)
