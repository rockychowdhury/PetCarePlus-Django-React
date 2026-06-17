from django.contrib import admin
from .models import GovtResource


@admin.register(GovtResource)
class GovtResourceAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'resource_type', 'division', 'district', 'phone', 'is_active')
    list_filter = ('resource_type', 'division', 'is_active')
    search_fields = ('name_en', 'name_bn', 'district')
