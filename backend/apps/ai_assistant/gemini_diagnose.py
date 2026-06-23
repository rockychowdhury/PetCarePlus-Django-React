"""
PetCarePlus v2 — Gemini One-Shot Diagnostic

Single-prompt diagnostic call to Gemini 2.5 Flash.
Returns structured JSON with diagnosis, urgency, warning/positive signs,
resource keywords, and provider type recommendations.
"""

import json
import logging
from django.conf import settings
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)


def diagnose_with_gemini(animal_type_name, animal_category, problem_description, preferred_language='bn'):
    """
    One-shot diagnostic call to Gemini.

    Args:
        animal_type_name: e.g., "Cow", "Cat"
        animal_category: "companion" or "livestock"
        problem_description: Free-text user input
        preferred_language: "bn" or "en"

    Returns:
        dict with structured diagnostic response
    """

    # Mock mode for tests or missing API key
    import sys
    is_test = (
        'test' in sys.argv or
        'test' in str(settings.DATABASES.get('default', {}).get('NAME', '')) or
        'memory' in str(settings.DATABASES.get('default', {}).get('NAME', ''))
    )

    if not settings.GEMINI_API_KEY or is_test:
        return _get_mock_response(problem_description, preferred_language, animal_type_name)

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        lang_name = 'Bangla' if preferred_language == 'bn' else 'English'
        context_type = 'livestock/farm animal' if animal_category == 'livestock' else 'companion pet'

        system_instruction = f"""You are a professional bilingual veterinary AI diagnostic assistant designed for users in Bangladesh.
You are analyzing a {context_type}: {animal_type_name}.
The user's preferred language is {preferred_language} ('{lang_name}').

ALL text content in your response MUST be in {lang_name}.

IMPORTANT: First determine if the query is about a disease/health issue OR a general information request (medicine info, feeding guidelines, care tips, breeding info, etc.).

Set "query_type" to "disease" if the user describes symptoms, illness, injury, or health concerns.
Set "query_type" to "information" if the user asks about medicine, feeding, care tips, breeding, housing, or other non-disease topics.

FOR "disease" QUERIES — provide a comprehensive veterinary diagnostic:

1. "diagnosis" object:
   - "possible_problems": Detailed explanation of what could be wrong, possible diseases or conditions (2-4 paragraphs)
   - "what_owner_can_do": Immediate actionable care steps the owner can take RIGHT NOW — home remedies, first aid, dietary changes (numbered list format)
   - "things_to_care_about": Important precautions — medication warnings, environmental factors, dietary restrictions, isolation needs

2. "urgency" object:
   - "level": One of: "monitor_at_home", "see_vet_this_week", "call_vet_now", "emergency"
   - "explanation": Brief 1-2 sentence explanation of why this urgency level

3. "warning_signs" object:
   - "emergency_situations": When does this become an emergency? What critical scenarios to watch for
   - "negative_symptoms": Specific symptoms that indicate worsening — be precise and observable
   - "when_to_worry": Timeline and triggers — e.g., "if fever persists beyond 48 hours", "if animal stops eating for more than a day"

4. "positive_signs" object:
   - "safe_indicators": Signs that the situation is currently under control
   - "recovery_signals": Observable improvements that mean the animal is getting better
   - "when_situation_is_controlled": How to know things are going well and heading toward recovery

5. "resource_keywords": Array of 3-5 English keywords for matching related resources in our database (e.g., ["diarrhea", "dehydration", "cattle disease", "fever"])

6. "recommended_provider_type": The type of provider to suggest — "vet", "pharmacy", "groomer", or "trainer"

7. "suggest_livestock_officer": Boolean — true if this is a livestock animal and the user should contact a government livestock officer

8. "guided_response": Empty string for disease queries

FOR "information" QUERIES — provide a guided informational answer:

1. "diagnosis": null
2. "urgency": null
3. "warning_signs": null
4. "positive_signs": null
5. "guided_response": A comprehensive, well-structured answer to the user's question. Use numbered lists and clear headings. Cover the topic thoroughly with Bangladesh-specific context where relevant.
6. "resource_keywords": Array of 3-5 English keywords for matching related resources
7. "recommended_provider_type": Most relevant provider type, or "vet" as default
8. "suggest_livestock_officer": true if this is a livestock query where a government officer's input would be valuable

You MUST respond strictly in the following JSON format:
{{
  "query_type": "disease" | "information",
  "diagnosis": {{
    "possible_problems": "...",
    "what_owner_can_do": "...",
    "things_to_care_about": "..."
  }} | null,
  "urgency": {{
    "level": "monitor_at_home" | "see_vet_this_week" | "call_vet_now" | "emergency",
    "explanation": "..."
  }} | null,
  "warning_signs": {{
    "emergency_situations": "...",
    "negative_symptoms": "...",
    "when_to_worry": "..."
  }} | null,
  "positive_signs": {{
    "safe_indicators": "...",
    "recovery_signals": "...",
    "when_situation_is_controlled": "..."
  }} | null,
  "guided_response": "...",
  "resource_keywords": ["keyword1", "keyword2"],
  "recommended_provider_type": "vet" | "pharmacy" | "groomer" | "trainer",
  "suggest_livestock_officer": true | false
}}"""

        user_prompt = f"Animal: {animal_type_name} ({animal_category})\n\nProblem/Question:\n{problem_description}"

        contents = [
            types.Content(
                role='user',
                parts=[types.Part.from_text(text=user_prompt)]
            )
        ]

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            temperature=0.2
        )

        response = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=contents,
            config=config
        )

        result = json.loads(response.text)
        return result

    except Exception as e:
        logger.error(f"Error calling Gemini Diagnose API: {e}")
        error_msg = (
            "দুঃখিত, এআই বিশ্লেষণে কিছু সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
            if preferred_language == 'bn'
            else "Sorry, there was an issue with the AI analysis. Please try again."
        )
        return {
            "query_type": "disease",
            "diagnosis": {
                "possible_problems": error_msg,
                "what_owner_can_do": "",
                "things_to_care_about": ""
            },
            "urgency": {
                "level": "see_vet_this_week",
                "explanation": error_msg
            },
            "warning_signs": None,
            "positive_signs": None,
            "guided_response": "",
            "resource_keywords": [],
            "recommended_provider_type": "vet",
            "suggest_livestock_officer": False
        }


