from django.contrib import admin
from .models import ServiceProvider, ProviderService, ProviderAnimalType


class ProviderServiceInline(admin.TabularInline):
    model = ProviderService
    extra = 1


class ProviderAnimalTypeInline(admin.TabularInline):
    model = ProviderAnimalType
    extra = 1
    autocomplete_fields = ['animal_type']


@admin.register(ServiceProvider)
class ServiceProviderAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'provider_type', 'division', 'district', 'is_verified', 'avg_rating')
    list_filter = ('provider_type', 'is_verified', 'is_active', 'division')
    search_fields = ('business_name', 'user__email', 'phone')
    autocomplete_fields = ['user']
    inlines = [ProviderAnimalTypeInline, ProviderServiceInline]
    list_editable = ('is_verified',)
    readonly_fields = ('avg_rating', 'total_reviews')
    actions = ['approve_providers']

    @admin.action(description='Approve selected providers and send credentials')
    def approve_providers(self, request, queryset):
        from django.core.mail import send_mail
        from django.conf import settings
        import secrets
        import string

        approved_count = 0
        for provider in queryset:
            if not provider.is_verified:
                user = provider.user
                
                # Generate random password
                alphabet = string.ascii_letters + string.digits
                password = ''.join(secrets.choice(alphabet) for _ in range(8))
                
                # Update User
                user.set_password(password)
                user.is_active = True
                user.save()
                
                # Update Provider
                provider.is_verified = True
                provider.save()

                # Send approval email
                subject = 'Your Provider Profile is Approved / আপনার সেবাদাতা প্রোফাইল অনুমোদিত হয়েছে'
                message = f"""Hi {user.full_name},

Congratulations! Your PetCarePlus provider profile has been approved by our team.
অভিনন্দন! আপনার পেটকেয়ারপ্লাস সেবাদাতা প্রোফাইলটি আমাদের টিম দ্বারা অনুমোদিত হয়েছে।

You can now log in to the platform using the following credentials:
আপনি এখন নিচের লগইন বিবরণ ব্যবহার করে প্ল্যাটফর্মে প্রবেশ করতে পারবেন:

Email (ইমেইল): {user.email}
Password (পাসওয়ার্ড): {password}

Please log in here:
অনুগ্রহ করে এখানে লগইন করুন:
{settings.FRONTEND_URL}/login

Best regards,
PetCarePlus Team
পেটকেয়ারপ্লাস টিম
"""
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL or 'noreply@petcareplus.app',
                    [user.email],
                    fail_silently=True
                )
                approved_count += 1
                
        self.message_user(request, f"{approved_count} provider(s) successfully approved and notified.")


@admin.register(ProviderService)
class ProviderServiceAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'provider', 'price', 'duration_minutes', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name_en', 'provider__business_name')
