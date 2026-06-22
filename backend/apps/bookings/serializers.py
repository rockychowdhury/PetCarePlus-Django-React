"""
PetCarePlus v2 — Bookings Serializers

Serializer for scheduling and viewing appointments.
Validates that services and pets are correctly associated.
"""

from rest_framework import serializers
from apps.bookings.models import Booking
from apps.providers.serializers import ServiceProviderSerializer, ProviderServiceSerializer


class BookingSerializer(serializers.ModelSerializer):
    """
    Serializer for the Booking model.
    Includes rich nested details for reads while using primary keys for writes.
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    provider_details = ServiceProviderSerializer(source='provider', read_only=True)
    service_details = ProviderServiceSerializer(source='service', read_only=True)
    animal_type_details = serializers.SerializerMethodField()
    has_review = serializers.SerializerMethodField()
    review_rating = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'user_email', 'user_name', 'provider', 'provider_details',
            'service', 'service_details', 'animal_type', 'animal_type_details', 'booking_date', 'booking_time',
            'status', 'notes', 'has_review', 'review_rating', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'status', 'created_at', 'updated_at']

    def get_animal_type_details(self, obj):
        from apps.animals.serializers import AnimalTypeSerializer
        if obj.animal_type:
            return AnimalTypeSerializer(obj.animal_type, context=self.context).data
        return None

    def get_has_review(self, obj):
        return hasattr(obj, 'review')

    def get_review_rating(self, obj):
        if hasattr(obj, 'review'):
            return obj.review.rating
        return None

    def validate(self, attrs):
        provider = attrs.get('provider')
        service = attrs.get('service')
        animal_type = attrs.get('animal_type')
        request = self.context.get('request')

        # 1. Validate that the service belongs to the chosen provider
        if service and service.provider != provider:
            raise serializers.ValidationError(
                {'service': "The selected service is not offered by the chosen service provider."}
            )

        # 2. Validate that the chosen animal type is supported by the provider
        if animal_type and not provider.animal_types.filter(animal_type=animal_type).exists():
            raise serializers.ValidationError(
                {'animal_type': "The selected provider does not support this animal type."}
            )

        return attrs
