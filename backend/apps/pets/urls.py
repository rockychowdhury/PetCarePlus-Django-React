from rest_framework.routers import SimpleRouter
from apps.pets.views import PetViewSet

router = SimpleRouter()
router.register(r'', PetViewSet, basename='pet')

urlpatterns = router.urls
