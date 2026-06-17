from django.urls import path
from apps.ai_assistant.views import AIChatView, AISessionDetailView

urlpatterns = [
    path('chat/', AIChatView.as_view(), name='ai_chat'),
    path('session/<int:pk>/', AISessionDetailView.as_view(), name='ai_session_detail'),
]
