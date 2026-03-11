from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models
from app.api import deps
from app.core import security

router = APIRouter()

@router.get("/", response_model=schemas.UserSettings)
def get_settings(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """Retrieve user settings. Create defaults if they don't exist."""
    settings = db.query(models.UserSettings).filter(models.UserSettings.user_id == current_user.id).first()
    
    if not settings:
        settings = models.UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
        
    return settings

@router.put("/", response_model=schemas.UserSettings)
def update_settings(
    *,
    db: Session = Depends(deps.get_db),
    settings_in: schemas.UserSettingsUpdate,
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """Update user settings."""
    settings = db.query(models.UserSettings).filter(models.UserSettings.user_id == current_user.id).first()
    
    if not settings:
        settings = models.UserSettings(user_id=current_user.id)
        db.add(settings)
        
    update_data = settings_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
        
    db.commit()
    db.refresh(settings)
    return settings
