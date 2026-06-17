from django.contrib import admin
from .models import Pet


@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    list_display = ('name', 'animal_type', 'owner', 'gender', 'is_active')
    list_filter = ('animal_type', 'gender', 'spayed_neutered', 'vaccinated', 'is_active')
    search_fields = ('name', 'owner__email', 'breed')
    autocomplete_fields = ['owner', 'animal_type']
