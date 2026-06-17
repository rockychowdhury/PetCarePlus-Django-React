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

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'user_email', 'user_name', 'provider', 'provider_details',
            'service', 'service_details', 'pet', 'booking_date', 'booking_time',
            'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'status', 'created_at', 'updated_at']

    def validate(self, attrs):
        provider = attrs.get('provider')
        service = attrs.get('service')
        pet = attrs.get('pet')
        request = self.context.get('request')

        # 1. Validate that the service belongs to the chosen provider
        if service and service.provider != provider:
            raise serializers.ValidationError(
                {'service': "The selected service is not offered by the chosen service provider."}
            )

        # 2. Validate that the pet belongs to the requesting customer
        if pet and request and request.user and pet.owner != request.user:
            raise serializers.ValidationError(
                {'pet': "The selected pet does not belong to your account."}
            )

        return attrs
