"""
PetCarePlus v2 — AI Assistant Models

Stores AI conversation sessions with JSONB history, extracted diagnostics,
and provider suggestions generated at session end.
"""

from django.db import models
from django.conf import settings


class AISession(models.Model):
    """
    Full AI conversation session.

    conversation_history is stored as JSONB array of {role, content} objects.
    When the session completes, extracted fields (urgency, diagnosis, advice)
    are written as typed columns so analytics queries never parse JSONB.
    """

    class UrgencyLevel(models.TextChoices):
        MONITOR = 'monitor_at_home', 'Monitor at home / বাড়িতে পর্যবেক্ষণ করুন'
        SEE_VET = 'see_vet_this_week', 'See a vet this week / এই সপ্তাহে পশু চিকিৎসক দেখান'
        CALL_VET = 'call_vet_now', 'Call a vet now / এখনই পশু চিকিৎসক ডাকুন'
        EMERGENCY = 'emergency', 'Emergency / জরুরি অবস্থা'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ai_sessions',
        help_text='Null for anonymous users'
    )
    animal_type = models.ForeignKey(
        'animals.AnimalType',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ai_sessions'
    )

    # Conversation
    conversation_history = models.JSONField(
        default=list,
        help_text='Array of {role: "user"|"assistant", content: "..."} objects'
    )
    total_turns = models.IntegerField(default=0)

    # Extracted results (written when session completes)
    urgency_level = models.CharField(
        max_length=20,
        choices=UrgencyLevel.choices,
        blank=True,
    )
    ai_diagnosis_summary = models.TextField(
        blank=True,
        help_text='AI-generated diagnosis summary'
    )
    ai_care_advice = models.TextField(
        blank=True,
        help_text='AI-generated home care advice'
    )

    # Timestamps
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'AI Session'
        verbose_name_plural = 'AI Sessions'
        ordering = ['-started_at']

    def __str__(self):
        user_label = self.user.email if self.user else 'Anonymous'
        return f'AI Session: {user_label} — {self.started_at.strftime("%Y-%m-%d %H:%M")}'

    @property
    def is_complete(self):
        return self.ended_at is not None


class AIProviderSuggestion(models.Model):
    """
    Providers suggested by AI at the end of a session.
    Stored with ranking and bilingual reason.
    """

    session = models.ForeignKey(
        AISession,
        on_delete=models.CASCADE,
        related_name='provider_suggestions'
    )
    provider = models.ForeignKey(
        'providers.ServiceProvider',
        on_delete=models.CASCADE,
        related_name='ai_suggestions'
    )

    rank = models.IntegerField(help_text='1 = best match')
    score = models.DecimalField(
        max_digits=5,
        decimal_places=3,
        default=0,
        help_text='Weighted score used for ranking'
    )
    reason_en = models.TextField(blank=True)
    reason_bn = models.TextField(blank=True)

    class Meta:
        verbose_name = 'AI Provider Suggestion'
        verbose_name_plural = 'AI Provider Suggestions'
        ordering = ['session', 'rank']
        unique_together = ('session', 'provider')

    def __str__(self):
        return f'#{self.rank}: {self.provider.business_name} for session {self.session_id}'
