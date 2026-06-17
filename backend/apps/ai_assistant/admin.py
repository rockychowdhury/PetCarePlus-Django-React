from django.contrib import admin
from .models import AISession, AIProviderSuggestion


class AIProviderSuggestionInline(admin.TabularInline):
    model = AIProviderSuggestion
    extra = 0
    readonly_fields = ('provider', 'rank', 'score', 'reason_en')
    can_delete = False


@admin.register(AISession)
class AISessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'animal_type', 'urgency_level', 'total_turns', 'started_at', 'is_complete')
    list_filter = ('urgency_level', 'animal_type', ('ended_at', admin.EmptyFieldListFilter))
    search_fields = ('user__email', 'ai_diagnosis_summary')
    readonly_fields = ('conversation_history', 'total_turns', 'ai_diagnosis_summary', 'ai_care_advice', 'started_at', 'ended_at')
    inlines = [AIProviderSuggestionInline]
    autocomplete_fields = ['user', 'animal_type']

    def is_complete(self, obj):
        return obj.is_complete
    is_complete.boolean = True
