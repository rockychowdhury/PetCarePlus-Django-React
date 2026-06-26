"""
PetCarePlus v2 — Bookings Admin

Admin for managing service bookings with date hierarchy and status actions.
"""

from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'user', 'provider', 'service', 'animal_type',
        'booking_date', 'booking_time', 'status', 'created_at',
    )
    list_filter = ('status', 'booking_date', 'provider__provider_type')
    search_fields = ('user__email', 'user__full_name', 'provider__business_name', 'notes')
    autocomplete_fields = ['user', 'provider', 'service', 'animal_type']
    date_hierarchy = 'booking_date'
    list_per_page = 25
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('status',)
    actions = ['confirm_bookings', 'cancel_bookings']

    fieldsets = (
        ('Booking Details', {
            'fields': ('user', 'provider', 'service', 'animal_type'),
        }),
        ('Schedule', {
            'fields': ('booking_date', 'booking_time'),
        }),
        ('Status & Notes', {
            'fields': ('status', 'notes'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    @admin.action(description='✅ Confirm selected bookings')
    def confirm_bookings(self, request, queryset):
        count = queryset.filter(status='pending').update(status='confirmed')
        self.message_user(request, f'{count} booking(s) confirmed.')

    @admin.action(description='❌ Cancel selected bookings')
    def cancel_bookings(self, request, queryset):
        count = queryset.exclude(status='cancelled').update(status='cancelled')
        self.message_user(request, f'{count} booking(s) cancelled.')
