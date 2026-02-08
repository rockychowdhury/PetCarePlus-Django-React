"""
Management command to clear Django cache
"""
from django.core.management.base import BaseCommand
from django.core.cache import cache


class Command(BaseCommand):
    help = 'Clear Django cache'

    def add_arguments(self, parser):
        parser.add_argument(
            '--pattern',
            type=str,
            help='Clear cache keys matching pattern (e.g., "provider_*")',
        )

    def handle(self, *args, **options):
        pattern = options.get('pattern')
        
        if pattern:
            # Clear specific pattern
            try:
                if hasattr(cache, 'delete_pattern'):
                    deleted = cache.delete_pattern(pattern)
                    self.stdout.write(
                        self.style.SUCCESS(f'Successfully cleared {deleted} cache keys matching pattern: {pattern}')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING('Cache backend does not support pattern deletion')
                    )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error clearing cache pattern: {e}')
                )
        else:
            # Clear all cache
            try:
                cache.clear()
                self.stdout.write(
                    self.style.SUCCESS('Successfully cleared all cache')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error clearing cache: {e}')
                )
