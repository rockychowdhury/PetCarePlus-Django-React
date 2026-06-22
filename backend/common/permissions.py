"""
PetCarePlus v2 — Custom DRF Permissions

Role-based permissions for the platform:
- IsProvider: user has the 'provider' role
- IsVerifiedProvider: provider with is_verified=True
- IsOwnerOrAdmin: object belongs to user, or user is admin
"""

from rest_framework import permissions


class IsProvider(permissions.BasePermission):
    """Allows access only to users with the 'provider' role."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'provider'
        )


class IsVerifiedProvider(permissions.BasePermission):
    """Allows access only to verified service providers."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'provider'
            and hasattr(request.user, 'service_provider')
            and request.user.service_provider.is_verified
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission: allows access if the user owns the object
    or is an admin.

    Checks for 'owner', 'user', or 'reviewer' FK fields on the object.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True

        # Check common ownership fields
        for field in ('owner', 'user', 'reviewer', 'applicant'):
            owner = getattr(obj, field, None)
            if owner is not None:
                return owner == request.user

        return False


class IsAdminUser(permissions.BasePermission):
    """Allows access only to admin users."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'admin'
        )
