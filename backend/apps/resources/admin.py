from django.contrib import admin
from .models import Resource


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title_en', 'resource_type', 'animal_type', 'is_active')
    list_filter = ('resource_type', 'animal_type', 'is_active')
    search_fields = ('title_en', 'title_bn', 'description_en')
