from rest_framework import serializers
from apps.services.models import ServiceBooking, ServiceProvider, ServiceOption
from apps.users.serializers import PublicUserSerializer
from apps.pets.models import PetProfile
from apps.services.serializers import ServiceCategorySerializer

class SimplePetSerializer(serializers.ModelSerializer):
    """
    Minimal pet details for dashboard.
    """
    main_photo = serializers.SerializerMethodField()
    
    class Meta:
        model = PetProfile
        fields = ['id', 'name', 'species', 'breed', 'main_photo']

    def get_main_photo(self, obj):
        main = obj.media.filter(is_primary=True).first()
        if main:
            return main.url
        any_photo = obj.media.first()
        return any_photo.url if any_photo else None

class DashboardServiceProviderSerializer(serializers.ModelSerializer):
    """
    Lightweight provider serializer for dashboard cards.
    Excludes heavy relations like reviews, availability, etc.
    """
    user = PublicUserSerializer(read_only=True)
    category = ServiceCategorySerializer(read_only=True)
    
    class Meta:
        model = ServiceProvider
        fields = [
            'id', 'user', 'business_name', 'category', 
            'city', 'state'
        ]

class DashboardServiceBookingSerializer(serializers.ModelSerializer):
    """
    Optimized booking serializer for dashboard lists.
    """
    provider = DashboardServiceProviderSerializer(read_only=True)
    client = PublicUserSerializer(read_only=True)
    pet = SimplePetSerializer(read_only=True)
    service_option_name = serializers.CharField(source='service_option.name', read_only=True)
    
    class Meta:
        model = ServiceBooking
        fields = [
            'id', 'provider', 'client', 'pet', 'service_option_name',
            'booking_type', 'booking_date', 'booking_time', 
            'start_datetime', 'end_datetime',
            'status', 'payment_status', 
            'created_at', 'duration_hours'
        ]
