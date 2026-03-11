from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.JobPosting])
def read_jobs(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Retrieve job postings."""
    jobs = db.query(models.JobPosting).offset(skip).limit(limit).all()
    return jobs

@router.post("/", response_model=schemas.JobPosting)
def create_job(
    *,
    db: Session = Depends(deps.get_db),
    job_in: schemas.JobPostingCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Create new job posting."""
    job = models.JobPosting(**job_in.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.put("/{id}", response_model=schemas.JobPosting)
def update_job(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    job_in: schemas.JobPostingCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Update a job posting."""
    job = db.query(models.JobPosting).filter(models.JobPosting.id == id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    update_data = job_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)
        
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.delete("/{id}", response_model=schemas.JobPosting)
def delete_job(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Delete a job posting."""
    job = db.query(models.JobPosting).filter(models.JobPosting.id == id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return job
