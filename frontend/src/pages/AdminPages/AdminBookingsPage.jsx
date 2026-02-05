import React, { useState, useMemo } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import useAdmin from '../../hooks/useAdmin';
import Button from '../../components/common/Buttons/Button';
import AdminBookingTable from './components/AdminBookingTable';

const AdminBookingsPage = () => {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Pagination & Sorting State
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = useState([
        { id: 'created_at', desc: true }
    ]);

    // Derived filters for hook
    const hookFilters = useMemo(() => ({
        page: pagination.pageIndex + 1,
        status: statusFilter === 'All' ? undefined : statusFilter,
        search: debouncedSearch,
        ordering: sorting.length > 0 ? (sorting[0].desc ? `-${sorting[0].id}` : sorting[0].id) : undefined,
    }), [pagination.pageIndex, statusFilter, debouncedSearch, sorting]);

    const { useGetBookings } = useAdmin();
    const { data, isLoading, isError } = useGetBookings(hookFilters);

    // Handle Search Debounce
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPagination(prev => ({ ...prev, pageIndex: 0 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const handleReset = () => {
        setSearch('');
        setDebouncedSearch('');
        setStatusFilter('All');
        setSorting([{ id: 'created_at', desc: true }]);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    };

    // Calculate total pages
    const pageCount = data ? Math.ceil(data.count / pagination.pageSize) : 0;
    const bookingsList = data?.results || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-sky-900 tracking-tight">Booking Management</h1>
                <p className="text-sky-900/60 font-medium">View and manage all service bookings across the platform.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-[2rem] border border-sky-100">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                    {/* Search */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-900/30" size={20} />
                        <input
                            type="text"
                            placeholder="Search client, provider, or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-full bg-sky-50 border-none text-sky-900 font-bold placeholder:text-sky-900/30 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {/* Status Tabs/Pills */}
                    <div className="flex bg-sky-50 p-1 rounded-full">
                        {['All', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    setStatusFilter(status);
                                    setPagination(prev => ({ ...prev, pageIndex: 0 }));
                                }}
                                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${statusFilter === status
                                        ? 'bg-white text-cyan-700 shadow-sm shadow-sky-900/5'
                                        : 'text-sky-900/40 hover:text-sky-900/60'
                                    }`}
                            >
                                {status === 'All' ? 'All' : status}
                            </button>
                        ))}
                    </div>

                    <Button
                        variant="ghost"
                        onClick={handleReset}
                        className="rounded-full w-10 h-10 p-0 flex items-center justify-center text-sky-900/40 hover:bg-sky-50 hover:text-cyan-700 transition-colors"
                        title="Reset Filters"
                    >
                        <RotateCcw size={18} />
                    </Button>
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="p-20 text-center text-sky-900/30 font-bold uppercase tracking-widest animate-pulse">
                    Loading bookings...
                </div>
            ) : isError ? (
                <div className="p-20 text-center text-red-400 font-bold">
                    Failed to load bookings. Please try again.
                </div>
            ) : (
                <AdminBookingTable
                    data={bookingsList}
                    isLoading={isLoading}
                    pagination={{ ...pagination, pageCount }}
                    onPaginationChange={setPagination}
                    sorting={sorting}
                    onSortingChange={setSorting}
                />
            )}
        </div>
    );
};

export default AdminBookingsPage;
