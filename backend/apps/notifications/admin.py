"""
PetCarePlus v2 — Notifications Admin

Admin for managing and bulk-processing user notifications.
"""

from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        'title_en', 'user', 'notification_type', 'is_read', 'created_at',
    )
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('user__email', 'user__full_name', 'title_en', 'title_bn', 'message_en')
    autocomplete_fields = ['user']
    readonly_fields = ('created_at',)
    list_per_page = 30
    date_hierarchy = 'created_at'
    actions = ['mark_as_read', 'mark_as_unread']

    fieldsets = (
        ('Recipient', {
            'fields': ('user', 'notification_type'),
        }),
        ('Content (English)', {
            'fields': ('title_en', 'message_en'),
        }),
        ('Content (Bangla / বাংলা)', {
            'fields': ('title_bn', 'message_bn'),
        }),
        ('Status', {
            'fields': ('is_read', 'created_at'),
        }),
    )

    @admin.action(description='📖 Mark selected as read')
    def mark_as_read(self, request, queryset):
        count = queryset.update(is_read=True)
        self.message_user(request, f'{count} notification(s) marked as read.')

    @admin.action(description='📬 Mark selected as unread')
    def mark_as_unread(self, request, queryset):
        count = queryset.update(is_read=False)
        self.message_user(request, f'{count} notification(s) marked as unread.')
