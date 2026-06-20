from django.urls import path
from apps.ai_assistant.views import (
    AIDiagnoseView,
    AISessionListView,
    AISessionDetailView,
    AIPolishView,
)

urlpatterns = [
    path('diagnose/', AIDiagnoseView.as_view(), name='ai_diagnose'),
    path('sessions/', AISessionListView.as_view(), name='ai_session_list'),
    path('sessions/<int:pk>/', AISessionDetailView.as_view(), name='ai_session_detail'),
    path('polish/', AIPolishView.as_view(), name='ai_polish'),
]
