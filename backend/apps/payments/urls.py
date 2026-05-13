from django.urls import path
from . import views

urlpatterns = [
    path('init/', views.PaymentInitiateView.as_view(), name='payment_init'),
    path('success/', views.PaymentSuccessView.as_view(), name='payment_success'),
    path('fail/', views.PaymentFailView.as_view(), name='payment_fail'),
    path('cancel/', views.PaymentCancelView.as_view(), name='payment_cancel'),
]
