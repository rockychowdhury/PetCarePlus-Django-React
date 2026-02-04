from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ServiceProviderViewSet, ServiceCategoryViewSet, SpeciesViewSet, ServiceOptionViewSet, 
    ServiceBookingViewSet, SpecializationViewSet,
    VeterinaryServiceViewSet, FosterServiceViewSet, TrainerServiceViewSet,
    GroomerServiceViewSet, PetSitterServiceViewSet, ServiceReviewViewSet,
    ProviderDashboardViewSet
)

router = DefaultRouter()
router.register(r'providers', ServiceProviderViewSet, basename='service-provider')
router.register(r'categories', ServiceCategoryViewSet, basename='service-category')
router.register(r'species', SpeciesViewSet, basename='species')
router.register(r'options', ServiceOptionViewSet, basename='service-option')
router.register(r'specializations', SpecializationViewSet, basename='specialization')
router.register(r'bookings', ServiceBookingViewSet, basename='service-booking')
router.register(r'reviews', ServiceReviewViewSet, basename='service-review')
router.register(r'veterinary', VeterinaryServiceViewSet, basename='veterinary-service')
router.register(r'foster', FosterServiceViewSet, basename='foster-service')
router.register(r'trainer', TrainerServiceViewSet, basename='trainer-service')
router.register(r'groomer', GroomerServiceViewSet, basename='groomer-service')
router.register(r'petsitter', PetSitterServiceViewSet, basename='petsitter-service')
router.register(r'provider', ProviderDashboardViewSet, basename='provider-dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
