from rest_framework import serializers
from .models import RehomingListing, RehomingRequest, AdoptionInquiry
from apps.users.serializers import PublicUserSerializer
from apps.pets.models import PetProfile

class PetSnapshotSerializer(serializers.ModelSerializer):
    """
    Read-only snapshot of the pet for listing display.
    """
    traits = serializers.SerializerMethodField()
    age_display = serializers.SerializerMethodField()
    main_photo = serializers.SerializerMethodField()
    photos = serializers.SerializerMethodField()

    class Meta:
        model = PetProfile
        fields = [
            'id', 'name', 'species', 'breed', 'gender', 'age_display', 
            'main_photo', 'photos', 'status',
            'size_category', 'weight_kg', 'spayed_neutered', 'microchipped', 
            'description', 'traits'
        ]

    def get_age_display(self, obj):
        if obj.birth_date:
            import datetime
            today = datetime.date.today()
            age_years = today.year - obj.birth_date.year - ((today.month, today.day) < (obj.birth_date.month, obj.birth_date.day))
            if age_years == 0:
                # Calculate months
                age_months = (today.year - obj.birth_date.year) * 12 + today.month - obj.birth_date.month
                return f"{age_months} months"
            return f"{age_years} years"
        return "Unknown"

    def get_main_photo(self, obj):
        main = obj.media.filter(is_primary=True).first()
        if main:
            return main.url
        any_photo = obj.media.first()
        return any_photo.url if any_photo else None

    def get_photos(self, obj):
        """Return all photos for gallery"""
        return [
            {
                'url': media.url,
                'is_primary': media.is_primary
            }
            for media in obj.media.all().order_by('-is_primary', 'uploaded_at')
        ]

    def get_traits(self, obj):
        return [t.trait.name for t in obj.traits.all()]

class ListingSerializer(serializers.ModelSerializer):
    """List view serializer"""
    owner = PublicUserSerializer(read_only=True)
    pet = PetSnapshotSerializer(read_only=True)
    application_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = RehomingListing
        fields = [
            'id', 'pet', 'owner', 'status', 
            'urgency', 'location_city', 'location_state',
            'published_at', 'created_at', 'reason', 'application_count', 'view_count',
            'latitude', 'longitude'
        ]

class ListingDetailSerializer(serializers.ModelSerializer):
    """Detailed view serializer"""
    owner = PublicUserSerializer(read_only=True)
    pet = PetSnapshotSerializer(read_only=True)
    
    class Meta:
        model = RehomingListing
        fields = '__all__'

class ListingCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating listings"""
    class Meta:
        model = RehomingListing
        exclude = ['created_at', 'updated_at', 'published_at', 'view_count']
        read_only_fields = [
            'owner', 'status', 'request', 'pet',
            'reason', 'urgency', 'ideal_home_notes',
            'location_city', 'location_state'
        ]

class RehomingRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for the owner's request to rehome a pet.
    """
    pet_details = PetSnapshotSerializer(source='pet', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = RehomingRequest
        fields = [
            'id', 'pet', 'pet_details', 'owner', 'reason', 'urgency', 
            'ideal_home_notes', 'location_city', 'location_state', 
            'latitude', 'longitude',
            'status', 'status_display',
            'terms_accepted', 'created_at'
        ]
        read_only_fields = ['owner', 'status']
        extra_kwargs = {
            'location_city': {'required': False},
            'location_state': {'required': False},
        }

    def validate_pet(self, value):
        """
        Validate that the pet belongs to the user and is available for rehoming.
        """
        user = self.context['request'].user
        if value.owner != user:
            raise serializers.ValidationError("You can only create a rehoming request for pets you own.")
        
        if value.status == 'rehomed':
            raise serializers.ValidationError("This pet has already been rehomed.")
            
        return value

class AdoptionInquirySerializer(serializers.ModelSerializer):
    """
    Serializer for adopter inquiries (formerly RehomingRequest).
    Redesigned to provide a nested, comprehensive response structure.
    """
    # Inputs (Write Only)
    listing_id = serializers.PrimaryKeyRelatedField(
        queryset=RehomingListing.objects.all(), 
        source='listing', 
        write_only=True
    )
    message = serializers.CharField(write_only=True)

    # Outputs (Read Only)
    application = serializers.SerializerMethodField()
    pet = serializers.SerializerMethodField()
    listing = serializers.SerializerMethodField()
    applicant = serializers.SerializerMethodField()
    trust_snapshot = serializers.SerializerMethodField()
    application_message = serializers.SerializerMethodField()

    class Meta:
        model = AdoptionInquiry
        fields = [
            'listing_id', 'message', # Write
            'application', 'pet', 'listing', 'applicant', 
            'trust_snapshot', 'application_message' # Read
        ]

    def get_application(self, obj):
        return {
            "id": obj.id,
            "status": obj.status,
            "owner_notes": obj.owner_notes,
            "rejection_reason": obj.rejection_reason,
            "submitted_at": obj.created_at,
            "last_updated_at": obj.updated_at,
            "match_percentage": obj.match_percentage,
            "ai_processed": obj.ai_processed,
            "is_ai_processed": obj.ai_processed # For convenience if needed
        }

    def get_pet(self, obj):
        pet = obj.listing.pet
        # Get primary photo safely
        main_photo = None
        primary = pet.media.filter(is_primary=True).first()
        if primary:
            main_photo = primary.url
        elif pet.media.exists():
            main_photo = pet.media.first().url

        return {
            "id": pet.id,
            "name": pet.name,
            "species": pet.species,
            "breed": pet.breed,
            "gender": pet.gender,
            "primary_photo": main_photo
        }

    def get_listing(self, obj):
        listing = obj.listing
        
        owner_data = None
        if listing.owner:
            owner_data = {
                "id": listing.owner.id,
                "full_name": listing.owner.full_name,
                "photo_url": listing.owner.photoURL,
                "email": listing.owner.email
            }
            
        return {
            "id": listing.id,
            "status": listing.status,
            "urgency": listing.urgency,
            "owner": owner_data,
            "created_at": listing.created_at,
            "location": {
                "city": listing.location_city,
                "state": listing.location_state
            }
        }

    def get_applicant(self, obj):
        user = obj.requester
        return {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email, # For mailto
            "phone": user.phone_number, # For WhatsApp
            "date_of_birth": user.date_of_birth,
            "photo_url": user.photoURL,
            "member_since": user.date_joined,
            "location": {
                "city": user.location_city,
                "state": user.location_state
            }
        }

    def get_trust_snapshot(self, obj):
        user = obj.requester
        
        # Calculate rating
        reviews = user.received_reviews.all()
        count = reviews.count()
        avg_rating = 0
        if count > 0:
            total = sum(r.rating for r in reviews)
            avg_rating = round(total / count, 1)

        return {
            "email_verified": user.email_verified,
            "phone_verified": user.phone_verified,
            "identity_verified": user.verified_identity,
            "pet_owner_verified": user.pet_owner_verified,
            "profile_completed": user.profile_is_complete,
            "average_rating": avg_rating,
            "reviews_count": count
        }

    def get_application_message(self, obj):
        return {
            "intro_message": obj.message
        }
