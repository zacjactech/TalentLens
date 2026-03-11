from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime

# Shared properties
class CandidateBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    target_role: Optional[str] = None
    status: Optional[str] = "new"

# Properties to receive via API on creation
class CandidateCreate(CandidateBase):
    pass

# Properties to receive via API on update
class CandidateUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    target_role: Optional[str] = None
    status: Optional[str] = None

class CandidateProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    summary: Optional[str] = None
    skills_analysis: Optional[str] = None
    career_stability_analysis: Optional[str] = None
    communication_evaluation: Optional[str] = None
    experience_analysis: Optional[str] = None
    final_evaluation: Optional[str] = None

class CandidateScore(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    experience_fit: float = 0.0
    career_stability: float = 0.0
    communication_quality: float = 0.0
    typing_test: float = 0.0
    role_specific: float = 0.0
    overall_score: float = 0.0

class CandidateInDBBase(CandidateBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime

# Additional properties to return via API
class Candidate(CandidateInDBBase):
    profile: Optional[CandidateProfile] = None
    score: Optional[CandidateScore] = None
