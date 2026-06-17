from django.contrib import admin
from .models import RehomingListing, RehomingApplication


class RehomingApplicationInline(admin.TabularInline):
    model = RehomingApplication
    extra = 0
    readonly_fields = ('created_at',)
    autocomplete_fields = ['applicant']


@admin.register(RehomingListing)
class RehomingListingAdmin(admin.ModelAdmin):
    list_display = ('pet', 'owner', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('pet__name', 'owner__email', 'reason')
    autocomplete_fields = ['pet', 'owner']
    inlines = [RehomingApplicationInline]


@admin.register(RehomingApplication)
class RehomingApplicationAdmin(admin.ModelAdmin):
    list_display = ('applicant', 'listing', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('applicant__email', 'listing__pet__name', 'message')
    autocomplete_fields = ['listing', 'applicant']
