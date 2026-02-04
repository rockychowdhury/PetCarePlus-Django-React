from rest_framework import serializers
from .models import (
    ServiceCategory, Species, Specialization, ServiceOption,
    ServiceProvider, ServiceMedia, BusinessHours,
    FosterService, VeterinaryClinic, TrainerService,
    GroomerService, PetSitterService,
    ServiceBooking, ServiceReview, ProviderAvailabilityBlock
)
from apps.users.serializers import PublicUserSerializer
from apps.pets.serializers import PetProfileSerializer

class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'slug', 'description', 'icon_name']

class SpeciesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Species
        fields = ['id', 'name', 'slug']

class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = ['id', 'name', 'description', 'category']

class ServiceOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceOption
        fields = ['id', 'name', 'base_price', 'description', 'category']

class ServiceMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceMedia
        fields = ['id', 'file_url', 'thumbnail_url', 'is_primary', 'alt_text']

class BusinessHoursSerializer(serializers.ModelSerializer):
    day_display = serializers.CharField(source='get_day_display', read_only=True)
    
    class Meta:
        model = BusinessHours
        fields = ['id', 'day', 'day_display', 'open_time', 'close_time', 'is_closed']
        extra_kwargs = {
            'id': {'read_only': True}
        }

class FosterServiceSerializer(serializers.ModelSerializer):
    species_accepted = SpeciesSerializer(many=True, read_only=True)
    species_accepted_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Species.objects.all(), source='species_accepted'
    )
    
    class Meta:
        model = FosterService
        fields = [
            'capacity', 'current_count', 'current_availability', 
            'species_accepted', 'species_accepted_ids', 'environment_details', 'care_standards',
            'daily_rate', 'weekly_discount', 'monthly_rate',
            'video_url'
        ]

    def validate_capacity(self, value):
        """Ensure capacity is positive"""
        if value <= 0:
            raise serializers.ValidationError("Capacity must be greater than 0")
        return value

    def validate_daily_rate(self, value):
        """Ensure daily rate is positive"""
        if value <= 0:
            raise serializers.ValidationError("Daily rate must be greater than 0")
        return value

class VeterinaryClinicSerializer(serializers.ModelSerializer):
    services_offered = ServiceOptionSerializer(many=True, read_only=True)
    services_offered_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=ServiceOption.objects.all(), source='services_offered'
    )
    species_treated = SpeciesSerializer(many=True, read_only=True)
    species_treated_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Species.objects.all(), source='species_treated'
    )
    
    base_price = serializers.SerializerMethodField()

    class Meta:
        model = VeterinaryClinic
        fields = [
            'clinic_type', 'services_offered', 'services_offered_ids', 
            'species_treated', 'species_treated_ids',
            'pricing_info', 'amenities', 'emergency_services', 'base_price'
        ]

    def validate_services_offered_ids(self, value):
        """Ensure at least one service is offered"""
        if not value or len(value) == 0:
            raise serializers.ValidationError(
                "Veterinary clinics must offer at least one service"
            )
        return value

    def validate_amenities(self, value):
        """Validate amenities is a list"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Amenities must be a list")
        return value

    def get_base_price(self, obj):
        # Extract price from pricing_info string (e.g., "Starts at $75")
        import re
        if obj.pricing_info:
            match = re.search(r'\$(\d+)', obj.pricing_info)
            if match:
                return float(match.group(1))
        return None

class TrainerServiceSerializer(serializers.ModelSerializer):
    specializations = SpecializationSerializer(many=True, read_only=True)
    specializations_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Specialization.objects.all(), source='specializations'
    )
    species_trained = SpeciesSerializer(many=True, read_only=True)
    species_trained_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Species.objects.all(), source='species_trained'
    )
    
    class Meta:
        model = TrainerService
        fields = [
            'specializations', 'specializations_ids', 'primary_method', 'training_philosophy',
            'certifications', 'years_experience', 'species_trained', 'species_trained_ids',
            'offers_private_sessions', 'offers_group_classes',
            'offers_board_and_train', 'offers_virtual_training',
            'private_session_rate', 'group_class_rate', 'package_options',
            'max_clients', 'current_client_count', 'accepting_new_clients',
            'video_url'
        ]

    def validate_specializations_ids(self, value):
        """Ensure at least one specialization"""
        if not value or len(value) == 0:
            raise serializers.ValidationError(
                "Trainers must have at least one specialization"
            )
        return value

    def validate_certifications(self, value):
        """Validate certifications format"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Certifications must be a list")
        return value

