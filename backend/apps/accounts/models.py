"""
PetCarePlus v2 — User Model

Custom user model with Bangladesh location hierarchy (division/district/upazila),
bilingual language preference, and simplified role system.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.conf import settings


# ──────────────────────────────────────────────
# Bangladesh Administrative Divisions
# ──────────────────────────────────────────────

DIVISION_CHOICES = [
    ('barishal', 'বরিশাল (Barishal)'),
    ('chattogram', 'চট্টগ্রাম (Chattogram)'),
    ('dhaka', 'ঢাকা (Dhaka)'),
    ('khulna', 'খুলনা (Khulna)'),
    ('mymensingh', 'ময়মনসিংহ (Mymensingh)'),
    ('rajshahi', 'রাজশাহী (Rajshahi)'),
    ('rangpur', 'রংপুর (Rangpur)'),
    ('sylhet', 'সিলেট (Sylhet)'),
]

LANGUAGE_CHOICES = [
    ('bn', 'বাংলা (Bangla)'),
    ('en', 'English'),
]


class UserManager(BaseUserManager):
    """Custom manager for email-based authentication."""

    def create_user(self, email, password=None, **kwargs):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **kwargs)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **kwargs):
        kwargs.setdefault('is_staff', True)
        kwargs.setdefault('is_superuser', True)
        kwargs.setdefault('is_active', True)
        kwargs.setdefault('role', 'admin')

        if not kwargs.get('is_staff') or not kwargs.get('is_superuser'):
            raise ValueError('Superuser must have is_staff=True and is_superuser=True.')

        return self.create_user(email=email, password=password, **kwargs)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model for PetCarePlus v2.

    Key differences from v1:
    - Location uses Bangladesh hierarchy (division/district/upazila) instead of generic city/state/country
    - Language preference stored per user (defaults to Bangla)
    - Simplified roles: pet_owner, farmer, provider, admin
    - No lat/lng, no verification codes, no privacy settings JSON
    """

    class Role(models.TextChoices):
        PET_OWNER = 'pet_owner', _('Pet Owner')
        FARMER = 'farmer', _('Farmer')
        PROVIDER = 'provider', _('Service Provider')
        ADMIN = 'admin', _('Admin')

    # ── Identity ──────────────────────────────
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15, blank=True)
    photo_url = models.URLField(max_length=500, blank=True)
    bio = models.TextField(max_length=500, blank=True)

    # ── Location (Bangladesh hierarchy) ───────
    division = models.CharField(
        max_length=20,
        choices=DIVISION_CHOICES,
        blank=True,
        help_text='বিভাগ (Division)'
    )
    district = models.CharField(
        max_length=50,
        blank=True,
        help_text='জেলা (District)'
    )
    upazila = models.CharField(
        max_length=50,
        blank=True,
        help_text='উপজেলা (Upazila)'
    )
    union = models.CharField(
        max_length=50,
        blank=True,
        help_text='ইউনিয়ন (Union)'
    )
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text='অক্ষাংশ (Latitude)'
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text='দ্রাঘিমাংশ (Longitude)'
    )

    # ── Language preference ───────────────────
    preferred_language = models.CharField(
        max_length=2,
        choices=LANGUAGE_CHOICES,
        default='bn',
        help_text='Preferred language for content and UI'
    )

    # ── Role and status ───────────────────────
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.PET_OWNER
    )

    # ── Django auth fields ────────────────────
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']

    def __str__(self):
        return f'{self.email} ({self.role})'

    @property
    def has_location(self):
        """Check if the user has set their location."""
        return bool(self.district)

    def save(self, *args, **kwargs):
        # Check if this is an update to an existing provider user
        # Providers now set their own password during registration, so we don't need to generate one
        # or send an email on approval since Render free tier blocks SMTP.
        
        super().save(*args, **kwargs)

from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

class SavedItem(models.Model):
    """
    Generic model to store user's saved items (e.g., Favorite Providers, Saved Resources).
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='saved_items'
    )
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Saved Item'
        verbose_name_plural = 'Saved Items'
        unique_together = ('user', 'content_type', 'object_id')

    def __str__(self):
        return f'{self.user.email} saved {self.content_object}'
