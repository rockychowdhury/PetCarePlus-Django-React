from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ServiceCategory(models.Model):
    """
    Main categories of services (e.g., Veterinary, Training, Foster).
    """
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    icon_name = models.CharField(max_length=50, blank=True, help_text="Lucide icon name for frontend")

    class Meta:
        verbose_name = "Service Category"
        verbose_name_plural = "Service Categories"

    def __str__(self):
        return self.name


class Species(models.Model):
    """
    Normalized species model.
    """
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)

    class Meta:
        verbose_name_plural = "Species"

    def __str__(self):
        return self.name


class Specialization(models.Model):
    """
    Specific specializations (e.g., Behavioral Issues, Emergency Care, Surgery).
    """
    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, related_name='specializations')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    class Meta:
        unique_together = ('category', 'name')

    def __str__(self):
        return f"{self.name} ({self.category.name})"


class ServiceOption(models.Model):
    """
    Predefined service options for each category (e.g., 'Wellness Exam' for Veterinary).
    """
    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, related_name='service_options')
    name = models.CharField(max_length=100)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.category.name})"



class ServiceProvider(models.Model):
    """
    Enhanced service provider model with full contact, verification, and media support.
    Base model for all service provider types (foster, vet, trainer, etc.)
    """
    VERIFICATION_STATUS_CHOICES = (
        ('pending', 'Pending Verification'),
        ('verified', 'Verified'),
        ('suspended', 'Suspended'),
    )

    APPLICATION_STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='service_provider_profile')
    business_name = models.CharField(max_length=100)
    category = models.ForeignKey(ServiceCategory, on_delete=models.PROTECT, related_name='providers', null=True, blank=True)
    description = models.TextField(help_text="Business description (500+ words required)")
    website = models.URLField(blank=True, null=True)
    
    # Address
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=10, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Contact Info
    phone = models.CharField(max_length=15, help_text="Business phone number")
    email = models.EmailField(help_text="Business email address")
    
    # Verification & Licensing
    license_number = models.CharField(max_length=50, blank=True, help_text="Professional license number")
    insurance_info = models.TextField(blank=True, help_text="Insurance details")
    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATUS_CHOICES,
        default='pending'
    )
    
    application_status = models.CharField(
        max_length=20,
        choices=APPLICATION_STATUS_CHOICES,
        default='draft'
    )
    
    # Settings (JSON for flexible preferences)
    settings = models.JSONField(
        default=dict,
        blank=True,
        help_text="Provider preferences (notifications, auto-reply, etc.)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Service Provider"
        verbose_name_plural = "Service Providers"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'verification_status']),
            models.Index(fields=['city', 'state']),
            models.Index(fields=['latitude', 'longitude']),
        ]
    
    def __str__(self):
        return f"{self.business_name} ({self.category.name if self.category else 'No Category'})"
    
    @property
    def full_address(self):
        """Get formatted full address"""
        parts = [self.address_line1]
        if self.address_line2:
            parts.append(self.address_line2)
        parts.append(f"{self.city}, {self.state} {self.zip_code}")
        return ", ".join(parts)
    
    @property
    def photo_count(self):
        """Count of photos"""
        return self.media.count()
    
    @property
    def average_rating(self):
        """Calculate average rating from reviews"""
        reviews = self.reviews.all()
        if not reviews.exists():
            return 0
        total = sum(r.rating_overall for r in reviews)
        return round(total / reviews.count(), 1)
    
    @property
    def review_count(self):
        """Count of reviews"""
        return self.reviews.count()

    def get_lowest_price(self):
        """Get the lowest starting price across all services"""
        prices = []
        if hasattr(self, 'foster_details'):
            prices.append(self.foster_details.daily_rate)
        if hasattr(self, 'vet_details'):
            # Vet pricing is complex, usually no single base price field easily available unless service options
            pass 
        if hasattr(self, 'trainer_details'):
            prices.append(self.trainer_details.private_session_rate)
        if hasattr(self, 'groomer_details'):
             if self.groomer_details.base_price:
                 prices.append(self.groomer_details.base_price)
        if hasattr(self, 'sitter_details'):
             if self.sitter_details.walking_rate:
                 prices.append(self.sitter_details.walking_rate)
        
        return min(prices) if prices else None



