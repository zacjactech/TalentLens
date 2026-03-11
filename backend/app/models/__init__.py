from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    role = relationship("Role")
    settings = relationship("UserSettings", back_populates="user", uselist=False)

class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    theme = Column(String, default="system") # system, light, dark
    language = Column(String, default="en")
    timezone = Column(String, default="UTC")
    email_notifications = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="settings")

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Candidate(Base):
    __tablename__ = "candidates"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String)
    target_role = Column(String, index=True)
    status = Column(String, default="pending")  # pending, interviewed, shortlisted, rejected
    years_of_experience = Column(Integer, default=0)
    source = Column(String, default="Direct")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    profile = relationship("CandidateProfile", back_populates="candidate", uselist=False)
    score = relationship("CandidateScore", back_populates="candidate", uselist=False)
    sessions = relationship("InterviewSession", back_populates="candidate")
    resumes = relationship("ResumeFile", back_populates="candidate")
    schedules = relationship("InterviewSchedule", back_populates="candidate")

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), unique=True)
    summary = Column(Text)
    skills_analysis = Column(Text)
    career_stability_analysis = Column(Text)
    communication_evaluation = Column(Text)
    experience_analysis = Column(Text)
    final_evaluation = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    candidate = relationship("Candidate", back_populates="profile")

class CandidateScore(Base):
    __tablename__ = "candidate_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), unique=True)
    experience_fit = Column(Float, default=0.0) # Out of 30
    career_stability = Column(Float, default=0.0) # Out of 20
    communication_quality = Column(Float, default=0.0) # Out of 20
    typing_test = Column(Float, default=0.0) # Out of 15
    role_specific = Column(Float, default=0.0) # Out of 15
    overall_score = Column(Float, default=0.0) # Out of 100
    rank = Column(Integer, nullable=True)
    is_overridden = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    candidate = relationship("Candidate", back_populates="score")

class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), index=True)
    session_id = Column(String, unique=True, index=True, nullable=False) # Maps to Rasa conversation ID
    status = Column(String, default="in_progress", index=True) # in_progress, completed, abandoned
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    
    candidate = relationship("Candidate", back_populates="sessions")
    answers = relationship("InterviewAnswer", back_populates="session")
    typing_test = relationship("TypingTest", back_populates="session", uselist=False)

class InterviewAnswer(Base):
    __tablename__ = "interview_answers"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), index=True)
    question_category = Column(String, index=True) # personal, education, experience, compensation, stability, role_specific
    question_text = Column(String)
    answer_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("InterviewSession", back_populates="answers")

class TypingTest(Base):
    __tablename__ = "typing_tests"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), unique=True)
    wpm = Column(Float, nullable=False)
    accuracy = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("InterviewSession", back_populates="typing_test")

class ResumeFile(Base):
    __tablename__ = "resume_files"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"))
    file_path = Column(String, nullable=False) # MinIO object path
    parsed_content = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    candidate = relationship("Candidate", back_populates="resumes")

class InterviewSchedule(Base):
    __tablename__ = "interview_schedule"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"))
    event_id = Column(String, nullable=True) # Google Calendar Event ID
    meeting_link = Column(String, nullable=True)
    scheduled_at = Column(DateTime, nullable=False)
    status = Column(String, default="scheduled") # scheduled, rescheduled, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    candidate = relationship("Candidate", back_populates="schedules")

class JobPosting(Base):
    __tablename__ = "job_postings"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    department = Column(String)
    location = Column(String)
    type = Column(String) # Full-time, Part-time, Contract
    status = Column(String, default="Active") # Active, Draft, Closed
    description = Column(Text)
    requirements = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

