from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom authentication class to extract the JWT access token 
    from the 'access_token' HttpOnly cookie instead of the Authorization header.
    """
    def authenticate(self, request):
        header = self.get_header(request)
        raw_token = None
        
        if header is not None:
            raw_token = self.get_raw_token(header)
            
        if raw_token is None:
            raw_token = request.COOKIES.get(getattr(settings, 'SIMPLE_JWT', {}).get('AUTH_COOKIE', 'access_token'))
            
        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token
