"""
PetCarePlus v2 — Reviews Admin

Admin for managing provider reviews with rating filters and moderation.
"""

from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'reviewer', 'provider', 'rating', 'short_comment', 'created_at',
    )
    list_filter = ('rating', 'created_at')
    search_fields = ('reviewer__email', 'reviewer__full_name', 'provider__business_name', 'comment')
    autocomplete_fields = ['booking', 'reviewer', 'provider']
    readonly_fields = ('created_at',)
    list_per_page = 25
    date_hierarchy = 'created_at'
    actions = ['delete_selected']

    fieldsets = (
        ('Review Details', {
            'fields': ('reviewer', 'provider', 'booking'),
        }),
        ('Content', {
            'fields': ('rating', 'comment'),
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',),
        }),
    )

    def short_comment(self, obj):
        if obj.comment and len(obj.comment) > 60:
            return obj.comment[:60] + '...'
        return obj.comment or '-'
    short_comment.short_description = 'Comment'
