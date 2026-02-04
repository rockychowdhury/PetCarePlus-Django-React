import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
    Plus,
    Filter,
    Calendar as CalendarIcon,
    Clock,
    DollarSign,
    Sparkles,
    ChevronRight,

} from 'lucide-react';
import { format, isSameDay, parseISO, isAfter } from 'date-fns';
import useServices from '../../../../hooks/useServices';
import Button from '../../../common/Buttons/Button';
import Calendar from '../../../common/Calendar/Calendar';
import Card from '../../../common/Layout/Card';
import DirectBookingModal from '../Modals/DirectBookingModal';

const CalendarPage = () => {
    const { provider } = useOutletContext();
    const navigate = useNavigate();
    const { useGetMyBookings } = useServices();
    const { data: bookingsData, isLoading } = useGetMyBookings();
    const [view, setView] = useState('week');
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    // --- Data Processing ---
    const bookings = bookingsData?.results?.filter(b => b.provider?.id === provider?.id) || [];

    // Filter for "Agenda" (Upcoming bookings)
    const upcomingBookings = bookings
        .filter(b => isAfter(new Date(b.booking_date), new Date()))
        .sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date))
        .slice(0, 4);

    // Calculate Month Revenue (Simple approximation based on booking date)
    const currentMonth = new Date().getMonth();
    const monthRevenue = bookings
        .filter(b => new Date(b.booking_date).getMonth() === currentMonth && b.status !== 'cancelled')
        .reduce((acc, curr) => acc + parseFloat(curr.agreed_price || 0), 0);

    // Transform bookings to calendar events format
    const events = bookings.map(booking => ({
        id: booking.id,
        date: booking.booking_date,
        time: booking.booking_time,
        title: booking.pet ? `${booking.pet.name} (${booking.pet.species})` : `${booking.guest_pet_name} (Guest)`,
        description: `${booking.service_option?.name || 'Standard Service'} • ${booking.client ? booking.client.first_name : booking.guest_client_name}`,
        color: getStatusColor(booking.status),
        status: booking.status,
        rawData: booking
    }));

    // Status color mapping (Updated for V3/Premium feel)
    function getStatusColor(status) {
        switch (status) {
            case 'confirmed': return 'border-l-[#C48B28] bg-[#C48B28]/10 text-[#402E11]';
            case 'pending': return 'border-l-yellow-500 bg-yellow-50/50 text-yellow-900';
            case 'completed': return 'border-l-green-600 bg-green-50/50 text-green-900';
            case 'in_progress': return 'border-l-purple-500 bg-purple-50/50 text-purple-900';
            case 'cancelled': return 'border-l-gray-400 bg-gray-50 text-gray-500';
            default: return 'border-l-gray-300 bg-gray-50 text-gray-700';
        }
    }

    const handleEventClick = (event) => {
        console.log('Event clicked:', event.rawData);
    };

    const handleDateClick = (date) => {
        console.log('Date clicked:', date);
    };

    const handleTimeSlotClick = (date, hour) => {
        console.log('Time slot clicked:', date, hour);
    };

    // V3 Style Event Renderer
    const renderBookingEvent = (event) => (
        <div
            onClick={(e) => {
                e.stopPropagation();
                handleEventClick(event);
            }}
            className={`mb-1 p-2 border-l-2 rounded-r-lg text-xs cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all ${event.color}`}
        >
            <div className="font-bold truncate">{event.title}</div>
            {event.time && <div className="text-[10px] opacity-80 truncate mt-0.5 flex items-center gap-1"><Clock size={8} /> {event.time}</div>}
        </div>
    );

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-[#C48B28]/20 border-t-[#C48B28] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.4em] mb-2 block">Schedule Management</span>
                    <h1 className="text-4xl font-black text-[#402E11] tracking-tight">
                        Professional Calendar
                    </h1>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="primary"
                        size="lg"
                        className="!bg-[#402E11] hover:!bg-[#5A421B] text-white shadow-xl shadow-[#402E11]/20 !rounded-lg"
                        onClick={() => setIsBookingModalOpen(true)}
                    >
                        <Plus size={18} className="mr-2" strokeWidth={2.5} />
                        New Booking
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Calendar (8 cols) */}
                <div className="lg:col-span-8">
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-[#EBC176]/20 shadow-2xl shadow-[#402E11]/5">

                        {/* Custom Toolbar for Calendar */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex bg-[#FAF3E0] p-1.5 rounded-full shadow-inner">
                                {['Week', 'Month'].map((v) => (
                                    <button
                                        key={v}
                                        onClick={() => setView(v.toLowerCase())}
                                        className={`px-8 py-2 text-xs font-black uppercase tracking-widest rounded-full transition-all duration-300 ${view === v.toLowerCase()
                                            ? 'bg-[#402E11] text-white shadow-lg scale-105'
                                            : 'text-[#402E11]/40 hover:text-[#402E11]'
                                            }`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[#402E11]/50">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-[#C48B28]"></div>
                                    <span>Confirmed</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <span>Pending</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                                    <span>Completed</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                    <span>In Progress</span>
                                </div>
                            </div>
                        </div>

                        {/* The Calendar Component */}
                        <Calendar
                            events={events}
                            onEventClick={handleEventClick}
                            onDateClick={handleDateClick}
                            onTimeSlotClick={handleTimeSlotClick}
                            view={view}
                            renderEvent={renderBookingEvent}
                            className="font-sans"
                        />
                    </div>
                </div>

                {/* Right Column: Sidebar (4 cols) */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Stats Card */}
                    <div className="bg-[#402E11] rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-[#402E11]/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[4rem] group-hover:scale-110 transition-transform" />

                        <div className="mb-8">
                            <p className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.3em] mb-2">Month Revenue</p>
                            <div className="flex items-center gap-3">
                                <DollarSign className="text-[#C48B28]" size={28} />
                                <span className="text-4xl font-black tracking-tighter">${monthRevenue.toLocaleString()}</span>
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.3em] mb-2">Upcoming</p>
                            <div className="flex items-center gap-3">
                                <CalendarIcon className="text-[#C48B28]" size={24} />
                                <span className="text-2xl font-black tracking-tight">{upcomingBookings.length} Bookings</span>
                            </div>
                        </div>
                    </div>

                    {/* Agenda / Upcoming List */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-[#EBC176]/20 shadow-xl shadow-[#402E11]/5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-[#402E11] flex items-center gap-2">
                                <Sparkles size={18} className="text-[#C48B28]" />
                                Agenda
                            </h3>
                            <button className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.2em] hover:text-[#402E11] transition-colors">
                                View All
                            </button>
                        </div>

                        <div className="space-y-4">
                            {upcomingBookings.length > 0 ? (
                                upcomingBookings.map(booking => (
                                    <div key={booking.id} className="group p-4 rounded-2xl bg-[#FAF3E0]/30 hover:bg-[#C48B28]/10 border border-transparent hover:border-[#C48B28]/20 transition-all cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-black text-[#402E11]/40 uppercase tracking-widest bg-white px-2 py-1 rounded-lg">
                                                {format(new Date(booking.booking_date), 'MMM dd')}
                                            </span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${booking.status === 'confirmed' ? 'text-green-700 bg-green-100' : 'text-yellow-700 bg-yellow-100'
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-[#402E11] text-sm mb-1">{booking.pet?.name}'s {booking.service_option?.name}</h4>
                                        <div className="flex items-center gap-2 text-xs text-[#402E11]/60">
                                            <Clock size={12} />
                                            {booking.booking_time} with {booking.client?.first_name}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-[#402E11]/40 text-sm font-medium">
                                    No upcoming bookings found.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Blocking Action */}
                    <div className="bg-gradient-to-br from-[#FDFBF7] to-[#FAF3E0] rounded-[2.5rem] p-8 border border-[#EBC176]/20 text-center">
                        <Clock size={32} className="mx-auto text-[#C48B28] mb-3 opacity-50" />
                        <h3 className="font-black text-[#402E11] text-lg mb-2">Need a Break?</h3>
                        <p className="text-xs text-[#402E11]/60 font-medium mb-6 px-4">
                            Block out time in your calendar to prevent new bookings during your off-hours.
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/provider/availability')}
                            className="w-full !bg-[#402E11] hover:!bg-[#5A421B] text-white !rounded-lg py-4 font-bold shadow-xl shadow-[#402E11]/20 hover:shadow-2xl hover:scale-[1.02] transition-all text-sm"
                        >
                            Block Time
                        </Button>
                    </div>

                </div>
            </div>
            {/* Direct Booking Modal */}
            <DirectBookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                provider={provider}
            />
        </div>
    );
};

export default CalendarPage;
