from django.contrib import admin
from django.contrib.admin import ModelAdmin
from .models import UserReport, ModerationAction

@admin.register(UserReport)
class UserReportAdmin(ModelAdmin):
    list_display = ("id", "report_type", "reporter", "status", "severity", "created_at")
    list_filter = ("status", "severity", "report_type")
    search_fields = ("reporter__email", "description")
    readonly_fields = ("created_at", "resolved_at")

@admin.register(ModerationAction)
class ModerationActionAdmin(ModelAdmin):
    list_display = ("action_type", "moderator", "target_user", "created_at")
    list_filter = ("action_type",)
    search_fields = ("moderator__email", "target_user__email", "reason")
    readonly_fields = ("created_at",)
