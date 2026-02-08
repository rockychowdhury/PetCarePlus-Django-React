from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from .models import RehomingListing

@receiver(post_save, sender=RehomingListing)
@receiver(post_delete, sender=RehomingListing)
def invalidate_listing_cache(sender, instance, **kwargs):
    # Invalidate listing-related cache
    # Since we use cache_page, we don't have easy access to the hashed keys.
    # However, for petcareplus, we can use a pattern if supported by the backend,
    # or just clear the cache if it's small/development focused.
    # For now, we clear the cache to ensure absolute freshness as requested.
    cache.clear()
