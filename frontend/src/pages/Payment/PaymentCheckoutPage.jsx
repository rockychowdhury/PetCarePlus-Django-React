import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Lock, Calendar, PawPrint, MapPin, Loader } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import useServices from '../../hooks/useServices';
import useAPI from '../../hooks/useAPI';
import PaymentMethodSelector from '../../components/Payment/PaymentMethodSelector';
import PricingSummary from '../../components/Payment/PricingSummary';
import Button from '../../components/common/Buttons/Button';
import { mockProcessPayment, calculatePricing } from '../../utils/mockPayment';

const PaymentCheckoutPage = () => {
    const api = useAPI();
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

    // Fetch booking details
    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const response = await api.get(`/services/bookings/${bookingId}/`);
                setBooking(response.data);
            } catch (error) {
                console.error('Failed to fetch booking:', error);
                toast.error('Failed to load booking details');
                navigate('/dashboard/bookings');
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId, navigate]);

    // Calculate pricing
    const pricing = booking ? calculatePricing(booking.agreed_price || 50) : null;

    const handlePayment = async () => {
        setProcessing(true);

        try {
            // Mock payment processing
            const result = await mockProcessPayment(
                pricing.total,
                selectedPaymentMethod,
                bookingId
            );

            // Update booking payment status
            await api.post(`/services/bookings/${bookingId}/mark_paid/`);

            toast.success('Payment successful!');
            navigate(`/checkout/success/${bookingId}`, { state: { transaction: result } });
        } catch (error) {
            console.error('Payment failed:', error);
            toast.error(error.message || 'Payment failed');
            navigate('/checkout/failure', { state: { bookingId, error: error.message } });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="animate-spin text-brand-primary" size={40} />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Booking not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-brand-primary font-bold text-lg mb-2">
                        <Lock size={20} />
                        Secure Checkout
                    </div>
                    <p className="text-sm text-gray-500">Complete your booking payment</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Payment Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Booking Summary */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Booking Summary</h2>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                                        <PawPrint className="text-brand-primary" size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{booking.provider?.business_name}</h3>
                                        <p className="text-sm text-gray-600">{booking.service_option?.name || 'Pet Service'}</p>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                            <MapPin size={12} />
                                            {booking.provider?.location || 'Location'}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold mb-1">Pet</div>
                                        <div className="text-sm font-medium text-gray-900">{booking.pet?.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold mb-1">Date</div>
                                        <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                            <Calendar size={14} />
                                            {booking.booking_date && format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <PaymentMethodSelector
                                selectedMethod={selectedPaymentMethod}
                                onSelect={setSelectedPaymentMethod}
                            />
                        </div>

                        {/* Trust Badges */}
                        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <Shield size={14} />
                                256-bit SSL Encrypted
                            </div>
                            <div className="flex items-center gap-1">
                                <Lock size={14} />
                                Secure Payment
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Pricing Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4">
                            <PricingSummary
                                pricing={pricing}
                                service={booking.service_option}
                                duration={1}
                            />

                            <Button
                                onClick={handlePayment}
                                disabled={processing}
                                variant="primary"
                                className="w-full mt-4 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3"
                            >
                                {processing ? (
                                    <>
                                        <Loader className="animate-spin mr-2" size={16} />
                                        Processing...
                                    </>
                                ) : (
                                    `Pay $${pricing?.total}`
                                )}
                            </Button>

                            <p className="text-xs text-center text-gray-500 mt-3">
                                By completing this purchase, you agree to our Terms of Service
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentCheckoutPage;
