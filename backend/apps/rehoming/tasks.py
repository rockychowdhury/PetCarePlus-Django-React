from apps.rehoming.models import RehomingApplication
from apps.ai_assistant.gemini import analyze_adoption_application

def calculate_ai_score_task(application_id, listing_details, message):
    """
    Background task to calculate the AI matching score for a rehoming application
    and save it to the database.
    """
    try:
        application = RehomingApplication.objects.get(id=application_id)
        
        # Analyze and score using the AI model
        score = analyze_adoption_application(listing_details, message)
        
        # Save score
        application.ai_score = score
        application.save(update_fields=['ai_score'])
        
        return f"Application {application_id} scored: {score}/10"
        
    except RehomingApplication.DoesNotExist:
        return f"Application {application_id} not found."
    except Exception as e:
        return f"Error scoring application {application_id}: {str(e)}"
