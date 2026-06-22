from rest_framework.routers import SimpleRouter
from apps.resources.views import ResourceViewSet

router = SimpleRouter()
router.register(r'', ResourceViewSet, basename='resource')

urlpatterns = router.urls