class GroomerServiceSerializer(serializers.ModelSerializer):
    species_accepted = SpeciesSerializer(many=True, read_only=True)
    species_accepted_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Species.objects.all(), source='species_accepted'
    )
    
    class Meta:
        model = GroomerService
        fields = [
            'salon_type', 'base_price', 'service_menu', 
            'species_accepted', 'species_accepted_ids', 'amenities'
        ]

    def validate_service_menu(self, value):
        """Validate service menu format"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Service menu must be a list")
        return value

    def validate_amenities(self, value):
        """Validate amenities format"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Amenities must be a list")
        return value

class PetSitterServiceSerializer(serializers.ModelSerializer):
    species_accepted = SpeciesSerializer(many=True, read_only=True)
    species_accepted_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Species.objects.all(), source='species_accepted'
    )
    
    class Meta:
        model = PetSitterService
        fields = [
            'offers_dog_walking', 'offers_house_sitting', 'offers_drop_in_visits',
            'walking_rate', 'house_sitting_rate', 'drop_in_rate',
            'species_accepted', 'species_accepted_ids',
            'years_experience', 'is_insured', 'has_transport', 'service_radius_km'
        ]

class ServiceReviewSerializer(serializers.ModelSerializer):
    reviewer = PublicUserSerializer(read_only=True)
    rating = serializers.IntegerField(source='rating_overall', read_only=True)
    comment = serializers.CharField(source='review_text', read_only=True)
    
    provider_details = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceReview
        fields = [
            'id', 'booking', 'provider', 'provider_details', 'reviewer', 'rating', 'comment', 
            'rating_overall', 'review_text',
            'rating_communication', 'rating_cleanliness', 'rating_quality', 'rating_value',
            'category', 'verified_client', 'provider_response', 'response_date', 'created_at'
        ]
        read_only_fields = ['reviewer', 'response_date', 'created_at']

    def get_provider_details(self, obj):
        return {
            'business_name': obj.provider.business_name,
            'category': obj.provider.category.name if obj.provider.category else None,
            'category_slug': obj.provider.category.slug if obj.provider.category else None
        }


