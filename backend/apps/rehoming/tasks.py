from .models import AdoptionInquiry
from .services.ai_service import calculate_match_score
from apps.users.serializers import UserSerializer

import logging

logger = logging.getLogger(__name__)

def analyze_application_match(inquiry_id):
    try:
        inquiry = AdoptionInquiry.objects.get(id=inquiry_id)
        
        # Prepare Data
        # Prepare Data
        # Pet & Listing Context
        pet_data = {
            "name": inquiry.listing.pet.name,
            "species": inquiry.listing.pet.species,
            "breed": inquiry.listing.pet.breed,
            "age": str(inquiry.listing.pet.birth_date) if inquiry.listing.pet.birth_date else "Unknown",
            "gender": inquiry.listing.pet.gender,
            "size": inquiry.listing.pet.size_category,
            "description": inquiry.listing.pet.description or "",
            "rehoming_reason": inquiry.listing.reason or "",
            "ideal_home": inquiry.listing.ideal_home_notes or ""
        }
        
        # Applicant Context
        applicant = inquiry.requester
        applicant_data = {
            "full_name": f"{applicant.first_name} {applicant.last_name}",
            "email_verified": applicant.email_verified,
            "phone_verified": applicant.phone_verified,
            "identity_verified": applicant.verified_identity,
            "profile_complete": applicant.profile_is_complete,
            "bio": applicant.bio or "",
            "location": f"{applicant.location_city or ''}, {applicant.location_state or ''}",
            "member_since": str(applicant.date_joined.date())
        }
        
        # Run AI Analysis
        score = calculate_match_score(pet_data, applicant_data, inquiry.message)
        
        # Update Model
        inquiry.match_percentage = score
        inquiry.ai_processed = True
        inquiry.save()
        
        logger.info(f"Updated match score for Inquiry {inquiry_id}: {score}%")
        
    except AdoptionInquiry.DoesNotExist:
        logger.error(f"Inquiry {inquiry_id} not found.")
    except Exception as e:
        logger.error(f"Error in analyze_application_match: {e}")
