from rest_framework.routers import SimpleRouter
from apps.notifications.views import NotificationViewSet

router = SimpleRouter()
router.register(r'', NotificationViewSet, basename='notification')

urlpatterns = router.urls