class ProviderAvailabilityBlockSerializer(serializers.ModelSerializer):
    """Serializer for provider availability blocks"""
    
    class Meta:
        model = ProviderAvailabilityBlock
        fields = [
            'id', 'block_date', 'start_time', 'end_time',
            'is_all_day', 'is_recurring', 'recurrence_pattern',
            'day_of_week', 'reason', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate(self, data):
        """Validate availability block data"""
        # If recurring, must have day_of_week and recurrence_pattern
        if data.get('is_recurring'):
            if data.get('day_of_week') is None or not data.get('recurrence_pattern'):
                raise serializers.ValidationError(
                    "Recurring blocks require day_of_week and recurrence_pattern"
                )
        
        # If not recurring, must have block_date
        if not data.get('is_recurring') and not data.get('block_date'):
            raise serializers.ValidationError(
                "Non-recurring blocks require block_date"
            )
        
        # If not all-day, must have times
        if not data.get('is_all_day'):
            if not data.get('start_time') or not data.get('end_time'):
                raise serializers.ValidationError(
                    "Non all-day blocks require start_time and end_time"
                )
            
            # End time must be after start time
            if data.get('end_time') <= data.get('start_time'):
                raise serializers.ValidationError(
                    "end_time must be after start_time"
                )
        
        return data

class CategoryField(serializers.SlugRelatedField):
    def to_representation(self, value):
        return ServiceCategorySerializer(value).data

class ServiceProviderSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)
    category = CategoryField(
        queryset=ServiceCategory.objects.all(), 
        slug_field='slug'
    )
    media = ServiceMediaSerializer(many=True, read_only=True)
    hours = BusinessHoursSerializer(many=True, required=False)
    availability_blocks = ProviderAvailabilityBlockSerializer(many=True, read_only=True)
    reviews = ServiceReviewSerializer(many=True, read_only=True)
    
    foster_details = FosterServiceSerializer(required=False, allow_null=True)
    vet_details = VeterinaryClinicSerializer(required=False, allow_null=True)
    trainer_details = TrainerServiceSerializer(required=False, allow_null=True)
    groomer_details = GroomerServiceSerializer(required=False, allow_null=True)
    sitter_details = PetSitterServiceSerializer(required=False, allow_null=True)
    
    avg_rating = serializers.FloatField(read_only=True)
    avg_communication = serializers.FloatField(read_only=True)
    avg_cleanliness = serializers.FloatField(read_only=True)
    avg_quality = serializers.FloatField(read_only=True)
    avg_value = serializers.FloatField(read_only=True)
    
    reviews_count = serializers.IntegerField(source='review_count', read_only=True)
    is_verified = serializers.SerializerMethodField()
    distance = serializers.FloatField(read_only=True, required=False)  # Annotated by haversine filter
    
    address = serializers.SerializerMethodField()
    service_specific_details = serializers.SerializerMethodField()

    class Meta:
        model = ServiceProvider
        fields = [
            'id', 'user', 'business_name', 'category', 'description', 'website',
            'phone', 'email', 'license_number', 'verification_status',
            'media', 'hours', 'availability_blocks',
            'address', 
            'address_line1', 'address_line2', 'city', 'state', 'zip_code', 'latitude', 'longitude',
            'is_verified', 'reviews', 'reviews_count', 'avg_rating', 
            'avg_communication', 'avg_cleanliness', 'avg_quality', 'avg_value',
            'distance',
            'service_specific_details',
            'foster_details', 'vet_details', 'trainer_details', 'groomer_details', 'sitter_details',
            'settings',
            'created_at'
        ]
        read_only_fields = ['user', 'created_at', 'avg_rating', 'reviews_count', 'address', 'service_specific_details']
        extra_kwargs = {
            'address_line1': {'write_only': True},
            'address_line2': {'write_only': True},
            'city': {'write_only': True},
            'state': {'write_only': True},
            'zip_code': {'write_only': True},
            'latitude': {'write_only': True},
            'longitude': {'write_only': True},
        }

    def get_address(self, obj):
        return {
            "line1": obj.address_line1,
            "line2": obj.address_line2,
            "city": obj.city,
            "state": obj.state,
            "zip": obj.zip_code,
            "coordinates": {
                "lat": obj.latitude,
                "lng": obj.longitude
            }
        }

    def get_service_specific_details(self, obj):
        # Determine category and return appropriate details
        # Note: Ideally we check obj.category.slug, but here we check relation existence
        if hasattr(obj, 'vet_details'):
            return VeterinaryClinicSerializer(obj.vet_details).data
        elif hasattr(obj, 'foster_details'):
            return FosterServiceSerializer(obj.foster_details).data
        elif hasattr(obj, 'trainer_details'):
            return TrainerServiceSerializer(obj.trainer_details).data
        elif hasattr(obj, 'groomer_details'):
            return GroomerServiceSerializer(obj.groomer_details).data
        elif hasattr(obj, 'sitter_details'):
            return PetSitterServiceSerializer(obj.sitter_details).data
        return {}
        
    def get_is_verified(self, obj):
        return obj.verification_status == 'verified'

    def get_distance(self, obj):
        return getattr(obj, 'distance', None)

    def validate(self, attrs):
        """Comprehensive validation"""
        category = attrs.get('category')
        
        if category:
            category_slug = category.slug if hasattr(category, 'slug') else None
            
            # Ensure category-specific details are provided
            if category_slug == 'veterinary' and not attrs.get('vet_details'):
                raise serializers.ValidationError("Veterinary providers must provide clinic details")
            elif category_slug == 'foster' and not attrs.get('foster_details'):
                raise serializers.ValidationError("Foster providers must provide service details")
            elif category_slug == 'training' and not attrs.get('trainer_details'):
                raise serializers.ValidationError("Training providers must provide trainer details")
            elif category_slug == 'grooming' and not attrs.get('groomer_details'):
                raise serializers.ValidationError("Grooming providers must provide groomer details")
            elif category_slug == 'pet_sitting' and not attrs.get('sitter_details'):
                raise serializers.ValidationError("Pet sitting providers must provide sitter details")
        
        return attrs
        
    def create(self, validated_data):
        foster_data = validated_data.pop('foster_details', None)
        vet_data = validated_data.pop('vet_details', None)
        trainer_data = validated_data.pop('trainer_details', None)
        groomer_data = validated_data.pop('groomer_details', None)
        sitter_data = validated_data.pop('sitter_details', None)
        hours_data = validated_data.pop('hours', [])
        
        provider = ServiceProvider.objects.create(**validated_data)
        
        # Create business hours
        for hour_data in hours_data:
            BusinessHours.objects.create(provider=provider, **hour_data)
        
        if foster_data:
            species = foster_data.pop('species_accepted', [])
            foster = FosterService.objects.create(provider=provider, **foster_data)
            foster.species_accepted.set(species)
        elif vet_data:
            services = vet_data.pop('services_offered', [])
            species = vet_data.pop('species_treated', [])
            vet = VeterinaryClinic.objects.create(provider=provider, **vet_data)
            vet.services_offered.set(services)
            vet.species_treated.set(species)
        elif trainer_data:
            specializations = trainer_data.pop('specializations', [])
            species = trainer_data.pop('species_trained', [])
            trainer = TrainerService.objects.create(provider=provider, **trainer_data)
            trainer.specializations.set(specializations)
            trainer.species_trained.set(species)
        elif groomer_data:
            species = groomer_data.pop('species_accepted', [])
            groomer = GroomerService.objects.create(provider=provider, **groomer_data)
            groomer.species_accepted.set(species)
        elif sitter_data:
            species = sitter_data.pop('species_accepted', [])
            sitter = PetSitterService.objects.create(provider=provider, **sitter_data)
            sitter.species_accepted.set(species)
            
        return provider
    
    def update(self, instance, validated_data):
        foster_data = validated_data.pop('foster_details', None)
        vet_data = validated_data.pop('vet_details', None)
        trainer_data = validated_data.pop('trainer_details', None)
        groomer_data = validated_data.pop('groomer_details', None)
        sitter_data = validated_data.pop('sitter_details', None)
        
        # Update provider fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Helper to update nested service
        def update_nested_service(model, data, related_name, m2m_fields=[]):
            # Extract M2M data to handle separately
            m2m_data = {}
            for field in m2m_fields:
                if field in data:
                    m2m_data[field] = data.pop(field)
            
            obj, created = model.objects.update_or_create(provider=instance, defaults=data)
            
            # Set M2M relationships
            for field, values in m2m_data.items():
                getattr(obj, field).set(values)

        if foster_data:
            update_nested_service(FosterService, foster_data, 'foster_details', ['species_accepted'])
        elif vet_data:
            update_nested_service(VeterinaryClinic, vet_data, 'vet_details', ['services_offered', 'species_treated'])
        elif trainer_data:
            update_nested_service(TrainerService, trainer_data, 'trainer_details', ['specializations', 'species_trained'])
        elif groomer_data:
            update_nested_service(GroomerService, groomer_data, 'groomer_details', ['species_accepted'])
        elif sitter_data:
            update_nested_service(PetSitterService, sitter_data, 'sitter_details', ['species_accepted'])
            
        return instance

