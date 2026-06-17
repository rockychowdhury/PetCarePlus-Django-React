from django.urls import path
from apps.accounts.views import (
    RegisterView,
    LoginView,
    CustomTokenRefreshView,
    LogoutView,
    ProfileView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('me/', ProfileView.as_view(), name='auth_me'),
]
