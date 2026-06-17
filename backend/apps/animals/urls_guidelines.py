from rest_framework.routers import SimpleRouter
from apps.animals.views import GuidelineViewSet

router = SimpleRouter()
router.register(r'', GuidelineViewSet, basename='guideline')

urlpatterns = router.urls
