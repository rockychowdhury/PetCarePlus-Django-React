from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import (
    ServiceCategory, Species, Specialization, ServiceOption,
    ServiceProvider, ServiceMedia, BusinessHours,
    FosterService, VeterinaryClinic, TrainerService, GroomerService, PetSitterService,
    ServiceBooking, ServiceReview
)

@admin.register(ServiceCategory)
class ServiceCategoryAdmin(ModelAdmin):
    list_display = ('name', 'slug', 'icon_name')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Species)
class SpeciesAdmin(ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Specialization)
class SpecializationAdmin(ModelAdmin):
    list_display = ('name', 'category')
    list_filter = ('category',)

@admin.register(ServiceOption)
class ServiceOptionAdmin(ModelAdmin):
    list_display = ('name', 'category', 'base_price')
    list_filter = ('category',)

class FosterServiceInline(admin.StackedInline):
    model = FosterService
    extra = 0
    can_delete = False

class VeterinaryClinicInline(admin.StackedInline):
    model = VeterinaryClinic
    extra = 0
    can_delete = False

class TrainerServiceInline(admin.StackedInline):
    model = TrainerService
    extra = 0
    can_delete = False

class GroomerServiceInline(admin.StackedInline):
    model = GroomerService
    extra = 0
    can_delete = False

class PetSitterServiceInline(admin.StackedInline):
    model = PetSitterService
    extra = 0
    can_delete = False

class BusinessHoursInline(admin.TabularInline):
    model = BusinessHours
    extra = 7
    max_num = 7

class ServiceMediaInline(admin.TabularInline):
    model = ServiceMedia
    extra = 1

@admin.register(ServiceProvider)
class ServiceProviderAdmin(ModelAdmin):
    list_display = ('id', 'user', 'business_name', 'category', 'verification_status')
    list_filter = ('category', 'verification_status')
    search_fields = ('business_name', 'email', 'user__email')
    inlines = [
        BusinessHoursInline,
        ServiceMediaInline,
        VeterinaryClinicInline,
        FosterServiceInline,
        TrainerServiceInline,
        GroomerServiceInline,
        PetSitterServiceInline
    ]

@admin.register(FosterService)
class FosterServiceAdmin(ModelAdmin):
    list_display = ('provider', 'capacity', 'current_count')

@admin.register(ServiceBooking)
class ServiceBookingAdmin(ModelAdmin):
    list_display = ['id', 'provider', 'client', 'pet', 'booking_date', 'status']
    list_filter = ['status', 'booking_type', 'payment_status']
    search_fields = ['provider__business_name', 'client__email', 'pet__name']

@admin.register(ServiceMedia)
class ServiceMediaAdmin(ModelAdmin):
    list_display = ('provider', 'is_primary', 'created_at')

@admin.register(BusinessHours)
class BusinessHoursAdmin(ModelAdmin):
    list_display = ('provider', 'day', 'open_time', 'close_time', 'is_closed')
    list_filter = ('day', 'is_closed')

@admin.register(VeterinaryClinic)
class VeterinaryClinicAdmin(ModelAdmin):
    list_display = ('provider', 'clinic_type')

@admin.register(TrainerService)
class TrainerServiceAdmin(ModelAdmin):
    list_display = ('provider', 'primary_method', 'years_experience')

@admin.register(ServiceReview)
class ServiceReviewAdmin(ModelAdmin):
    list_display = ('provider', 'reviewer', 'rating_overall', 'created_at')
