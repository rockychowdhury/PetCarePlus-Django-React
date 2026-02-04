import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
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
    AlertCircle,
    ChevronDown,
    ChevronUp,
    ChevronsUpDown,
    ArrowRight,
    Sparkles,
    DollarSign,
    Users,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Clock4,
    X,
    Dog,
    MapPin,
    CalendarDays,
    Info,
    ExternalLink
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../../components/common/Buttons/Button';
import Badge from '../../../../components/common/Feedback/Badge';
import useServices from '../../../../hooks/useServices';
import DirectBookingModal from '../Modals/DirectBookingModal';

const BookingsPage = () => {
    const { provider } = useOutletContext();
    const { useGetMyBookings, useBookingAction, useGetDashboardStats } = useServices();
    const { data: bookingsData, isLoading: isBookingsLoading } = useGetMyBookings();
    const { data: statsData, isLoading: isStatsLoading } = useGetDashboardStats();
    const bookingAction = useBookingAction();

    const [activeTab, setActiveTab] = useState('all');
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState([{ id: 'booking_date', desc: true }]);

    const [detailModal, setDetailModal] = useState({ isOpen: false, booking: null });
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [completionData, setCompletionData] = useState({ finalPrice: '', paymentReceived: false });

    const [rejectionModal, setRejectionModal] = useState({ isOpen: false, bookingId: null, action: null });
    const [rejectionReason, setRejectionReason] = useState('');
    const [isDirectEntryOpen, setIsDirectEntryOpen] = useState(false);

    // --- Actions ---
    const handleOpenDetail = (booking) => {
        setDetailModal({ isOpen: true, booking });
    };

    const handleAction = async (id, action, reason = null) => {
        if (action === 'complete') {
            const booking = allBookings.find(b => b.id === id);
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

    const handleExport = () => {
        if (!filteredData.length) return toast.error("No data to export");

        const headers = ["ID", "Client", "Service", "Date", "Price", "Status", "Payment"];
        const rows = filteredData.map(b => [
            b.id,
            b.clientName,
            b.serviceName,
            b.schedule,
            b.price,
            b.status,
            b.payment_status
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `bookings_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Log exported successfully");
    };

    const handleMonitorLive = () => {
        setActiveTab('in_progress');
        toast.success("Viewing active sessions");
    };

    // --- Data Processing ---
    const allBookings = useMemo(() => {
        const data = bookingsData?.results?.filter(b => b.provider.id === provider.id) || [];
        return data.map(b => {
            // Safe extraction of pet photo
            const petPhoto = b.pet?.media?.find(m => m.is_primary)?.url || b.pet?.media?.[0]?.url || null;

            // Client Name & Photo Resolution
            let clientName = 'Guest Client';
            if (b.client) {
                clientName = `${b.client.first_name} ${b.client.last_name}`;
            } else if (b.guest_client_name) {
                clientName = b.guest_client_name;
            }

            return {
                ...b,
                clientName,
                serviceName: b.service_option?.name || b.booking_type || 'Service',
                schedule: b.booking_date ? format(parseISO(b.booking_date), 'MMM dd, yyyy') : 'TBD',
                price: parseFloat(b.agreed_price || b.service_option?.base_price || 0),
                petPhoto,
                displayPetName: b.pet?.name || b.guest_pet_name || 'Pet'
            };
        });
    }, [bookingsData, provider.id]);

    const filteredData = useMemo(() => {
        if (activeTab === 'all') return allBookings;
        return allBookings.filter(b => b.status === activeTab);
    }, [allBookings, activeTab]);

    // --- Table Definition ---
    const columns = useMemo(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: info => (
                <button
                    onClick={() => handleOpenDetail(info.row.original)}
                    className="text-[10px] font-black text-[#402E11]/40 uppercase tracking-widest hover:text-[#C48B28] transition-colors flex items-center gap-1 group"
                >
                    #BK-{info.getValue()}
                    <ExternalLink size={8} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            ),
        },
        {
            accessorKey: 'clientName',
            header: 'Client',
            cell: info => {
                const b = info.row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#402E11] flex items-center justify-center text-[#C48B28] text-xs font-black shadow-sm overflow-hidden">
                            {b.client?.photoURL ? (
                                <img src={b.client.photoURL} alt="" className="w-full h-full object-cover" />
                            ) : (b.client?.first_name?.[0] || b.guest_client_name?.[0] || 'G')}
                        </div>
                        <div>
                            <div className="text-xs font-black text-[#402E11] leading-none mb-1">{b.clientName}</div>
                            <div className="text-[9px] font-bold text-[#C48B28] uppercase tracking-wider">{b.displayPetName}</div>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: 'serviceName',
            header: 'Service',
            cell: info => (
                <div>
                    <div className="text-xs font-black text-[#402E11] leading-none mb-1">{info.getValue()}</div>
                    <div className="text-[9px] font-bold text-[#402E11]/40 uppercase tracking-widest">
                        {info.row.original.duration_hours ? `${info.row.original.duration_hours} hr Session` : 'Fixed Duration'}
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'booking_date',
            header: 'Schedule',
            cell: info => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#402E11]">
                        <Calendar size={10} className="text-[#C48B28]" />
                        {info.row.original.schedule}
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-[#402E11]/30 uppercase tracking-widest">
                        <Clock size={10} className="text-[#C48B28]/40" />
                        {info.row.original.booking_time ? info.row.original.booking_time.substring(0, 5) : 'TBD'}
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'price',
            header: 'Revenue',
            cell: info => (
                <div className="text-center">
                    <div className="text-xs font-black text-[#402E11] mb-1">${info.getValue().toFixed(2)}</div>
                    <Badge variant={info.row.original.payment_status === 'paid' ? 'success' : 'warning'} className="text-[8px] h-4 py-0">
                        {info.row.original.payment_status}
                    </Badge>
                </div>
            )
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: info => {
                const status = info.getValue();
                const colors = {
                    pending: 'bg-[#FAF3E0] text-[#C48B28] border-[#EBC176]/20',
                    confirmed: 'bg-green-50 text-green-600 border-green-100',
                    in_progress: 'bg-blue-50 text-blue-600 border-blue-100',
                    completed: 'bg-gray-50 text-gray-500 border-gray-200',
                    cancelled: 'bg-red-50 text-red-600 border-red-100'
                };
                return (
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${colors[status] || colors.pending}`}>
                        {status.replace('_', ' ')}
                    </span>
                );
            }
        },
        {
            id: 'actions',
            header: '',
            cell: info => {
                const b = info.row.original;
                return (
                    <div className="flex justify-end gap-2.5">
                        {b.status === 'pending' && (
                            <button
                                onClick={() => handleAction(b.id, 'accept')}
                                className="w-8 h-8 bg-[#402E11] text-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-md group/btn"
                                title="Accept"
                            >
                                <CheckCircle2 size={16} className="text-[#C48B28] group-hover/btn:text-white transition-colors" />
                            </button>
                        )}
                        {b.status === 'confirmed' && (
                            <button
                                onClick={() => handleAction(b.id, 'start')}
                                className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-md"
                                title="Start"
                            >
                                <Clock4 size={16} />
                            </button>
                        )}
                        {b.status === 'in_progress' && (
                            <button
                                onClick={() => handleAction(b.id, 'complete')}
                                className="w-8 h-8 bg-green-600 text-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-md"
                                title="Complete"
                            >
                                <CheckCircle2 size={16} />
                            </button>
                        )}
                        {(['pending', 'confirmed'].includes(b.status)) && (
                            <button
                                onClick={() => handleAction(b.id, b.status === 'pending' ? 'reject' : 'cancel')}
                                className="w-8 h-8 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-md group/btn"
                                title="Cancel/Decline"
                            >
                                <XCircle size={16} />
                            </button>
                        )}
                    </div>
                );
            }
        }
    ], [allBookings]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const metrics = useMemo(() => {
        if (!statsData?.metrics) return {
            revenue: allBookings.filter(b => b.status === 'completed').reduce((acc, curr) => acc + curr.price, 0),
            pending: allBookings.filter(b => b.status === 'pending').length,
            active: allBookings.filter(b => b.status === 'in_progress').length,
            month_revenue: 0
        };
        return {
            revenue: statsData.metrics.total_earnings,
            pending: statsData.metrics.pending_requests,
            active: statsData.metrics.active_guests,
            month_revenue: statsData.metrics.month_earnings
        };
    }, [statsData, allBookings]);

    if (isBookingsLoading || isStatsLoading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-20 animate-pulse">
            <div className="w-20 h-20 bg-[#FAF3E0] rounded-full mb-6 border border-[#EBC176]/20" />
            <div className="h-4 w-40 bg-[#FAF3E0] rounded mb-2" />
            <div className="h-3 w-60 bg-[#FAF3E0] rounded" />
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.4em] mb-4 block">Operations Control</span>
                    <h1 className="text-4xl md:text-5xl font-black text-[#402E11] tracking-tighter mb-4">
                        Booking Center
                    </h1>
                    <p className="text-[#402E11]/60 font-bold text-sm">Orchestrate your appointments and service delivery with precision.</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleExport}
                        className="px-6 py-4 bg-white/80 backdrop-blur-xl border border-[#EBC176]/20 rounded-2xl text-[10px] font-black text-[#402E11] uppercase tracking-widest hover:bg-[#FAF3E0] transition-all shadow-sm flex items-center gap-2"
                    >
                        <Download size={14} className="text-[#C48B28]" />
                        Export Log
                    </button>
                    <button
                        onClick={() => setIsDirectEntryOpen(true)}
                        className="px-6 py-4 bg-[#402E11] rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#402E11]/20 flex items-center gap-2"
                    >
                        <Plus size={14} className="text-[#C48B28]" />
                        Direct Entry
                    </button>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Table Column */}
                <div className="lg:col-span-9 space-y-6">
                    {/* Control Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-4 rounded-[1.5rem] border border-[#EBC176]/10 shadow-lg shadow-[#402E11]/5">
                        {/* Status Tabs */}
                        <div className="flex bg-[#FAF3E0]/40 p-1 rounded-xl overflow-x-auto no-scrollbar">
                            {['all', 'pending', 'confirmed', 'in_progress', 'completed'].map(id => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === id
                                        ? 'bg-[#402E11] text-white shadow-md'
                                        : 'text-[#402E11]/40 hover:text-[#402E11]'
                                        }`}
                                >
                                    {id.replace('_', ' ')}
                                </button>
                            ))}
                        </div>

                        {/* Search Bar */}
                        <div className="relative flex-1 md:max-w-xs">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C48B28]" size={14} />
                            <input
                                type="text"
                                placeholder="Locate client or ID..."
                                value={globalFilter}
                                onChange={e => setGlobalFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-[#FAF3E0]/30 border border-[#EBC176]/20 rounded-xl text-xs font-bold text-[#402E11] focus:outline-none focus:ring-2 focus:ring-[#C48B28]/20 placeholder:text-[#402E11]/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] border border-[#EBC176]/20 shadow-2xl shadow-[#402E11]/5 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead className="bg-[#FAF3E0]/30 border-b border-[#EBC176]/10">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th
                                                    key={header.id}
                                                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                                    className={`px-6 py-5 text-[9px] font-black text-[#402E11]/40 uppercase tracking-[0.2em] cursor-pointer hover:text-[#C48B28] transition-colors ${header.column.getCanSort() ? 'select-none' : ''}`}
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                        {header.column.getCanSort() && ({
                                                            asc: <ChevronUp size={10} />,
                                                            desc: <ChevronDown size={10} />,
                                                        }[header.column.getIsSorted()] || <ChevronsUpDown size={10} className="opacity-30" />)}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-[#FAF3E0]">
                                    {table.getRowModel().rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={columns.length} className="px-6 py-32 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-[#FAF3E0] rounded-full flex items-center justify-center text-[#C48B28] mb-4">
                                                        <Calendar size={28} />
                                                    </div>
                                                    <h4 className="text-lg font-black text-[#402E11] mb-1">Queue is Empty</h4>
                                                    <p className="text-[10px] font-bold text-[#402E11]/30 uppercase tracking-widest">No active bookings match your filter.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        table.getRowModel().rows.map(row => (
                                            <motion.tr
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                key={row.id}
                                                className="hover:bg-[#FAF3E0]/10 transition-colors group"
                                            >
                                                {row.getVisibleCells().map(cell => (
                                                    <td key={cell.id} className="px-6 py-4">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-[#EBC176]/10 flex items-center justify-between bg-[#FAF3E0]/10">
                            <div className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-widest">
                                Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} Results
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="px-3 py-1.5 rounded-lg border border-[#EBC176]/20 text-[8px] font-black uppercase tracking-widest text-[#402E11] hover:bg-[#FAF3E0] disabled:opacity-30 transition-all"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="px-3 py-1.5 rounded-lg border border-[#EBC176]/20 text-[8px] font-black uppercase tracking-widest text-[#402E11] hover:bg-[#FAF3E0] disabled:opacity-30 transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Insights Column */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Revenue Snapshot */}
                    <div className="bg-[#402E11] rounded-[2rem] p-8 text-white shadow-xl shadow-[#402E11]/10 relative overflow-hidden group">
                        <Sparkles className="absolute -top-4 -right-4 text-[#C48B28]/20" size={100} />
                        <div className="relative z-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C48B28] mb-6">Settled Revenue</h3>
                            <div className="text-4xl font-black tracking-tighter mb-2">${metrics.revenue.toLocaleString()}</div>
                            <div className="flex items-center gap-2 text-green-400">
                                <TrendingUp size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">${metrics.month_revenue.toLocaleString()} this month</span>
                            </div>
                        </div>
                    </div>

                    {/* Operational Cards */}
                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-[#EBC176]/20 shadow-lg shadow-[#402E11]/5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-[#FAF3E0] rounded-xl flex items-center justify-center text-[#C48B28]">
                                    <Clock size={16} />
                                </div>
                                <span className="text-2xl font-black text-[#402E11]">{metrics.pending}</span>
                            </div>
                            <h4 className="text-[10px] font-black text-[#402E11] uppercase tracking-widest">Awaiting Approval</h4>
                            <div className="mt-4 pt-4 border-t border-[#FAF3E0] flex items-center justify-between">
                                <span className="text-[9px] font-bold text-[#402E11]/40 uppercase tracking-widest">Est. Action Time</span>
                                <span className="text-[9px] font-black text-[#C48B28]">~15 mins</span>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-[#EBC176]/20 shadow-lg shadow-[#402E11]/5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-[#FAF3E0] rounded-xl flex items-center justify-center text-[#C48B28]">
                                    <Users size={16} />
                                </div>
                                <span className="text-2xl font-black text-[#402E11]">{metrics.active}</span>
                            </div>
                            <h4 className="text-[10px] font-black text-[#402E11] uppercase tracking-widest">Active Services</h4>
                            <div
                                onClick={handleMonitorLive}
                                className="mt-4 pt-4 border-t border-[#FAF3E0] flex items-center justify-between text-[#C48B28] group cursor-pointer"
                            >
                                <span className="text-[9px] font-black uppercase tracking-widest group-hover:underline">Monitor Live</span>
                                <ArrowRight size={10} />
                            </div>
                        </div>
                    </div>

                    {/* Pro Tip Card */}
                    <div className="bg-[#FAF3E0]/50 backdrop-blur-md p-8 rounded-[2rem] border border-[#F0F0F0]">
                        <h4 className="text-[11px] font-black text-[#402E11] uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Sparkles size={12} className="text-[#C48B28]" />
                            Provider Pro-Tip
                        </h4>
                        <p className="text-[11px] font-bold text-[#402E11]/50 leading-relaxed italic">
                            Respond to new requests within 30 minutes to increase your booking success rate by up to 45%.
                        </p>
                    </div>
                </div>
            </div>

            {/* Booking Detail Modal */}
            <AnimatePresence>
                {detailModal.isOpen && detailModal.booking && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-[#402E11]/15 backdrop-blur-md"
                            style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                            onClick={() => setDetailModal({ isOpen: false, booking: null })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.99, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.99, y: 12 }}
                            transition={{
                                type: "spring",
                                damping: 32,
                                stiffness: 450,
                                mass: 1
                            }}
                            className="bg-white rounded-[2.5rem] max-w-4xl w-full p-0 relative z-10 overflow-hidden max-h-[94vh] flex flex-col shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-white/50"
                        >
                            {/* Modal Header */}
                            <div className="bg-[#FAF9F6] p-10 border-b border-[#EAE6E2] relative">
                                <button
                                    onClick={() => setDetailModal({ isOpen: false, booking: null })}
                                    className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#402E11]/40 hover:text-[#402E11] transition-all hover:rotate-90 shadow-sm border border-[#EAE6E2]/50"
                                >
                                    <X size={24} />
                                </button>
                                <div className="flex items-center gap-8">
                                    <div className="w-24 h-24 rounded-[2rem] bg-[#EAE6E2] flex items-center justify-center text-[#C48B28] text-2xl font-black shadow-inner overflow-hidden border-4 border-white">
                                        {detailModal.booking.client?.photoURL ? (
                                            <img src={detailModal.booking.client.photoURL} alt="" className="w-full h-full object-cover" />
                                        ) : (detailModal.booking.client?.first_name?.[0] || detailModal.booking.guest_client_name?.[0] || 'G')}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-[#402E11] tracking-tighter mb-1">
                                            {detailModal.booking.clientName}
                                        </h2>
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 rounded-full bg-[#402E11] text-white text-[10px] font-black uppercase tracking-widest">
                                                {detailModal.booking.displayPetName}
                                            </span>
                                            <span className="text-xs font-bold text-[#402E11]/40 uppercase tracking-widest">
                                                #{detailModal.booking.id}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Content - Scrollable */}
                            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10 overflow-y-auto custom-scrollbar bg-white flex-1">
                                {/* Left Section: Service & Schedule */}
                                <div className="space-y-8">
                                    <section>
                                        <h3 className="text-[10px] font-black text-[#402E11]/30 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                            <Sparkles size={12} className="text-[#C48B28]" /> Service Requirements
                                        </h3>
                                        <div className="bg-[#FAF9F6] p-7 rounded-[2.5rem] border border-[#EAE6E2]/60 shadow-sm space-y-4">
                                            <div className="flex items-center justify-between border-b border-[#EAE6E2]/40 pb-4">
                                                <span className="text-[11px] font-bold text-[#402E11]/40 uppercase tracking-widest">Service Type</span>
                                                <span className="text-sm font-black text-[#402E11]">{detailModal.booking.serviceName}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-[#EAE6E2]/40 pb-4">
                                                <span className="text-[11px] font-bold text-[#402E11]/40 uppercase tracking-widest">Confirmed Duration</span>
                                                <span className="text-sm font-black text-[#402E11]">{detailModal.booking.duration_hours || '1.0'} Hours</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-[#402E11]/40 uppercase tracking-widest">Total Revenue</span>
                                                <span className="text-2xl font-black text-[#C48B28] tracking-tight">${detailModal.booking.price.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-[10px] font-black text-[#402E11]/30 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                            <CalendarDays size={12} className="text-[#C48B28]" /> Schedule Metadata
                                        </h3>
                                        <div className="bg-[#FAF9F6] p-7 rounded-[2.5rem] border border-[#EAE6E2]/60 shadow-sm space-y-5">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#C48B28] shadow-sm border border-[#EAE6E2]/50">
                                                    <Calendar size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-[#402E11]/30 uppercase tracking-[0.2em] mb-1">Appointment Date</div>
                                                    <div className="text-sm font-black text-[#402E11]">{detailModal.booking.schedule}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#C48B28] shadow-sm border border-[#EAE6E2]/50">
                                                    <Clock size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-[#402E11]/30 uppercase tracking-[0.2em] mb-1">Time Window</div>
                                                    <div className="text-sm font-black text-[#402E11]">{detailModal.booking.booking_time ? format(parseISO(`1970-01-01T${detailModal.booking.booking_time}`), 'hh:mm a') : 'TBD'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* Right Section: Pet & Notes */}
                                <div className="space-y-8">
                                    <section>
                                        <h3 className="text-[10px] font-black text-[#402E11]/30 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                            <Dog size={12} className="text-[#C48B28]" /> Guest Information
                                        </h3>
                                        <div className="bg-[#FAF9F6] p-8 rounded-[3rem] border border-[#EAE6E2]/40 shadow-sm flex items-center gap-7">
                                            <div className="w-24 h-24 flex-shrink-0 bg-[#402E11] rounded-[2rem] flex items-center justify-center text-[#C48B28] overflow-hidden shadow-2xl relative">
                                                {detailModal.booking.petPhoto ? (
                                                    <img src={detailModal.booking.petPhoto} alt="" className="w-full h-full object-cover" />
                                                ) : <Dog size={32} />}
                                            </div>
                                            <div className="pl-2">
                                                <div className="text-lg font-black text-[#402E11] mb-0.5">{detailModal.booking.displayPetName}</div>
                                                <div className="text-[11px] font-bold text-[#C48B28] uppercase tracking-[0.2em]">{detailModal.booking.pet?.species || 'Guest'} • {detailModal.booking.pet?.breed || 'Service Recipient'}</div>
                                                <div className="mt-3 px-3 py-1 bg-white border border-[#EAE6E2] inline-block rounded-full text-[9px] font-black text-[#402E11]/60 uppercase tracking-widest shadow-sm">
                                                    {detailModal.booking.pet ? `${detailModal.booking.pet.age_years || '0'}y ${detailModal.booking.pet.age_months || '0'}m Old` : 'Age Not Specified'}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-[10px] font-black text-[#402E11]/30 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                            <MessageSquare size={12} className="text-[#C48B28]" /> Special Requirements
                                        </h3>
                                        <div className="bg-[#F8F5F2]/50 p-6 rounded-[2.5rem] border border-[#F8F5F2] italic text-xs font-bold text-[#402E11]/60 leading-relaxed min-h-[120px]">
                                            {detailModal.booking.special_requirements || "No specific instructions or requirements were provided by the client for this booking session."}
                                        </div>
                                    </section>

                                    {/* Additional Status Info */}
                                    <div className="flex gap-4">
                                        <div className="flex-1 bg-white p-5 rounded-[1.5rem] border border-[#F0F0F0]">
                                            <div className="text-[8px] font-black text-[#402E11]/40 uppercase tracking-[0.2em] mb-1.5">Operational Status</div>
                                            <span className="text-[10px] font-black text-[#402E11] uppercase tracking-widest">{detailModal.booking.status.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex-1 bg-white p-5 rounded-[1.5rem] border border-[#F0F0F0]">
                                            <div className="text-[8px] font-black text-[#402E11]/40 uppercase tracking-[0.2em] mb-1.5">Payment Ledger</div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${detailModal.booking.payment_status === 'paid' ? 'text-green-600' : 'text-red-500'}`}>
                                                {detailModal.booking.payment_status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )
                }
            </AnimatePresence >

            {/* Completion Modal */}
            < AnimatePresence >
                {isCompleteModalOpen && selectedBooking && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-[#402E11]/15 backdrop-blur-md"
                            style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                            onClick={() => setIsCompleteModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] max-w-lg w-full p-10 relative z-10"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-[#402E11] tracking-tight">Finalize Service</h2>
                                    <p className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.3em] mt-1">Booking #BK-{selectedBooking.id}</p>
                                </div>
                                <div className="w-12 h-12 bg-[#F0F0F0] rounded-2xl flex items-center justify-center text-[#C48B28]">
                                    <CheckCircle2 size={24} />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-[#402E11] uppercase tracking-widest mb-2 ml-1">Final Price Adjustments</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-[#C48B28]" size={16} />
                                        <input
                                            type="number"
                                            value={completionData.finalPrice}
                                            onChange={(e) => setCompletionData({ ...completionData, finalPrice: e.target.value })}
                                            className="w-full bg-[#F0F0F0]/30 border border-[#F0F0F0] rounded-[2rem] pl-14 pr-6 py-5 text-xl font-black text-[#402E11] focus:ring-4 focus:ring-[#C48B28]/10 outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => setCompletionData({ ...completionData, paymentReceived: !completionData.paymentReceived })}
                                    className={`w-full p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group ${completionData.paymentReceived
                                        ? 'bg-green-50 border-green-500/30'
                                        : 'bg-[#F0F0F0]/20 border-transparent hover:border-[#F0F0F0]'
                                        }`}
                                >
                                    <div className="text-left">
                                        <div className={`text-xs font-black uppercase tracking-widest ${completionData.paymentReceived ? 'text-green-700' : 'text-[#402E11]'}`}>Payment Collected</div>
                                        <div className="text-[10px] font-bold text-[#402E11]/40 mt-0.5">Payment received at host location</div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${completionData.paymentReceived ? 'bg-green-500 border-green-500 text-white' : 'border-[#F0F0F0]'}`}>
                                        {completionData.paymentReceived && <CheckCircle2 size={14} />}
                                    </div>
                                </button>

                                <div className="flex flex-col gap-4 mt-8">
                                    <button
                                        onClick={handleCompleteSubmit}
                                        className="w-full bg-[#402E11] text-white py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-[#402E11]/20 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        Execute Completion
                                    </button>
                                    <button
                                        onClick={() => setIsCompleteModalOpen(false)}
                                        className="w-full py-4 text-[10px] font-black text-[#402E11]/30 uppercase tracking-[0.2em] hover:text-[#C48B28] transition-colors"
                                    >
                                        Return to Dashboard
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence >

            {/* Rejection Modal */}
            < AnimatePresence >
                {
                    rejectionModal.isOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-[#402E11]/15 backdrop-blur-md"
                                style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                                onClick={() => setRejectionModal({ ...rejectionModal, isOpen: false })}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white rounded-[3rem] max-w-lg w-full p-10 relative z-10"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-[#402E11] tracking-tight capitalize">{rejectionModal.action === 'reject' ? 'Decline Request' : 'Cancel Booking'}</h2>
                                        <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mt-1">This action cannot be undone</p>
                                    </div>
                                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                                        <XCircle size={24} />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-[#402E11] uppercase tracking-widest mb-2 ml-1">Official Reason</label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Explain the reason for this adjustment..."
                                            className="w-full bg-[#F0F0F0]/30 border border-[#F0F0F0] rounded-[2rem] p-6 text-base font-bold text-[#402E11] focus:ring-4 focus:ring-red-500/10 outline-none min-h-[140px] placeholder:text-[#402E11]/20"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-4 mt-8">
                                        <button
                                            onClick={handleRejectionSubmit}
                                            disabled={!rejectionReason.trim()}
                                            className="w-full bg-red-600 text-white py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-red-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            Execute {rejectionModal.action}
                                        </button>
                                        <button
                                            onClick={() => setRejectionModal({ ...rejectionModal, isOpen: false })}
                                            className="w-full py-4 text-[10px] font-black text-[#402E11]/30 uppercase tracking-[0.2em] hover:text-[#402E11] transition-colors"
                                        >
                                            Abort Action
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }

            </AnimatePresence >

            {/* Direct Booking Modal */}
            <DirectBookingModal
                isOpen={isDirectEntryOpen}
                onClose={() => setIsDirectEntryOpen(false)}
                provider={provider}
            />
        </div >
    );
};

export default BookingsPage;