class ServiceMedia(models.Model):
    """
    Normalized media model for service providers and specific services.
    """
    provider = models.ForeignKey(ServiceProvider, on_delete=models.CASCADE, related_name='media')
    file_url = models.URLField()
    thumbnail_url = models.URLField(blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    alt_text = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Service Media"
        verbose_name_plural = "Service Media"
        ordering = ['-is_primary', '-created_at']

    def __str__(self):
        return f"Media for {self.provider.business_name}"


class BusinessHours(models.Model):
    """
    Normalized hours of operation for service providers.
    """
    DAYS_OF_WEEK = (
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    )
    
    provider = models.ForeignKey(ServiceProvider, on_delete=models.CASCADE, related_name='hours')
    day = models.IntegerField(choices=DAYS_OF_WEEK)
    open_time = models.TimeField(null=True, blank=True)
    close_time = models.TimeField(null=True, blank=True)
    is_closed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('provider', 'day')
        ordering = ['day']

    def __str__(self):
        day_name = dict(self.DAYS_OF_WEEK).get(self.day)
        if self.is_closed:
            return f"{day_name}: Closed"
        return f"{day_name}: {self.open_time} - {self.close_time}"


class FosterService(models.Model):
    """
    Specific details for Foster Homes with comprehensive environment and pricing info.
    """
    AVAILABILITY_CHOICES = (
        ('available', 'Available'),
        ('limited', 'Limited'),
        ('full', 'Full'),
    )
    
    provider = models.OneToOneField(ServiceProvider, on_delete=models.CASCADE, related_name='foster_details')
    
    # Capacity
    capacity = models.IntegerField(default=1, help_text="Maximum number of animals")
    current_count = models.IntegerField(default=0, help_text="Current number of animals in care")
    current_availability = models.CharField(
        max_length=20,
        choices=AVAILABILITY_CHOICES,
        default='available'
    )
    
    # Species Accepted
    species_accepted = models.ManyToManyField(Species, related_name='foster_providers')
    
    # Environment Details (Keep as JSON for specific flexible data)
    environment_details = models.JSONField(
        default=dict,
        help_text="Detailed environment information (indoor_space, yard, etc.)"
    )
    
    # Care Standards, (Keep as JSON)
    care_standards = models.JSONField(
        default=dict,
        help_text="Care standards and routines"
    )
    
    # Pricing
    daily_rate = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        help_text="Daily rate in USD"
    )
    weekly_discount = models.IntegerField(
        default=0,
        help_text="Percentage discount for weekly booking (0-100)"
    )
    monthly_rate = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        help_text="Monthly rate in USD"
    )
    
    video_url = models.URLField(
        blank=True,
        null=True,
        help_text="Optional facility tour video URL"
    )
    
    class Meta:
        verbose_name = "Foster Service"
        verbose_name_plural = "Foster Services"
    
    def __str__(self):
        return f"Foster details for {self.provider.business_name}"
    
    @property
    def availability_percentage(self):
        """Calculate availability as percentage"""
        if self.capacity == 0:
            return 0
        return int(((self.capacity - self.current_count) / self.capacity) * 100)
    
    @property
    def weekly_rate(self):
        """Calculate weekly rate with discount"""
        weekly_base = self.daily_rate * 7
        discount_amount = weekly_base * (self.weekly_discount / 100)
        return weekly_base - discount_amount


class VeterinaryClinic(models.Model):
    """
    Specific details for Veterinary Clinics with comprehensive service and amenity info.
    """
    CLINIC_TYPE_CHOICES = (
        ('general', 'General Practice'),
        ('emergency', 'Emergency'),
        ('specialty', 'Specialty'),
        ('mobile', 'Mobile Vet'),
    )
    
    provider = models.OneToOneField(ServiceProvider, on_delete=models.CASCADE, related_name='vet_details')
    
    # Clinic Type
    clinic_type = models.CharField(
        max_length=20,
        choices=CLINIC_TYPE_CHOICES,
        default='general'
    )
    
    # Services Offered (M2M)
    services_offered = models.ManyToManyField(ServiceOption, related_name='clinics')
    
    # Species Treated (M2M)
    species_treated = models.ManyToManyField(Species, related_name='clinics')
    
    # Pricing
    pricing_info = models.TextField(
        help_text="Text description of pricing or specific procedure prices"
    )
    
    # Amenities (JSON array is okay for simple tags)
    amenities = models.JSONField(
        default=list,
        help_text="List of amenities available"
    )
    
    # Emergency Services
    emergency_services = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Veterinary Clinic"
        verbose_name_plural = "Veterinary Clinics"
    
    def __str__(self):
        return f"Vet details for {self.provider.business_name}"
    
    def is_open_now(self):
        """Check if clinic is currently open using BusinessHours"""
        from django.utils import timezone
        now = timezone.now()
        day = now.weekday()  # Monday is 0, Sunday is 6
        
        hours = self.provider.hours.filter(day=day).first()
        if not hours or hours.is_closed:
            return False
        
        current_time = now.time()
        return hours.open_time <= current_time <= hours.close_time


