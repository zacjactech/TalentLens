from typing import Optional
from pydantic import BaseModel

class UserSettingsBase(BaseModel):
    theme: str = "system"
    language: str = "en"
    timezone: str = "UTC"
    email_notifications: bool = True

class UserSettingsCreate(UserSettingsBase):
    pass

class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    email_notifications: Optional[bool] = None

class UserSettingsInDBBase(UserSettingsBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class UserSettings(UserSettingsInDBBase):
    pass
