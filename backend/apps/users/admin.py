from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.admin import ModelAdmin
from .models import User, RoleRequest, UserTrustReview

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "first_name", "last_name", "role", "email_verified", "is_staff")
    list_filter = ("role", "email_verified", "verified_identity", "is_staff", "is_active")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone_number', 'photoURL', 'bio', 'location_city', 'location_state', 'location_country', 'zip_code')}),
        ('Verification', {'fields': ('email_verified', 'phone_verified', 'verified_identity', 'pet_owner_verified')}),
        ('Role & Status', {'fields': ('role', 'account_status', 'is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Permissions', {'fields': ('groups', 'user_permissions')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password', 'role'),
        }),
    )
    
    filter_horizontal = ('groups', 'user_permissions')
    readonly_fields = ["date_joined", "last_login"]

@admin.register(RoleRequest)
class RoleRequestAdmin(ModelAdmin):
    list_display = ("user", "requested_role", "status", "created_at")
    list_filter = ("status", "requested_role")
    search_fields = ("user__email",)

@admin.register(UserTrustReview)
class UserTrustReviewAdmin(ModelAdmin):
    list_display = ("reviewer", "reviewee", "rating", "created_at")
    search_fields = ("reviewer__email", "reviewee__email")