class TrainerService(models.Model):
    """
    Specific details for Pet Trainers with comprehensive service and pricing info.
    Supports behavioral intervention resources mentioned in rehoming intervention.
    """
    TRAINING_METHOD_CHOICES = (
        ('positive_reinforcement', 'Positive Reinforcement'),
        ('clicker_training', 'Clicker Training'),
        ('balanced', 'Balanced Training'),
        ('other', 'Other Methods'),
    )
    
    provider = models.OneToOneField(ServiceProvider, on_delete=models.CASCADE, related_name='trainer_details')
    
    # Specializations (M2M)
    # Links to Specialization model (Training category)
    specializations = models.ManyToManyField(Specialization, related_name='trainers')
    
    # Training Methods
    primary_method = models.CharField(
        max_length=30,
        choices=TRAINING_METHOD_CHOICES,
        default='positive_reinforcement'
    )
    training_philosophy = models.TextField(
        help_text="Detailed explanation of training approach and philosophy"
    )
    
    # Certifications (JSON is okay for this structured secondary info)
    certifications = models.JSONField(
        default=list,
        help_text="List of professional certifications [{'name': 'CPDT-KA', ...}]"
    )
    
    # Experience
    years_experience = models.IntegerField(default=0)
    
    # Species Trained (M2M)
    species_trained = models.ManyToManyField(Species, related_name='trainers')
    
    # Training Options
    offers_private_sessions = models.BooleanField(default=True)
    offers_group_classes = models.BooleanField(default=False)
    offers_board_and_train = models.BooleanField(default=False)
    offers_virtual_training = models.BooleanField(default=False)
    
    # Pricing
    private_session_rate = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        help_text="Hourly rate for private sessions"
    )
    group_class_rate = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Per-class rate for group sessions"
    )
    
    # Package Options (JSON is okay for this complex pricing structure)
    package_options = models.JSONField(
        default=list,
        blank=True,
        help_text="Pre-packaged training programs with pricing"
    )
    
    # Availability
    max_clients = models.IntegerField(
        default=10,
        help_text="Maximum number of concurrent clients"
    )
    current_client_count = models.IntegerField(default=0)
    accepting_new_clients = models.BooleanField(default=True)
    
    video_url = models.URLField(
        blank=True,
        null=True,
        help_text="Promotional video or training demonstration"
    )
    
    class Meta:
        verbose_name = "Trainer Service"
        verbose_name_plural = "Trainer Services"
    
    def __str__(self):
        return f"Trainer details for {self.provider.business_name}"
    
    @property
    def is_accepting_clients(self):
        """Check if trainer is accepting new clients based on capacity"""
        if not self.accepting_new_clients:
            return False
        return self.current_client_count < self.max_clients
    

class GroomerService(models.Model):
    """
    Specific details for Pet Groomers.
    """
    SALON_TYPE_CHOICES = (
        ('salon', 'Salon Based'),
        ('mobile', 'Mobile Grooming'),
        ('both', 'Both'),
    )
    
    provider = models.OneToOneField(ServiceProvider, on_delete=models.CASCADE, related_name='groomer_details')
    
    salon_type = models.CharField(max_length=20, choices=SALON_TYPE_CHOICES, default='salon')
    
    # Generic base price for "starts at" display
    base_price = models.DecimalField(max_digits=6, decimal_places=2, help_text="Starting price for basic groom")
    
    # Services (Using ServiceOption link or JSON for specific groomer menu)
    # Using JSON for flexibility in groomer menus which vary wildly by breed/size
    service_menu = models.JSONField(
        default=list,
        help_text="List of services [{'name': 'Full Groom', 'price': 50, 'description': '...'}, ...]"
    )
    
    species_accepted = models.ManyToManyField(Species, related_name='groomers')
    
    # Amenities
    amenities = models.JSONField(default=list, help_text="e.g. ['Hypoallergenic Shampoo', 'Cat Friendly']")
    
    class Meta:
        verbose_name = "Groomer Service"
        verbose_name_plural = "Groomer Services"
        
    def __str__(self):
        return f"Groomer details for {self.provider.business_name}"


