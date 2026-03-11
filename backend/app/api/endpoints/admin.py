from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import schemas, models
from app.api import deps

router = APIRouter()

@router.get("/top-candidates", response_model=List[schemas.Candidate])
def get_top_candidates(
    db: Session = Depends(deps.get_db),
    limit: int = 10,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Retrieve top ranked candidates based on overall score."""
    # Join with CandidateScore to order by overall_score
    candidates = (
        db.query(models.Candidate)
        .join(models.CandidateScore, models.Candidate.id == models.CandidateScore.candidate_id)
        .order_by(models.CandidateScore.overall_score.desc())
        .limit(limit)
        .all()
    )
            
    return candidates

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Retrieve high level stats for the admin dashboard."""
    total_candidates = db.query(models.Candidate).count()
    completed_interviews = db.query(models.InterviewSession).filter(models.InterviewSession.status == "completed").count()
    avg_score = db.query(func.avg(models.CandidateScore.overall_score)).scalar() or 0
    
    return {
        "total_candidates": total_candidates,
        "completed_interviews": completed_interviews,
        "average_score": float(avg_score)
    }

@router.get("/upcoming-interviews")
def get_upcoming_interviews(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Retrieve upcoming scheduled interviews."""
    from datetime import datetime
    schedules = (
        db.query(models.InterviewSchedule)
        .join(models.Candidate, models.InterviewSchedule.candidate_id == models.Candidate.id)
        .filter(models.InterviewSchedule.scheduled_at >= datetime.utcnow())
        .order_by(models.InterviewSchedule.scheduled_at.asc())
        .limit(5)
        .all()
    )
    
    results = []
    for sched in schedules:
        results.append({
            "id": sched.id,
            "month": sched.scheduled_at.strftime("%b"),
            "date": sched.scheduled_at.strftime("%d"),
            "title": f"Interview with {sched.candidate.first_name} {sched.candidate.last_name}",
            "subtitle": f"{sched.candidate.target_role} Role",
            "meeting_link": sched.meeting_link
        })
    return results

@router.get("/recent-activity")
def get_recent_activity(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Retrieve recent platform activity."""
    # We can aggregate from multiple tables, e.g. recent profiles updated
    recent_profiles = (
        db.query(models.CandidateProfile)
        .order_by(models.CandidateProfile.created_at.desc())
        .limit(3)
        .all()
    )
    
    results = []
    for prof in recent_profiles:
        results.append({
            "id": f"prof_{prof.id}",
            "type": "success",
            "icon": "smart_toy",
            "title": "AI Evaluation Complete",
            "details": f"for Candidate #{prof.candidate_id}",
            "time": prof.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })
        
    recent_candidates = (
        db.query(models.Candidate)
        .order_by(models.Candidate.created_at.desc())
        .limit(3)
        .all()
    )
    for cand in recent_candidates:
        results.append({
            "id": f"cand_{cand.id}",
            "type": "mail",
            "icon": "person_add",
            "title": "New Candidate Added",
            "details": f"{cand.first_name} {cand.last_name} applied",
            "time": cand.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })
        
    results.sort(key=lambda x: x["time"], reverse=True)
    return results[:5]

@router.get("/analytics")
def get_analytics(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Retrieve detailed analytics for the analytics page."""
    total_candidates = db.query(models.Candidate).count()
    active_jobs = db.query(models.JobPosting).filter(models.JobPosting.status == "Active").count()
    completed_interviews = db.query(models.InterviewSession).filter(models.InterviewSession.status == "completed").count()
    avg_score = db.query(func.avg(models.CandidateScore.overall_score)).scalar() or 0
    
    # Real hiring velocity (counts per month)
    velocity_query = db.query(
        func.to_char(models.Candidate.created_at, 'Mon').label('month'),
        func.count(models.Candidate.id).label('count')
    ).group_by(
        func.to_char(models.Candidate.created_at, 'Mon'),
        func.extract('month', models.Candidate.created_at)
    ).order_by(
        func.extract('month', models.Candidate.created_at)
    ).all()
    
    hiring_velocity = [{"month": row.month, "hires": row.count} for row in velocity_query]
    
    # Real source distribution
    source_query = db.query(
        models.Candidate.source,
        func.count(models.Candidate.id).label('count')
    ).group_by(models.Candidate.source).all()
    
    source_distribution = [{"source": row.source or "Unknown", "count": row.count} for row in source_query]

    return {
        "overview": {
            "total_candidates": total_candidates,
            "active_jobs": active_jobs,
            "completed_interviews": completed_interviews,
            "average_score": float(avg_score)
        },
        "hiring_velocity": hiring_velocity,
        "source_distribution": source_distribution
    }

@router.get("/candidate-stats")
def get_candidate_stats(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Retrieve stats for the candidate list page."""
    avg_score = db.query(func.avg(models.CandidateScore.overall_score)).scalar() or 0
    high_match = db.query(models.CandidateScore).filter(models.CandidateScore.overall_score >= 80).count()
    pending = db.query(models.Candidate).filter(models.Candidate.status == "pending").count()
    
    return {
        "average_score": float(avg_score),
        "high_match_count": high_match,
        "pending_assessment_count": pending
    }
