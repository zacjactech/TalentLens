from pydantic import BaseModel, EmailStr
from .user import User, UserCreate, UserUpdate, Token, TokenPayload
from .candidate import Candidate, CandidateCreate, CandidateUpdate
from .interview import InterviewSessionResponse, InterviewSessionCreate, InterviewAnswerResponse, InterviewAnswerCreate, TypingTestCreate, ScoringResponse, ScoringCreate
from .job import JobPosting, JobPostingCreate, JobPostingUpdate, JobPostingInDBBase
from .settings import UserSettings, UserSettingsCreate, UserSettingsUpdate# Create a master __init__.py for easy imports
