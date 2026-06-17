from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('reviewer', 'provider', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('reviewer__email', 'provider__business_name', 'comment')
    autocomplete_fields = ['booking', 'reviewer', 'provider']
    readonly_fields = ('created_at',)
