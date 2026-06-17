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


class Guideline(models.Model):
    """
    Bilingual care guidelines filterable by animal type, topic, and season.
    Full-text search supported via search field.
    """

    TOPIC_CHOICES = [
        ('feeding', 'Feeding / খাওয়ানো'),
        ('health', 'Health / স্বাস্থ্য'),
        ('grooming', 'Grooming / পরিচর্যা'),
        ('training', 'Training / প্রশিক্ষণ'),
        ('housing', 'Housing / আবাসন'),
        ('breeding', 'Breeding / প্রজনন'),
        ('general', 'General Care / সাধারণ যত্ন'),
    ]

    SEASON_CHOICES = [
        ('all', 'All Seasons'),
        ('summer', 'Summer / গ্রীষ্ম'),
        ('monsoon', 'Monsoon / বর্ষা'),
        ('winter', 'Winter / শীত'),
    ]

    animal_type = models.ForeignKey(
        AnimalType,
        on_delete=models.CASCADE,
        related_name='guidelines'
    )

    # Bilingual content
    title_en = models.CharField(max_length=200)
    title_bn = models.CharField(max_length=200)
    content_en = models.TextField()
    content_bn = models.TextField()
    summary_en = models.CharField(max_length=300, blank=True)
    summary_bn = models.CharField(max_length=300, blank=True)

    # Categorisation
    topic = models.CharField(max_length=20, choices=TOPIC_CHOICES, default='general')
    season = models.CharField(max_length=10, choices=SEASON_CHOICES, default='all')

    # Publishing
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Guideline'
        verbose_name_plural = 'Guidelines'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['animal_type', 'topic']),
            models.Index(fields=['animal_type', 'season']),
        ]

    def __str__(self):
        return f'{self.title_en} ({self.animal_type.name_en})'


class VaccinationRecord(models.Model):
    """
    Vaccination schedules, dosage, and disease prevention info per animal type.
    All content is bilingual.
    """

    animal_type = models.ForeignKey(
        AnimalType,
        on_delete=models.CASCADE,
        related_name='vaccination_records'
    )

    # Bilingual vaccine info
    vaccine_name_en = models.CharField(max_length=100)
    vaccine_name_bn = models.CharField(max_length=100)
    disease_en = models.CharField(max_length=200, help_text='Disease(s) prevented')
    disease_bn = models.CharField(max_length=200)

    # Schedule and dosage
    schedule_en = models.TextField(help_text='When to administer (e.g., "8 weeks, 12 weeks, annually")')
    schedule_bn = models.TextField()
    dosage = models.CharField(max_length=100, blank=True, help_text='Dosage info')
    age_range = models.CharField(
        max_length=50,
        blank=True,
        help_text='Applicable age range (e.g., "6 weeks - 1 year")'
    )

    # Local medicine names (helpful in Bangladesh context)
    local_medicine_name = models.CharField(
        max_length=200,
        blank=True,
        help_text='Locally available medicine/brand names in Bangladesh'
    )

    notes_en = models.TextField(blank=True)
    notes_bn = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Vaccination Record'
        verbose_name_plural = 'Vaccination Records'
        ordering = ['animal_type', 'vaccine_name_en']

    def __str__(self):
        return f'{self.vaccine_name_en} — {self.animal_type.name_en}'
