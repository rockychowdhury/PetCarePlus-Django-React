from django.db import models
import uuid

class PaymentTransaction(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
    )

    transaction_id = models.CharField(max_length=100, unique=True, default=uuid.uuid4)
    booking = models.ForeignKey('services.ServiceBooking', on_delete=models.CASCADE, related_name='payment_transactions')
    val_id = models.CharField(max_length=100, blank=True, null=True, help_text="Validation ID from SSLCommerz")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    session_key = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_id} - {self.booking} - {self.status}"
