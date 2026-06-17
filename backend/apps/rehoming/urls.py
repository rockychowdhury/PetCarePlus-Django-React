from rest_framework.routers import SimpleRouter
from apps.rehoming.views import RehomingListingViewSet, RehomingApplicationViewSet

router = SimpleRouter()
router.register(r'applications', RehomingApplicationViewSet, basename='rehomingapplication')
router.register(r'', RehomingListingViewSet, basename='rehominglisting')

urlpatterns = router.urls
