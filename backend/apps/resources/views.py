"""
PetCarePlus v2 — Resources Views

API views for retrieving and managing Resource models.
Allows public read-only access with search, filter, and ordering capabilities.
"""

from rest_framework import viewsets, permissions, filters
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers

from common.permissions import IsAdminUser
from apps.resources.models import Resource
from apps.resources.serializers import ResourceSerializer


class ResourcePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


@method_decorator(cache_page(None), name='retrieve')
@method_decorator(vary_on_headers('Authorization', 'Cookie'), name='retrieve')
class ResourceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Resource.
    Enables public view with pagination, filtering, ordering, and full-text search.
    """
    serializer_class = ResourceSerializer
    pagination_class = ResourcePagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filtering
    filterset_fields = ['resource_type', 'animal_types', 'is_active']
    
    # Search (full-text search over specified fields)
    search_fields = [
        'title_en', 'title_bn',
        'description_en', 'description_bn'
    ]
    
    # Ordering
    ordering_fields = ['created_at', 'updated_at', 'title_en', 'title_bn']
    ordering = ['-created_at']

    def get_queryset(self):
        # Admins can view inactive resources in list/detail; others only active
        user = self.request.user
        if user and user.is_authenticated and user.role == 'admin':
            return Resource.objects.prefetch_related('animal_types').all()
        return Resource.objects.prefetch_related('animal_types').filter(is_active=True)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsAdminUser()]

    def list(self, request, *args, **kwargs):
        # Only cache if it's the basic page 1 (no other filters/searches)
        query_params = request.query_params.dict()
        page = query_params.pop('page', '1')
        
        is_basic_page_1 = (page == '1' and not query_params)
        
        if is_basic_page_1:
            from django.core.cache import cache
            from rest_framework.response import Response
            
            user_role = getattr(request.user, 'role', 'anon')
            cache_key = f"resources_page_1_{user_role}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return Response(cached_data)
                
            response = super().list(request, *args, **kwargs)
            cache.set(cache_key, response.data, timeout=None) # Permanent cache
            return response
            
        return super().list(request, *args, **kwargs)
