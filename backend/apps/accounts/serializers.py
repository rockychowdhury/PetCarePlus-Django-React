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
            'full_name': user.full_name,
            'name': user.full_name,  # Compatibility key
            'phone_number': user.phone_number,
            'phone': user.phone_number,  # Compatibility key
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
    Only collects email, name, phone, and role.
    Generates a secure password and emails it to the user.
    """
    name = serializers.CharField(write_only=True, required=True)
    phone = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'phone', 'role'
        ]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        name = validated_data['name'].strip()
        role = validated_data.get('role', 'pet_owner')
        is_provider = role == 'provider'

        # Create user
        user = User.objects.create(
            email=validated_data['email'],
            full_name=name,
            phone_number=validated_data['phone'],
            role=role,
            is_active=not is_provider  # Provider accounts start as inactive
        )

        from django.core.mail import send_mail
        from django.conf import settings

        if is_provider:
            # Set unusable password for providers until admin verifies
            user.set_unusable_password()
            user.save()

            # Send pending approval email
            subject = 'Pending Approval: PetCarePlus / অনুমোদনের অপেক্ষায়'
            message = f"""Hi {validated_data['name']},

Your provider account has been successfully created but is currently pending approval.
আপনার সেবাদাতা অ্যাকাউন্টটি সফলভাবে তৈরি করা হয়েছে তবে এটি বর্তমানে অনুমোদনের অপেক্ষায় রয়েছে।

Please contact your nearest Department of Livestock Services officer to verify your profile.
আপনার প্রোফাইল যাচাই করার জন্য অনুগ্রহ করে আপনার নিকটস্থ প্রাণিসম্পদ অধিদপ্তরের কর্মকর্তার সাথে যোগাযোগ করুন।

Once verified, you will receive another email with your login password.
যাচাইকরণ সম্পন্ন হলে, আপনি লগইন পাসওয়ার্ডসহ আরেকটি ইমেইল পাবেন।

Best regards,
PetCarePlus Team
পেটকেয়ারপ্লাস টিম
"""
        else:
            # Generate random password for regular users
            import secrets
            import string
            alphabet = string.ascii_letters + string.digits
            password = ''.join(secrets.choice(alphabet) for _ in range(8))
            
            user.set_password(password)
            user.save()

            # Send welcome email containing credentials
            subject = 'Welcome to PetCarePlus / পেটকেয়ারপ্লাসে আপনাকে স্বাগতম!'
            message = f"""Hi {validated_data['name']},

Welcome to PetCarePlus! Your account has been successfully created.
পেটকেয়ারপ্লাসে আপনাকে স্বাগতম! আপনার অ্যাকাউন্টটি সফলভাবে তৈরি করা হয়েছে।

Here are your login credentials to access the platform:
প্ল্যাটফর্মে প্রবেশ করার জন্য আপনার লগইন বিবরণ নিচে দেওয়া হলো:

Email (ইমেইল): {user.email}
Password (পাসওয়ার্ড): {password}

Please log in using the link below and set up your location details:
অনুগ্রহ করে নিচের লিঙ্কের মাধ্যমে লগইন করুন এবং আপনার অবস্থান নির্ধারণ করুন:

{settings.FRONTEND_URL}/login

Best regards,
PetCarePlus Team
পেটকেয়ারপ্লাস টিম
"""

        def send_email_async():
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL or 'noreply@petcareplus.app',
                [user.email],
                fail_silently=True
            )

        import threading
        threading.Thread(target=send_email_async).start()

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving and updating user profile information.
    email and role cannot be changed via profile endpoints.
    Maps name and phone for frontend compatibility.
    """
    name = serializers.CharField(required=False, write_only=True)
    phone = serializers.CharField(required=False, write_only=True)
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name',
            'phone_number', 'photo_url', 'bio',
            'division', 'district', 'upazila', 'union', 'latitude', 'longitude',
            'preferred_language', 'role', 'date_joined',
            'name', 'phone'
        ]
        read_only_fields = ['id', 'email', 'role', 'date_joined']

    def update(self, instance, validated_data):
        name = validated_data.pop('name', None)
        phone = validated_data.pop('phone', None)
        photo_url = validated_data.pop('photo_url', None)

        if name is not None:
            instance.full_name = name

        if phone is not None:
            instance.phone_number = phone
            
        if photo_url is not None:
            instance.photo_url = photo_url

        return super().update(instance, validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Expose name and phone for frontend state syncing
        data['name'] = instance.full_name
        data['phone'] = instance.phone_number
        return data
