from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.test import RequestFactory
from rest_framework.test import APIClient
from apps.rehoming.views import ListingListCreateView
from apps.services.views import ServiceProviderViewSet
from apps.users.views import UserProfileView
import time

User = get_user_model()

class Command(BaseCommand):
    help = 'Warms the Redis cache for demo users by simulating API requests'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting Cache Warming for Demo Users..."))
        
        demo_emails = ['rocky20809@gmail.com', 'provider@pcp.com']
        
        # 1. Warm Public/Anonymous Cache (Common endpoints)
        self.warm_public_endpoints()

        # 2. Warm User-Specific Cache
        for email in demo_emails:
            try:
                user = User.objects.get(email=email)
                self.warm_user_cache(user)
            except User.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"User {email} not found. Skipping."))

        self.stdout.write(self.style.SUCCESS("Cache Warming Complete! 🚀"))

    def warm_public_endpoints(self):
        self.stdout.write("Warning public endpoints...")
        client = APIClient()
        
        # Listings
        start = time.time()
        client.get('/api/rehoming/listings/')
        self.stdout.write(f"  - Public Listings: {time.time() - start:.2f}s")
        
        # Service Providers
        start = time.time()
        client.get('/api/services/providers/')
        self.stdout.write(f"  - Public Providers: {time.time() - start:.2f}s")

    def warm_user_cache(self, user):
        self.stdout.write(f"Warming cache for {user.email}...")
        client = APIClient()
        client.force_authenticate(user=user)
        
        # 1. User Profile
        start = time.time()
        client.get('/api/user/')
        self.stdout.write(f"  - Profile: {time.time() - start:.2f}s")
        
        # 2. Rehoming Listings (Authenticated view might show different data/permissions)
        start = time.time()
        client.get('/api/rehoming/listings/') 
        self.stdout.write(f"  - Listings: {time.time() - start:.2f}s")
        
        # 3. Service Providers
        start = time.time()
        client.get('/api/services/providers/')
        self.stdout.write(f"  - Providers: {time.time() - start:.2f}s")
        
        # 4. My Listings (if applicable)
        if user.role == 'user':
            start = time.time()
            client.get('/api/rehoming/my-listings/')
            self.stdout.write(f"  - My Listings: {time.time() - start:.2f}s")
            
        # 5. Provider Dashboard (if applicable)
        if user.role == 'service_provider':
             start = time.time()
             try:
                 client.get('/api/services/provider/dashboard_stats/')
                 self.stdout.write(f"  - Dashboard Stats: {time.time() - start:.2f}s")
             except Exception:
                 pass
