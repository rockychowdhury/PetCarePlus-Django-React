"""
PetCarePlus v2 — Service Providers Serializers

Bilingual serializers for ServiceProvider and ProviderService.
Handles relation linking for supported animal types and services.
"""

from rest_framework import serializers
from common.mixins import BilingualMixin
from apps.animals.models import AnimalType
from apps.animals.serializers import AnimalTypeSerializer
from apps.providers.models import ServiceProvider, ProviderService, ProviderAnimalType


class ProviderServiceSerializer(BilingualMixin, serializers.ModelSerializer):
    """
    Serializer for individual services offered by a provider.
    """
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    class Meta:
        model = ProviderService
        fields = [
            'id', 'provider', 'name', 'description', 'price',
            'duration_minutes', 'is_active', 'created_at',
            'name_en', 'name_bn', 'description_en', 'description_bn'
        ]
        read_only_fields = ['id', 'provider', 'is_active', 'created_at']


    def get_name(self, obj):
        return self.get_bilingual_field(obj, 'name')

    def get_description(self, obj):
        return self.get_bilingual_field(obj, 'description')


class ServiceProviderSerializer(BilingualMixin, serializers.ModelSerializer):
    """
    Serializer for the ServiceProvider profile.
    Dynamically maps bilingual description and handles updates for linked animal types.
    """
    description = serializers.SerializerMethodField()
    services = ProviderServiceSerializer(many=True, read_only=True)
    supported_animal_types = serializers.SerializerMethodField()

    # Field to specify animal type IDs to support on write
    animal_type_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    distance = serializers.FloatField(read_only=True, required=False)

    class Meta:
        model = ServiceProvider
        fields = [
            'id', 'user', 'user_email', 'user_name', 'business_name', 'description',
            'provider_type', 'division', 'district', 'upazila', 'latitude', 'longitude', 'phone', 'email',
            'is_verified', 'is_active', 'avg_rating', 'total_reviews', 'services',
            'supported_animal_types', 'animal_type_ids', 'created_at', 'updated_at',
            'description_en', 'description_bn', 'distance'
        ]
        read_only_fields = [
            'id', 'user', 'is_verified', 'avg_rating', 'total_reviews',
            'created_at', 'updated_at'
        ]

    def get_description(self, obj):
        return self.get_bilingual_field(obj, 'description')

    def get_supported_animal_types(self, obj):
        # Retrieve mapped bilingual animal types
        animal_types = [link.animal_type for link in obj.animal_types.all()]
        serializer = AnimalTypeSerializer(animal_types, many=True, context=self.context)
        return serializer.data

    def validate_animal_type_ids(self, value):
        for at_id in value:
            try:
                at = AnimalType.objects.get(id=at_id)
                if not at.supports_services:
                    raise serializers.ValidationError(
                        f"Animal type '{at.name_en}' is a livestock and does not support provider services."
                    )
            except AnimalType.DoesNotExist:
                raise serializers.ValidationError(f"Animal type with ID {at_id} does not exist.")
        return value

    def create(self, validated_data):
        animal_type_ids = validated_data.pop('animal_type_ids', [])
        provider = ServiceProvider.objects.create(**validated_data)
        
        # Link animal types
        for animal_type_id in animal_type_ids:
            animal_type = AnimalType.objects.get(id=animal_type_id)
            ProviderAnimalType.objects.create(provider=provider, animal_type=animal_type)
            
        return provider

    def update(self, instance, validated_data):
        animal_type_ids = validated_data.pop('animal_type_ids', None)
        instance = super().update(instance, validated_data)
        
        if animal_type_ids is not None:
            # Sync animal types (delete existing links and add new ones)
            instance.animal_types.all().delete()
            for animal_type_id in animal_type_ids:
                animal_type = AnimalType.objects.get(id=animal_type_id)
                ProviderAnimalType.objects.create(provider=instance, animal_type=animal_type)
                
        return instance
