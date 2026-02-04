from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.services.models import (
    ServiceProvider, ServiceCategory, ServiceBooking, 
    VeterinaryClinic, BusinessHours
)
from apps.pets.models import PetProfile
from datetime import date, time, timedelta
from django.utils import timezone

User = get_user_model()

class ServicesApiRefactorTests(APITestCase):
    def setUp(self):
        # Create Users
        self.user = User.objects.create_user(email='provider@test.com', password='password', first_name='Prov', last_name='Ider')
        self.client_user = User.objects.create_user(email='client@test.com', password='password', first_name='Cli', last_name='Ent')
        
        # Create Category
        self.vet_category = ServiceCategory.objects.create(
            name='Veterinary', 
            slug='veterinary', 
            description='Vet services'
        )
        
        # Create Provider
        self.provider = ServiceProvider.objects.create(
            user=self.user,
            business_name='Test Vet Clinic',
            category=self.vet_category,
            address_line1='123 Test St',
            city='Test City',
            state='TS',
            zip_code='12345',
            latitude=10.0,
            longitude=20.0,
            verification_status='verified'
        )
        
        # Create Service Specific Details (Vet)
        self.vet_details = VeterinaryClinic.objects.create(
            provider=self.provider,
            pricing_info="Consultation fee: $50.00",
            emergency_services=True
        )
        
        # Create Business Hours
        BusinessHours.objects.create(
            provider=self.provider,
            day=0, # Monday
            open_time=time(9,0),
            close_time=time(17,0),
            is_closed=False
        )
        
        # Create Pet for Booking
        self.pet = PetProfile.objects.create(
            owner=self.client_user,
            name='Buddy',
            species='dog', # Lowercase
            breed='Golden Retriever',
            birth_date=date(2020, 1, 1), # Use birth_date instead of age
            gender='male' # Lowercase
        )
        
        # Ensure today hours exist
        today_weekday = timezone.now().weekday()
        if today_weekday != 0:
             BusinessHours.objects.create(
                provider=self.provider,
                day=today_weekday,
                open_time=time(9,0),
                close_time=time(17,0),
                is_closed=False
            )

        self.client.force_authenticate(user=self.client_user)

    def test_provider_details_structure(self):
        """Test GET /providers/{id} includes nested address and service details"""
        url = reverse('service-provider-detail', args=[self.provider.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        
        # Check Address Nesting
        self.assertIn('address', data)
        self.assertEqual(data['address']['line1'], '123 Test St')
        self.assertEqual(data['address']['city'], 'Test City')
        
        # Check Service Specific Details
        self.assertIn('service_specific_details', data)
        self.assertIn('Consultation fee', data['service_specific_details']['pricing_info'])

    def test_service_specific_endpoint(self):
        """Test GET /services/veterinary/{id}/"""
        try:
             url = reverse('veterinary-service-detail', kwargs={'provider__id': self.provider.id})
        except:
             url = reverse('veterinary-service-detail', args=[self.provider.id])

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Consultation fee', response.data['pricing_info'])

    def test_availability_endpoint(self):
        """Test GET /providers/{id}/availability/"""
        url = reverse('service-provider-availability', args=[self.provider.id])
        response = self.client.get(url, {'date': str(date.today())})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('available_slots', response.data)

    def test_booking_filters(self):
        """Test Filtering Bookings by status"""
        # Create bookings
        b1 = ServiceBooking.objects.create(
            client=self.client_user,
            provider=self.provider,
            pet=self.pet,
            booking_type='standard',
            status='pending',
            booking_date=date.today()
        )
        b2 = ServiceBooking.objects.create(
            client=self.client_user,
            provider=self.provider,
            pet=self.pet,
            booking_type='standard',
            status='confirmed',
            booking_date=date.today()
        )
        
        url = reverse('service-booking-list')
        response = self.client.get(url, {'status': 'pending'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['id'], b1.id)

    def test_media_upload_endpoint(self):
        """Test POST /providers/{id}/media/"""
        self.client.force_authenticate(user=self.user)
        url = reverse('service-provider-upload-media', args=[self.provider.id])
        
        from django.core.files.uploadedfile import SimpleUploadedFile
        file = SimpleUploadedFile("test_image.jpg", b"file_content", content_type="image/jpeg")
        
        response = self.client.post(url, {'file': file, 'is_primary': 'true'}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('example.com', response.data['file_url'])

    def test_legacy_check_availability_removed(self):
        """Ensure the legacy check_availability action is gone from Booking ViewSet"""
        try:
            url = reverse('service-booking-check-availability')
            exists = True
        except:
            exists = False
        self.assertFalse(exists, "Legacy check_availability endpoint should be removed")
