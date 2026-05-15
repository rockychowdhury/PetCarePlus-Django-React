from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.shortcuts import get_object_or_404, redirect
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from apps.services.models import ServiceBooking
from .models import PaymentTransaction
import requests
import uuid

# SSLCommerz Sandbox endpoints
SSL_INIT_URL = 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
SSL_VALIDATION_URL = 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'

class PaymentInitiateView(APIView):
    def post(self, request, *args, **kwargs):
        booking_id = request.data.get('booking_id')
        if not booking_id:
            return Response({'error': 'booking_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        booking = get_object_or_404(ServiceBooking, id=booking_id)
        
        # In a real scenario, you'd calculate this based on booking parameters or use agreed_price
        amount = booking.agreed_price
        
        if amount <= 0:
            # Handle free services or zero-amount bookings gracefully
            booking.payment_status = 'paid'
            booking.save()
            
            # Create a success transaction record for history
            PaymentTransaction.objects.create(
                transaction_id=f"FREE-{uuid.uuid4().hex[:8].upper()}",
                booking=booking,
                amount=0,
                status='SUCCESS'
            )
            
            return Response({
                'status': 'SUCCESS',
                'message': 'Free service booking confirmed.',
                'direct_success': True
            }, status=status.HTTP_200_OK)

        tran_id = str(uuid.uuid4())
        
        # Create transaction record
        transaction = PaymentTransaction.objects.create(
            transaction_id=tran_id,
            booking=booking,
            amount=amount,
            status='PENDING'
        )

        # Build payload for SSLCommerz
        # Since it's local/dev environment, you must use Ngrok or the Render backend URL for callbacks
        # We will dynamically build the backend URL
        backend_url = request.build_absolute_uri('/')[:-1] # Remove trailing slash
        
        post_body = {
            'store_id': settings.SSLCOMMERZ_STORE_ID,
            'store_passwd': settings.SSLCOMMERZ_STORE_PASSWORD,
            'total_amount': float(amount),
            'currency': 'BDT',
            'tran_id': tran_id,
            'success_url': f"{backend_url}/api/payments/success/",
            'fail_url': f"{backend_url}/api/payments/fail/",
            'cancel_url': f"{backend_url}/api/payments/cancel/",
            'emi_option': 0,
            'cus_name': booking.guest_client_name or (booking.client.get_full_name() if booking.client else 'Guest'),
            'cus_email': booking.guest_email or (booking.client.email if booking.client else 'test@test.com'),
            'cus_phone': booking.guest_phone or '01711111111',
            'cus_add1': 'Dhaka',
            'cus_city': 'Dhaka',
            'cus_country': 'Bangladesh',
            'shipping_method': 'NO',
            'product_name': f"Booking #{booking.id}",
            'product_category': 'Service',
            'product_profile': 'general',
        }

        response = requests.post(SSL_INIT_URL, data=post_body)
        
        if response.status_code == 200:
            res_data = response.json()
            if res_data.get('status') == 'SUCCESS':
                transaction.session_key = res_data.get('sessionkey')
                transaction.save()
                return Response({'GatewayPageURL': res_data.get('GatewayPageURL')}, status=status.HTTP_200_OK)
            else:
                return Response({'error': res_data.get('failedreason', 'Initiation failed')}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Failed to connect to SSLCommerz'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class PaymentSuccessView(APIView):
    authentication_classes = []
    
    def post(self, request, *args, **kwargs):
        val_id = request.data.get('val_id')
        tran_id = request.data.get('tran_id')
        
        if not val_id or not tran_id:
            return redirect(f"{settings.FRONTEND_URL}/payment/fail?reason=missing_parameters")
            
        transaction = get_object_or_404(PaymentTransaction, transaction_id=tran_id)
        
        # Validate the transaction
        validation_payload = {
            'val_id': val_id,
            'store_id': settings.SSLCOMMERZ_STORE_ID,
            'store_passwd': settings.SSLCOMMERZ_STORE_PASSWORD,
            'format': 'json'
        }
        
        val_response = requests.get(SSL_VALIDATION_URL, params=validation_payload)
        
        if val_response.status_code == 200:
            val_data = val_response.json()
            if val_data.get('status') == 'VALID' or val_data.get('status') == 'VALIDATED':
                transaction.status = 'SUCCESS'
                transaction.val_id = val_id
                transaction.save()
                
                # Update booking
                booking = transaction.booking
                booking.payment_status = 'paid'
                booking.save()
                
                return redirect(f"{settings.FRONTEND_URL}/payment/success?tran_id={tran_id}")
                
        # If validation fails
        transaction.status = 'FAILED'
        transaction.save()
        return redirect(f"{settings.FRONTEND_URL}/payment/fail?tran_id={tran_id}&reason=validation_failed")


@method_decorator(csrf_exempt, name='dispatch')
class PaymentFailView(APIView):
    authentication_classes = []
    
    def post(self, request, *args, **kwargs):
        tran_id = request.data.get('tran_id')
        if tran_id:
            PaymentTransaction.objects.filter(transaction_id=tran_id).update(status='FAILED')
            
        return redirect(f"{settings.FRONTEND_URL}/payment/fail?tran_id={tran_id or ''}")


@method_decorator(csrf_exempt, name='dispatch')
class PaymentCancelView(APIView):
    authentication_classes = []
    
    def post(self, request, *args, **kwargs):
        tran_id = request.data.get('tran_id')
        if tran_id:
            PaymentTransaction.objects.filter(transaction_id=tran_id).update(status='CANCELLED')
            
        return redirect(f"{settings.FRONTEND_URL}/payment/cancel?tran_id={tran_id or ''}")
