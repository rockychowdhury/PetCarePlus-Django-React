from django.urls import path, include
from rest_framework.routers import SimpleRouter
from apps.providers.views import ServiceProviderViewSet, ProviderServiceViewSet

router = SimpleRouter()
router.register(r'', ServiceProviderViewSet, basename='serviceprovider')

# Explicitly mapping the nested /providers/:id/services/ paths
provider_services_list = ProviderServiceViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
provider_services_detail = ProviderServiceViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})


urlpatterns = [
    # Nested endpoints
    path('<int:provider_pk>/services/', provider_services_list, name='provider-services-list'),
    path('<int:provider_pk>/services/<int:pk>/', provider_services_detail, name='provider-services-detail'),
    
    # Standard router urls
    path('', include(router.urls)),
]
