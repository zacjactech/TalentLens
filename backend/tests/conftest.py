import sys
import os

# Force test environment variables BEFORE any imports
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["REDIS_URL"] = "redis://localhost:6379/0"
os.environ["MINIO_ENDPOINT"] = "localhost:9000"
os.environ["INTERNAL_API_KEY"] = "test-secret"
os.environ["GEMINI_API_KEY"] = "test-ai-key"
os.environ["MINIO_ACCESS_KEY"] = "fake"
os.environ["MINIO_SECRET_KEY"] = "fake"
os.environ["JWT_SECRET_KEY"] = "fake"

import pytest
from unittest.mock import MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

# Mock external dependencies that connect on import
mock_minio = MagicMock()
sys.modules["minio"] = mock_minio
sys.modules["minio.error"] = MagicMock()

mock_redis = MagicMock()
sys.modules["redis"] = mock_redis

mock_google = MagicMock()
sys.modules["google"] = mock_google
sys.modules["google.genai"] = MagicMock()

mock_celery = MagicMock()
sys.modules["celery"] = mock_celery

from app.db.database import Base, get_db, engine, SessionLocal as TestingSessionLocal
from app.main import app
from app.models import User, Role, Candidate, CandidateScore, InterviewSession, InterviewAnswer

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    admin_role = Role(name="admin", description="Administrator")
    db.add(admin_role)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
