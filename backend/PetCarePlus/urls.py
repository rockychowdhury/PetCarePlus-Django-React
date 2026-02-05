"""
URL configuration for FurEverHome project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/user/', include('apps.users.urls')),
    # path('api/adoption/', include('apps.adoption.urls')), # Deprecated
    # path('api/reviews/', include('apps.reviews.urls')), # Deprecated
    path('api/rehoming/', include('apps.rehoming.urls')),
    path('api/admin-panel/', include('apps.admin_panel.urls')),
    path('api/services/', include('apps.services.urls')),
    path('api/pets/', include('apps.pets.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    # path('api/common/', include('apps.common.urls')),
    
    # Root Health Check
    path('', lambda request: JsonResponse({"message": "Server is Healthy"})),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
