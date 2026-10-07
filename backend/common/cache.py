"""
PetCarePlus v2 -- fail-open Redis cache backend.

Caching must never be able to take an API endpoint down. When Redis is
unreachable (network partition, expired credentials, cold free-tier instance,
misconfigured env var), every operation degrades gracefully: reads behave as a
cache miss and writes are skipped, so views serve uncached responses instead
of raising a 500.
"""

import logging

from django.core.cache.backends.base import DEFAULT_TIMEOUT
from django.core.cache.backends.redis import RedisCache

logger = logging.getLogger(__name__)


class FailsafeRedisCache(RedisCache):
    """RedisCache that swallows connection/serialization errors."""

    def _run(self, operation, func, default=None):
        try:
            return func()
        except Exception as exc:
            logger.warning(
                "Cache %s failed, continuing without cache: %s", operation, exc
            )
            return default

    def get(self, key, default=None, version=None):
        parent = super().get
        return self._run("get", lambda: parent(key, default, version), default)

    def set(self, key, value, timeout=DEFAULT_TIMEOUT, version=None):
        parent = super().set
        return self._run("set", lambda: parent(key, value, timeout, version))

    def add(self, key, value, timeout=DEFAULT_TIMEOUT, version=None):
        parent = super().add
        return self._run("add", lambda: parent(key, value, timeout, version), False)

    def delete(self, key, version=None):
        parent = super().delete
        return self._run("delete", lambda: parent(key, version), False)

    def has_key(self, key, version=None):
        parent = super().has_key
        return self._run("has_key", lambda: parent(key, version), False)

    def touch(self, key, timeout=DEFAULT_TIMEOUT, version=None):
        parent = super().touch
        return self._run("touch", lambda: parent(key, timeout, version), False)

    def clear(self):
        parent = super().clear
        return self._run("clear", parent)
