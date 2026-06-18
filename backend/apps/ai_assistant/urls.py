from django.urls import path
from apps.ai_assistant.views import AIChatView, AISessionDetailView, AIPolishView

urlpatterns = [
    path('sessions/', AIChatView.as_view(), name='ai_chat'),
    path('sessions/<uuid:pk>/', AISessionDetailView.as_view(), name='ai_session_detail'),
    path('polish/', AIPolishView.as_view(), name='ai_polish'),
]