class PetSitterService(models.Model):
    """
    Specific details for Pet Sitters and Dog Walkers.
    """
    provider = models.OneToOneField(ServiceProvider, on_delete=models.CASCADE, related_name='sitter_details')
    
    # Service Types Enabled
    offers_dog_walking = models.BooleanField(default=True)
    offers_house_sitting = models.BooleanField(default=False)
    offers_drop_in_visits = models.BooleanField(default=False)
    
    # Rates
    walking_rate = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    house_sitting_rate = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    drop_in_rate = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    
    species_accepted = models.ManyToManyField(Species, related_name='sitters')
    
    # details
    years_experience = models.IntegerField(default=0)
    is_insured = models.BooleanField(default=False)
    has_transport = models.BooleanField(default=False)
    
    service_radius_km = models.IntegerField(default=10, help_text="Service radius in KM")
    
    class Meta:
        verbose_name = "Pet Sitter Service"
        verbose_name_plural = "Pet Sitter Services"
        
    def __str__(self):
        return f"Sitter details for {self.provider.business_name}"



from apps.pets.models import PetProfile


class ServiceBooking(models.Model):
    """
    Generalized booking/reservation system for all service types.
    """
    BOOKING_TYPE_CHOICES = (
        ('standard', 'Standard Service'),
        ('recurring', 'Recurring'),
        ('emergency', 'Emergency'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending Approval'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('partial', 'Partial'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
    )
    
    provider = models.ForeignKey(ServiceProvider, on_delete=models.CASCADE, related_name='bookings')
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='service_bookings')
    pet = models.ForeignKey(PetProfile, on_delete=models.CASCADE, related_name='service_bookings')
    
    # Optional specific service option
    service_option = models.ForeignKey(ServiceOption, on_delete=models.SET_NULL, null=True, blank=True)
    
    booking_type = models.CharField(max_length=50, choices=BOOKING_TYPE_CHOICES, default='standard')
    
    # Booking date/time fields - USER PROVIDED, NOT auto-generated
    booking_date = models.DateField(help_text="Date of the booking/appointment", default='2024-01-01')  # Temporary for migration
    booking_time = models.TimeField(null=True, blank=True, help_text="Time of appointment (for time-based services)")
    
    # Full datetime fields (can be calculated or explicit)
    start_datetime = models.DateTimeField(help_text="Start date and time of service", default='2024-01-01 00:00:00')  # Temporary for migration
    end_datetime = models.DateTimeField(null=True, blank=True, help_text="End date and time (for multi-day services)")
    
    # Financials
    agreed_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Total price agreed for the service")
    deposit_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    special_requirements = models.TextField(blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    cancellation_reason = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['provider', 'status']),
            models.Index(fields=['booking_date', 'booking_time']),
            models.Index(fields=['start_datetime', 'end_datetime']),
        ]
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Booking: {self.provider.business_name} for {self.pet.name} on {self.booking_date}"
        
    @property
    def duration_hours(self):
        """Calculate duration in hours"""
        if self.start_datetime and self.end_datetime:
            delta = self.end_datetime - self.start_datetime
            return max(0, delta.total_seconds() / 3600)
        return 0


