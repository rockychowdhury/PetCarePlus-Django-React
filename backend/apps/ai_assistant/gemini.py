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
from google.genai.errors import APIError
import time

logger = logging.getLogger(__name__)


def call_gemini(conversation_history, preferred_language='bn', animal_type_name='Cat', guideline_context=None, total_turns=1):
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

        # If the user says "done" or similar, or we hit a turn count limit, complete session
        is_done = any(k in user_msg.lower() for k in ["done", "complete", "শেষ", "yes", "হ্যাঁ"]) or total_turns >= 3

        reply = mock_reply_bn if preferred_language == 'bn' else mock_reply_en


        response_dict = {
            "reply": reply if not is_done else ("বিশ্লেষণ সমাপ্ত।" if preferred_language == 'bn' else "Analysis complete."),
            "session_complete": is_done,
            "urgency_level": urgency,
            "urgency_explanation": (
                "জ্বর এবং খাদ্য গ্রহণে অনীহা দেখা যাচ্ছে।"
                if preferred_language == 'bn' else "Fever and loss of appetite observed."
            ) if is_done else "",
            "diagnosis_summary": (
                "মক রোগ নির্ণয়: হালকা সংক্রমণ বা এলার্জি।"
                if preferred_language == 'bn' else "Mock Diagnosis: Mild infection or allergy."
            ) if is_done else "",
            "care_advice": (
                "১. পর্যাপ্ত পানি খাওয়ান।\n২. পরিষ্কার এবং আরামদায়ক জায়গায় রাখুন।"
                if preferred_language == 'bn' else "1. Provide fresh water.\n2. Keep in a warm, clean place."
            ) if is_done else "",
            "things_to_care_about": (
                "ওষুধ প্রয়োগে সতর্কতা অবলম্বন করুন। পরিষ্কার পরিবেশ বজায় রাখুন।"
                if preferred_language == 'bn' else "Be careful with medication dosage. Maintain a clean environment."
            ) if is_done else "",
            "warning_signs": {
                "emergency_situations": "যদি রক্তপাত হয় বা শ্বাসকষ্ট দেখা দেয়।" if preferred_language == 'bn' else "If bleeding occurs or breathing difficulty appears.",
                "negative_symptoms": "জ্বর ৪৮ ঘণ্টার বেশি থাকলে।" if preferred_language == 'bn' else "If fever persists beyond 48 hours.",
                "when_to_worry": "যদি ২৪ ঘণ্টার মধ্যে খাবার না খায়।" if preferred_language == 'bn' else "If the animal doesn't eat within 24 hours."
            } if is_done else None,
            "positive_signs": {
                "safe_indicators": "প্রাণী সক্রিয় এবং পানি পান করছে।" if preferred_language == 'bn' else "Animal is active and drinking water.",
                "recovery_signals": "জ্বর কমে যাওয়া এবং খাবারে আগ্রহ ফিরে আসা।" if preferred_language == 'bn' else "Fever reducing and appetite returning.",
                "when_situation_is_controlled": "যখন স্বাভাবিক আচরণ ফিরে আসবে।" if preferred_language == 'bn' else "When normal behavior returns."
            } if is_done else None,
            "recommended_provider_type": "vet",
            "suggest_livestock_officer": False,
            "resource_keywords": ["fever", "infection", "care"] if is_done else []
        }
        return response_dict

    # 2. Live API Call
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        # Build guidelines context section if provided
        guidelines_section = ""
        if guideline_context:
            guidelines_section = f"\nVERIFIED PLATFORM CARE GUIDELINES REFERENCE:\nUse the following guidelines as context to provide accurate answers and care advice:\n{guideline_context}\n"

        # Build system instruction template
        system_instruction = f"""
You are Antigravity, a professional bilingual pet and livestock care AI assistant designed for users in Bangladesh.
You are helping a client with a {animal_type_name}. The client's preferred language is {preferred_language} ('bn' for Bangla, 'en' for English).

Always reply in the client's preferred language: {preferred_language}.
{guidelines_section}
Your goal:
1. Ask helpful diagnostic questions to understand the symptoms (limit to 1-2 questions per turn).
2. Maintain a friendly and empathetic tone.
3. Assess the urgency of the symptoms and choose one of the following:
   - 'monitor_at_home': For minor issues (e.g., mild fatigue, minor hairball).
   - 'see_vet_this_week': For non-urgent issues that need checking (e.g., skin itching, minor changes in appetite).
   - 'call_vet_now': For urgent symptoms (e.g., moderate fever, limping, persistent diarrhea).
   - 'emergency': For life-threatening emergencies (e.g., heavy bleeding, poisoning, severe breathing difficulty).
4. If you have gathered sufficient information to conclude the assessment, set `session_complete` to `true`, and provide the FULL structured diagnostic data below.
5. If the session is NOT complete, set `session_complete` to `false`, and provide empty/null values for the diagnostic fields.

WHEN session_complete is FALSE, respond in this JSON format:
{{
  "reply": "Your response message to the user in {preferred_language}",
  "session_complete": false,
  "urgency_level": "monitor_at_home",
  "urgency_explanation": "",
  "diagnosis_summary": "",
  "care_advice": "",
  "things_to_care_about": "",
  "warning_signs": null,
  "positive_signs": null,
  "recommended_provider_type": "vet",
  "suggest_livestock_officer": false,
  "resource_keywords": []
}}

WHEN session_complete is TRUE, respond in this JSON format with ALL fields filled:
{{
  "reply": "A brief completion message in {preferred_language}",
  "session_complete": true,
  "urgency_level": "monitor_at_home|see_vet_this_week|call_vet_now|emergency",
  "urgency_explanation": "Brief 1-2 sentence explanation of why this urgency level was chosen",
  "diagnosis_summary": "Detailed explanation of possible diseases or conditions (2-3 paragraphs in {preferred_language})",
  "care_advice": "Immediate actionable care steps — home remedies, first aid, dietary changes (numbered list in {preferred_language})",
  "things_to_care_about": "Important precautions — medication warnings, environmental factors, dietary restrictions, isolation needs (in {preferred_language})",
  "warning_signs": {{
    "emergency_situations": "When does this become an emergency? Critical scenarios to watch for",
    "negative_symptoms": "Specific symptoms that indicate worsening — be precise and observable",
    "when_to_worry": "Timeline and triggers — e.g., if fever persists beyond 48 hours"
  }},
  "positive_signs": {{
    "safe_indicators": "Signs that the situation is currently under control",
    "recovery_signals": "Observable improvements that mean the animal is getting better",
    "when_situation_is_controlled": "How to know things are going well and heading toward recovery"
  }},
  "recommended_provider_type": "vet|pharmacy|groomer|trainer",
  "suggest_livestock_officer": true|false,
  "resource_keywords": ["keyword1", "keyword2", "keyword3"]
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

        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=contents,
                    config=config
                )
                result = json.loads(response.text)
                return result
            except APIError as e:
                if e.code == 503 and attempt < max_retries - 1:
                    logger.warning(f"Gemini 503 error on attempt {attempt + 1}, retrying in {2 ** attempt}s...")
                    time.sleep(2 ** attempt)
                    continue
                raise

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

        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=[types.Content(role='user', parts=[types.Part.from_text(text=text)])],
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.3
                    )
                )
                return response.text.strip()
            except APIError as e:
                if e.code == 503 and attempt < max_retries - 1:
                    logger.warning(f"Gemini 503 error on attempt {attempt + 1}, retrying in {2 ** attempt}s...")
                    time.sleep(2 ** attempt)
                    continue
                raise
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

        max_retries = 3
        response = None
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=[types.Content(role='user', parts=[types.Part.from_text(text=prompt)])],
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.1
                    )
                )
                break
            except APIError as e:
                if e.code == 503 and attempt < max_retries - 1:
                    logger.warning(f"Gemini 503 error on attempt {attempt + 1}, retrying in {2 ** attempt}s...")
                    time.sleep(2 ** attempt)
                    continue
                raise
        
        # Try to parse the integer from the response
        try:
            score = int(response.text.strip())
            return min(max(score, 1), 10)  # Clamp between 1 and 10
        except ValueError:
            return 5  # Fallback score if parsing fails
            
    except Exception as e:
        logger.error(f"Error calling Gemini for application analysis: {e}")
        return 5
