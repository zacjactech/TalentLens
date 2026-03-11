from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from app.core.config import settings
from datetime import datetime, timedelta

def get_calendar_service():
    if not settings.GOOGLE_CALENDAR_CREDENTIALS:
        return None
        
    creds = Credentials.from_service_account_info(
        settings.GOOGLE_CALENDAR_CREDENTIALS,
        scopes=['https://www.googleapis.com/auth/calendar']
    )
    service = build('calendar', 'v3', credentials=creds)
    return service

def schedule_interview(candidate_email: str, summary: str, start_time: datetime, duration_minutes: int = 45):
    """
    Schedules an interview and returns the Google Meet link.
    """
    service = get_calendar_service()
    if not service:
        print("Calendar service not configured. Skipping event creation. Using fallback link.")
        import uuid
        return f"{settings.MEETING_BASE_URL}-{str(uuid.uuid4())[:8]}"
        
    end_time = start_time + timedelta(minutes=duration_minutes)
    
    event = {
      'summary': summary,
      'description': 'AI HR Automation Initial Interview Follow-up',
      'start': {
        'dateTime': start_time.isoformat() + 'Z',
      },
      'end': {
        'dateTime': end_time.isoformat() + 'Z',
      },
      'attendees': [
        {'email': candidate_email},
      ],
      'conferenceData': {
        'createRequest': {
            'requestId': f"interview-{int(start_time.timestamp())}",
            'conferenceSolutionKey': {'type': 'hangoutsMeet'}
        }
      }
    }

    event = service.events().insert(
        calendarId='primary', 
        body=event, 
        conferenceDataVersion=1
    ).execute()
    
    return event.get('hangoutLink')
