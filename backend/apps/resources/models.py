"""
PetCarePlus v2 — Resources Model

Resources and guidelines related to pets and animals.
"""

from django.db import models
from apps.animals.models import AnimalType


class Resource(models.Model):
    """
    Resources and guidelines features.
    """

    class ResourceType(models.TextChoices):
        GOVT = 'govt', 'Government Office'
        EMERGENCY = 'emergency', 'Emergency Contact'
        VACCINATION = 'vaccination', 'Vaccination'
        MEDICINE = 'medicine', 'Medicine'
        DISEASES = 'diseases', 'Diseases'
        INFORMATION = 'information', 'Information'
        SHELTER = 'shelter', 'Shelter'
        FOOD = 'food', 'Food'
        OTHER = 'other', 'Other'

    # Bilingual title
    title_en = models.CharField(max_length=200)
    title_bn = models.CharField(max_length=200)

    # Optional Animal Types
    animal_types = models.ManyToManyField(
        AnimalType,
        blank=True,
        related_name='resources'
    )

    resource_type = models.CharField(
        max_length=20,
        choices=ResourceType.choices,
        default=ResourceType.INFORMATION
    )

    # Bilingual description
    description_en = models.TextField(blank=True)
    description_bn = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Resource'
        verbose_name_plural = 'Resources'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['resource_type']),
            models.Index(fields=['is_active']),
            models.Index(fields=['title_en']),
            models.Index(fields=['title_bn']),
        ]

    def __str__(self):
        return f'{self.title_en} ({self.resource_type})'
