from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app import schemas, models
from app.api import deps

router = APIRouter()

@router.post("/start", response_model=schemas.InterviewSessionResponse)
def start_interview(
    *,
    db: Session = Depends(deps.get_db),
    session_in: schemas.InterviewSessionCreate,
    _auth: bool = Depends(deps.validate_internal_api_key),
) -> Any:
    """Start a new interview session."""
    candidate = db.query(models.Candidate).filter(models.Candidate.id == session_in.candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    session = models.InterviewSession(
        candidate_id=session_in.candidate_id,
        status="in_progress",
        start_time=datetime.now(timezone.utc)
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.post("/answer", response_model=schemas.InterviewAnswerResponse)
def submit_answer(
    *,
    db: Session = Depends(deps.get_db),
    answer_in: schemas.InterviewAnswerCreate,
    _auth: bool = Depends(deps.validate_internal_api_key),
) -> Any:
    """Submit an answer to an interview question."""
    session = db.query(models.InterviewSession).filter(models.InterviewSession.id == answer_in.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    answer = models.InterviewAnswer(
        session_id=answer_in.session_id,
        question_category=answer_in.question_category,
        answer_text=answer_in.answer_text
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)
    return answer

@router.post("/typing-test")
def submit_typing_test(
    *,
    db: Session = Depends(deps.get_db),
    test_in: schemas.TypingTestCreate,
) -> Any:
    """Submit typing test results."""
    session = db.query(models.InterviewSession).filter(models.InterviewSession.id == test_in.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    typing_test = db.query(models.TypingTest).filter(models.TypingTest.session_id == test_in.session_id).first()
    if typing_test:
        typing_test.wpm = test_in.wpm
        typing_test.accuracy = test_in.accuracy
    else:
        typing_test = models.TypingTest(
            session_id=test_in.session_id,
            wpm=test_in.wpm,
            accuracy=test_in.accuracy
        )
        db.add(typing_test)
        
    db.commit()
    db.refresh(typing_test)
    return {"status": "success", "id": typing_test.id}

@router.post("/{session_id}/complete")
def complete_interview(
    *,
    db: Session = Depends(deps.get_db),
    session_id: int,
    _auth: bool = Depends(deps.validate_internal_api_key),
) -> Any:
    """Mark an interview session as completed."""
    session = db.query(models.InterviewSession).filter(models.InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session.status = "completed"
    session.end_time = datetime.now(timezone.utc)
    if session.start_time:
        # start_time might not have timezone info if coming from default
        start = session.start_time.replace(tzinfo=timezone.utc) if session.start_time.tzinfo is None else session.start_time
        diff = session.end_time - start
        session.duration_minutes = int(diff.total_seconds() / 60)
    db.commit()
    
    # Trigger Celery task here to generate score using Gemini
    from app.tasks.scoring import evaluate_candidate
    evaluate_candidate.delay(session_id)
    
    return {"status": "success", "message": "Interview completed successfully."}

@router.post("/{session_id}/schedule")
def schedule_candidate_interview(
    *,
    db: Session = Depends(deps.get_db),
    session_id: int,
    start_time: datetime,
) -> Any:
    """Schedule follow up interview."""
    session = db.query(models.InterviewSession).filter(models.InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    candidate = db.query(models.Candidate).filter(models.Candidate.id == session.candidate_id).first()
    
    from app.core.calendar import schedule_interview
    
    summary = f"TalentLens Interview: {candidate.first_name} {candidate.last_name}"
    meet_link = schedule_interview(candidate.email, summary, start_time)
    
    # Save the schedule
    schedule = models.InterviewSchedule(
        candidate_id=candidate.id,
        scheduled_at=start_time,
        meeting_link=meet_link
    )
    db.add(schedule)
    db.commit()
    return {"status": "success", "meet_link": meet_link}
@router.get("/", response_model=List[schemas.InterviewSessionResponse])
def get_interviews(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Get all interview sessions."""
    sessions = db.query(models.InterviewSession).all()
    return sessions

@router.get("/candidate/{candidate_id}/transcript", response_model=List[schemas.InterviewAnswerResponse])
def get_candidate_transcript(
    *,
    db: Session = Depends(deps.get_db),
    candidate_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Get the latest transcript for a specific candidate."""
    session = db.query(models.InterviewSession).filter(
        models.InterviewSession.candidate_id == candidate_id
    ).order_by(models.InterviewSession.start_time.desc()).first()
    
    if not session:
        return []
        
    answers = db.query(models.InterviewAnswer).filter(
        models.InterviewAnswer.session_id == session.id
    ).order_by(models.InterviewAnswer.created_at.asc()).all()
    return answers
