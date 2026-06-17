"""
PetCarePlus v2 — Pets Serializers

Serializer for companion pet profiles.
Validates companion capability check at the database/API level.
"""

from rest_framework import serializers
from apps.animals.models import AnimalType
from apps.animals.serializers import AnimalTypeSerializer
from apps.pets.models import Pet


class PetSerializer(serializers.ModelSerializer):
    """
    Serializer for the Pet model.
    Enforces companion-only animal type constraints on writes.
    """
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    animal_type_details = AnimalTypeSerializer(source='animal_type', read_only=True)

    class Meta:
        model = Pet
        fields = [
            'id', 'owner', 'owner_email', 'animal_type', 'animal_type_details',
            'name', 'breed', 'gender', 'birth_date', 'description',
            'weight_kg', 'spayed_neutered', 'vaccinated', 'photo_url',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'is_active', 'created_at', 'updated_at']

    def validate_animal_type(self, value):
        # Only allow companion pets
        if value.category != AnimalType.Category.COMPANION:
            raise serializers.ValidationError(
                f"'{value.name_en}' is livestock. Only companion animals (Cat, Dog, Rabbit, Bird) "
                f"can be registered as pets."
            )
        return value
