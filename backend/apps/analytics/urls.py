from django.urls import path
from .views import UserDashboardOverviewView

urlpatterns = [
    path('user-overview/', UserDashboardOverviewView.as_view(), name='user-dashboard-overview'),
]
