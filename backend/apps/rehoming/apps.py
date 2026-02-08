from django.apps import AppConfig


class RehomingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.rehoming'

    def ready(self):
        import apps.rehoming.signals
