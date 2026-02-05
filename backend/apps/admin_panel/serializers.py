from rest_framework import serializers
from .models import UserReport, ModerationAction
from apps.users.serializers import UserSerializer, PublicUserSerializer
from apps.users.models import RoleRequest
from django.contrib.auth import get_user_model

User = get_user_model()

class UserReportSerializer(serializers.ModelSerializer):
    reporter_email = serializers.EmailField(source='reporter.email', read_only=True)
    reported_user_email = serializers.EmailField(source='reported_user.email', read_only=True)

    class Meta:
        model = UserReport
        fields = [
            'id', 'reporter', 'reporter_email', 'reported_user', 'reported_user_email',
            'reported_content_type', 'reported_content_id',
            'report_type', 'description', 'status', 'admin_notes', 'created_at', 'resolved_at'
        ]
        read_only_fields = ['reporter', 'created_at', 'resolved_at']

class RoleRequestSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    provider_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = RoleRequest
        fields = [
            'id', 'user', 'user_email', 'user_name', 
            'requested_role', 'reason', 'status', 'admin_notes',
            'created_at', 'updated_at', 'provider_profile'
        ]
        read_only_fields = ['user', 'requested_role', 'reason', 'created_at', 'updated_at']

    def get_provider_profile(self, obj):
        if obj.requested_role == 'service_provider' and hasattr(obj.user, 'service_provider_profile'):
            from apps.services.serializers import ServiceProviderSerializer
            return ServiceProviderSerializer(obj.user.service_provider_profile).data
        return None

# Admin-specific serializers
class AdminUserListSerializer(serializers.ModelSerializer):
    """Serializer for admin user list view"""
    pets_count = serializers.SerializerMethodField()
    reports_count = serializers.SerializerMethodField()
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 'role', 'photoURL',
            'email_verified', 'verified_identity', 'is_active', 'account_status',
            'date_joined', 'last_login', 'pets_count', 'reports_count'
        ]
    
    def get_pets_count(self, obj):
        return obj.pets.count()
    
    def get_reports_count(self, obj):
        return obj.reports_against.count()

class AdminUserDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for admin user detail view"""
    pets = serializers.SerializerMethodField()
    reports_against = serializers.SerializerMethodField()
    role_requests = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 'role', 'photoURL', 'bio',
            'phone_number', 'location_city', 'location_state', 'location_country', 'zip_code',
            'email_verified', 'phone_verified', 'verified_identity', 'pet_owner_verified',
            'is_active', 'account_status', 'date_joined', 'last_login',
            'pets', 'reports_against', 'role_requests'
        ]
    
    def get_pets(self, obj):
        return obj.pets.count()
    
    def get_reports_against(self, obj):
        return obj.reports_against.filter(status='pending').count()
    
    def get_role_requests(self, obj):
        return obj.role_requests.filter(status='pending').count()

class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for admin to update user"""
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'role', 'is_active', 'account_status',
            'bio', 'phone_number', 'location_city', 'location_state',
            'verified_identity', 'pet_owner_verified', 'email_verified'
        ]

    def update(self, instance, validated_data):
        # Auto-sync is_active based on account_status
        if 'account_status' in validated_data:
            status = validated_data['account_status']
            if status in ['banned', 'suspended']:
                validated_data['is_active'] = False
            elif status == 'active':
                validated_data['is_active'] = True
        
        return super().update(instance, validated_data)

class UserReportListSerializer(serializers.ModelSerializer):
    """Serializer for listing reports"""
    reporter_name = serializers.CharField(source='reporter.full_name', read_only=True)
    reported_user_name = serializers.CharField(source='reported_user.full_name', read_only=True)
    
    class Meta:
        model = UserReport
        fields = [
            'id', 'reporter', 'reporter_name', 'reported_user', 'reported_user_name',
            'report_type', 'severity', 'status', 'created_at'
        ]

class UserReportDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for report"""
    reporter = PublicUserSerializer(read_only=True)
    reported_user = PublicUserSerializer(read_only=True)
    assigned_to = PublicUserSerializer(read_only=True)
    
    class Meta:
        model = UserReport
        fields = [
            'id', 'reporter', 'reported_user', 'report_type', 'description',
            'severity', 'evidence_urls', 'status', 'assigned_to', 'admin_notes',
            'action_taken', 'created_at', 'resolved_at', 'updated_at'
        ]

class UserReportUpdateSerializer(serializers.ModelSerializer):
    """Serializer for admin to update report"""
    class Meta:
        model = UserReport
        fields = ['status', 'assigned_to', 'admin_notes', 'action_taken', 'severity']

class ModerationActionSerializer(serializers.ModelSerializer):
    """Serializer for moderation actions"""
    moderator_name = serializers.CharField(source='moderator.full_name', read_only=True)
    target_user_name = serializers.CharField(source='target_user.full_name', read_only=True)
    
    class Meta:
        model = ModerationAction
        fields = [
            'id', 'moderator', 'moderator_name', 'target_user', 'target_user_name',
            'action_type', 'reason', 'duration_days', 'related_report',
            'notes', 'expires_at', 'is_active', 'created_at'
        ]
        read_only_fields = ['moderator', 'created_at']
