"""
PetCarePlus v2 — Pet Model

Simplified from v1: removed PetMedia, PersonalityTrait, PetPersonality.
Uses AnimalType FK instead of hardcoded species choices.
Only companion animals (category='companion') allowed.
"""

from django.db import models
from django.conf import settings


class Pet(models.Model):
    """
    Companion pet profile. Only animals with category='companion' are allowed.
    """

    class Gender(models.TextChoices):
        MALE = 'male', 'Male'
        FEMALE = 'female', 'Female'
        UNKNOWN = 'unknown', 'Unknown'

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='pets'
    )
    animal_type = models.ForeignKey(
        'animals.AnimalType',
        on_delete=models.PROTECT,
        related_name='pets',
        help_text='Must be a companion animal (cat, dog, rabbit, bird)'
    )

    # Identity
    name = models.CharField(max_length=100)
    breed = models.CharField(max_length=100, blank=True)
    gender = models.CharField(
        max_length=10,
        choices=Gender.choices,
        default=Gender.UNKNOWN
    )
    birth_date = models.DateField(null=True, blank=True)
    description = models.TextField(max_length=1000, blank=True)

    # Physical
    weight_kg = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )

    # Health basics
    spayed_neutered = models.BooleanField(default=False)
    vaccinated = models.BooleanField(default=False)

    # Media
    photo_url = models.URLField(max_length=500, blank=True)

    # Lifecycle
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Pet'
        verbose_name_plural = 'Pets'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} ({self.animal_type.name_en})'

    def clean(self):
        """Validate that animal_type is a companion animal."""
        from django.core.exceptions import ValidationError
        if self.animal_type and self.animal_type.category != 'companion':
            raise ValidationError(
                f'{self.animal_type.name_en} is not a companion animal. '
                'Only cats, dogs, rabbits, and birds can be registered as pets.'
            )
