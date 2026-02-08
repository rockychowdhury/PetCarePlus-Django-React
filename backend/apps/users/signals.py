from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.cache import cache
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(post_save, sender=User)
def invalidate_user_cache(sender, instance, **kwargs):
    # For simplicity and correctness in development/shared environments, 
    # we clear the cache when user info changes.
    # In a production environment with many users, we would find the 
    # specific user profile cache key and delete only that.
    cache.clear()
