"""
PetCarePlus v2 — Accounts Views

API views for user registration, profile retrieval/update,
and custom JWT login/refresh using httpOnly cookies.
"""

from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from apps.accounts.serializers import (
    CustomTokenObtainPairSerializer,
    UserRegistrationSerializer,
    UserProfileSerializer,
)


class RegisterView(generics.CreateAPIView):
    """
    Endpoint for public registration of pet owners, farmers, and providers.
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    """
    Custom JWT Login View.
    Authenticates a user and returns an access token in the response body,
    while setting the refresh token in a secure, httpOnly cookie.
    """
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            # Extract refresh token from response
            refresh_token = response.data.pop('refresh', None)
            if refresh_token:
                # Set refresh token in httpOnly cookie
                # secure=True in production, or if DEBUG is False
                is_secure = not settings.DEBUG
                response.set_cookie(
                    key='refresh_token',
                    value=refresh_token,
                    httponly=True,
                    secure=is_secure,
                    samesite='Lax',
                    max_age=7 * 24 * 60 * 60,  # 7 days
                )
        return response


class CustomTokenRefreshView(TokenRefreshView):
    """
    Custom Token Refresh View.
    Attempts to read the refresh token from the httpOnly cookies
    before checking the POST body, securing token refresh logic.
    """

    def post(self, request, *args, **kwargs):
        # Retrieve the refresh token from httpOnly cookie if not in POST request data
        refresh_token = request.COOKIES.get('refresh_token')
        
        if refresh_token and 'refresh' not in request.data:
            # Mutate request data to include the token for standard serializer validation
            data = request.data.copy()
            data['refresh'] = refresh_token
            serializer = self.get_serializer(data=data)
        else:
            serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        # Formulate response
        response = Response(serializer.validated_data, status=status.HTTP_200_OK)

        # Handle potential rotated refresh token
        new_refresh = serializer.validated_data.get('refresh')
        if new_refresh:
            is_secure = not settings.DEBUG
            response.set_cookie(
                key='refresh_token',
                value=new_refresh,
                httponly=True,
                secure=is_secure,
                samesite='Lax',
                max_age=7 * 24 * 60 * 60,
            )
            # Remove from JSON payload for security
            del response.data['refresh']

        return response


class LogoutView(APIView):
    """
    Logout view that clears the secure httpOnly refresh token cookie.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        response = Response(
            {'message': 'Successfully logged out.'},
            status=status.HTTP_200_OK
        )
        response.delete_cookie('refresh_token')
        return response


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieves or updates the currently authenticated user's profile details.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
