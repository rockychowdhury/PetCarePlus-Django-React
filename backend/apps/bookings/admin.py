from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'provider', 'booking_date', 'booking_time', 'status')
    list_filter = ('status', 'booking_date')
    search_fields = ('user__email', 'provider__business_name')
    autocomplete_fields = ['user', 'provider', 'service', 'pet']
    date_hierarchy = 'booking_date'
