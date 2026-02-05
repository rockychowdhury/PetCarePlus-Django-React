import google.generativeai as genai
import os
import json

# Setup API Key
api_key = os.environ.get('GEMINI_API_KEY', None)
if api_key:
    genai.configure(api_key=api_key)
else:
    # Warning: GEMINI_API_KEY not found

def generate_application_content(user, listing, form_data):
    """
    Generates a personalized adoption application using Google Gemini.
    """
    
    # 1. Extract Context
    pet_name = listing.pet.name
    species = listing.pet.species
    breed = listing.pet.breed
    owner_name = listing.owner.first_name
    applicant_name = user.first_name
    
    living = form_data.get('living_situation', {})
    history = form_data.get('pet_history', {})
    care = form_data.get('daily_care', {})
    
    # 2. Construct Prompt
    prompt = f"""
    You are an expert adoption counselor assisting an applicant in writing a warm, professional, and persuasive adoption application for a pet.
    
    Write a personalized letter from {applicant_name} to the pet owner {owner_name}.
    
    **The Pet:**
    - Name: {pet_name}
    - Species: {species}
    - Breed: {breed}
    
    **The Applicant's Profile:**
    - Living Situation: {living.get('home_type')} ({living.get('ownership')}).
    - Household: {living.get('household_members')}.
    - Outdoor Space: {living.get('outdoor_space')}.
    
    **Pet Experience:**
    - Previous Owner: {history.get('previous_ownership')}.
    - Types Owned: {history.get('types_owned', 'N/A')}.
    - Experience Note: {history.get('outcome', 'N/A')}.
    
    **Daily Care Plan:**
    - Primary Caregiver: {care.get('primary_caregiver')}.
    - Time Alone: {care.get('time_alone')}.
    - Routine: {care.get('routine')}.
    
    **Instructions:**
    - Tone: Warm, responsible, genuine, and professional.
    - Structure:
        1. Greeting.
        2. Express strong interest in {pet_name} specifically.
        3. Explain why the home environment is perfect (mention the yard/home type).
        4. Highlight pet experience to show competence.
        5. Describe the daily routine to show commitment.
        6. Closing (asking for a meeting/next steps).
    - Do NOT include placeholders like [Your Name]. Use the real name: {applicant_name}.
    - Keep it under 300 words.
    """
    
    # Retry logic for Rate Limits (429)
    # Try up to 4 times with exponential backoff
    import time
    from google.api_core import exceptions
    
    for attempt in range(4):
        try:
            # Using stable flash model for better reliability
            model = genai.GenerativeModel('gemini-flash-latest')
            response = model.generate_content(prompt)
            return response.text.replace('**', '').strip() 
            
        except exceptions.ResourceExhausted:
            wait_time = 3 * (attempt + 1)
            time.sleep(wait_time)
            continue
            
        except Exception:
            # For other errors, log (optionally) and break to fallback
            break
            
    # Fallback to a basic template if all retries fail
    return f"Dear {owner_name},\n\nI am writing to apply for {pet_name}. I have reviewed the profile and believe I can provide a loving home. I live in a {living.get('home_type')} and have a plan for daily care. I look forward to hearing from you.\n\nSincerely,\n{applicant_name}"


def calculate_match_score(pet_details, applicant_details, message):
    """
    Analyzes the match between a pet and an applicant.
    Returns: integer percentage (0-100)
    """
    
    # Retry logic details...
    import time
    from google.api_core import exceptions
    
    prompt = f"""
    You are an expert pet adoption counselor. Evaluate the compatibility between this pet and the applicant.
    
    PET PROFILE:
    {json.dumps(pet_details, indent=2)}
    
    APPLICANT PROFILE:
    {json.dumps(applicant_details, indent=2)}
    
    APPLICANT MESSAGE:
    "{message}"
    
    TASK:
    Analyze the compatibility based on living situation, experience, and lifestyle.
    Provide a SINGLE integer between 0 and 100 representing the match percentage.
    If the applicant seems excellent, give 80-100.
    If there are concerns, give 40-79.
    If there are major red flags, give 0-39.
    
    OUTPUT FORMAT:
    Just the number. Nothing else.
    """

    for attempt in range(4):
        try:
            model = genai.GenerativeModel('gemini-flash-latest')
            response = model.generate_content(prompt)
            text = response.text.strip()
            # Extract number
            import re
            match = re.search(r'\d+', text)
            if match:
                return int(match.group())
            return 50 # Default if no number found
            
        except exceptions.ResourceExhausted:
            wait_time = 3 * (attempt + 1)
            time.sleep(wait_time)
            continue
        except Exception as e:
            pass
            break
            
    return 0 # Error default
