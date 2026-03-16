import io
from celery import shared_task
from app.db.database import SessionLocal
from app.models import CandidateProfile, ResumeFile
from pypdf import PdfReader
from minio import Minio
from google import genai
from app.core.config import settings
from app.schemas.interview import ResumeAIResult
import json

@shared_task(name="app.tasks.resume.parse_resume")
def parse_resume(candidate_id: int, file_id: int):
    db = SessionLocal()
    try:
        resume = db.query(ResumeFile).filter(ResumeFile.id == file_id).first()
        if not resume:
            return "Resume not found"
            
        # Initialize MinIO client
        client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=False
        )
        
        # Download the file into memory
        response = client.get_object("resumes", resume.file_path)
        pdf_bytes = response.read()
        response.close()
        response.release_conn()
        
        # Extract text from pypdf
        reader = PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
            
        # Pass to Gemini to generate Candidate Profile summary
        genai_client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        prompt = f"""
        You are an expert technical recruiter. Read the following resume text and provide a structured JSON profile for the candidate.
        Resume Text:
        {text}
        
        Provide JSON exactly like this, no markdown formatting around it:
        {{
            "skills": ["skill1", "skill2"],
            "experience_years": 5,
            "education_level": "Bachelors in Computer Science",
            "ai_summary": "Brief 3 sentence summary of the candidate's background"
        }}
        """
        
        gemini_response = genai_client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt,
        )
        
        try:
            # Strip markdown if Gemini includes it
            resp_text = gemini_response.text.strip()
            if resp_text.startswith("```json"):
                resp_text = resp_text[7:]
            if resp_text.endswith("```"):
                resp_text = resp_text[:-3]
            
            result = json.loads(resp_text.strip())
            
            # Validate with Pydantic
            ai_val = ResumeAIResult(**result)
            
            profile = CandidateProfile(
                candidate_id=candidate_id,
                summary=ai_val.ai_summary,
                skills_analysis=", ".join(ai_val.skills),
                experience_analysis=f"{ai_val.experience_years} years. Education: {ai_val.education_level}"
            )
            db.add(profile)
            
            resume.parsed = True
            db.commit()
            
        except json.JSONDecodeError:
            print(f"Failed to parse Gemini response: {gemini_response.text}")

    except Exception as e:
        print(f"Error processing resume: {str(e)}")
    finally:
        db.close()
        
    return "Complete"
