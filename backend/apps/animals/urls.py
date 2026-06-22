from rest_framework.routers import SimpleRouter
from apps.animals.views import AnimalTypeViewSet

router = SimpleRouter()
router.register(r'', AnimalTypeViewSet, basename='animaltype')

urlpatterns = router.urls
