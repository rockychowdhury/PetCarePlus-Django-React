from django.urls import path
from rest_framework_simplejwt.views import (TokenVerifyView)
from .views import (
    UserProfileView,
    LogoutView,
    UserRegistrationView,

    UserDeactivateView, 
    UserActivateView,
    PasswordChangeView,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    UserPetViewSet,
    PublicUserProfileView,
    RequestPasswordResetView,
    PasswordResetConfirmView,
    VerifyEmailView,
    ResendEmailVerificationView,
    RoleRequestViewSet,
    UserManagementViewSet,
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'pets', UserPetViewSet, basename='user-pets')
router.register(r'role-requests', RoleRequestViewSet, basename='role-requests')
router.register(r'admin/users', UserManagementViewSet, basename='admin-users')

urlpatterns = [
    path('',UserProfileView.as_view(),name="user_profile"),
    path('request-password-reset/', RequestPasswordResetView.as_view(), name='request-password-reset'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('token/',CustomTokenObtainPairView.as_view(), name = 'token_obtain_pair'),
    path('token/refresh/',CustomTokenRefreshView.as_view(), name = 'refresh_token'),
    path('token/verify/',TokenVerifyView.as_view(), name = 'token_verify'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-email-verification/', ResendEmailVerificationView.as_view(), name='resend-email-verification'),
    path('register/',UserRegistrationView.as_view(),name="register"),

    path('logout/',LogoutView.as_view(),name="logout"),
    path('deactivate/',UserDeactivateView.as_view(),name="deactivate_user"),
    path('activate/',UserActivateView.as_view(),name="activate_user"),
    path('change-password/',PasswordChangeView.as_view(),name="change_password"),
    path('public-profile/<int:pk>/', PublicUserProfileView.as_view(), name='public_profile'),
    

] + router.urls
