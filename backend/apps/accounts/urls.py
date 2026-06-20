from django.urls import path
from apps.accounts.views import (
    RegisterView,
    LoginView,
    CustomTokenRefreshView,
    LogoutView,
    ProfileView,
    SavedItemViewSet,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('me/', ProfileView.as_view(), name='auth_me'),
    path('saved/', SavedItemViewSet.as_view({'get': 'list'}), name='saved_items_list'),
    path('saved/toggle/', SavedItemViewSet.as_view({'post': 'toggle'}), name='saved_items_toggle'),
    path('saved/check/', SavedItemViewSet.as_view({'get': 'check'}), name='saved_items_check'),
]
