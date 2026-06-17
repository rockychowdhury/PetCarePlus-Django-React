from django.contrib import admin
from .models import ServiceProvider, ProviderService, ProviderAnimalType


class ProviderServiceInline(admin.TabularInline):
    model = ProviderService
    extra = 1


class ProviderAnimalTypeInline(admin.TabularInline):
    model = ProviderAnimalType
    extra = 1
    autocomplete_fields = ['animal_type']


@admin.register(ServiceProvider)
class ServiceProviderAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'provider_type', 'division', 'district', 'is_verified', 'avg_rating')
    list_filter = ('provider_type', 'is_verified', 'is_active', 'division')
    search_fields = ('business_name', 'user__email', 'phone')
    autocomplete_fields = ['user']
    inlines = [ProviderAnimalTypeInline, ProviderServiceInline]
    list_editable = ('is_verified',)
    readonly_fields = ('avg_rating', 'total_reviews')


@admin.register(ProviderService)
class ProviderServiceAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'provider', 'price', 'duration_minutes', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name_en', 'provider__business_name')
