from pydantic import BaseModel, EmailStr
from .user import User, UserCreate, UserUpdate, Token, TokenPayload
from .interview import InterviewSessionResponse, InterviewSessionCreate, InterviewAnswerResponse, InterviewAnswerCreate, TypingTestCreate, ScoringResponse, ScoringCreate
from .candidate import Candidate, CandidateCreate, CandidateUpdate
from .job import JobPosting, JobPostingCreate, JobPostingUpdate, JobPostingInDBBase
from .settings import UserSettings, UserSettingsCreate, UserSettingsUpdate# Create a master __init__.py for easy imports
