from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import  TokenError
from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.users.permissions import IsOwnerOrReadOnly
from .serializers import (
    UserRegistrationSerializer, UserUpdateSerializer, UserSerializer, 
    PublicUserSerializer, RoleRequestSerializer, AdminUserDetailSerializer
)
from apps.pets.serializers import PetProfileSerializer
from .utils.email import send_verification_email, send_password_reset_email
from .utils.whatsapp import (
    generate_otp, format_whatsapp_link, verify_meta_signature,
    extract_message_from_webhook, extract_code_from_message
)
from .models import RoleRequest
from apps.pets.models import PetProfile
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
import os
import random
from django.utils import timezone
from django.core.mail import send_mail
from datetime import timedelta
from django.conf import settings

User = get_user_model()

# Custom Throttle Classes
class RegistrationRateThrottle(AnonRateThrottle):
    scope = 'registration'

class LoginRateThrottle(AnonRateThrottle):
    scope = 'login'

class PasswordResetRateThrottle(AnonRateThrottle):
    scope = 'password_reset'

class ResendVerificationRateThrottle(AnonRateThrottle):
    scope = 'resend_verification'

class CustomTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [LoginRateThrottle]
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        refresh_token = response.data.get("refresh")
        access_token = response.data.get('access')

        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            samesite="None",
            secure=True,
            max_age=7*24*60*60, # 7 days to match JWT settings
        )
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            samesite="None",
            secure=True,
            max_age=15*60, # 15 minutes
        )
        response.data.pop("refresh", None)
        response.data.pop("access", None)
        return response


class CustomTokenRefreshView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            response = Response(
                {"message": "Refresh token not provided", 'code': 'invalid-refresh-token'},
                status=401
            )
            response.delete_cookie("refresh_token", samesite="None")
            response.delete_cookie("access_token", samesite="None")
            return response

        try:
            token = RefreshToken(refresh_token)
            
            # Check if user exists
            user_id = token.payload.get('user_id')
            if not User.objects.filter(id=user_id).exists():
                response = Response(
                    {"message": "User not found", 'code': 'user-not-found'},
                    status=401
                )
                response.delete_cookie("refresh_token", samesite="None")
                response.delete_cookie("access_token", samesite="None")
                return response

            access_token = str(token.access_token)
            response = Response({"message": "Token refreshed"})
            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                samesite="None",
                secure=True,
                max_age=15*60, # 15 minutes
            )
            return response
        except TokenError as e:
            response = Response(
                {"message": str(e), 'code': 'invalid-refresh-token'},
                status=401
            )
            response.delete_cookie("refresh_token", samesite="None")
            response.delete_cookie("access_token", samesite="None")
            return response

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def patch(self, request):
        user= request.user
        serializer = UserUpdateSerializer(user, data = request.data, partial = True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Profile updated successfully', 'data': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class UserRegistrationView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [RegistrationRateThrottle]
    
    def post(self, request, *args, **kwargs):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate 6-digit verification code
            code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            user.verification_code = code
            user.verification_code_expires_at = timezone.now() + timedelta(minutes=15)
            user.save()
            
            # Send Email
            try:
                send_verification_email(user.email, code)
            except Exception as e:
                pass # Logged via sentry or other means in prod                # In prod, you might want to rollback or queue it. For now, we continue.

            response_data = {
                "message": "User created successfully. Please check your email for verification code.",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "role": user.role,
                },
                # We do NOT return tokens here. User must verify first.
            }
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        email = request.data.get('email', '').lower()
        code = request.data.get('code')

        if not email or not code:
            return Response({'error': 'Email and code are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
             return Response({'error': 'Invalid email'}, status=status.HTTP_400_BAD_REQUEST)

        if user.verification_code != code:
            return Response({'error': 'Invalid verification code'}, status=status.HTTP_400_BAD_REQUEST)
        
        if user.verification_code_expires_at and user.verification_code_expires_at < timezone.now():
             return Response({'error': 'Verification code expired'}, status=status.HTTP_400_BAD_REQUEST)

        # Success
        user.email_verified = True
        user.is_active = True  # Activate user upon successful verification
        user.verification_code = None
        user.verification_code_expires_at = None
        user.save()
        
        # Generate tokens since they are now verified and can likely log in immediately
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response = Response({'message': 'Email verified successfully'}, status=status.HTTP_200_OK)
        
        # Set cookies for auto-login
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            samesite="None",
            secure=True,
            max_age=30*24*60*60, # 30 days
        )
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            samesite="None",
            secure=True,
            max_age=15*60, # 15 minutes
        )
        return response


