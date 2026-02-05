from django.contrib import admin
from django.contrib.admin import ModelAdmin
from .models import RehomingListing, RehomingRequest, AdoptionInquiry

@admin.register(RehomingRequest)
class RehomingRequestAdmin(ModelAdmin):
    list_display = ('id', 'owner', 'pet', 'urgency', 'status', 'created_at')
    list_filter = ('urgency', 'status')
    search_fields = ('owner__email', 'pet__name')

@admin.register(RehomingListing)
class RehomingListingAdmin(ModelAdmin):
    list_display = ('pet', 'owner', 'status', 'published_at')
    list_filter = ('status', 'urgency')
    search_fields = ('pet__name', 'owner__email', 'location_city')

@admin.register(AdoptionInquiry)
class AdoptionInquiryAdmin(ModelAdmin):
    list_display = ('listing', 'requester', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('listing__pet__name', 'requester__email')
