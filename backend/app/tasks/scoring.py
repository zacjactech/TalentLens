from celery import shared_task
from app.db.database import SessionLocal
from app.models import CandidateScore, CandidateProfile, InterviewSession, InterviewAnswer
from google import genai
from app.core.config import settings
from app.schemas.interview import ScoringAIResult

@shared_task(name="app.tasks.scoring.evaluate_candidate")
def evaluate_candidate(session_id: int):
    db = SessionLocal()
    try:
        session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
        if not session:
            return "Session not found"
            
        # Get Resume content if available
        resume = db.query(models.ResumeFile).filter(models.ResumeFile.candidate_id == session.candidate_id).first()
        resume_context = f"\nResume Content:\n{resume.parsed_content[:2000]}" if resume and resume.parsed_content else ""
            
        answers = db.query(InterviewAnswer).filter(InterviewAnswer.session_id == session_id).all()
        # Format the answers for the prompt
        transcript = ""
        for ans in answers:
            transcript += f"Category: {ans.question_category}\nAnswer: {ans.answer_text}\n\n"
            
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        prompt = f"""
        You are an expert HR evaluator. Review the following interview transcript and candidate resume to provide a structured JSON scoring.
        
        Transcript:
        {transcript}
        {resume_context}
        
        Evaluation Criteria:
        - experience_score: 0-30 (Fit for the role based on past experience)
        - stability_score: 0-20 (Likelihood of staying long-term)
        - communication_score: 0-20 (Clarity, confidence, and professionalism)
        - typing_score: 0-15 (Estimated based on communication speed/accuracy if not explicitly tested)
        - role_specific_score: 0-15 (Technical or role-specific knowledge shown)
        
        Provide JSON exactly like this, no markdown formatting around it:
        {{
            "experience_score": int,
            "stability_score": int,
            "communication_score": int,
            "typing_score": int,
            "role_specific_score": int,
            "ai_summary": "3 sentence summary"
        }}
        """
        
        try:
            response = client.models.generate_content(
                model='gemini-1.5-flash',
                contents=prompt,
            )
            
            # Parse the JSON response
            import json
            text = response.text.strip()
            # Robust JSON stripping
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            
            result = json.loads(text.strip())
            
            # Validate and fix ranges if Gemini goes out of bounds
            ai_val = ScoringAIResult(**result)
            
            # Save the score
            overall = (
                min(30, ai_val.experience_score) + 
                min(20, ai_val.stability_score) + 
                min(20, ai_val.communication_score) + 
                min(15, ai_val.typing_score or 0) + 
                min(15, ai_val.role_specific_score)
            )
            
            # Check for existing score to update or create
            score = db.query(CandidateScore).filter(CandidateScore.candidate_id == session.candidate_id).first()
            if not score:
                score = CandidateScore(candidate_id=session.candidate_id)
                db.add(score)
            
            score.experience_fit = ai_val.experience_score
            score.career_stability = ai_val.stability_score
            score.communication_quality = ai_val.communication_score
            score.typing_test = ai_val.typing_score or 0
            score.role_specific = ai_val.role_specific_score
            score.overall_score = overall
            
            profile = db.query(CandidateProfile).filter(CandidateProfile.candidate_id == session.candidate_id).first()
            if profile:
                profile.final_evaluation = ai_val.ai_summary
            else:
                profile = CandidateProfile(candidate_id=session.candidate_id, final_evaluation=ai_val.ai_summary)
                db.add(profile)
            
            # Update candidate status
            candidate = db.query(models.Candidate).filter(models.Candidate.id == session.candidate_id).first()
            if candidate:
                candidate.status = "interviewed"
                
            db.commit()
            
        except Exception as e:
            print(f"Error in AI evaluation: {str(e)}")
            if 'response' in locals():
                print(f"Raw Response: {response.text}")
            db.rollback()
            
    finally:
        db.close()
    return "Complete"
