"""
PetCarePlus v2 — URL Configuration
All API endpoints under /api/v1/
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # API v1
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/animals/', include('apps.animals.urls')),
    path('api/v1/guidelines/', include('apps.animals.urls_guidelines')),
    path('api/v1/vaccinations/', include('apps.animals.urls_vaccinations')),
    path('api/v1/resources/', include('apps.resources.urls')),
    path('api/v1/providers/', include('apps.providers.urls')),
    path('api/v1/bookings/', include('apps.bookings.urls')),
    path('api/v1/reviews/', include('apps.reviews.urls')),
    path('api/v1/ai/', include('apps.ai_assistant.urls')),
    path('api/v1/rehoming/', include('apps.rehoming.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/locations/', include('apps.locations.urls')),

    # Health check
    path('', lambda request: JsonResponse({
        'status': 'healthy',
        'version': '2.0',
        'service': 'PetCarePlus API',
    })),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
