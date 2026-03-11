from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

# Load .env from current directory or parent directory
if os.path.exists(".env"):
    load_dotenv(".env")
elif os.path.exists("../.env"):
    load_dotenv("../.env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "TalentLens API"
    DATABASE_URL: str
    REDIS_URL: str
    MINIO_ENDPOINT: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    GEMINI_API_KEY: str
    GOOGLE_CALENDAR_CREDENTIALS_JSON: str = ""
    INTERNAL_API_KEY: str
    MEETING_BASE_URL: str = "https://meet.google.com/fallback-link"

    class Config:
        extra = 'ignore'

settings = Settings()
