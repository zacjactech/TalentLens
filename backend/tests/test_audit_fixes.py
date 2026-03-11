import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.api.deps import get_db
from unittest.mock import MagicMock
from datetime import datetime

client = TestClient(app)

# Mock DB dependency
def override_get_db():
    db = MagicMock()
    # Mock candidate query result
    candidate = MagicMock()
    candidate.id = 1
    db.query.return_value.filter.return_value.first.return_value = candidate
    
    # Mock session commit - it should handle ID assignment
    def mock_add(obj):
        if hasattr(obj, 'id'):
            obj.id = 1
        if hasattr(obj, 'start_time') and obj.start_time is None:
            obj.start_time = datetime.utcnow()
    
    db.add.side_effect = mock_add
    
    return db

app.dependency_overrides[get_db] = override_get_db

def test_interview_endpoints_unauthorized():
    # Attempt to start interview without header
    response = client.post("/api/v1/interviews/start", json={"candidate_id": 1})
    # FastAPI returns 422 for missing required header
    assert response.status_code == 422

def test_interview_endpoints_wrong_key():
    # Attempt to start interview with wrong header
    headers = {"X-Internal-Secret": "wrong-key"}
    response = client.post("/api/v1/interviews/start", json={"candidate_id": 1}, headers=headers)
    assert response.status_code == 403

def test_interview_endpoints_authorized():
    headers = {"X-Internal-Secret": settings.INTERNAL_API_KEY}
    response = client.post("/api/v1/interviews/start", json={"candidate_id": 1}, headers=headers)
    
    # Auth passes, and it returns 200
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["start_time"] is not None
