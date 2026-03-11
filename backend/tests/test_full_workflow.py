import pytest
from app.api.deps import get_current_active_user
from app.main import app
from app.models import User, Candidate, CandidateScore, InterviewSession, InterviewAnswer
from datetime import datetime, timezone

from app.core.config import settings
import os
print(f"DEBUG: settings.DATABASE_URL={settings.DATABASE_URL}")
print(f"DEBUG: os.environ['DATABASE_URL']={os.environ.get('DATABASE_URL')}")

# --- Setup Authenticated User ---
@pytest.fixture
def auth_user(db):
    user = db.query(User).filter(User.email == "admin@talentlens.ai").first()
    if not user:
        user = User(email="admin@talentlens.ai", hashed_password="fake")
        db.add(user)
        db.commit()
        db.refresh(user)
    
    app.dependency_overrides[get_current_active_user] = lambda: user
    yield user
    if get_current_active_user in app.dependency_overrides:
        del app.dependency_overrides[get_current_active_user]

# --- Tests ---

def test_get_dashboard_stats(client, db, auth_user):
    # Add dummy data
    c1 = Candidate(first_name="Jane", last_name="Doe", email="jane@example.com", target_role="Dev")
    db.add(c1)
    db.commit()
    db.refresh(c1)
    
    score = CandidateScore(candidate_id=c1.id, overall_score=85.0)
    db.add(score)
    
    session = InterviewSession(candidate_id=c1.id, session_id="test_session", status="completed")
    db.add(session)
    db.commit()
    
    response = client.get("/api/v1/admin/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_candidates"] == 1
    assert data["completed_interviews"] == 1
    assert data["average_score"] == 85.0

def test_read_candidates(client, db, auth_user):
    c = Candidate(first_name="Alice", last_name="Wonder", email="alice@example.com")
    db.add(c)
    db.commit()
    
    response = client.get("/api/v1/candidates/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(cand["email"] == "alice@example.com" for cand in data)

def test_create_candidate(client, db, auth_user):
    new_candidate = {
        "first_name": "Bob",
        "last_name": "Builder",
        "email": "bob@example.com",
        "target_role": "Architect"
    }
    
    response = client.post("/api/v1/candidates/", json=new_candidate)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "bob@example.com"
    assert data["id"] is not None

def test_get_interview_transcript(client, db, auth_user):
    c = Candidate(first_name="Charlie", last_name="Brown", email="charlie@example.com")
    db.add(c)
    db.commit()
    
    session = InterviewSession(candidate_id=c.id, session_id="session_charlie")
    db.add(session)
    db.commit()
    
    ans = InterviewAnswer(session_id=session.id, question_category="skills", answer_text="I can bake cakes.")
    db.add(ans)
    db.commit()
    
    response = client.get(f"/api/v1/interviews/{session.id}/transcript")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["answer_text"] == "I can bake cakes."