class ServiceReview(models.Model):
    """
    Enhanced service review with detailed rating categories matching spec.
    """
    provider = models.ForeignKey(ServiceProvider, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='service_reviews')
    booking = models.OneToOneField('ServiceBooking', on_delete=models.CASCADE, related_name='review', null=True, blank=True)
    
    # Overall + Specific Ratings (1-5 stars each)
    rating_overall = models.IntegerField(choices=[(i, f"{i} Stars") for i in range(1, 6)])
    rating_communication = models.IntegerField(choices=[(i, f"{i} Stars") for i in range(1, 6)])
    rating_cleanliness = models.IntegerField(choices=[(i, f"{i} Stars") for i in range(1, 6)])
    rating_quality = models.IntegerField(choices=[(i, f"{i} Stars") for i in range(1, 6)], verbose_name="Quality of Care")
    rating_value = models.IntegerField(choices=[(i, f"{i} Stars") for i in range(1, 6)], verbose_name="Value for Money")
    
    # Review Content
    review_text = models.TextField(help_text="Detailed review (200+ words required)")
    photo_url = models.URLField(
        blank=True,
        null=True,
        help_text="Optional photo with review"
    )
    
    # Service Type Used (Optional - can be inferred from provider but useful for history)
    category = models.ForeignKey(ServiceCategory, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Specific service option used
    service_option = models.ForeignKey(ServiceOption, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Verification
    verified_client = models.BooleanField(
        default=False,
        help_text="Has admin verified this person actually used the service?"
    )
    
    # Provider Response
    provider_response = models.TextField(
        blank=True,
        null=True,
        help_text="Provider's response to this review"
    )
    response_date = models.DateTimeField(
        blank=True,
        null=True,
        help_text="When provider responded"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Service Review"
        verbose_name_plural = "Service Reviews"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.rating_overall}* for {self.provider.business_name} by {self.reviewer.email}"
    
    @property
    def average_rating(self):
        """Calculate average of all rating categories"""
        ratings = [
            self.rating_overall,
            self.rating_communication,
            self.rating_cleanliness,
            self.rating_quality,
            self.rating_value,
        ]
        return round(sum(ratings) / len(ratings), 1)

class ProviderAvailabilityBlock(models.Model):
    """
    Represents times when a provider is NOT available for bookings.
    Supports one-time blocks and recurring patterns.
    """
    
    RECURRENCE_CHOICES = [
        ('weekly', 'Weekly'),
        ('biweekly', 'Bi-weekly'),
        ('monthly', 'Monthly'),
    ]
    
    provider = models.ForeignKey(
        ServiceProvider,
        on_delete=models.CASCADE,
        related_name='availability_blocks'
    )
    
    # Date-specific blocks
    block_date = models.DateField(
        null=True,
        blank=True,
        help_text="Specific date to block (for one-time blocks)"
    )
    start_time = models.TimeField(
        null=True,
        blank=True,
        help_text="Start time of block"
    )
    end_time = models.TimeField(
        null=True,
        blank=True,
        help_text="End time of block"
    )
    
    # All-day blocks
    is_all_day = models.BooleanField(
        default=False,
        help_text="Block entire day"
    )
    
    # Recurring blocks
    is_recurring = models.BooleanField(
        default=False,
        help_text="Is this a recurring block?"
    )
    recurrence_pattern = models.CharField(
        max_length=20,
        choices=RECURRENCE_CHOICES,
        null=True,
        blank=True,
        help_text="How often this block repeats"
    )
    day_of_week = models.IntegerField(
        null=True,
        blank=True,
        help_text="Day of week (0=Monday, 6=Sunday) for recurring blocks"
    )
    
    # Metadata
    reason = models.TextField(
        blank=True,
        help_text="Reason for blocking this time (optional)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-block_date', 'start_time']
        verbose_name = "Availability Block"
        verbose_name_plural = "Availability Blocks"
    
    def __str__(self):
        if self.is_recurring:
            days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            day_name = days[self.day_of_week] if self.day_of_week is not None else 'Unknown'
            return f"{self.provider.business_name} - Every {day_name}"
        elif self.is_all_day:
            return f"{self.provider.business_name} - {self.block_date} (All Day)"
        else:
            return f"{self.provider.business_name} - {self.block_date} {self.start_time}-{self.end_time}"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        
        # Recurring blocks must have day_of_week and recurrence_pattern
        if self.is_recurring:
            if self.day_of_week is None or not self.recurrence_pattern:
                raise ValidationError(
                    "Recurring blocks must specify day_of_week and recurrence_pattern"
                )
        
        # Non-recurring blocks must have block_date
        if not self.is_recurring and not self.block_date:
            raise ValidationError(
                "Non-recurring blocks must specify a block_date"
            )
        
        # If not all-day, must have start and end times
        if not self.is_all_day and (not self.start_time or not self.end_time):
            raise ValidationError(
                "Blocks must have start_time and end_time unless is_all_day is True"
            )
        
        # End time must be after start time
        if self.start_time and self.end_time and self.end_time <= self.start_time:
            raise ValidationError(
                "end_time must be after start_time"
            )
