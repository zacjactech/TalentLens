from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class JobPostingBase(BaseModel):
    title: str
    department: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = "Full-time"
    status: Optional[str] = "Active"
    description: Optional[str] = None
    requirements: Optional[str] = None

class JobPostingCreate(JobPostingBase):
    pass

class JobPostingUpdate(JobPostingBase):
    title: Optional[str] = None

class JobPostingInDBBase(JobPostingBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime

class JobPosting(JobPostingInDBBase):
    pass
