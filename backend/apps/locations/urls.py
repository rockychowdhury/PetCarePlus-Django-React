from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DivisionViewSet, DistrictViewSet, UpazilaViewSet, UnionViewSet

router = DefaultRouter()
router.register(r'divisions', DivisionViewSet, basename='division')
router.register(r'districts', DistrictViewSet, basename='district')
router.register(r'upazilas', UpazilaViewSet, basename='upazila')
router.register(r'unions', UnionViewSet, basename='union')

urlpatterns = [
    path('', include(router.urls)),
]
