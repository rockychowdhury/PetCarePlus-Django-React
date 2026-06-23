"""
PetCarePlus v2 — Gemini Integration Utility

Calls the Gemini API using the new google-genai SDK.
Handles structured JSON outputs, system instructions, and includes a
fallback/mock mode for test runs or missing keys.
"""

import json
import logging
from django.conf import settings
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)


def call_gemini(conversation_history, preferred_language='bn', animal_type_name='Cat'):
    """
    Calls the Gemini 2.5 Flash model with conversation history and returns a structured response.
    Automatically handles mock responses during test runs or if GEMINI_API_KEY is not configured.
    """
    
    # 1. Fallback/Mock Mode (For unit tests or missing keys)
    import sys
    is_test = (
        'test' in sys.argv or
        'test' in str(settings.DATABASES.get('default', {}).get('NAME', '')) or
        'memory' in str(settings.DATABASES.get('default', {}).get('NAME', ''))
    )
    if not settings.GEMINI_API_KEY or is_test:
        user_msg = "test symptom"
        for msg in reversed(conversation_history):
            if msg.get('role') == 'user':
                user_msg = msg.get('content', '')
                break

        # Check full history to simulate contextual memory for urgency classification
        full_text = " ".join([m.get('content', '') for m in conversation_history if m.get('role') == 'user']).lower()
        is_emergency = any(k in full_text for k in ["bleed", "accident", "emergency", "জরুরি", "রক্ত"])
        urgency = "emergency" if is_emergency else "see_vet_this_week"


        mock_reply_bn = (
            "মক উত্তর: এটি একটি মক উত্তর। আপনার পোষা প্রাণীর উপসর্গ বিশ্লেষণ করা হচ্ছে। "
            "আপনার কি আর কোনো লক্ষণ আমাদের জানাতে চান?"
        )
        mock_reply_en = (
            "Mock Response: I am analyzing your pet's symptoms. Are there any other "
            "symptoms or behaviors you would like to describe?"
        )

        # If the user says "done" or similar, complete the session in tests
        is_done = any(k in user_msg.lower() for k in ["done", "complete", "শেষ", "yes", "হ্যাঁ"])

        reply = mock_reply_bn if preferred_language == 'bn' else mock_reply_en


        response_dict = {
            "reply": reply if not is_done else ("বিশ্লেষণ সমাপ্ত।" if preferred_language == 'bn' else "Analysis complete."),
            "session_complete": is_done,
            "urgency_level": urgency,
            "diagnosis_summary": (
                "মক রোগ নির্ণয়: হালকা সংক্রমণ বা এলার্জি।"
                if preferred_language == 'bn' else "Mock Diagnosis: Mild infection or allergy."
            ) if is_done else "",
            "care_advice": (
                "১. পর্যাপ্ত পানি খাওয়ান।\n২. পরিষ্কার এবং আরামদায়ক জায়গায় রাখুন।"
                if preferred_language == 'bn' else "1. Provide fresh water.\n2. Keep in a warm, clean place."
            ) if is_done else ""
        }
        return response_dict

    # 2. Live API Call
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        # Build system instruction template
        system_instruction = f"""
You are Antigravity, a professional bilingual pet and livestock care AI assistant designed for users in Bangladesh.
You are helping a client with a {animal_type_name}. The client's preferred language is {preferred_language} ('bn' for Bangla, 'en' for English).

Always reply in the client's preferred language: {preferred_language}.

Your goal:
1. Ask helpful diagnostic questions to understand the symptoms (limit to 1-2 questions per turn).
2. Maintain a friendly and empathetic tone.
3. Assess the urgency of the symptoms and choose one of the following:
   - 'monitor_at_home': For minor issues (e.g., mild fatigue, minor hairball).
   - 'see_vet_this_week': For non-urgent issues that need checking (e.g., skin itching, minor changes in appetite).
   - 'call_vet_now': For urgent symptoms (e.g., moderate fever, limping, persistent diarrhea).
   - 'emergency': For life-threatening emergencies (e.g., heavy bleeding, poisoning, severe breathing difficulty).
4. If you have gathered sufficient information to conclude the assessment, set `session_complete` to `true`, and provide a structured care advice and diagnosis summary.
5. If the session is NOT complete, set `session_complete` to `false`, and provide empty values for `diagnosis_summary` and `care_advice`.

You MUST respond strictly in the following JSON format:
{{
  "reply": "Your response message to the user in {preferred_language}",
  "session_complete": true|false,
  "urgency_level": "monitor_at_home"|"see_vet_this_week"|"call_vet_now"|"emergency",
  "diagnosis_summary": "Extracted summary of potential issues (only if session_complete is true, else empty)",
  "care_advice": "Home care tips or instructions (only if session_complete is true, else empty)"
}}
"""

        # Convert simple list history: {role: "user"|"assistant", content: "..."} into types.Content objects
        contents = []
        for msg in conversation_history:
            role = 'user' if msg['role'] == 'user' else 'model'
            contents.append(
                types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=msg['content'])]
                )
            )

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            temperature=0.2
        )

        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=contents,
            config=config
        )

        result = json.loads(response.text)
        return result

    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}")
        return {
            "reply": "দুঃখিত, সংযোগে কিছু সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।" if preferred_language == 'bn' else "Sorry, we are having trouble connecting. Please try again.",
            "session_complete": False,
            "urgency_level": "monitor_at_home",
            "diagnosis_summary": "",
            "care_advice": ""
        }

