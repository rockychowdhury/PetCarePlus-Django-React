from rest_framework.routers import SimpleRouter
from apps.animals.views import VaccinationRecordViewSet

router = SimpleRouter()
router.register(r'', VaccinationRecordViewSet, basename='vaccination')

urlpatterns = router.urls
