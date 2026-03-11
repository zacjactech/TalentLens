from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app import schemas, models
from app.api import deps
from app.core import security
from app.core.config import settings

router = APIRouter()

@router.post("/login", response_model=schemas.Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """OAuth2 compatible token login, get an access token for future requests."""
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(user.id, expires_delta=access_token_expires),
        "token_type": "bearer",
    }

@router.post("/register", response_model=schemas.User)
def register_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """Create new user."""
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists.",
        )
    
    # Assign default recruiter role if it exists
    role = db.query(models.Role).filter(models.Role.name == "recruiter").first()
    
    user_obj = models.User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        role_id=role.id if role else None
    )
    db.add(user_obj)
    db.commit()
    db.refresh(user_obj)
    return user_obj

@router.get("/me", response_model=schemas.User)
def read_users_me(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Get current user."""
    return current_user

@router.post("/reset-password")
def reset_password(
    email: str = Body(..., embed=True),
    db: Session = Depends(deps.get_db)
) -> Any:
    """Password Recovery (Simulated). In production, this would send an email."""
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        # Simulate email sending process
        pass
        
    # Always return success to prevent email enumeration
    return {"message": "If that email exists in our system, a password reset link has been sent."}
