from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class InterviewAnswerCreate(BaseModel):
    session_id: int
    question_category: str
    answer_text: str

class InterviewAnswerResponse(InterviewAnswerCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime

class InterviewSessionCreate(BaseModel):
    candidate_id: int

class InterviewSessionResponse(InterviewSessionCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    start_time: datetime
    end_time: Optional[datetime]
    duration_minutes: Optional[int]
    status: str

class TypingTestCreate(BaseModel):
    session_id: int
    wpm: int
    accuracy: float

class ScoringCreate(BaseModel):
    candidate_id: int
    experience_score: float
    stability_score: float
    communication_score: float
    typing_score: float
    role_specific_score: float
    overall_score: float
    ai_summary: Optional[str] = None

class ScoreUpdate(BaseModel):
    experience_score: Optional[float] = None
    stability_score: Optional[float] = None
    communication_score: Optional[float] = None
    typing_score: Optional[float] = None
    role_specific_score: Optional[float] = None
    overall_score: Optional[float] = None

class ScoringResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    candidate_id: int
    experience_fit: float
    career_stability: float
    communication_quality: float
    typing_test: float
    role_specific: float
    overall_score: float
    is_overridden: bool = False

class ScoringAIResult(BaseModel):
    experience_score: float
    stability_score: float
    communication_score: float
    typing_score: Optional[float] = 0
    role_specific_score: float
    ai_summary: str

class ResumeAIResult(BaseModel):
    skills: List[str]
    experience_years: int
    education_level: str
    ai_summary: str