def polish_text(text, language='bn'):
    """
    Polishes and rewrites a pet adoption application text.
    """
    import sys
    is_test = (
        'test' in sys.argv or
        'test' in str(settings.DATABASES.get('default', {}).get('NAME', '')) or
        'memory' in str(settings.DATABASES.get('default', {}).get('NAME', ''))
    )
    if not settings.GEMINI_API_KEY or is_test:
        return f"✨ [Polished] {text}"

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        system_instruction = f"You are a helpful assistant. The user is writing a pet adoption application. Polish the provided text to make it sound professional, empathetic, and responsible. Keep it in the {'Bangla' if language == 'bn' else 'English'} language. Do NOT add greetings like 'Hello' or closings like 'Sincerely'. Just return the polished body text directly."

        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=[types.Content(role='user', parts=[types.Part.from_text(text=text)])],
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.3
            )
        )
        return response.text.strip()
    except Exception as e:
        logger.error(f"Error calling Gemini for polishing: {e}")
        return text

def analyze_adoption_application(listing_details, application_text):
    """
    Analyzes the adoption application against the listing details and requirements.
    Returns a score out of 10 (int).
    """
    import sys
    is_test = (
        'test' in sys.argv or
        'test' in str(settings.DATABASES.get('default', {}).get('NAME', '')) or
        'memory' in str(settings.DATABASES.get('default', {}).get('NAME', ''))
    )
    if not settings.GEMINI_API_KEY or is_test:
        return 7  # Mock score

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        system_instruction = (
            "You are an expert pet adoption counselor. Evaluate the adopter's application "
            "based on the pet's details, requirements, and the applicant's message. "
            "Score the application strictly from 1 to 10 based on suitability. "
            "Return ONLY the integer score (e.g., '8'). Do not include any other text."
        )

        prompt = (
            f"Pet Details & Requirements:\n{listing_details}\n\n"
            f"Adopter Application Message:\n{application_text}\n\n"
            "Score this application out of 10. Reply with just the number."
        )

        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=[types.Content(role='user', parts=[types.Part.from_text(text=prompt)])],
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.1
            )
        )
        
        # Try to parse the integer from the response
        try:
            score = int(response.text.strip())
            return min(max(score, 1), 10)  # Clamp between 1 and 10
        except ValueError:
            return 5  # Fallback score if parsing fails
            
    except Exception as e:
        logger.error(f"Error calling Gemini for application analysis: {e}")
        return 5