class ServiceBookingSerializer(serializers.ModelSerializer):
    provider = ServiceProviderSerializer(read_only=True)
    client = PublicUserSerializer(read_only=True)
    pet = PetProfileSerializer(read_only=True)
    service_option = ServiceOptionSerializer(read_only=True)
    has_review = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceBooking
        fields = [
            'id', 'provider', 'client', 'pet', 'service_option', 
            'booking_type', 'booking_date', 'booking_time', 
            'start_datetime', 'end_datetime',
            'agreed_price', 'deposit_paid', 'special_requirements',
            'status', 'payment_status', 'cancellation_reason',
            'guest_client_name', 'guest_pet_name', 'guest_email', 'guest_phone',
            'created_at', 'updated_at', 'duration_hours', 'has_review'
        ]
        read_only_fields = ['client', 'agreed_price', 'deposit_paid', 'status', 'payment_status', 'created_at', 'updated_at']

    def get_has_review(self, obj):
        try:
            return obj.review is not None
        except Exception:
            return False

class ServiceBookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceBooking
        fields = [
            'provider', 'pet', 'service_option', 
            'booking_type', 'booking_date', 'booking_time',
            'start_datetime', 'end_datetime',
            'special_requirements', 'agreed_price',
            # Guest fields
            'guest_client_name', 'guest_pet_name', 'guest_email', 'guest_phone',
            'payment_method', 'payment_status',
            'client'
        ]
        extra_kwargs = {
            'pet': {'required': False},
            'booking_type': {'required': False},
        }
    
    def validate(self, attrs):
        request = self.context.get('request')
        
        # Scenario 1: Registered User Booking (Standard)
        if attrs.get('pet'):
             # If user is booking for themselves
             if request and not request.user.is_staff and not hasattr(request.user, 'service_provider_profile'):
                  if request.user != attrs['pet'].owner:
                       raise serializers.ValidationError("You can only book services for your own pets.")
        
        # Scenario 2: Provider Booking (Walk-in / Reception Desk)
        if request and hasattr(request.user, 'service_provider_profile'):
             # If provider is creating booking, they might not start with 'pet' if it's a walk-in
             # but they MUST provide guest details if pet is missing
             if not attrs.get('pet'):
                  if not attrs.get('guest_client_name') or not attrs.get('guest_pet_name'):
                       raise serializers.ValidationError("For walk-in guests, Client Name and Pet Name are required.")
        
        return attrs
