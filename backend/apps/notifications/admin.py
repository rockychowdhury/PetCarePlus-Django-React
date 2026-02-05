from django.contrib import admin
from django.contrib.admin import ModelAdmin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(ModelAdmin):
    list_display = ('recipient', 'notification_type', 'title', 'is_read', 'created_at')
    list_filter = ('is_read', 'notification_type', 'channel', 'priority')
    search_fields = ('recipient__email', 'title')
