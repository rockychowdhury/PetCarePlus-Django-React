from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UserManager(BaseUserManager):
    def create_user(self, email, password = None, **kwargs):
        if not email:
            raise ValueError('Email is Required')

        email = self.normalize_email(email)
        user = self.model(email=email,**kwargs)
        user.set_password(password)
        user.save(using=self.db)
        return user
    
    def create_superuser(self, email, password=None, **kwargs):
        kwargs.setdefault('is_staff', True)
        kwargs.setdefault('is_superuser', True)
        if not kwargs.get('is_staff') or not kwargs.get('is_superuser'):
            raise ValueError("Superuser must have is_staff=True and is_superuser=True.")
        user = self.create_user(email=email, password=password, **kwargs)
        user.is_active = True
        user.role = User.UserRole.ADMIN
        user.save()
        return user 


class User(AbstractBaseUser, PermissionsMixin):
    class UserRole(models.TextChoices):
        ADMIN                   = 'admin', _('Admin')
        MODERATOR               = 'moderator', _('Moderator')
        SERVICE_PROVIDER        = 'service_provider', _('Service Provider')
        USER                    = 'user', _('User')

    class AccountStatus(models.TextChoices):
        ACTIVE = 'active', _('Active')
        SUSPENDED = 'suspended', _('Suspended')
        BANNED = 'banned', _('Banned')

    # Basic Information
    email                   = models.EmailField(unique=True)
    first_name              = models.CharField(max_length=50)
    last_name               = models.CharField(max_length=50)
    phone_number            = models.CharField(max_length=15, blank=True, null=True, default = "01639066718")
    photoURL                = models.URLField(max_length=200, blank=True, null=True, default='https://i.ibb.co.com/hWK4ZpT/petDP.jpg')
    bio                     = models.TextField(max_length=500, blank=True, null=True)
    date_of_birth           = models.DateField(blank=True, null=True)
    
    # Location Fields
    location_city           = models.CharField(max_length=100, blank=True, null=True)
    location_state          = models.CharField(max_length=100, blank=True, null=True)
    location_country        = models.CharField(max_length=100)
    zip_code                = models.CharField(max_length=10, blank=True, null=True)
    latitude                = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude               = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Verification (Directly on User now)
    email_verified          = models.BooleanField(default=False)
    phone_verified          = models.BooleanField(default=True)
    verified_identity       = models.BooleanField(default=False)
    pet_owner_verified      = models.BooleanField(default=False)
    
    verification_code = models.CharField(max_length=6, blank=True, null=True)
    verification_code_expires_at = models.DateTimeField(blank=True, null=True)
    phone_verification_code = models.CharField(max_length=6, blank=True, null=True)
    phone_verification_code_expires_at = models.DateTimeField(blank=True, null=True)
    phone_verification_sent_at = models.DateTimeField(blank=True, null=True)

    # Privacy Settings (JSON)
    # { 'profile_visibility': 'public', 'show_location': true ... }
    privacy_settings = models.JSONField(default=dict, blank=True)
    
    # Role and Status
    role                    = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.USER)
    account_status          = models.CharField(max_length=20, choices=AccountStatus.choices, default=AccountStatus.ACTIVE)
    
    # Django Auth Fields
    is_active               = models.BooleanField(default=False)
    is_staff                = models.BooleanField(default=False)
    is_superuser            = models.BooleanField(default=False)
    date_joined             = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD              = 'email'
    REQUIRED_FIELDS             = ['first_name', 'last_name']


    class Meta:
        verbose_name            ='User'
        verbose_name_plural     = 'Users'
    
    def __str__(self) -> str:
        return f"{self.email} ({self.role})"
    
    @property
    def username(self):
        return self.email
    
    @property
    def is_user(self):
        return self.role == User.UserRole.USER
    
    @property
    def is_service_provider(self):
        return self.role == User.UserRole.SERVICE_PROVIDER

    @property
    def has_service_profile(self):
        return hasattr(self, 'service_provider_profile')

    @property
    def is_admin(self):
        return self.role == User.UserRole.ADMIN
    
    @property
    def is_verified(self):
        # Relaxed for now: Only email verification is mandatory
        return self.email_verified
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def can_create_listing(self):
        return self.is_verified and self.account_status == User.AccountStatus.ACTIVE

    @property
    def missing_profile_fields(self):
        """
        Returns a list of fields that are missing for profile completion.
        """
        missing = []
        
        # Data Fields
        if not self.first_name or not str(self.first_name).strip(): missing.append('first_name')
        if not self.last_name or not str(self.last_name).strip(): missing.append('last_name')
        if not self.email: missing.append('email') # Should be present as username
        
        if not self.phone_number or not str(self.phone_number).strip(): missing.append('phone_number')
        if not self.location_city or not str(self.location_city).strip(): missing.append('location_city')
        if not self.location_state or not str(self.location_state).strip(): missing.append('location_state')
        if not self.location_country or not str(self.location_country).strip(): missing.append('location_country')
        if not self.date_of_birth: missing.append('date_of_birth')
        
        return missing

    @property
    def profile_is_complete(self):
        """
        Checks if the user has filled out all necessary fields for rehoming.
        """
        return len(self.missing_profile_fields) == 0


class UserTrustReview(models.Model):
    """
    Peer-to-peer reviews for trust building.
    """
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="given_reviews")
    reviewee = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_reviews")
    rating = models.IntegerField(choices=[(i,i) for i in range(1,6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('reviewer', 'reviewee')

    def __str__(self):
        return f"Review by {self.reviewer.email} for {self.reviewee.email}"


class RoleRequest(models.Model):
    """
    Model for users to request a role change (e.g., to Service Provider).
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='role_requests')
    requested_role = models.CharField(max_length=20, choices=User.UserRole.choices)
    reason = models.TextField(help_text="Reason for requesting this role")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True, null=True, help_text="Notes from admin regarding approval/rejection")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} requesting {self.requested_role}"

    class Meta:
        ordering = ['-created_at']
