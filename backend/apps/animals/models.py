"""
PetCarePlus v2 — Animals App Models

Three models:
- AnimalType: Seed reference table with 8 supported animals, tier flags, and bilingual names
- Guideline: Bilingual care guides filterable by animal, topic, season
- VaccinationRecord: Vaccine schedules with bilingual content per animal
"""

from django.db import models


class AnimalType(models.Model):
    """
    Seed reference table defining the 8 supported animals.
    Enforces the two-tier system at the database level via capability flags.

    Tier 1 (Companion): cat, dog, rabbit, bird — full platform support
    Tier 2 (Livestock): cow, goat, chicken, duck — information only
    """

    class Category(models.TextChoices):
        COMPANION = 'companion', 'Companion Pet'
        LIVESTOCK = 'livestock', 'Livestock'

    name_en = models.CharField(max_length=50, unique=True)
    name_bn = models.CharField(max_length=50, help_text='Bangla name (বাংলা নাম)')
    slug = models.SlugField(max_length=50, unique=True)
    category = models.CharField(max_length=10, choices=Category.choices)
    icon = models.CharField(
        max_length=50,
        blank=True,
        help_text='Icon identifier (e.g., lucide icon name or emoji)'
    )

    # Capability flags — enforced via CHECK constraints on related tables
    supports_rehoming = models.BooleanField(
        default=False,
        help_text='Can be listed for rehoming (cat and dog only)'
    )
    supports_services = models.BooleanField(
        default=False,
        help_text='Can be linked to service providers (companion pets only)'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Animal Type'
        verbose_name_plural = 'Animal Types'
        ordering = ['category', 'name_en']

    def __str__(self):
        return f'{self.name_en} ({self.name_bn})'


