"""
PetCarePlus v2 — Animals Admin

Admin for managing animal types with bilingual names and feature flags.
"""

from django.contrib import admin
from .models import AnimalType


@admin.register(AnimalType)
class AnimalTypeAdmin(admin.ModelAdmin):
    list_display = (
        'name_en', 'name_bn', 'slug', 'category',
        'supports_rehoming', 'supports_services',
    )
    list_filter = ('category', 'supports_rehoming', 'supports_services')
    search_fields = ('name_en', 'name_bn', 'slug')
    prepopulated_fields = {'slug': ('name_en',)}
    list_editable = ('supports_rehoming', 'supports_services')
    list_per_page = 20

    fieldsets = (
        ('Names / নাম', {
            'fields': ('name_en', 'name_bn', 'slug'),
        }),
        ('Classification', {
            'fields': ('category',),
        }),
        ('Feature Flags', {
            'fields': ('supports_rehoming', 'supports_services'),
            'description': 'Controls which platform features this animal type appears in.',
        }),
    )
