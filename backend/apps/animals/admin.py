from django.contrib import admin
from .models import AnimalType, Guideline, VaccinationRecord


@admin.register(AnimalType)
class AnimalTypeAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'name_bn', 'category', 'supports_rehoming', 'supports_services')
    list_filter = ('category', 'supports_rehoming', 'supports_services')
    search_fields = ('name_en', 'name_bn', 'slug')
    prepopulated_fields = {'slug': ('name_en',)}


@admin.register(Guideline)
class GuidelineAdmin(admin.ModelAdmin):
    list_display = ('title_en', 'animal_type', 'topic', 'season', 'is_published')
    list_filter = ('animal_type', 'topic', 'season', 'is_published')
    search_fields = ('title_en', 'title_bn', 'content_en', 'content_bn')
    autocomplete_fields = ['animal_type']


@admin.register(VaccinationRecord)
class VaccinationRecordAdmin(admin.ModelAdmin):
    list_display = ('vaccine_name_en', 'animal_type', 'disease_en', 'age_range')
    list_filter = ('animal_type',)
    search_fields = ('vaccine_name_en', 'disease_en', 'local_medicine_name')
    autocomplete_fields = ['animal_type']
