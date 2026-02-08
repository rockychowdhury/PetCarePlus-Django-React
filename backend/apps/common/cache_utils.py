"""
Cache utility functions for PetCarePlus
"""
from django.core.cache import cache
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def get_cache_key(prefix, *args, **kwargs):
    """
    Generate a consistent cache key from prefix and arguments.
    
    Example:
        get_cache_key('provider_list', page=1, category='vet')
        # Returns: 'provider_list:page=1:category=vet'
    """
    parts = [prefix]
    
    # Add positional args
    parts.extend(str(arg) for arg in args)
    
    # Add keyword args (sorted for consistency)
    for key in sorted(kwargs.keys()):
        parts.append(f"{key}={kwargs[key]}")
    
    return ':'.join(parts)


def invalidate_cache_pattern(pattern):
    """
    Invalidate all cache keys matching a pattern.
    
    Example:
        invalidate_cache_pattern('provider_*')
    """
    try:
        if hasattr(cache, 'delete_pattern'):
            # Redis backend supports pattern deletion
            deleted = cache.delete_pattern(f"{settings.CACHES['default'].get('KEY_PREFIX', '')}:{pattern}")
            logger.info(f"Invalidated {deleted} cache keys matching pattern: {pattern}")
        else:
            # Fallback for local memory cache
            logger.warning(f"Cache backend doesn't support pattern deletion: {pattern}")
    except Exception as e:
        logger.error(f"Error invalidating cache pattern {pattern}: {e}")


def cache_response(key_prefix, timeout=300):
    """
    Decorator to cache function responses.
    
    Usage:
        @cache_response('my_function', timeout=600)
        def my_function(arg1, arg2):
            return expensive_operation()
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Generate cache key from function args
            cache_key = get_cache_key(key_prefix, *args, **kwargs)
            
            # Try to get from cache
            result = cache.get(cache_key)
            if result is not None:
                logger.debug(f"Cache HIT: {cache_key}")
                return result
            
            # Cache miss - execute function
            logger.debug(f"Cache MISS: {cache_key}")
            result = func(*args, **kwargs)
            
            # Store in cache
            cache.set(cache_key, result, timeout)
            return result
        
        return wrapper
    return decorator
