from rest_framework.routers import SimpleRouter
from apps.bookings.views import BookingViewSet

router = SimpleRouter()
router.register(r'', BookingViewSet, basename='booking')

urlpatterns = router.urls
