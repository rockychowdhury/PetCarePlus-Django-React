from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import AuthenticationFailed
from .models import RoleRequest, UserTrustReview
from apps.pets.models import PetProfile

# Import PetProfileSerializer to ensure consistent pet representation (including media)
from apps.pets.serializers import PetProfileSerializer

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        try:
            user = User.objects.get(email=attrs['email'])
        except User.DoesNotExist:
            return super().validate(attrs)

        if user and not user.is_active:
            raise AuthenticationFailed(
                detail={'detail': 'Your account has been deactivated.', 'code': 'account_deactivated'}
            )
        
        data = super().validate(attrs)
        data['role'] = user.role
        data['user_id'] = user.id
        data['is_verified'] = user.is_verified
        return data

class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'photoURL', 'role', 'verified_identity', 'pet_owner_verified', 'location_city', 'location_state', 'phone_number']

class RoleRequestSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = RoleRequest
        fields = ['id', 'user', 'user_email', 'requested_role', 'reason', 'status', 'admin_notes', 'created_at', 'updated_at']
        read_only_fields = ['user', 'status', 'admin_notes', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email','password','first_name','last_name', 'phone_number', 
                  'location_city', 'location_state', 'location_country', 'zip_code', 'latitude', 'longitude']
        extra_kwargs = {
            "password":{"write_only":True},
            }
    
    def validate_password(self, value):
        """Validate password strength using Django's password validators"""
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value
            
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone_number', 'phone_verified', 'photoURL', 'bio', 
                  'location_city', 'location_state', 'location_country', 'zip_code', 'privacy_settings', 'date_of_birth']
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'phone_number': {'required': False},
            'phone_verified': {'required': False},
            'photoURL': {'required': False},
            'bio': {'required': False},
        }

class UserTrustReviewSerializer(serializers.ModelSerializer):
    reviewer = PublicUserSerializer(read_only=True)
    class Meta:
        model = UserTrustReview
        fields = ['id', 'reviewer', 'reviewee', 'rating', 'comment', 'created_at']
        read_only_fields = ['reviewer', 'reviewee', 'created_at']


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for user profile (GET /api/user/).
    Excludes heavy nested relations like 'pets' and 'received_reviews'.
    """
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 'role', 'photoURL', 'bio', 'date_of_birth',
            'phone_number', 'location_city', 'location_state', 'location_country', 'zip_code',
            'email_verified', 'phone_verified', 'verified_identity', 'pet_owner_verified',
            'can_create_listing', 'account_status', 'profile_is_complete', 'missing_profile_fields',
            'has_service_profile',
            'privacy_settings' 
        ]

class UserSerializer(serializers.ModelSerializer):
    # Use the shared serializer
    pets = PetProfileSerializer(many=True, read_only=True)
    received_reviews = UserTrustReviewSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 'role', 'photoURL', 'bio', 'date_of_birth',
            'phone_number', 'location_city', 'location_state', 'location_country', 'zip_code',
            'email_verified', 'phone_verified', 'verified_identity', 'pet_owner_verified',
            'can_create_listing', 'account_status', 'profile_is_complete', 'missing_profile_fields',
            'has_service_profile',
            'pets', 'privacy_settings', 'received_reviews'
        ]

class AdminUserDetailSerializer(UserSerializer):
    """
    Detailed serializer for admin use only.
    Includes sensitive fields and system flags.
    """
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + [
            'is_superuser', 'last_login', 'date_joined',
            'phone_verification_code', 'phone_verification_sent_at',
            'verification_code' 
        ]
        read_only_fields = ['last_login', 'date_joined']
