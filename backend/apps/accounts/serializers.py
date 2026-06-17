"""
PetCarePlus v2 — Accounts Serializers

Serializers for user registration, user profile details/updating,
and custom JWT token claim extensions.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extends standard JWT TokenObtainPairSerializer to return essential user profile details in the login response payload.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Custom claims added to the JWT payload
        token['email'] = user.email
        token['role'] = user.role
        token['full_name'] = user.full_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # User details for response
        user = self.user
        data['user'] = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': user.full_name,
            'phone_number': user.phone_number,
            'photo_url': user.photo_url,
            'role': user.role,
            'division': user.division,
            'district': user.district,
            'upazila': user.upazila,
            'union': user.union,
            'latitude': user.latitude,
            'longitude': user.longitude,
            'preferred_language': user.preferred_language,
        }
        return data


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for handling new user registration.
    Supports Bangladesh hierarchy location and bilingual preference.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=6
    )

    class Meta:
        model = User
        fields = [
            'id', 'email', 'password', 'first_name', 'last_name',
            'phone_number', 'division', 'district', 'upazila', 'union',
            'latitude', 'longitude', 'preferred_language', 'role'
        ]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            division=validated_data.get('division', ''),
            district=validated_data.get('district', ''),
            upazila=validated_data.get('upazila', ''),
            union=validated_data.get('union', ''),
            latitude=validated_data.get('latitude'),
            longitude=validated_data.get('longitude'),
            preferred_language=validated_data.get('preferred_language', 'bn'),
            role=validated_data.get('role', 'pet_owner')
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving and updating user profile information.
    email and role cannot be changed via profile endpoints.
    """
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone_number', 'photo_url', 'bio',
            'division', 'district', 'upazila', 'union', 'latitude', 'longitude',
            'preferred_language', 'role', 'date_joined'
        ]
        read_only_fields = ['id', 'email', 'role', 'date_joined']
