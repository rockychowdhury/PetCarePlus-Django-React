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

    pet = models.OneToOneField(
        'pets.Pet',
        on_delete=models.CASCADE,
        related_name='rehoming_listing'
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='rehoming_listings'
    )

    reason = models.TextField(help_text='Reason for rehoming')
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Rehoming Listing'
        verbose_name_plural = 'Rehoming Listings'
        ordering = ['-created_at']

    def __str__(self):
        return f'Rehoming: {self.pet.name} ({self.status})'

    def clean(self):
        """Validate that the pet's animal type supports rehoming (cat/dog only)."""
        from django.core.exceptions import ValidationError
        if self.pet and not self.pet.animal_type.supports_rehoming:
            raise ValidationError(
                f'{self.pet.animal_type.name_en} cannot be listed for rehoming. '
                'Only cats and dogs are eligible.'
            )


class RehomingApplication(models.Model):
    """
    Application to adopt a pet from a rehoming listing.
    """

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

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
    living_situation = models.TextField(
        blank=True,
        help_text='Describe your living situation'
    )
    experience = models.TextField(
        blank=True,
        help_text='Previous pet ownership experience'
    )

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Rehoming Application'
        verbose_name_plural = 'Rehoming Applications'
        ordering = ['-created_at']
        unique_together = ('listing', 'applicant')

    def __str__(self):
        return f'Application: {self.applicant.email} → {self.listing.pet.name}'
