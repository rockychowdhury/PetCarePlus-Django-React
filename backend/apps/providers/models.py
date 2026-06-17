"""
PetCarePlus v2 — Service Providers Models

Simplified from v1's complex sub-model system (Foster, Vet, Trainer, Groomer, Sitter)
to a flat provider model with type field, plus individual services and animal type links.
"""

from django.db import models
from django.conf import settings
from apps.accounts.models import DIVISION_CHOICES


class ServiceProvider(models.Model):
    """
    Provider business profile with location, type, verification status,
    and aggregated rating.

    One-to-one with User model. A user with role='provider' creates this.
    """

    class ProviderType(models.TextChoices):
        VET = 'vet', 'Veterinarian / পশু চিকিৎসক'
        GROOMER = 'groomer', 'Groomer / গ্রুমার'
        SITTER = 'sitter', 'Pet Sitter / পেট সিটার'
        TRAINER = 'trainer', 'Trainer / প্রশিক্ষক'
        PHARMACY = 'pharmacy', 'Pharmacy / ফার্মেসি'

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='service_provider'
    )

    business_name = models.CharField(max_length=100)
    description_en = models.TextField(blank=True)
    description_bn = models.TextField(blank=True)

    provider_type = models.CharField(
        max_length=10,
        choices=ProviderType.choices,
        default=ProviderType.VET
    )

    is_government_vet = models.BooleanField(
        default=False,
        help_text='Indicates if this is a Government Vet'
    )

    profile_image_url = models.URLField(max_length=500, blank=True, null=True, help_text="Direct link to profile image")

    # Location (Bangladesh hierarchy)
    division = models.CharField(max_length=20, choices=DIVISION_CHOICES)
    district = models.CharField(max_length=50)
    upazila = models.CharField(max_length=50, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Contact
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True)

    # Verification
    is_verified = models.BooleanField(
        default=False,
        help_text='Verified by admin'
    )
    is_active = models.BooleanField(default=True)

    # Aggregated rating (updated via signal on review creation)
    avg_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        help_text='Auto-calculated average rating'
    )
    total_reviews = models.IntegerField(
        default=0,
        help_text='Auto-calculated total review count'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Service Provider'
        verbose_name_plural = 'Service Providers'
        ordering = ['-avg_rating', '-created_at']
        indexes = [
            models.Index(fields=['provider_type', 'is_verified']),
            models.Index(fields=['division', 'district']),
            models.Index(fields=['avg_rating']),
        ]

    def __str__(self):
        return f'{self.business_name} ({self.provider_type})'


class ProviderService(models.Model):
    """
    Individual services offered by a provider with pricing.
    Example: "General Checkup — ৫০০ BDT — 30 min"
    """

    provider = models.ForeignKey(
        ServiceProvider,
        on_delete=models.CASCADE,
        related_name='services'
    )

    name_en = models.CharField(max_length=100)
    name_bn = models.CharField(max_length=100, blank=True)
    description_en = models.TextField(blank=True)
    description_bn = models.TextField(blank=True)

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Price in BDT'
    )
    duration_minutes = models.IntegerField(
        null=True,
        blank=True,
        help_text='Approximate duration in minutes'
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Provider Service'
        verbose_name_plural = 'Provider Services'
        ordering = ['name_en']

    def __str__(self):
        return f'{self.name_en} — {self.provider.business_name}'


class ProviderAnimalType(models.Model):
    """
    Many-to-many: which animals each provider treats/serves.
    Only companion pets (supports_services=True) can be linked.
    """

    provider = models.ForeignKey(
        ServiceProvider,
        on_delete=models.CASCADE,
        related_name='animal_types'
    )
    animal_type = models.ForeignKey(
        'animals.AnimalType',
        on_delete=models.CASCADE,
        related_name='provider_links'
    )

    class Meta:
        verbose_name = 'Provider Animal Type'
        verbose_name_plural = 'Provider Animal Types'
        unique_together = ('provider', 'animal_type')

    def __str__(self):
        return f'{self.provider.business_name} → {self.animal_type.name_en}'
