"""
PetCarePlus v2 — Rehoming Models

Simplified from v1's 3-model flow (Request → Listing → Inquiry) to:
- RehomingListing: direct listing, cat/dog only
- RehomingApplication: application to adopt
"""

from django.db import models
from django.conf import settings


class RehomingListing(models.Model):
    """
    Free rehoming listing. Cat and dog only, scoped to local network.
    One listing per pet (OneToOne).
    """

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        ADOPTED = 'adopted', 'Adopted'
        WITHDRAWN = 'withdrawn', 'Withdrawn'

    class Gender(models.TextChoices):
        MALE = 'male', 'Male'
        FEMALE = 'female', 'Female'
        UNKNOWN = 'unknown', 'Unknown'

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='rehoming_listings'
    )
    animal_type = models.ForeignKey(
        'animals.AnimalType',
        on_delete=models.PROTECT,
        related_name='rehoming_listings',
        help_text='Must be a companion animal (cat, dog)'
    )

    # Pet Identity
    pet_name = models.CharField(max_length=100)
    breed = models.CharField(max_length=100, blank=True)
    gender = models.CharField(
        max_length=10,
        choices=Gender.choices,
        default=Gender.UNKNOWN
    )
    age = models.DecimalField(
        max_digits=4, 
        decimal_places=1, 
        null=True, 
        blank=True, 
        help_text='Age in years'
    )
    description = models.TextField(max_length=1000, blank=True)

    # Physical & Health
    weight_kg = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    spayed_neutered = models.BooleanField(default=False)
    vaccinated = models.BooleanField(default=False)

    # Media
    photo_url = models.URLField(max_length=500, blank=True)

    # Location
    district = models.CharField(
        max_length=50,
        blank=True,
        help_text='জেলা (District) of the pet/owner'
    )
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text='Latitude for distance matching'
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text='Longitude for distance matching'
    )

    reason = models.TextField(help_text='Reason for rehoming')
    adopter_requirements = models.TextField(
        blank=True,
        help_text='Requirements for the potential adopter (e.g. Must have yard, no other pets)'
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    
    policy_accepted = models.BooleanField(
        default=False,
        help_text='User agreed to safety and responsibility guidelines'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Rehoming Listing'
        verbose_name_plural = 'Rehoming Listings'
        ordering = ['-created_at']

    def __str__(self):
        return f'Rehoming: {self.pet_name} ({self.status})'

    def clean(self):
        """Validate that the animal type supports rehoming (cat/dog only)."""
        from django.core.exceptions import ValidationError
        if self.animal_type and not self.animal_type.supports_rehoming:
            raise ValidationError(
                f'{self.animal_type.name_en} cannot be listed for rehoming. '
                'Only cats and dogs are eligible.'
            )


class RehomingApplication(models.Model):
    """
    Application to adopt a pet from a rehoming listing.
    """

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        REVIEWED = 'reviewed', 'Reviewed'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        CANCELLED = 'cancelled', 'Cancelled'

    listing = models.ForeignKey(
        RehomingListing,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='rehoming_applications'
    )

    message = models.TextField(help_text='Why do you want to adopt this pet?')

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING
    )
    
    ai_score = models.IntegerField(
        null=True, 
        blank=True,
        help_text='AI-generated matching score out of 10'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Rehoming Application'
        verbose_name_plural = 'Rehoming Applications'
        ordering = ['-created_at']
        unique_together = ('listing', 'applicant')

    def __str__(self):
        return f'Application: {self.applicant.email} → {self.listing.pet_name}'
