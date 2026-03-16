import requests
import time
import os
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

API_BASE_URL = os.getenv("BACKEND_URL", "http://backend:8000")
INTERNAL_API_KEY = os.environ["INTERNAL_API_KEY"]

import random
...
HEADERS = {
    "X-Internal-Secret": INTERNAL_API_KEY
}

# Mapping of previous bot utterances to question categories
CATEGORY_MAPPING = {
    "utter_ask_experience": "experience",
    "utter_ask_stability": "stability",
    "utter_ask_communication": "communication",
    "utter_ask_role_specific": "role_specific"
}

class ActionSaveAnswer(Action):
    def name(self) -> Text:
        return "action_save_answer"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        session_id = tracker.get_slot("interview_session_id")
        latest_message = tracker.latest_message.get('text')
        
        # Determine category based on the last action performed by the bot
        category = "general"
        for event in reversed(tracker.events):
            if event.get("event") == "action":
                action_name = event.get("name")
                if action_name in CATEGORY_MAPPING:
                    category = CATEGORY_MAPPING[action_name]
                    break
        
        if session_id:
            try:
                # Store answer in backend
                requests.post(f"{API_BASE_URL}/interviews/answer", json={
                    "session_id": int(session_id),
                    "question_category": category,
                    "answer_text": latest_message
                }, headers=HEADERS)
            except Exception as e:
                print(f"Failed to save answer: {str(e)}")

        return []

class ActionMeasureTyping(Action):
    def name(self) -> Text:
        return "action_measure_typing"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
            
        # Typing metrics are now saved actively by the frontend UI via UPSERT.
        # No action needed on the Rasa side.
        return []

class ActionCompleteInterview(Action):
    def name(self) -> Text:
        return "action_complete_interview"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
            
        session_id = tracker.get_slot("interview_session_id")
        if session_id:
            try:
                requests.post(f"{API_BASE_URL}/interviews/{session_id}/complete", headers=HEADERS)
            except Exception as e:
                print(f"Failed to complete interview: {str(e)}")
                
        return []

class ActionUploadResume(Action):
    def name(self) -> Text:
        return "action_upload_resume"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # The UI should handle true file uploads outside the chat interface.
        # This action acknowledges the user providing a link or confirmation.
        dispatcher.utter_message(text="Thank you for sharing your resume. Let's proceed with some questions.")
        return []
