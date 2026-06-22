from django.contrib import admin
from .models import Resource


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title_en', 'resource_type', 'display_animal_types', 'is_active')
    list_filter = ('resource_type', 'animal_types', 'is_active')

    def display_animal_types(self, obj):
        return ", ".join([animal.name_en for animal in obj.animal_types.all()])
    display_animal_types.short_description = 'Animal Types'
    search_fields = ('title_en', 'title_bn', 'description_en')
