from rest_framework.routers import SimpleRouter
from apps.resources.views import GovtResourceViewSet

router = SimpleRouter()
router.register(r'', GovtResourceViewSet, basename='govtresource')

urlpatterns = router.urls
