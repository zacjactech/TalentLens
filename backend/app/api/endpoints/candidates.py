from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Candidate])
def read_candidates(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    role: str = None,
    status: str = None,
    search: str = None,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Retrieve candidates with optional filtering."""
    query = db.query(models.Candidate)
    
    if role and role != "Filter by Role":
        query = query.filter(models.Candidate.target_role.ilike(f"%{role}%"))
    if status and status != "Filter by Status":
        query = query.filter(models.Candidate.status.ilike(f"%{status}%"))
    if search:
        query = query.filter(
            (models.Candidate.first_name.ilike(f"%{search}%")) |
            (models.Candidate.last_name.ilike(f"%{search}%")) |
            (models.Candidate.email.ilike(f"%{search}%"))
        )
        
    candidates = query.offset(skip).limit(limit).all()
    return candidates

@router.post("/", response_model=schemas.Candidate)
def create_candidate(
    *,
    db: Session = Depends(deps.get_db),
    candidate_in: schemas.CandidateCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Create new candidate."""
    candidate = db.query(models.Candidate).filter(models.Candidate.email == candidate_in.email).first()
    if candidate:
        raise HTTPException(
            status_code=400,
            detail="The candidate with this email already exists in the system.",
        )
    candidate = models.Candidate(
        first_name=candidate_in.first_name,
        last_name=candidate_in.last_name,
        email=candidate_in.email,
        phone=candidate_in.phone,
        target_role=candidate_in.target_role,
        status=candidate_in.status
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate

@router.get("/{candidate_id}", response_model=schemas.Candidate)
def read_candidate(
    *,
    db: Session = Depends(deps.get_db),
    candidate_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Get candidate by ID."""
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate
