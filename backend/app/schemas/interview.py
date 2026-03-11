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
    experience_score: int
    stability_score: int
    communication_score: int
    typing_score: int
    role_specific_score: int
    overall_score: int
    ai_summary: str

class ScoringResponse(ScoringCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int

class ScoringAIResult(BaseModel):
    experience_score: int
    stability_score: int
    communication_score: int
    typing_score: Optional[int] = 0
    role_specific_score: int
    ai_summary: str

class ResumeAIResult(BaseModel):
    skills: List[str]
    experience_years: int
    education_level: str
    ai_summary: str
