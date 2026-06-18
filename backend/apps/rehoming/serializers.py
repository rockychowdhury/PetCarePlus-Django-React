"""
PetCarePlus v2 — Rehoming Serializers

Serializers for RehomingListings and RehomingApplications.
Validates rehoming capability (cat/dog only) and ownership logic.
"""

from rest_framework import serializers
from apps.rehoming.models import RehomingListing, RehomingApplication


class RehomingListingSerializer(serializers.ModelSerializer):
    """
    Serializer for RehomingListing.
    Validates pet ownership and rehoming support flags (cat/dog only).
    """
    animal_type_details = serializers.SerializerMethodField()
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    owner_email = serializers.EmailField(source='owner.email', read_only=True)

    class Meta:
        model = RehomingListing
        fields = [
            'id', 'animal_type', 'animal_type_details', 'pet_name', 'breed', 'gender',
            'age', 'description', 'weight_kg', 'spayed_neutered', 'vaccinated', 'photo_url',
            'district', 'latitude', 'longitude', 'adopter_requirements',
            'owner', 'owner_name', 'owner_email', 'reason', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'status', 'created_at', 'updated_at']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user:
            # Auto-populate location from user if not provided
            if not validated_data.get('district'):
                validated_data['district'] = request.user.district
            if validated_data.get('latitude') is None:
                validated_data['latitude'] = request.user.latitude
            if validated_data.get('longitude') is None:
                validated_data['longitude'] = request.user.longitude
        return super().create(validated_data)

    def get_animal_type_details(self, obj):
        from apps.animals.serializers import AnimalTypeSerializer
        if obj.animal_type:
            return AnimalTypeSerializer(obj.animal_type, context=self.context).data
        return None

    def validate_animal_type(self, value):
        # Category check (supports_rehoming = cat/dog only)
        if not value.supports_rehoming:
            raise serializers.ValidationError(
                f"'{value.name_en}' cannot be listed for rehoming. "
                f"Only cats and dogs are eligible."
            )
        return value


class RehomingApplicationSerializer(serializers.ModelSerializer):
    """
    Serializer for RehomingApplication.
    Prevents duplicate applications and listing owners from adopting their own pets.
    """
    applicant_name = serializers.CharField(source='applicant.full_name', read_only=True)
    applicant_email = serializers.EmailField(source='applicant.email', read_only=True)
    listing_details = RehomingListingSerializer(source='listing', read_only=True)

    class Meta:
        model = RehomingApplication
        fields = [
            'id', 'listing', 'listing_details', 'applicant', 'applicant_name', 'applicant_email',
            'message', 'status', 'ai_score', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'applicant', 'status', 'ai_score', 'created_at', 'updated_at']

    def validate(self, attrs):
        listing = attrs.get('listing')
        request = self.context.get('request')

        if not request or not request.user:
            raise serializers.ValidationError("Authentication is required.")

        # Creation-only validations
        if listing is not None:
            # 1. Self-adoption check
            if listing.owner == request.user:
                raise serializers.ValidationError("You cannot submit an adoption application to your own listing.")

            # 2. Active listing check
            if listing.status != RehomingListing.Status.ACTIVE:
                raise serializers.ValidationError("This rehoming listing is no longer active.")

            # 3. Duplicate application check
            if RehomingApplication.objects.filter(listing=listing, applicant=request.user).exists():
                raise serializers.ValidationError("You have already submitted an application for this pet.")

        return attrs

