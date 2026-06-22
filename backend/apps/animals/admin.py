from django.contrib import admin
from .models import AnimalType


@admin.register(AnimalType)
class AnimalTypeAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'name_bn', 'category', 'supports_rehoming', 'supports_services')
    list_filter = ('category', 'supports_rehoming', 'supports_services')
    search_fields = ('name_en', 'name_bn', 'slug')
    prepopulated_fields = {'slug': ('name_en',)}