class ResendEmailVerificationView(APIView):
    """Resend email verification code to user"""
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ResendVerificationRateThrottle]
    
    def post(self, request):
        email = request.data.get('email', '').lower()
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't leak email existence
            return Response(
                {'message': 'If the email exists, a verification code has been sent.'}, 
                status=status.HTTP_200_OK
            )
        
        # Check if already verified
        if user.email_verified:
            return Response(
                {'error': 'Email already verified'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate new 6-digit verification code
        code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        user.verification_code = code
        user.verification_code_expires_at = timezone.now() + timedelta(minutes=15)
        user.save()
        
        # Send verification email
        try:
            send_verification_email(user.email, code)
        except Exception as e:
            pass
            return Response(
                {'error': 'Failed to send verification email. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response(
            {'message': 'Verification code sent successfully. Please check your email.'}, 
            status=status.HTTP_200_OK
        )


    


class LogoutView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def post(self, request):
        response = Response({"message": "Logout successful"}, status=200)
        
        # Always delete cookies specifically
        response.delete_cookie("refresh_token", samesite="None")
        response.delete_cookie("access_token", samesite="None")

        try:
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            # Token might be invalid or expired, but we still want to clear cookies
            pass

        return response

        
class UserDeactivateView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self,request):
        user = request.user
        user.is_active = False
        user.save()
        return Response({"message": "Account has been deactivated."})

class UserActivateView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def patch(self,request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = User.objects.get(email=email)

        if not user.check_password(password):
            return Response(
                {"error": "password is incorrect."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        user.is_active = True
        user.save()

        return Response(
            {"message": "Account activated successfully."},
            status=status.HTTP_200_OK
        )

class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    # Changed from patch to post to match frontend expectation and standard practice for sensitive action
    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not user.check_password(old_password):
            return Response(
                {"error": "The old password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            validate_password(new_password,user)
        except ValidationError as e:
            return Response(
                {"error": e.messages},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.set_password(new_password)
        user.save()

        return Response(
            {"message": "Password updated successfully."},
            status=status.HTTP_200_OK
        )

from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_str, force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

class RequestPasswordResetView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [PasswordResetRateThrottle]
    
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            token = PasswordResetTokenGenerator().make_token(user)
            uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
            
            # In production, send this link via email
            link = f"http://localhost:5173/password-reset/{uidb64}/{token}"
            
            send_password_reset_email(user.email, link)
            pass
            
            return Response({"message": "Password reset link sent to email."}, status=200)
        except User.DoesNotExist:
            # Return 200 to avoid leaking email existence
            return Response({"message": "Password reset link sent to email."}, status=200)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def patch(self, request):
        uidb64 = request.data.get('uidb64')
        token = request.data.get('token')
        password = request.data.get('password')
        
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Invalid link"}, status=400)
            
        if user and PasswordResetTokenGenerator().check_token(user, token):
            # Validate password strength
            try:
                validate_password(password, user)
            except ValidationError as e:
                return Response({"error": e.messages}, status=400)
            
            user.set_password(password)
            user.save()
            return Response({"message": "Password reset successful"}, status=200)
        else:
            return Response({"error": "Invalid or expired token"}, status=400)

class UserPetViewSet(viewsets.ModelViewSet):
    serializer_class = PetProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return PetProfile.objects.filter(owner=user).order_by('-created_at')
        return PetProfile.objects.none()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class PublicUserProfileView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            serializer = PublicUserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class RoleRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing role requests.
    Users can create and list their requests.
    Admins can list all and update status.
    """
    serializer_class = RoleRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['status', 'requested_role']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser or user.role == 'admin':
             return RoleRequest.objects.all()
        return RoleRequest.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        if not (request.user.is_staff or request.user.role == 'admin'):
             return Response({"error": "Permission denied. Only admins can update status."}, status=status.HTTP_403_FORBIDDEN)
         
        response = super().partial_update(request, *args, **kwargs)
        
        # If successfully approved, update the user's role and sync provider profile if applicable
        if response.status_code == 200:
            instance = self.get_object()
            if instance.status == 'approved':
                user = instance.user
                user.role = instance.requested_role
                user.save()
                
                # If they were requesting to be a service provider, approve their profile too
                if instance.requested_role == User.UserRole.SERVICE_PROVIDER:
                    from apps.services.models import ServiceProvider
                    try:
                        provider = user.service_provider_profile
                        provider.application_status = 'approved'
                        provider.verification_status = 'verified'
                        provider.save()
                    except (ServiceProvider.DoesNotExist, AttributeError):
                        pass
            
            elif instance.status == 'rejected':
                if instance.requested_role == User.UserRole.SERVICE_PROVIDER:
                    from apps.services.models import ServiceProvider
                    try:
                        provider = instance.user.service_provider_profile
                        provider.application_status = 'rejected'
                        provider.save()
                    except (ServiceProvider.DoesNotExist, AttributeError):
                        pass
        
        return response

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        """Approve a role request"""
        role_request = self.get_object()
        
        if role_request.status != 'pending':
            return Response(
                {"error": "Only pending requests can be approved"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        role_request.status = 'approved'
        role_request.admin_notes = request.data.get('admin_notes', '')
        role_request.save()
        
        # Update user role and ensure account is active (per servicesflow.md Section 3)
        user = role_request.user
        user.role = role_request.requested_role
        user.is_active = True  # Ensure user account is active
        user.save()

        # Sync ServiceProvider profile if applicable
        if role_request.requested_role == User.UserRole.SERVICE_PROVIDER:
            from apps.services.models import ServiceProvider
            try:
                provider = user.service_provider_profile
                provider.application_status = 'approved'
                provider.verification_status = 'verified'
                provider.save()
            except (ServiceProvider.DoesNotExist, AttributeError):
                pass
        
        return Response({
            "message": "Role request approved successfully",
            "data": RoleRequestSerializer(role_request).data
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        """Reject a role request"""
        role_request = self.get_object()
        
        if role_request.status != 'pending':
            return Response(
                {"error": "Only pending requests can be rejected"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        role_request.status = 'rejected'
        role_request.admin_notes = request.data.get('admin_notes', 'Request rejected by admin')
        role_request.save()

        # Update ServiceProvider profile status to rejected
        if role_request.requested_role == User.UserRole.SERVICE_PROVIDER:
            from apps.services.models import ServiceProvider
            try:
                provider = role_request.user.service_provider_profile
                provider.application_status = 'rejected'
                provider.save()
            except (ServiceProvider.DoesNotExist, AttributeError):
                pass
        
        return Response({
            "message": "Role request rejected",
            "data": RoleRequestSerializer(role_request).data
        })


class InitiatePhoneVerifyView(APIView):
    """
    Initiate phone verification using WhatsApp.
    Sends OTP code directly to user's WhatsApp number.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        from .utils.whatsapp import send_otp_via_whatsapp
        
        user = request.user
        phone_number = request.data.get('phone_number')
        
        # Update phone number if provided
        if phone_number:
            # Basic validation - just check it's not empty
            phone_number = phone_number.strip()
            if not phone_number:
                return Response(
                    {'error': 'Phone number cannot be empty'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.phone_number = phone_number
        
        # Check if user has a phone number
        if not user.phone_number:
            return Response(
                {'error': 'Phone number is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate OTP
        otp_code = generate_otp()
        
        # Save code and timestamp to user
        user.phone_verification_code = otp_code
        user.phone_verification_sent_at = timezone.now()
        user.save()
        
        # Get WhatsApp API credentials from settings
        access_token = getattr(settings, 'WHATSAPP_ACCESS_TOKEN', '')
        phone_number_id = getattr(settings, 'WHATSAPP_PHONE_NUMBER_ID', '')
        
        if not access_token or not phone_number_id:
            return Response(
                {
                    'error': 'WhatsApp API not configured',
                    'message': 'Please configure WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in settings'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Send OTP via WhatsApp
        result = send_otp_via_whatsapp(
            user.phone_number,
            otp_code,
            access_token,
            phone_number_id
        )
        
        if not result.get('success'):
            return Response(
                {
                    'error': 'Failed to send verification code',
                    'message': result.get('message', 'Unknown error'),
                    'details': result.get('error', '')
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            'success': True,
            'message': 'Verification code sent to your WhatsApp number',
            'phone_number': user.phone_number
        }, status=status.HTTP_200_OK)


class VerifyPhoneCodeView(APIView):
    """
    Verify the OTP code entered by the user.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        code = request.data.get('code', '').strip()
        
        if not code:
            return Response(
                {'error': 'Verification code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user has a verification code
        if not user.phone_verification_code:
            return Response(
                {'error': 'No verification code found. Please request a new code.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate code
        if user.phone_verification_code != code:
            return Response(
                {'error': 'Invalid verification code'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if code is expired (15 minutes)
        if user.phone_verification_sent_at:
            expiry_time = user.phone_verification_sent_at + timedelta(minutes=15)
            if timezone.now() > expiry_time:
                return Response(
                    {'error': 'Verification code has expired. Please request a new code.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Success! Mark phone as verified
        user.phone_verified = True
        user.phone_verification_code = None
        user.phone_verification_sent_at = None
        user.save()
        
        return Response({
            'success': True,
            'message': 'Phone number verified successfully',
            'phone_verified': True
        }, status=status.HTTP_200_OK)


class WhatsAppWebhookView(APIView):
    """
    Handle WhatsApp webhook calls from Meta Cloud API.
    - GET: Webhook verification
    - POST: Process incoming messages for phone verification
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def get(self, request):
        """
        Meta webhook verification endpoint.
        Meta will send a GET request with hub.mode, hub.challenge, and hub.verify_token.
        """
        mode = request.query_params.get('hub.mode')
        token = request.query_params.get('hub.verify_token')
        challenge = request.query_params.get('hub.challenge')
        
        verify_token = getattr(settings, 'WHATSAPP_VERIFY_TOKEN', '')
        
        if mode == 'subscribe' and token == verify_token:
            # Return challenge to complete verification
            return Response(int(challenge), status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Verification failed'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    def post(self, request):
        """
        Process incoming WhatsApp messages.
        Extract sender and message, validate OTP, and update user verification status.
        """
        # Verify Meta signature for security (optional but recommended)
        signature = request.headers.get('X-Hub-Signature-256', '')
        if not verify_meta_signature(request.body, signature):
            return Response(
                {'error': 'Invalid signature'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Extract message data
        webhook_data = request.data
        sender_phone, message_text = extract_message_from_webhook(webhook_data)
        
        if not sender_phone or not message_text:
            # Not a message we care about, or invalid format
            # Return 200 to acknowledge receipt
            return Response({'status': 'ignored'}, status=status.HTTP_200_OK)
        
        # Extract code from message
        code = extract_code_from_message(message_text)
        
        if not code:
            # No valid code found in message
            return Response({'status': 'no_code_found'}, status=status.HTTP_200_OK)
        
        # Find user by phone number
        try:
            # Try with current sender_phone format
            user = User.objects.get(phone_number=sender_phone)
        except User.DoesNotExist:
            # Try without '+' prefix
            sender_phone_alt = sender_phone.lstrip('+')
            try:
                user = User.objects.get(phone_number=sender_phone_alt)
            except User.DoesNotExist:
                # Also try with '+' prefix if it wasn't there
                try:
                    user = User.objects.get(phone_number=f'+{sender_phone_alt}')
                except User.DoesNotExist:
                    # User not found
                    return Response(
                        {'status': 'user_not_found'},
                        status=status.HTTP_200_OK
                    )
        
        # Validate OTP
        if user.phone_verification_code != code:
            return Response(
                {'status': 'invalid_code'},
                status=status.HTTP_200_OK
            )
        
        # Check if code is expired (15 minutes)
        if user.phone_verification_sent_at:
            expiry_time = user.phone_verification_sent_at + timedelta(minutes=15)
            if timezone.now() > expiry_time:
                return Response(
                    {'status': 'code_expired'},
                    status=status.HTTP_200_OK
                )
        
        # Success! Mark phone as verified
        user.phone_verified = True
        user.phone_verification_code = None
        user.phone_verification_sent_at = None
        user.save()
        
        return Response({'status': 'verified'}, status=status.HTTP_200_OK)

class UserManagementViewSet(viewsets.ModelViewSet):
    """
    Admin-only ViewSet for managing all users.
    Allows listing, retrieving, and updating user status.
    """
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'is_active', 'email_verified', 'is_service_provider']
    search_fields = ['email', 'first_name', 'last_name']
    ordering_fields = ['date_joined', 'last_login']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AdminUserDetailSerializer
        return UserSerializer

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        log_business_event('USER_SUSPENDED', request.user, {'target_user_id': user.id})
        return Response({'message': 'User suspended successfully', 'status': 'suspended'})

    @action(detail=True, methods=['post'])
    def reinstate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        log_business_event('USER_REINSTATED', request.user, {'target_user_id': user.id})
        return Response({'message': 'User reinstated successfully', 'status': 'active'})
    
    @action(detail=True, methods=['post'])
    def verify_identity(self, request, pk=None):
        user = self.get_object()
        user.verified_identity = True
        user.save()
        log_business_event('USER_IDENTITY_VERIFIED', request.user, {'target_user_id': user.id})
        return Response({'message': 'User identity verified', 'verified_identity': True})