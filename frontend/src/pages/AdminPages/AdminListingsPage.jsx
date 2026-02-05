import React, { useState, useMemo } from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';
import useAdmin from '../../hooks/useAdmin'; // Ensure correct path
import Button from '../../components/common/Buttons/Button';
import AdminListingTable from './components/AdminListingTable';

const AdminListingsPage = () => {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [speciesFilter, setSpeciesFilter] = useState('All');

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
        species: speciesFilter === 'All' ? undefined : speciesFilter,
        search: debouncedSearch,
        ordering: sorting.length > 0 ? (sorting[0].desc ? `-${sorting[0].id}` : sorting[0].id) : undefined,
    }), [pagination.pageIndex, statusFilter, speciesFilter, debouncedSearch, sorting]);

    const { useGetListings } = useAdmin();
    const { data, isLoading, isError } = useGetListings(hookFilters);

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
        setSpeciesFilter('All');
        setSorting([{ id: 'created_at', desc: true }]);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    };

    // Calculate total pages
    const pageCount = data ? Math.ceil(data.count / pagination.pageSize) : 0;
    const listingsList = data?.results || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-sky-900 tracking-tight">Listing Management</h1>
                <p className="text-sky-900/60 font-medium">View and manage all pet listings across the platform.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white p-4 rounded-[2rem] border border-sky-100">
                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto items-center">
                    {/* Search */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-900/30" size={20} />
                        <input
                            type="text"
                            placeholder="Search pets, breeds, owners..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-full bg-sky-50 border-none text-sky-900 font-bold placeholder:text-sky-900/30 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 w-full xl:w-auto items-center">
                    {/* Species Filter */}
                    <div className="relative">
                        <select
                            value={speciesFilter}
                            onChange={(e) => {
                                setSpeciesFilter(e.target.value);
                                setPagination(prev => ({ ...prev, pageIndex: 0 }));
                            }}
                            className="appearance-none bg-sky-50 border border-sky-100 text-sky-900 font-bold text-sm rounded-full pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 cursor-pointer hover:bg-sky-100 transition-colors"
                        >
                            <option value="All">All Species</option>
                            <option value="dog">Dogs</option>
                            <option value="cat">Cats</option>
                            <option value="rabbit">Rabbits</option>
                            <option value="bird">Birds</option>
                            <option value="other">Other</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-900/30 pointer-events-none" size={16} />
                    </div>

                    {/* Status Tabs/Dropdown for smaller screens, Pills for larger */}
                    <div className="hidden md:flex bg-sky-50 p-1 rounded-full">
                        {['All', 'active', 'rehomed', 'deceased'].map((status) => (
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
                                {status === 'All' ? 'All Status' : status}
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
                    Loading listings...
                </div>
            ) : isError ? (
                <div className="p-20 text-center text-red-400 font-bold">
                    Failed to load listings. Please try again.
                </div>
            ) : (
                <AdminListingTable
                    data={listingsList}
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

export default AdminListingsPage;
