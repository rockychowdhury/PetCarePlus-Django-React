"""
PetCarePlus v2 — Resources Admin

Comprehensive admin for managing Resources with bilingual fields,
bulk actions, and rich filtering.
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Resource


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = (
        'title_en', 'title_bn', 'resource_type', 'display_animal_types',
        'is_active', 'created_at', 'updated_at',
    )
    list_filter = ('resource_type', 'is_active', 'animal_types', 'created_at')
    search_fields = ('title_en', 'title_bn', 'description_en', 'description_bn')
    list_editable = ('is_active',)
    list_per_page = 25
    date_hierarchy = 'created_at'
    filter_horizontal = ('animal_types',)
    readonly_fields = ('created_at', 'updated_at')
    actions = ['activate_resources', 'deactivate_resources']

    fieldsets = (
        ('Title / শিরোনাম', {
            'fields': ('title_en', 'title_bn'),
        }),
        ('Type & Animal Association', {
            'fields': ('resource_type', 'animal_types'),
        }),
        ('Description (English)', {
            'fields': ('description_en',),
            'classes': ('wide',),
        }),
        ('Description (Bangla / বর্ণনা)', {
            'fields': ('description_bn',),
            'classes': ('wide',),
        }),
        ('Status & Timestamps', {
            'fields': ('is_active', 'created_at', 'updated_at'),
        }),
    )

    def display_animal_types(self, obj):
        animals = obj.animal_types.all()
        if not animals:
            return format_html('<span style="color:#999;">All Animals</span>')
        return ", ".join([a.name_en for a in animals])
    display_animal_types.short_description = 'Animal Types'

    @admin.action(description='✅ Activate selected resources')
    def activate_resources(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f'{count} resource(s) activated.')

    @admin.action(description='❌ Deactivate selected resources')
    def deactivate_resources(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count} resource(s) deactivated.')
