import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Search,
    Calendar,
    Clock,
    Filter,
    Download,
    Plus,
    MoreVertical,
    FileText,
    MessageSquare,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Button from '../../../../components/common/Buttons/Button';
import Badge from '../../../../components/common/Feedback/Badge';
import useServices from '../../../../hooks/useServices';

const BookingsPage = () => {
    const { provider } = useOutletContext();
    const { useGetMyBookings, useBookingAction } = useServices();
    const { data: bookingsData, isLoading } = useGetMyBookings();
    const bookingAction = useBookingAction();

    const [activeTab, setActiveTab] = useState('pending');
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [completionData, setCompletionData] = useState({ finalPrice: '', paymentReceived: false });

    const [rejectionModal, setRejectionModal] = useState({ isOpen: false, bookingId: null, action: null });
    const [rejectionReason, setRejectionReason] = useState('');

    const handleAction = async (id, action, reason = null) => {
        if (action === 'complete') {
            const booking = filteredBookings.find(b => b.id === id);
            setSelectedBooking(booking);
            setCompletionData({
                finalPrice: booking.agreed_price || booking.service_option?.base_price || '0.00',
                paymentReceived: booking.payment_status === 'paid'
            });
            setIsCompleteModalOpen(true);
            return;
        }

        if (action === 'reject' || action === 'cancel') {
            setRejectionModal({ isOpen: true, bookingId: id, action });
            setRejectionReason('');
            return;
        }

        try {
            await bookingAction.mutateAsync({ id, action, data: reason ? { reason } : {} });
            toast.success(`Booking ${action}ed successfully`);
        } catch (error) {
            console.error(error);
            toast.error(`Failed to ${action} booking`);
        }
    };

    const handleRejectionSubmit = async () => {
        const { bookingId, action } = rejectionModal;
        if (!bookingId || !action) return;

        try {
            await bookingAction.mutateAsync({ id: bookingId, action, data: { reason: rejectionReason } });
            toast.success(`Booking ${action === 'reject' ? 'declined' : 'cancelled'} successfully`);
            setRejectionModal({ isOpen: false, bookingId: null, action: null });
            setRejectionReason('');
        } catch (error) {
            console.error(error);
            toast.error(`Failed to ${action} booking`);
        }
    };

    const handleCompleteSubmit = async () => {
        if (!selectedBooking) return;

        try {
            await bookingAction.mutateAsync({
                id: selectedBooking.id,
                action: 'complete',
                data: {
                    final_price: completionData.finalPrice,
                    payment_received: completionData.paymentReceived
                }
            });
            toast.success('Booking completed successfully');
            setIsCompleteModalOpen(false);
            setSelectedBooking(null);
        } catch (error) {
            console.error(error);
            toast.error('Failed to complete booking');
        }
    };

    // Filter Logic
    const allBookings = bookingsData?.results?.filter(b => b.provider.id === provider.id) || [];

    // Calculate counts for tabs
    const counts = {
        all: allBookings.length,
        pending: allBookings.filter(b => b.status === 'pending').length,
        confirmed: allBookings.filter(b => b.status === 'confirmed').length,
        in_progress: allBookings.filter(b => b.status === 'in_progress').length,
        completed: allBookings.filter(b => b.status === 'completed').length,
        cancelled: allBookings.filter(b => b.status === 'cancelled').length,
    };

    const filteredBookings = allBookings.filter(b => {
        // Status Filter
        if (activeTab !== 'all' && b.status !== activeTab) return false;

        // Search Filter (Client Name or ID)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const clientName = `${b.client.first_name} ${b.client.last_name}`.toLowerCase();
            return clientName.includes(query) || b.id.toString().includes(query);
        }

        return true;
    });

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'pending', label: `Pending (${counts.pending})` },
        { id: 'confirmed', label: 'Confirmed' },
        { id: 'in_progress', label: 'In Progress' },
        { id: 'completed', label: 'Completed' },
        { id: 'cancelled', label: 'Cancelled' }
    ];

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading bookings...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 bg-white shadow-sm">
                        <Download size={16} />
                        Export
                    </button>
                    <Button variant="primary" className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 shadow-sm">
                        <Plus size={16} />
                        New Booking
                    </Button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
                {/* Tabs */}
                <div className="flex gap-1 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all
                                ${activeTab === tab.id
                                    ? 'bg-gray-900 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by client or booking ID..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
                        <Calendar size={18} />
                    </button>
                </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
                {filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    filteredBookings.map(booking => (
                        <div key={booking.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            {/* Card Header: ID & Status */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                                <span className="text-sm font-medium text-gray-500">#BK-{booking.id}</span>
                                <Badge variant={
                                    booking.status === 'confirmed' ? 'success' :
                                        booking.status === 'in_progress' ? 'warning' :
                                            booking.status === 'pending' ? 'warning' :
                                                booking.status === 'completed' ? 'info' :
                                                    'error'
                                } className="capitalize px-3 py-1">
                                    {booking.status === 'pending' ? 'Pending Request' : booking.status.replace('_', ' ')}
                                </Badge>
                            </div>

                            {/* Card Content: Columns */}
                            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                                {/* 1. Client */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Client</label>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                            {booking.client.photoURL ? (
                                                <img src={booking.client.photoURL} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200 font-bold">
                                                    {booking.client.first_name[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{booking.client.first_name} {booking.client.last_name}</div>
                                            <div className="text-xs text-gray-500">Pet: {booking.pet?.name || 'Unknown'} ({booking.pet?.species || 'Pet'})</div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Service */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Service</label>
                                    <div className="font-semibold text-gray-900">{booking.service_option?.name || booking.service_name || booking.booking_type || 'Service'}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">Duration: {booking.duration_hours ? `${booking.duration_hours} hr` : 'N/A'}</div>
                                </div>

                                {/* 3. Schedule */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Schedule</label>
                                    <div className="font-semibold text-gray-900">
                                        {booking.booking_date ? format(new Date(booking.booking_date), 'MMM dd, yyyy') : 'TBD'}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        {booking.booking_time ? booking.booking_time.substring(0, 5) : 'Time TBD'}
                                        {booking.end_datetime && ` - ${format(new Date(booking.end_datetime), 'hh:mm a')}`}
                                    </div>
                                </div>

                                {/* 4. Price */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Price</label>
                                    <div className="font-bold text-gray-900">${booking.agreed_price || booking.service_option?.base_price || '0.00'}</div>
                                    <div className={`text-xs font-medium mt-0.5 ${booking.payment_status === 'paid' ? 'text-green-600' : 'text-red-500'}`}>
                                        {booking.payment_status === 'paid' ? 'Paid' : booking.payment_status === 'partial' ? 'Partially Paid' : 'Unpaid'}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info / Footer */}
                            <div className="px-6 pb-6 mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                {/* Notes */}
                                <div className="flex items-start gap-2 text-sm text-gray-500 md:max-w-xl">
                                    {booking.special_requirements ? (
                                        <>
                                            <AlertCircle size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                            <span>{booking.special_requirements}</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-400 italic flex items-center gap-2">
                                            <MessageSquare size={16} /> No additional notes provided.
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 self-end md:self-auto">
                                    {booking.status === 'pending' && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200"
                                                onClick={() => handleAction(booking.id, 'reject')}
                                            >
                                                Decline
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-teal-600 hover:bg-teal-700 text-white border-transparent"
                                                onClick={() => handleAction(booking.id, 'accept')}
                                            >
                                                Accept Request
                                            </Button>
                                        </>
                                    )}
                                    {booking.status === 'confirmed' && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-gray-600 border-gray-200"
                                                onClick={() => handleAction(booking.id, 'cancel')}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-blue-600 hover:bg-blue-700 text-white border-transparent"
                                                onClick={() => handleAction(booking.id, 'start')}
                                            >
                                                Start Service
                                            </Button>
                                        </>
                                    )}

                                    {booking.status === 'in_progress' && (
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white border-transparent"
                                            onClick={() => handleAction(booking.id, 'complete')}
                                        >
                                            Complete Service
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {/* Completion Modal */}
            {isCompleteModalOpen && selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Complete Service</h3>
                            <button onClick={() => setIsCompleteModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-600">
                                Please confirm payment details before completing the service for <strong>{selectedBooking.client.first_name}</strong>.
                            </p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Final Service Price</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                                        value={completionData.finalPrice}
                                        onChange={(e) => setCompletionData({ ...completionData, finalPrice: e.target.value })}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Adjust if additional services were provided.</p>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <input
                                    type="checkbox"
                                    id="paymentReceived"
                                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 border-gray-300"
                                    checked={completionData.paymentReceived}
                                    onChange={(e) => setCompletionData({ ...completionData, paymentReceived: e.target.checked })}
                                />
                                <label htmlFor="paymentReceived" className="text-sm font-medium text-gray-900 cursor-pointer">
                                    Payment Received (Cash/Reception)
                                </label>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsCompleteModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleCompleteSubmit} className="bg-green-600 hover:bg-green-700 text-white">
                                Confirm & Complete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection/Cancellation Modal */}
            {rejectionModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 capitalize">
                                {rejectionModal.action === 'reject' ? 'Decline Request' : 'Cancel Booking'}
                            </h3>
                            <button onClick={() => setRejectionModal({ ...rejectionModal, isOpen: false })} className="text-gray-400 hover:text-gray-600">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-600">
                                Please provide a reason for {rejectionModal.action === 'reject' ? 'declining' : 'cancelling'} this booking. This will be sent to the client.
                            </p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all h-32 resize-none"
                                    placeholder="Enter reason here..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setRejectionModal({ ...rejectionModal, isOpen: false })}>Cancel</Button>
                            <Button
                                onClick={handleRejectionSubmit}
                                className="bg-red-600 hover:bg-red-700 text-white"
                                disabled={!rejectionReason.trim()}
                            >
                                {rejectionModal.action === 'reject' ? 'Decline Booking' : 'Cancel Booking'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingsPage;
