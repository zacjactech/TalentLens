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
            
        answers = db.query(InterviewAnswer).filter(InterviewAnswer.session_id == session_id).all()
        
        # Format the answers for the prompt
        transcript = ""
        for ans in answers:
            transcript += f"Category: {ans.question_category}\nAnswer: {ans.answer_text}\n\n"
            
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        prompt = f"""
        You are an expert HR evaluator. Review the following interview transcript and provide a structured JSON scoring.
        Transcript:
        {transcript}
        
        Provide JSON exactly like this, no markdown formatting around it:
        {{
            "experience_score": 0-30,
            "stability_score": 0-20,
            "communication_score": 0-20,
            "typing_score": 0-15,
            "role_specific_score": 0-15,
            "ai_summary": "Brief 3 sentence summary of the candidate's strengths and weaknesses"
        }}
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        # Parse the JSON response
        import json
        result = {}
        try:
            # Strip markdown if Gemini includes it
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            
            result = json.loads(text.strip())
            
            # Validate with Pydantic
            ai_val = ScoringAIResult(**result)
            
            # Save the score
            overall = ai_val.experience_score + ai_val.stability_score + ai_val.communication_score + (ai_val.typing_score or 0) + ai_val.role_specific_score
            
            score = CandidateScore(
                candidate_id=session.candidate_id,
                experience_fit=ai_val.experience_score,
                career_stability=ai_val.stability_score,
                communication_quality=ai_val.communication_score,
                typing_test=ai_val.typing_score or 0,
                role_specific=ai_val.role_specific_score,
                overall_score=overall
            )
            db.add(score)
            
            profile = db.query(CandidateProfile).filter(CandidateProfile.candidate_id == session.candidate_id).first()
            if profile:
                profile.final_evaluation = ai_val.ai_summary
            else:
                profile = CandidateProfile(candidate_id=session.candidate_id, final_evaluation=ai_val.ai_summary)
                db.add(profile)
            db.commit()
            
        except json.JSONDecodeError:
            print(f"Failed to parse Gemini response: {response.text}")
            
    finally:
        db.close()
    return "Complete"
