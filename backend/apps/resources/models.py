"""
PetCarePlus v2 — Government Resources Model

Government offices, NGOs, and emergency contacts scoped to division/district.
"""

from django.db import models
from apps.accounts.models import DIVISION_CHOICES


class GovtResource(models.Model):
    """
    Government programs, NGO resources, and emergency contacts.
    Scoped to division/district for local relevance.
    """

    class ResourceType(models.TextChoices):
        GOVT = 'govt', 'Government Office'
        NGO = 'ngo', 'NGO'
        EMERGENCY = 'emergency', 'Emergency Contact'

    # Bilingual content
    name_en = models.CharField(max_length=200)
    name_bn = models.CharField(max_length=200)
    description_en = models.TextField(blank=True)
    description_bn = models.TextField(blank=True)

    # Type and location
    resource_type = models.CharField(
        max_length=10,
        choices=ResourceType.choices,
        default=ResourceType.GOVT
    )
    division = models.CharField(max_length=20, choices=DIVISION_CHOICES)
    district = models.CharField(max_length=50, blank=True)

    # Contact
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    address_en = models.TextField(blank=True)
    address_bn = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Government Resource'
        verbose_name_plural = 'Government Resources'
        ordering = ['division', 'resource_type', 'name_en']
        indexes = [
            models.Index(fields=['division', 'district']),
            models.Index(fields=['resource_type']),
        ]

    def __str__(self):
        return f'{self.name_en} ({self.resource_type} — {self.division})'