def _get_mock_response(problem_description, preferred_language, animal_type_name):
    """Return a mock response for tests and development without API key."""

    text_lower = problem_description.lower()
    is_emergency = any(k in text_lower for k in [
        "bleed", "accident", "emergency", "জরুরি", "রক্ত", "poison", "বিষ"
    ])
    is_info_query = any(k in text_lower for k in [
        "medicine", "feed", "food", "ওষুধ", "খাবার", "vaccine", "টিকা",
        "breed", "প্রজনন", "guideline", "housing", "আবাসন"
    ])

    if is_info_query:
        guided_text = (
            "মক তথ্য: এটি একটি মক উত্তর। আপনার প্রশ্নের বিস্তারিত গাইডলাইন এখানে প্রদর্শিত হবে।"
            if preferred_language == 'bn'
            else "Mock Info: This is a mock response. Detailed guidelines for your query would be displayed here."
        )
        return {
            "query_type": "information",
            "diagnosis": None,
            "urgency": None,
            "warning_signs": None,
            "positive_signs": None,
            "guided_response": guided_text,
            "resource_keywords": ["feeding", "care", animal_type_name.lower()],
            "recommended_provider_type": "vet",
            "suggest_livestock_officer": True
        }

    urgency_level = "emergency" if is_emergency else "see_vet_this_week"

    if preferred_language == 'bn':
        diagnosis = {
            "possible_problems": f"মক রোগ নির্ণয়: আপনার {animal_type_name}-এর লক্ষণগুলো বিশ্লেষণ করে সম্ভাব্য কারণ হতে পারে সংক্রমণ, এলার্জি, বা পুষ্টির অভাব। বিস্তারিত পরীক্ষার জন্য পশু চিকিৎসকের কাছে যান।",
            "what_owner_can_do": "১. পর্যাপ্ত পরিষ্কার পানি দিন\n২. পরিষ্কার ও আরামদায়ক জায়গায় রাখুন\n৩. অন্য পশু থেকে আলাদা রাখুন\n৪. খাওয়ার পরিমাণ ও মল পর্যবেক্ষণ করুন",
            "things_to_care_about": "ওষুধ নিজে থেকে দেবেন না। মানুষের ওষুধ পশুর জন্য ক্ষতিকর হতে পারে। তাপমাত্রা ও আবহাওয়ার প্রভাব খেয়াল রাখুন।"
        }
        warning_signs = {
            "emergency_situations": "যদি প্রাণীটি অচেতন হয়ে যায়, ক্রমাগত রক্তপাত হয়, বা শ্বাসকষ্ট তীব্র হয় তাহলে তাৎক্ষণিক জরুরি চিকিৎসা প্রয়োজন।",
            "negative_symptoms": "খাওয়া সম্পূর্ণ বন্ধ করা, উচ্চ জ্বর (১০৩°F এর বেশি), ডায়রিয়ায় রক্ত, নিস্তেজ ও অসাড় হয়ে যাওয়া।",
            "when_to_worry": "যদি ২৪ ঘণ্টার মধ্যে অবস্থার উন্নতি না হয়, বা জ্বর ৪৮ ঘণ্টার বেশি স্থায়ী হয়।"
        }
        positive_signs = {
            "safe_indicators": "প্রাণীটি সচেতন ও সক্রিয়, নিজে থেকে পানি পান করছে, স্বাভাবিক তাপমাত্রা।",
            "recovery_signals": "খাওয়ার আগ্রহ ফিরে আসা, স্বাভাবিক মলত্যাগ, চোখ উজ্জ্বল ও সচল হওয়া।",
            "when_situation_is_controlled": "যখন প্রাণীটি স্বাভাবিক খাবার খেতে শুরু করবে এবং ৪৮ ঘণ্টায় কোনো নতুন লক্ষণ দেখা দেবে না।"
        }
    else:
        diagnosis = {
            "possible_problems": f"Mock Diagnosis: Based on the symptoms described for your {animal_type_name}, possible causes include infection, allergy, or nutritional deficiency. Please visit a veterinarian for detailed examination.",
            "what_owner_can_do": "1. Provide plenty of clean water\n2. Keep in a clean, comfortable area\n3. Isolate from other animals\n4. Monitor food intake and stool",
            "things_to_care_about": "Do not administer medication without veterinary guidance. Human medicines can be harmful to animals. Watch for temperature and weather effects."
        }
        warning_signs = {
            "emergency_situations": "If the animal becomes unconscious, has continuous bleeding, or severe breathing difficulty, seek immediate emergency care.",
            "negative_symptoms": "Complete loss of appetite, high fever (above 103°F), blood in diarrhea, extreme lethargy.",
            "when_to_worry": "If no improvement within 24 hours, or fever persists beyond 48 hours."
        }
        positive_signs = {
            "safe_indicators": "Animal is alert and active, drinking water on its own, normal body temperature.",
            "recovery_signals": "Appetite returning, normal stool, bright eyes and active movement.",
            "when_situation_is_controlled": "When the animal starts eating normally and no new symptoms appear within 48 hours."
        }

    return {
        "query_type": "disease",
        "diagnosis": diagnosis,
        "urgency": {
            "level": urgency_level,
            "explanation": (
                "লক্ষণগুলো পর্যবেক্ষণ করে এই স্তর নির্ধারণ করা হয়েছে।"
                if preferred_language == 'bn'
                else "This urgency level was determined based on the reported symptoms."
            )
        },
        "warning_signs": warning_signs,
        "positive_signs": positive_signs,
        "guided_response": "",
        "resource_keywords": ["disease", "symptom", animal_type_name.lower()],
        "recommended_provider_type": "vet",
        "suggest_livestock_officer": False
    }
