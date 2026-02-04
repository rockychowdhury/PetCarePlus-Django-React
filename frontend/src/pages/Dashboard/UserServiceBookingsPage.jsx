import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
    Clock,
    MapPin,
    PawPrint,
    ChevronRight,
    Search,
    AlertCircle,
    Filter,
    X,
    CalendarDays,
    DollarSign,
    ExternalLink,
    Star,
    Plus,
    BarChart3,
    Users,
    MessageCircle,
    RotateCcw
} from 'lucide-react';
import useServices from '../../hooks/useServices';
import useReviews from '../../hooks/useReviews';
import BookingStatusBadge from '../../components/Services/BookingStatusBadge';
import Button from '../../components/common/Buttons/Button';
import { format, isAfter, isBefore } from 'date-fns';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const UserServiceBookingsPage = () => {
    const [filter, setFilter] = useState('all'); // 'all' | 'completed' | 'upcoming' | 'cancelled'
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    // --- Modal State ---
    const [activeModal, setActiveModal] = useState(null); // 'details' | 'review' | 'reschedule'
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Review Form State
    const [reviewForm, setReviewForm] = useState({
        rating_overall: 5,
        rating_communication: 5,
        rating_cleanliness: 5,
        rating_quality: 5,
        rating_value: 5,
        review_text: ''
    });

    // Reschedule State
    const [rescheduleData, setRescheduleData] = useState({
        booking_date: format(new Date(), 'yyyy-MM-dd'),
        booking_time: '09:00'
    });
    const [availableSlots, setAvailableSlots] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    const { useGetMyBookings, useBookingAction, useGetProvider } = useServices();
    const { useSubmitServiceReview } = useReviews();

    const { data: bookingsData, isLoading, refetch } = useGetMyBookings();
    const bookingAction = useBookingAction();
    const submitReview = useSubmitServiceReview();

    const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData?.results || []);

    // Load available slots when date changes or rescheduling starts
    useEffect(() => {
        if (activeModal === 'reschedule' && selectedBooking?.provider?.id && rescheduleData.booking_date) {
            const fetchSlots = async () => {
                setIsLoadingSlots(true);
                try {
                    const { axiosInstance } = await import('../../hooks/useAPI');
                    const resp = await axiosInstance.get(`/services/providers/${selectedBooking.provider.id}/availability/`, {
                        params: { date: rescheduleData.booking_date }
                    });
                    setAvailableSlots(resp.data.available_slots || []);
                } catch (err) {
                    console.error("Failed to fetch slots", err);
                    setAvailableSlots([]);
                } finally {
                    setIsLoadingSlots(false);
                }
            };
            fetchSlots();
        }
    }, [activeModal, rescheduleData.booking_date, selectedBooking?.provider?.id]);

    // Statistics & Next Visit calculation
    const now = new Date();
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const upcomingBookings = bookings
        .filter(b => ['pending', 'confirmed'].includes(b.status) && isAfter(new Date(b.start_datetime), now))
        .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));

    const nextVisit = upcomingBookings[0];
    const nextVetVisit = upcomingBookings.find(b => b.provider?.category?.slug === 'veterinary');

    const getGoogleCalendarUrl = (booking) => {
        if (!booking) return '';
        const title = `${booking.provider?.category?.name || 'Service'} appointment with ${booking.provider?.business_name}`;
        const location = `${booking.provider?.address?.line1 || ''}, ${booking.provider?.address?.city || ''}`;
        const details = `Booking for ${booking.pet?.name}. Status: ${booking.status}. Agreed price: $${booking.agreed_price}`;

        // Use start_datetime if available, otherwise combine booking_date and booking_time
        const start = booking.start_datetime ? new Date(booking.start_datetime) : new Date(`${booking.booking_date}T${booking.booking_time}`);
        const end = booking.end_datetime ? new Date(booking.end_datetime) : new Date(start.getTime() + (booking.duration_hours || 1) * 60 * 60 * 1000);

        const formatGCalDate = (date) => {
            try { return date.toISOString().replace(/-|:|\.\d\d\d/g, ""); }
            catch (e) { return ''; }
        };

        const dates = `${formatGCalDate(start)}/${formatGCalDate(end)}`;
        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
    };

    const stats = {
        completed_count: completedBookings.length,
        next_vet_check: nextVetVisit ? format(new Date(nextVetVisit.booking_date), 'EEE, MMM dd') : 'Not scheduled',
        total_spent: completedBookings.reduce((acc, b) => acc + parseFloat(b.agreed_price || 0), 0).toFixed(2),
        pending_reviews: completedBookings.filter(b => !b.has_review).length,
        recommendation: completedBookings.some(b => !b.has_review)
            ? "Pending visits to review"
            : "All caught up!"
    };

    // --- Actions ---
    const handleAction = async (id, action, data = {}) => {
        try {
            await bookingAction.mutateAsync({ id, action, data });
            toast.success(`Booking ${action}ed successfully!`);
            refetch();
            setActiveModal(null);
        } catch (err) {
            toast.error(err.response?.data?.error || `Failed to ${action} booking.`);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await submitReview.mutateAsync({
                ...reviewForm,
                provider: selectedBooking.provider.id,
                booking: selectedBooking.id
            });
            toast.success("Review submitted! Thank you for your feedback.");
            refetch();
            setActiveModal(null);
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to submit review.");
        }
    };

    const handleWhatsApp = (booking) => {
        const phone = booking.provider?.phone;
        if (!phone) {
            toast.error("Provider phone number not available.");
            return;
        }
        const text = encodeURIComponent(`Hi ${booking.provider.business_name}, I'm messaging regarding my booking for ${booking.pet?.name} on ${booking.booking_date}.`);
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${text}`, '_blank');
    };

    const filteredBookings = bookings.filter(b => {
        if (filter === 'all') return true;
        if (filter === 'completed') return b.status === 'completed';
        if (filter === 'cancelled') return b.status === 'cancelled';
        if (filter === 'upcoming') return ['pending', 'confirmed', 'in_progress'].includes(b.status);
        return true;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Update current page if filter reduces results below current page range
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        } else if (totalPages === 0) {
            setCurrentPage(1);
        }
    }, [filteredBookings.length, totalPages]);

    return (
        <div className="w-full md:p-12 lg:p-20 space-y-12 bg-[#FEF9ED]/30 min-h-screen">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.3em] mb-3 block">History</span>
                    <h1 className="text-4xl font-black text-[#402E11] tracking-tight mb-2">
                        Service bookings
                    </h1>
                    <div className="flex items-center gap-3">
                        <p className="text-[#402E11]/60 font-bold text-sm">Track every visit, payment and review in one place.</p>
                        {nextVisit && (
                            <span className="px-3 py-1 bg-[#C48B28]/10 text-[#C48B28] rounded-full text-[10px] font-black uppercase tracking-wider border border-[#C48B28]/10">
                                {nextVisit.provider?.business_name}
                            </span>
                        )}
                    </div>
                </div>
                <Link to="/services">
                    <button className="flex items-center gap-3 bg-[#C48B28] text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#C48B28]/20 hover:scale-105 active:scale-95 transition-all">
                        <Plus size={18} strokeWidth={3} />
                        New booking
                    </button>
                </Link>
            </div>

            {/* Top Cards Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Timeline Section (Left - 8 cols) - MOVED HERE per Screenshot layout usually having timeline left or swapped? 
                   Wait, Step 777 had Next Visit on Left (8 cols) and Visit Overview on Right (4 cols).
                   Screenshot shows Timeline on LEFT and "Next Visit" + "Overview" on RIGHT.
                   I will adjust the col-spans and order to match screenshot: 
                   Left: Timeline (8 cols?)
                   Right: Next Visit & Overview (4 cols?)
                   Actually screenshot looks like:
                   [Timeline Filter]
                   [List of Bookings (Left)]  [Next Visit & Overview (Right)]
                */}

                {/* Timeline Section - Left Column */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Timeline Filter Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#EBC176]/10 pb-8">
                        <div>
                            <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.3em] mb-2 block">Timeline</span>
                            <p className="text-[#402E11]/60 font-medium text-sm">Your most recent bookings, newest first</p>
                        </div>
                        <div className="flex p-1.5 bg-white rounded-2xl border border-[#EBC176]/20 shadow-sm">
                            {['all', 'completed', 'upcoming', 'cancelled'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f
                                        ? 'bg-[#C48B28] text-white shadow-lg shadow-[#C48B28]/20'
                                        : 'text-[#402E11]/40 hover:text-[#402E11]'
                                        }`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {paginatedBookings.length > 0 ? (
                            paginatedBookings.map((booking) => (
                                <div key={booking.id} className="bg-white rounded-[2rem] p-6 border border-[#EBC176]/10 hover:shadow-xl hover:shadow-[#402E11]/5 transition-all group">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Left Section: Provider & Pet */}
                                        <div className="flex-1 flex gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-[#FAF3E0] overflow-hidden border border-[#EBC176]/20 shrink-0">
                                                {booking.provider?.user?.photoURL ? (
                                                    <img src={booking.provider.user.photoURL} alt="" className="w-full h-full object-cover" />
                                                ) : <div className="w-full h-full flex items-center justify-center text-[#C48B28]"><Users size={20} /></div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-base font-black text-[#402E11] truncate">{booking.provider?.business_name}</h4>
                                                    <span className="px-2 py-0.5 bg-[#FAF3E0] text-[#C48B28] rounded-full text-[8px] font-black uppercase tracking-widest border border-[#EBC176]/10">
                                                        {booking.provider?.category?.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[#402E11]/40 mb-3">
                                                    <MapPin size={10} />
                                                    <p className="text-[10px] font-bold truncate">{booking.provider?.address?.city || 'Dhaka'}, {booking.provider?.address?.state || 'Bangladesh'}</p>
                                                </div>

                                                {/* Pet Info Badge */}
                                                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#FAF3E0]/30 rounded-full w-fit border border-[#EBC176]/10">
                                                    {booking.pet?.media?.[0]?.url ? (
                                                        <div className="w-4 h-4 rounded-full overflow-hidden border border-white">
                                                            <img src={booking.pet.media[0].url} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : <PawPrint size={10} className="text-[#C48B28]" />}
                                                    <p className="text-[9px] font-black text-[#402E11] tracking-tight">
                                                        {booking.pet?.name} • <span className="text-[#C48B28] uppercase">{booking.pet?.species}</span> {booking.pet?.breed && `• ${booking.pet.breed}`}
                                                    </p>
                                                </div>

                                                <div className="mt-4 flex items-center gap-2">
                                                    <span className="text-[8px] font-black text-[#402E11]/30 uppercase tracking-[0.2em] border border-[#EBC176]/10 px-2 py-0.5 rounded-md">Standard Booking</span>
                                                </div>

                                                {booking.special_requirements && (
                                                    <p className="text-[9px] text-[#402E11]/50 mt-3 font-medium line-clamp-2">
                                                        <span className="font-bold">Special request:</span> {booking.special_requirements}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Middle Section: Schedule */}
                                        <div className="flex-1 border-y md:border-y-0 md:border-x border-[#EBC176]/5 px-0 md:px-6 py-4 md:py-0">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#FAF3E0] flex items-center justify-center text-[#C48B28] shrink-0">
                                                    <CalendarDays size={16} strokeWidth={2.5} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-[#402E11] tracking-tight mb-1">
                                                        {format(new Date(booking.booking_date), 'EEE, MMM dd')} • {booking.booking_time?.slice(0, 5) || format(new Date(booking.start_datetime), 'HH:mm')}
                                                    </p>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-bold text-[#402E11]/40 uppercase tracking-tighter">
                                                            Duration: {Math.round(booking.duration_hours)} hour • {booking.status}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-[#402E11]/40 uppercase tracking-tighter">
                                                            Booking created on {format(new Date(booking.created_at || new Date()), 'MMM dd, yyyy')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Section: Status & Actions */}
                                        <div className="w-full md:w-64 flex flex-col items-end shrink-0">
                                            <div className="text-right mb-4">
                                                <span className={`inline-block px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-2 ${booking.status === 'completed' ? 'bg-green-50 text-green-600 border border-green-100' :
                                                    booking.status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                        'bg-[#EBC176]/10 text-[#C48B28] border border-[#EBC176]/20'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                                <p className="text-[10px] font-bold text-[#C48B28] mb-1">
                                                    {booking.payment_status === 'paid' ? 'Payment received' : 'Payment pending'}
                                                </p>
                                                <p className="text-2xl font-black text-[#402E11] tracking-tight">${booking.agreed_price}</p>
                                            </div>

                                            <div className="mt-auto flex flex-row gap-2 w-full justify-end">
                                                <button
                                                    onClick={() => { setSelectedBooking(booking); setActiveModal('details'); }}
                                                    className="flex-1 md:flex-none px-4 py-2 bg-white text-[#402E11] border border-[#EBC176]/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#FAF3E0] transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <ExternalLink size={12} /> Details
                                                </button>

                                                {booking.status === 'completed' ? (
                                                    <button
                                                        disabled={booking.has_review}
                                                        onClick={() => { setSelectedBooking(booking); setActiveModal('review'); }}
                                                        className={`flex-1 md:flex-none px-4 py-2 bg-white text-[#402E11] border border-[#EBC176]/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${booking.has_review ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-[#FAF3E0]'}`}
                                                    >
                                                        <Star size={12} className={booking.has_review ? 'text-gray-400' : 'text-[#C48B28]'} />
                                                        {booking.has_review ? 'Reviewed' : 'Review'}
                                                    </button>
                                                ) : booking.status === 'cancelled' || booking.status === 'rejected' ? (
                                                    <Link to={`/services/${booking.provider?.id || ''}`} className="flex-1 md:flex-none">
                                                        <button className="w-full px-4 py-2 bg-[#C48B28] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-[#C48B28]/10 flex items-center justify-center gap-2">
                                                            <RotateCcw size={12} /> Re-book
                                                        </button>
                                                    </Link>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleWhatsApp(booking)}
                                                            className="flex-1 md:flex-none px-4 py-2 bg-[#25D366] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-[#25D366]/10 flex items-center justify-center gap-2"
                                                        >
                                                            <MessageCircle size={12} /> WhatsApp
                                                        </button>
                                                        {booking.status === 'pending' && (
                                                            <button
                                                                onClick={() => { setSelectedBooking(booking); setActiveModal('reschedule'); }}
                                                                className="flex-1 md:flex-none px-4 py-2 bg-white text-[#402E11] border border-[#EBC176]/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#FAF3E0] transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                <CalendarDays size={12} /> Reschedule
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-[2.5rem] p-24 text-center border border-[#EBC176]/10">
                                <CalendarDays size={48} className="text-[#C48B28]/20 mx-auto mb-6" />
                                <h3 className="text-xl font-black text-[#402E11] tracking-tight mb-2">No {filter} bookings found</h3>
                                <p className="text-[#402E11]/40 font-bold text-sm max-w-sm mx-auto">Your timeline is empty.</p>
                                <Link to="/services" className="mt-8 block">
                                    <button className="px-10 py-4 bg-[#C48B28] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest">Browse Services</button>
                                </Link>
                            </div>
                        )}
                    </div>     {/* Pagination Footer */}
                    <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-[#EBC176]/5 gap-4">
                        <span className="text-[11px] font-bold text-[#402E11]/40 uppercase tracking-widest">
                            {filteredBookings.length > 0 ? (
                                <>Showing <span className="text-[#402E11]">{(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredBookings.length)}</span> of <span className="text-[#402E11]">{filteredBookings.length}</span> bookings</>
                            ) : 'No bookings to show'}
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`w-9 h-9 rounded-full bg-white border border-[#EBC176]/20 flex items-center justify-center text-[#402E11] transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#FAF3E0] hover:border-[#EBC176]/40'}`}
                            >
                                <ChevronRight className="rotate-180" size={16} />
                            </button>

                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => handlePageChange(i + 1)}
                                    className={`w-9 h-9 rounded-full text-[11px] font-black transition-all ${currentPage === i + 1
                                        ? 'bg-[#C48B28] text-white shadow-lg shadow-[#C48B28]/20'
                                        : 'bg-white text-[#402E11] border border-[#EBC176]/10 hover:bg-[#FAF3E0]'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`w-9 h-9 rounded-full bg-white border border-[#EBC176]/20 flex items-center justify-center text-[#402E11] transition-all ${currentPage === totalPages || totalPages === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#FAF3E0] hover:border-[#EBC176]/40'}`}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column (Sidebar) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Next Visit Card (Premium Light V2) */}
                    {nextVisit ? (
                        <div className="bg-[#FEF9ED] rounded-[2.5rem] p-8 border border-[#EBC176]/20 shadow-xl shadow-[#402E11]/5 relative overflow-hidden group">
                            {/* Static Ambient Glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C48B28]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                            <div className="relative z-10">
                                {/* Header with Animated Badge and Pet */}
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#B45309] text-white rounded-full shadow-lg shadow-[#B45309]/20">
                                        <div className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Next Visit</span>
                                    </div>

                                    {/* Pet Info Badge */}
                                    <div className="bg-white/80 backdrop-blur-sm p-0.5 pr-3 rounded-full border border-[#EBC176]/30 flex items-center gap-2 shadow-sm">
                                        {nextVisit.pet?.media?.[0]?.url ? (
                                            <div className="w-7 h-7 rounded-full overflow-hidden bg-white border border-[#EBC176]/20 shadow-inner">
                                                <img src={nextVisit.pet.media[0].url} className="w-full h-full object-cover" alt="" />
                                            </div>
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center border border-[#EBC176]/20">
                                                <PawPrint size={12} className="text-[#C48B28]" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-[10px] font-black text-[#402E11] leading-tight">{nextVisit.pet?.name}</p>
                                            <p className="text-[8px] font-bold text-[#C48B28] uppercase tracking-tighter">
                                                {nextVisit.pet?.species} • {nextVisit.pet?.breed || 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8 pl-1">
                                    <h2 className="text-[26px] font-black text-[#402E11] tracking-tight leading-tight mb-2">
                                        {nextVisit.provider?.category?.slug === 'veterinary' ? 'Vet appointment' : 'Service appointment'}
                                        <span className="text-base font-medium text-[#402E11]/30 tracking-tight mx-2">with</span>
                                        <span className="text-[#C48B28] mr-3">{nextVisit.provider?.business_name}</span>
                                        <span className="inline-flex px-3 py-1 bg-white border border-[#EBC176]/30 rounded-full text-[8px] font-black text-[#C48B28] uppercase tracking-[0.2em] shadow-sm align-middle relative -top-0.5">
                                            {nextVisit.provider?.category?.name}
                                        </span>
                                    </h2>
                                    {nextVisit.provider?.experience_years && (
                                        <p className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-[0.2em] mt-1">
                                            Verified Provider • {nextVisit.provider.experience_years} Years Experience
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {/* Date & Time Box */}
                                    <div className="flex items-center gap-4 p-4 bg-white/60 rounded-[1.25rem] border border-[#EBC176]/20 hover:bg-white/90 transition-all group/box shadow-sm">
                                        <div className="w-10 h-10 rounded-xl bg-[#C48B28] flex items-center justify-center text-white border border-[#C48B28]/20 shadow-md transition-colors group-hover/box:scale-105">
                                            <CalendarDays size={18} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-[#402E11] tracking-wide">
                                                {format(new Date(nextVisit.booking_date), 'EEE, MMM dd')}
                                            </p>
                                            <p className="text-[10px] text-[#C48B28] font-bold uppercase tracking-widest mt-0.5">
                                                {nextVisit.booking_time ? nextVisit.booking_time.slice(0, 5) : format(new Date(nextVisit.start_datetime), 'HH:mm')} ({Math.round(nextVisit.duration_hours)} HR SESSION)
                                            </p>
                                        </div>
                                    </div>

                                    {/* Location Box */}
                                    <div className="flex items-center gap-4 p-4 bg-white/60 rounded-[1.25rem] border border-[#EBC176]/20 hover:bg-white/90 transition-all group/box shadow-sm">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#C48B28] border border-[#EBC176]/30 shadow-sm transition-colors group-hover/box:scale-105">
                                            <MapPin size={18} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-[#402E11] tracking-wide truncate">
                                                {nextVisit.provider?.address?.city || 'Location Pending'}
                                            </p>
                                            <p className="text-[10px] text-[#402E11]/40 font-bold uppercase tracking-widest mt-0.5 truncate">
                                                {[nextVisit.provider?.address?.line1, nextVisit.provider?.address?.line2].filter(Boolean).join(', ') || 'Address details available soon'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Buttons Row */}
                                    <div className="pt-4 flex gap-4">
                                        <a
                                            href={getGoogleCalendarUrl(nextVisit)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 py-4 bg-[#C48B28] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-[#A37320] hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#C48B28]/20 group/btn"
                                        >
                                            <CalendarDays size={16} strokeWidth={2.5} /> Add to Calendar
                                        </a>
                                        <button
                                            onClick={() => handleWhatsApp(nextVisit)}
                                            className="flex-1 py-4 bg-white text-[#25D366] rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-[#25D366]/10 hover:border-[#25D366]/30 hover:bg-[#25D366]/5 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-[#25D366]/5"
                                        >
                                            <MessageCircle size={16} strokeWidth={2.5} /> WhatsApp
                                        </button>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-8 pt-6 border-t border-[#EBC176]/10 flex justify-between items-end">
                                        <div>
                                            <p className="text-[9px] font-black text-[#C48B28] uppercase tracking-[0.2em] mb-1">Estimated Total</p>
                                            <p className="text-3xl font-black text-[#402E11] tracking-tighter">${nextVisit.agreed_price}</p>
                                        </div>
                                        <p className="text-[9px] text-[#402E11]/30 font-black uppercase tracking-widest mb-1.5">
                                            {nextVisit.payment_status === 'paid' ? 'Paid in full' : 'Pay at clinic'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Visit Overview Card (Compact V2) */}
                    <div className="bg-gradient-to-br from-[#FDFBF7] via-white to-[#FAF3E0]/40 rounded-[2rem] p-6 border-2 border-[#EBC176]/25 shadow-xl shadow-[#C48B28]/10 relative overflow-hidden group">
                        {/* More Visible Metallic Mesh */}
                        <div className="absolute inset-0 opacity-[0.35] pointer-events-none transition-transform duration-700 group-hover:scale-110"
                            style={{
                                backgroundImage: 'radial-gradient(circle at 20% 20%, #C48B28 0%, transparent 25%), radial-gradient(circle at 80% 80%, #C48B28 0%, transparent 25%)',
                                filter: 'blur(50px)'
                            }} />

                        {/* Noticeable Shine Sweep */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -skew-x-[35deg] -translate-x-full group-hover:translate-x-[250%] transition-transform duration-[2000ms] ease-in-out pointer-events-none opacity-65 z-20" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-[#C48B28]/10 rounded-lg">
                                        <BarChart3 size={14} className="text-[#C48B28]" />
                                    </div>
                                    <h3 className="text-[10px] font-black text-[#402E11] uppercase tracking-[0.2em]">Visit overview</h3>
                                </div>
                                <span className="text-[8px] font-black text-[#402E11]/30 uppercase tracking-[0.2em]">12 Months</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-[#FAF3E0]/20 rounded-2xl border border-[#EBC176]/10 hover:bg-[#FAF3E0]/40 transition-colors group/stat">
                                    <p className="text-[8px] font-black text-[#402E11]/40 uppercase tracking-widest mb-1">Completed</p>
                                    <p className="text-2xl font-black text-[#402E11] tracking-tight group-hover/stat:text-[#C48B28] transition-colors">{stats.completed_count}</p>
                                </div>

                                <div className="p-4 bg-[#FAF3E0]/20 rounded-2xl border border-[#EBC176]/10 hover:bg-[#FAF3E0]/40 transition-colors group/stat">
                                    <p className="text-[8px] font-black text-[#402E11]/40 uppercase tracking-widest mb-1">Next Vet</p>
                                    <p className="text-sm font-black text-[#402E11] tracking-tight group-hover/stat:text-[#C48B28] transition-colors truncate">{stats.next_vet_check}</p>
                                </div>

                                <div className="p-4 bg-[#FAF3E0]/20 rounded-2xl border border-[#EBC176]/10 hover:bg-[#FAF3E0]/40 transition-colors group/stat">
                                    <p className="text-[8px] font-black text-[#402E11]/40 uppercase tracking-widest mb-1">Total Spent</p>
                                    <p className="text-2xl font-black text-[#402E11] tracking-tight group-hover/stat:text-[#C48B28] transition-colors">${Math.round(stats.total_spent)}</p>
                                </div>

                                <div className="p-4 bg-[#FAF3E0]/20 rounded-2xl border border-[#EBC176]/10 hover:bg-[#FAF3E0]/40 transition-colors group/stat">
                                    <p className="text-[8px] font-black text-[#402E11]/40 uppercase tracking-widest mb-1">Reviews</p>
                                    <p className="text-sm font-black text-[#402E11] tracking-tight group-hover/stat:text-[#C48B28] transition-colors">
                                        {stats.pending_reviews > 0 ? `${stats.pending_reviews} Pending` : 'All caught up'}
                                    </p>
                                </div>
                            </div>

                            <p className="text-[9px] font-bold text-[#402E11]/20 mt-6 leading-relaxed text-center">
                                Updated automatically as you book or complete visits.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <AnimatePresence>
                    {activeModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setActiveModal(null)}
                                className="absolute inset-0 bg-transparent"
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                                transition={{
                                    type: "spring",
                                    damping: 25,
                                    stiffness: 300,
                                    opacity: { duration: 0.2, ease: "easeOut" }
                                }}
                                className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 border border-[#EBC176]/30"
                            >
                                {/* Modal Header */}
                                <div className="p-5 border-b border-[#EBC176]/10 flex justify-between items-center bg-[#FDFBF7]">
                                    <div>
                                        <span className="text-[9px] font-black text-[#C48B28] uppercase tracking-[0.3em] mb-1 block">
                                            {activeModal === 'details' ? 'Transaction Receipt' : activeModal === 'review' ? 'Share your experience' : 'Schedule Adjustment'}
                                        </span>
                                        <h2 className="text-xl font-black text-[#402E11] tracking-tight truncate">
                                            {selectedBooking?.provider?.business_name}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => setActiveModal(null)}
                                        className="w-10 h-10 rounded-2xl bg-white border border-[#EBC176]/20 flex items-center justify-center text-[#C48B28] hover:scale-105 active:scale-95 transition-all shadow-sm"
                                    >
                                        <X size={18} strokeWidth={3} />
                                    </button>
                                </div>

                                <div className="max-h-[80vh] overflow-y-auto p-5 space-y-4 custom-scrollbar">
                                    {activeModal === 'details' && selectedBooking && (
                                        <div className="space-y-4">
                                            {/* Status Row */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 bg-[#FAF3E0]/30 rounded-2xl border-2 border-[#EBC176]/10 text-center">
                                                    <p className="text-[8px] font-black text-[#C48B28] uppercase tracking-[0.2em] mb-1.5">Booking Status</p>
                                                    <span className="px-3 py-1 bg-white text-[#C48B28] rounded-full text-[9px] font-black uppercase tracking-wider border border-[#EBC176]/20 shadow-sm">{selectedBooking.status}</span>
                                                </div>
                                                <div className="p-3 bg-[#FAF3E0]/30 rounded-2xl border-2 border-[#EBC176]/10 text-center">
                                                    <p className="text-[8px] font-black text-[#C48B28] uppercase tracking-[0.2em] mb-1.5">Payment</p>
                                                    <span className={`px-3 py-1 bg-white rounded-full text-[9px] font-black uppercase tracking-wider border ${selectedBooking.payment_status === 'paid' ? 'text-green-600 border-green-100 shadow-sm shadow-green-50' : 'text-orange-600 border-orange-100 shadow-sm shadow-orange-50'}`}>
                                                        {selectedBooking.payment_status}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Main Details Card */}
                                            <div className="p-5 bg-white rounded-[2rem] border-2 border-[#EBC176]/15 shadow-sm relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#C48B28]/5 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-110" />
                                                <div className="flex items-center gap-4 mb-4 relative z-10">
                                                    <div className="w-12 h-12 rounded-2xl border-2 border-[#FAF3E0] overflow-hidden shadow-md">
                                                        <img src={selectedBooking.pet?.media?.[0]?.url || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-base font-black text-[#402E11]">{selectedBooking.pet?.name}</h4>
                                                        <p className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-widest">{selectedBooking.pet?.species} • {selectedBooking.pet?.breed || 'Unknown'}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 relative z-10">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2.5 bg-[#FAF3E0] rounded-xl text-[#C48B28] border border-[#EBC176]/20"><CalendarDays size={16} strokeWidth={2.5} /></div>
                                                        <div>
                                                            <p className="text-sm font-black text-[#402E11] tracking-tight">{format(new Date(selectedBooking.booking_date), 'MMMM dd, yyyy')}</p>
                                                            <p className="text-[9px] font-black text-[#C48B28] uppercase tracking-[0.2em] mt-0.5">Appointment Date</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2.5 bg-[#FAF3E0] rounded-xl text-[#C48B28] border border-[#EBC176]/20"><Clock size={16} strokeWidth={2.5} /></div>
                                                        <div>
                                                            <p className="text-sm font-black text-[#402E11] tracking-tight">{selectedBooking.booking_time?.slice(0, 5)} • {Math.round(selectedBooking.duration_hours)}H Session</p>
                                                            <p className="text-[9px] font-black text-[#C48B28] uppercase tracking-[0.2em] mt-0.5">Time & Duration</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Financial Summary */}
                                            <div className="p-5 bg-[#FAF3E0]/40 rounded-[2rem] border-2 border-[#EBC176]/20 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C48B28]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                                <div className="flex justify-between items-center relative z-10">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-[#C48B28] flex items-center justify-center text-white shadow-lg shadow-[#C48B28]/20">
                                                            <DollarSign size={22} strokeWidth={2.5} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-[#C48B28] uppercase tracking-[0.2em] mb-0.5">Total agreed price</p>
                                                            <p className="text-3xl font-black text-[#402E11] tracking-tighter leading-none">${selectedBooking.agreed_price}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="px-3 py-1 bg-white border border-[#EBC176]/30 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                            <span className="text-[8px] font-black text-[#402E11] uppercase tracking-widest">Final Amount</span>
                                                        </div>
                                                        <p className="text-[9px] font-bold text-[#402E11]/30 mt-2 uppercase tracking-tight italic">Service Fee Included</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {selectedBooking.special_requirements && (
                                                <div className="p-3.5 bg-[#FAF3E0]/10 rounded-2xl border border-[#EBC176]/10">
                                                    <p className="text-[8px] font-black text-[#402E11]/50 uppercase tracking-widest mb-2">Internal Notes</p>
                                                    <p className="text-[11px] text-[#402E11]/70 font-bold leading-relaxed italic border-l-2 border-[#C48B28]/20 pl-3">
                                                        "{selectedBooking.special_requirements}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeModal === 'review' && selectedBooking && (
                                        <form onSubmit={handleReviewSubmit} className="space-y-6">
                                            {/* Overall Stars */}
                                            <div className="text-center py-2">
                                                <p className="text-[9px] font-black text-[#C48B28] uppercase tracking-[0.2em] mb-4">Overall rating</p>
                                                <div className="flex justify-center gap-1.5">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <button
                                                            key={s}
                                                            type="button"
                                                            onClick={() => setReviewForm(prev => ({ ...prev, rating_overall: s }))}
                                                            className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                                                        >
                                                            <Star size={28} fill={reviewForm.rating_overall >= s ? '#C48B28' : 'none'} className={reviewForm.rating_overall >= s ? 'text-[#C48B28]' : 'text-gray-200'} strokeWidth={2.5} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Advanced Ratings Grid */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { id: 'rating_communication', label: 'Communication' },
                                                    { id: 'rating_cleanliness', label: 'Cleanliness' },
                                                    { id: 'rating_quality', label: 'Quality of Care' },
                                                    { id: 'rating_value', label: 'Value for Money' }
                                                ].map(cat => (
                                                    <div key={cat.id} className="p-3.5 bg-[#FAF3E0]/20 rounded-2xl border border-[#EBC176]/10">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-[8px] font-black text-[#402E11]/40 uppercase tracking-widest">{cat.label}</span>
                                                            <span className="text-[9px] font-black text-[#C48B28]">{reviewForm[cat.id]}/5</span>
                                                        </div>
                                                        <div className="flex gap-1.5 flex-wrap">
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <button
                                                                    key={s}
                                                                    type="button"
                                                                    onClick={() => setReviewForm(prev => ({ ...prev, [cat.id]: s }))}
                                                                    className="flex-1 h-2 rounded-full transition-all min-w-[12px]"
                                                                    style={{ backgroundColor: reviewForm[cat.id] >= s ? '#C48B28' : '#FAF3E0' }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Review Text Area */}
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-widest ml-1">Write your review</label>
                                                <textarea
                                                    required
                                                    minLength={20}
                                                    value={reviewForm.review_text}
                                                    onChange={(e) => setReviewForm(prev => ({ ...prev, review_text: e.target.value }))}
                                                    placeholder="Tell us about the service quality, professionality and care provided..."
                                                    className="w-full bg-white border border-[#EBC176]/20 rounded-2xl p-4 text-xs font-bold text-[#402E11] outline-none focus:border-[#C48B28]/40 transition-all min-h-[120px] shadow-sm placeholder:text-[#402E11]/20 resize-none"
                                                />
                                                <div className="flex justify-between items-center px-1">
                                                    <p className="text-[8px] font-bold text-[#402E11]/30 italic">Min. 20 characters required</p>
                                                    <p className={`text-[8px] font-black uppercase tracking-widest ${reviewForm.review_text.length >= 20 ? 'text-green-500' : 'text-red-400'}`}>
                                                        {reviewForm.review_text.length} Chars
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={submitReview.isLoading || reviewForm.review_text.length < 20}
                                                className="w-full py-4 bg-[#C48B28] text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#C48B28]/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-30 disabled:bg-[#EBC176]/20 disabled:text-[#C48B28]/40 disabled:shadow-none disabled:border-2 disabled:border-[#EBC176]/10"
                                            >
                                                {submitReview.isLoading ? 'Processing Submission...' : 'Post Service Review'}
                                            </button>
                                        </form>
                                    )}

                                    {activeModal === 'reschedule' && selectedBooking && (
                                        <div className="space-y-4">
                                            <div className="p-5 bg-[#FAF3E0]/40 rounded-[2rem] border-2 border-[#EBC176]/20 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#C48B28]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                                <p className="text-[9px] font-black text-[#C48B28] uppercase tracking-[0.2em] mb-3 relative z-10">Pending appointment</p>
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#C48B28] shadow-sm border border-[#EBC176]/20">
                                                        <Clock size={20} strokeWidth={2.5} />
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-black text-[#402E11] tracking-tight">{format(new Date(selectedBooking.booking_date), 'MMMM dd, HH:mm')}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#C48B28]" />
                                                            <p className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-widest">Status: {selectedBooking.status}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2.5">
                                                    <label className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-widest ml-1">Proposed adjustment date</label>
                                                    <div className="relative group">
                                                        <CalendarDays size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C48B28] z-10" />
                                                        <DatePicker
                                                            selected={new Date(rescheduleData.booking_date)}
                                                            onChange={(date) => setRescheduleData(prev => ({ ...prev, booking_date: format(date || new Date(), 'yyyy-MM-dd') }))}
                                                            minDate={new Date()}
                                                            dateFormat="MM/dd/yyyy"
                                                            className="w-full bg-white border-2 border-[#EBC176]/10 py-3 pl-14 pr-5 rounded-2xl text-[11px] font-black text-[#402E11] focus:border-[#C48B28]/50 focus:ring-0 outline-none transition-all shadow-sm cursor-pointer"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2.5">
                                                    <div className="flex justify-between items-center ml-1">
                                                        <label className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-widest">Available Time Blocks</label>
                                                        {isLoadingSlots && <span className="text-[8px] font-black text-[#C48B28] animate-pulse">Scanning availability...</span>}
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {availableSlots.length > 0 ? (
                                                            availableSlots.slice(0, 8).map(time => (
                                                                <button
                                                                    key={time}
                                                                    onClick={() => setRescheduleData(prev => ({ ...prev, booking_time: time }))}
                                                                    className={`py-3 rounded-xl text-[9px] font-black transition-all border-2 ${rescheduleData.booking_time === time ? 'bg-[#C48B28] border-[#C48B28] text-white shadow-lg shadow-[#C48B28]/20' : 'bg-white border-[#EBC176]/10 text-[#402E11] hover:border-[#C48B28]/20'}`}
                                                                >
                                                                    {time}
                                                                </button>
                                                            ))
                                                        ) : !isLoadingSlots && (
                                                            <div className="col-span-4 text-center py-6 bg-[#FAF3E0]/40 rounded-[2rem] border-2 border-[#EBC176]/20 border-dashed">
                                                                <p className="text-[9px] font-black text-[#C48B28]/80 uppercase tracking-[0.2em]">No valid slots found for this date</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleAction(selectedBooking.id, 'reschedule', rescheduleData)}
                                                disabled={isLoadingSlots || availableSlots.length === 0 || bookingAction.isLoading}
                                                className="w-full py-4 bg-[#C48B28] text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#C48B28]/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:grayscale-0 disabled:bg-[#EBC176]/10 disabled:text-[#C48B28]/60 disabled:shadow-none disabled:border-2 border-[#EBC176]/20"
                                            >
                                                {bookingAction.isLoading ? 'Verifying Schedule...' : 'Confirm Availability change'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 bg-[#FDFBF7] border-t border-[#EBC176]/10 text-center">
                                    <p className="text-[8px] font-bold text-[#402E11]/40 uppercase tracking-[0.2em]">Secure verification by PetCarePlus Engine</p>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default UserServiceBookingsPage;
