"""
PetCarePlus v2 — Rehoming Serializers

Serializers for RehomingListings and RehomingApplications.
Validates rehoming capability (cat/dog only) and ownership logic.
"""

from rest_framework import serializers
from apps.rehoming.models import RehomingListing, RehomingApplication
from apps.pets.serializers import PetSerializer


class RehomingListingSerializer(serializers.ModelSerializer):
    """
    Serializer for RehomingListing.
    Validates pet ownership and rehoming support flags (cat/dog only).
    """
    pet_details = PetSerializer(source='pet', read_only=True)
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    owner_email = serializers.EmailField(source='owner.email', read_only=True)

    class Meta:
        model = RehomingListing
        fields = [
            'id', 'pet', 'pet_details', 'owner', 'owner_name', 'owner_email',
            'reason', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'status', 'created_at', 'updated_at']

    def validate_pet(self, value):
        request = self.context.get('request')

        # 1. Ownership check
        if request and request.user and value.owner != request.user:
            raise serializers.ValidationError("The selected pet does not belong to your account.")

        # 2. Category check (supports_rehoming = cat/dog only)
        if not value.animal_type.supports_rehoming:
            raise serializers.ValidationError(
                f"'{value.animal_type.name_en}' cannot be listed for rehoming. "
                f"Only cats and dogs are eligible."
            )

        # 3. Uniqueness check
        if RehomingListing.objects.filter(pet=value).exists():
            raise serializers.ValidationError("This pet is already listed for rehoming.")

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
            'message', 'living_situation', 'experience', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'applicant', 'status', 'created_at', 'updated_at']

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

        return attrs

