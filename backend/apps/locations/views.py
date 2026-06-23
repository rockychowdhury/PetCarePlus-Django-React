from rest_framework import viewsets
from .models import Division, District, Upazila, Union
from .serializers import DivisionSerializer, DistrictSerializer, UpazilaSerializer, UnionSerializer

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

@method_decorator(cache_page(None), name='list')
@method_decorator(cache_page(None), name='retrieve')
class DivisionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Division.objects.all()
    serializer_class = DivisionSerializer
    pagination_class = None

@method_decorator(cache_page(None), name='list')
@method_decorator(cache_page(None), name='retrieve')
class DistrictViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = District.objects.all()
    serializer_class = DistrictSerializer
    filterset_fields = ['division']
    pagination_class = None

@method_decorator(cache_page(None), name='list')
@method_decorator(cache_page(None), name='retrieve')
class UpazilaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Upazila.objects.all()
    serializer_class = UpazilaSerializer
    filterset_fields = ['district']
    pagination_class = None

@method_decorator(cache_page(None), name='list')
@method_decorator(cache_page(None), name='retrieve')
class UnionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Union.objects.all()
    serializer_class = UnionSerializer
    filterset_fields = ['upazila']
    pagination_class = None
