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
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')
            
            jwt_settings = getattr(settings, 'SIMPLE_JWT', {})
            access_cookie = jwt_settings.get('AUTH_COOKIE', 'access_token')
            refresh_cookie = jwt_settings.get('AUTH_COOKIE_REFRESH', 'refresh_token')
            is_secure = jwt_settings.get('AUTH_COOKIE_SECURE', not settings.DEBUG)
            httponly = jwt_settings.get('AUTH_COOKIE_HTTP_ONLY', True)
            samesite = jwt_settings.get('AUTH_COOKIE_SAMESITE', 'Lax')
            
            if access_token:
                response.set_cookie(
                    key=access_cookie,
                    value=access_token,
                    httponly=httponly,
                    secure=is_secure,
                    samesite=samesite,
                    max_age=int(jwt_settings.get('ACCESS_TOKEN_LIFETIME').total_seconds()),
                )
            if refresh_token:
                response.set_cookie(
                    key=refresh_cookie,
                    value=refresh_token,
                    httponly=httponly,
                    secure=is_secure,
                    samesite=samesite,
                    max_age=int(jwt_settings.get('REFRESH_TOKEN_LIFETIME').total_seconds()),
                )
                
            # Remove from JSON payload for security
            if 'access' in response.data:
                del response.data['access']
            if 'refresh' in response.data:
                del response.data['refresh']
        return response


class CustomTokenRefreshView(TokenRefreshView):
    """
    Custom Token Refresh View.
    Attempts to read the refresh token from the httpOnly cookies
    before checking the POST body, securing token refresh logic.
    """

    def post(self, request, *args, **kwargs):
        jwt_settings = getattr(settings, 'SIMPLE_JWT', {})
        refresh_cookie = jwt_settings.get('AUTH_COOKIE_REFRESH', 'refresh_token')
        access_cookie = jwt_settings.get('AUTH_COOKIE', 'access_token')
        
        # Retrieve the refresh token from httpOnly cookie if not in POST request data
        refresh_token = request.COOKIES.get(refresh_cookie)
        
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

        is_secure = jwt_settings.get('AUTH_COOKIE_SECURE', not settings.DEBUG)
        httponly = jwt_settings.get('AUTH_COOKIE_HTTP_ONLY', True)
        samesite = jwt_settings.get('AUTH_COOKIE_SAMESITE', 'Lax')

        # Handle new access token
        new_access = response.data.get('access')
        if new_access:
            response.set_cookie(
                key=access_cookie,
                value=new_access,
                httponly=httponly,
                secure=is_secure,
                samesite=samesite,
                max_age=int(jwt_settings.get('ACCESS_TOKEN_LIFETIME').total_seconds()),
            )
            del response.data['access']

        # Handle potential rotated refresh token
        new_refresh = response.data.get('refresh')
        if new_refresh:
            response.set_cookie(
                key=refresh_cookie,
                value=new_refresh,
                httponly=httponly,
                secure=is_secure,
                samesite=samesite,
                max_age=int(jwt_settings.get('REFRESH_TOKEN_LIFETIME').total_seconds()),
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
        jwt_settings = getattr(settings, 'SIMPLE_JWT', {})
        access_cookie = jwt_settings.get('AUTH_COOKIE', 'access_token')
        refresh_cookie = jwt_settings.get('AUTH_COOKIE_REFRESH', 'refresh_token')
        
        response.delete_cookie(access_cookie)
        response.delete_cookie(refresh_cookie)
        return response


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieves or updates the currently authenticated user's profile details.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
