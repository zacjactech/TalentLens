from typing import Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app import schemas, models
from app.api import deps
from app.core.storage import storage_client
from app.tasks.resume import parse_resume
from pypdf import PdfReader
import io

router = APIRouter()

@router.post("/resume/{candidate_id}")
def upload_candidate_resume(
    candidate_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Upload resume to MinIO and trigger parsing."""
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    file_content = file.file.read()
    
    # Save to MinIO
    file_name = f"candidate_{candidate_id}_{file.filename}"
    try:
        storage_client.upload_file(file_name, file_content, file.content_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to upload file")
        
    # Save to DB
    resume_file = models.ResumeFile(
        candidate_id=candidate_id,
        file_path=file_name
    )
    db.add(resume_file)
    db.commit()
    db.refresh(resume_file)
    
    # Trigger Celery Task
    parse_resume.delay(candidate_id, resume_file.id)

    return {"status": "success", "file_id": resume_file.id, "file_name": file_name}
