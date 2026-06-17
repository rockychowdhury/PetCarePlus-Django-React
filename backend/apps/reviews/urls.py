from rest_framework.routers import SimpleRouter
from apps.reviews.views import ReviewViewSet

router = SimpleRouter()
router.register(r'', ReviewViewSet, basename='review')

urlpatterns = router.urls
