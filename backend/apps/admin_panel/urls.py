from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserReportViewSet, ListingModerationViewSet, AnalyticsView,
    ModerationLogViewSet, RoleRequestViewSet, UserManagementViewSet,
    AdminPetViewSet, AdminBookingViewSet, AdminProviderViewSet
)

router = DefaultRouter()
router.register(r'reports', UserReportViewSet, basename='user-reports')
router.register(r'moderation/listings', ListingModerationViewSet, basename='listing-moderation')
router.register(r'logs', ModerationLogViewSet, basename='moderation-logs')
router.register(r'role-requests', RoleRequestViewSet, basename='role-requests')
router.register(r'users', UserManagementViewSet, basename='admin-users')
router.register(r'pets', AdminPetViewSet, basename='admin-pets')
router.register(r'bookings', AdminBookingViewSet, basename='admin-bookings')
router.register(r'reports', UserReportViewSet, basename='admin-report')
router.register(r'providers', AdminProviderViewSet, basename='admin-providers')

urlpatterns = [
    path('analytics/', AnalyticsView.as_view(), name='admin-analytics'),
    path('', include(router.urls)),
]
