import React, { useState, useEffect } from 'react';
import {
    Search, List as ListIcon, Loader2, X, MapPin, ChevronLeft, ChevronRight, ChevronDown, Plus, LayoutGrid, Filter
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import useRehoming from '../../hooks/useRehoming';
import NoResults from '../../components/common/Feedback/NoResults';
import CreatePetModal from '../../components/Pet/CreatePetModal';
import FilterSidebar from '../../components/Pet/FilterSidebar';
import PetCard from '../../components/Pet/PetCard';
import LocationMapModal from '../../components/Services/LocationMapModal';
import SortDropdown from '../../components/Pet/SortDropdown';

const PetListingPage = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [viewMode, setViewMode] = useState('grid');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const {
        useGetListings
    } = useRehoming();

    // --- State Derived from URL ---
    const page = parseInt(searchParams.get('page')) || 1;
    const nearby = searchParams.get('nearby'); // lat,lng,radius

    const filters = {
        search: searchParams.get('search') || '',
        species: searchParams.get('species') || '',
        gender: searchParams.get('gender') || '',
        age_range: searchParams.get('age_range') || '',
        size: searchParams.get('size') || '',
        location: searchParams.get('location') || '',
        radius: parseInt(searchParams.get('radius')) || 50,
        nearby: searchParams.get('nearby') || '',
        verified_owner: searchParams.get('verified_owner') || '',
        ordering: searchParams.get('ordering') || '-published_at'
    };

    // Add compatibility flags
    ['good_with_cats', 'good_with_dogs', 'good_with_children', 'house_trained'].forEach(key => {
        if (searchParams.get(key)) filters[key] = searchParams.get(key);
    });

    const { data, isLoading, refetch } = useGetListings({ ...filters, page, nearby });
    const pets = data?.results || [];
    const totalCount = data?.count || 0;
    const hasNextPage = !!data?.next;

    const setPage = (newPage) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', newPage.toString());
        setSearchParams(newParams);
    };

    // --- Refined Filter Handler ---
    const handleFilterChange = (nameOrEvent, value) => {
        if (typeof nameOrEvent === 'string') {
            const newParams = new URLSearchParams(searchParams);

            if (nameOrEvent === 'updateLocation') {
                const { lat, lng, radius, name } = value;
                newParams.set('nearby', `${lat},${lng},${radius}`);
                newParams.set('location', name);
                newParams.delete('radius'); // Prefer nearby param
            } else if (nameOrEvent === 'openLocationPicker') {
                setIsLocationModalOpen(true);
                return;
            } else {
                if (value === '' || value === null || value === undefined) {
                    newParams.delete(nameOrEvent);
                    if (nameOrEvent === 'location') {
                        newParams.delete('nearby');
                    }
                } else {
                    newParams.set(nameOrEvent, value);
                }
            }

            newParams.set('page', '1');
            setSearchParams(newParams);
        }
    };

    const handleSearchInput = (e) => {
        const val = e.target.value;
        const newParams = new URLSearchParams(searchParams);
        if (val) newParams.set('search', val);
        else newParams.delete('search');
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const clearFilters = () => {
        setSearchParams({});
    };

    return (
        <div className="min-h-screen bg-[#FEF9ED]">

            <div className="max-w-[1600px] mx-auto px-4 md:px-10 py-8 md:py-12">

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Container - Desktop Only */}
                    <aside className="hidden lg:block w-[320px] shrink-0 sticky top-8 h-fit">
                        <FilterSidebar
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={clearFilters}
                        />
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0 flex flex-col min-h-[calc(100vh-80px)]">
                        {/* --- Hero Section --- */}
                        <div className="mb-10">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                                <div className="max-w-2xl">
                                    <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.2em] mb-4 block">Pet Adoption</span>
                                    <h1 className="text-2xl sm:text-3xl font-black text-themev2-text tracking-tighter mb-2 leading-none">Find your new best friend</h1>
                                    <p className="text-[10px] sm:text-xs font-bold text-themev2-text/40 max-w-lg leading-relaxed">
                                        Connect with verified owners and give a loving home to {totalCount || 0} pets waiting for you.
                                    </p>
                                </div>

                                {/* Matches Badge */}
                                <div className="hidden md:block">
                                    <div className="px-5 py-2.5 bg-[#FEF2D5]/50 border border-[#EBC176]/20 rounded-xl flex items-center gap-2.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#C48B28]" />
                                        <span className="text-[10px] font-black text-[#C48B28] whitespace-nowrap uppercase tracking-widest">{totalCount} matches found</span>
                                    </div>
                                </div>
                            </div>

                            {/* --- Search & Controls Bar --- */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-themev2-text/20" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search by breed, name or personality..."
                                        value={filters.search}
                                        onChange={handleSearchInput}
                                        className="w-full pl-14 pr-8 py-4 bg-white border border-[#EBC176]/20 rounded-2xl text-[13px] font-bold text-themev2-text placeholder:text-themev2-text/20 shadow-sm focus:border-[#C48B28]/40 outline-none transition-all"
                                    />
                                </div>

                                <div className="flex items-center gap-3 shrink-0 pb-1 md:pb-0 overflow-x-auto md:overflow-visible no-scrollbar">
                                    {/* Mobile Filter Toggle */}
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="lg:hidden flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-white border border-[#EBC176]/20 rounded-2xl text-[9px] sm:text-[10px] font-black text-themev2-text uppercase tracking-widest hover:bg-[#FAF3E0] transition-all shadow-sm"
                                    >
                                        <Filter size={14} className="text-[#C48B28]" />
                                        Filters
                                    </button>

                                    <SortDropdown
                                        currentSort={filters.ordering}
                                        onSortChange={(val) => handleFilterChange('ordering', val)}
                                        options={[
                                            { value: '-published_at', label: 'Newest First' },
                                            { value: 'created_at', label: 'Oldest First' },
                                            ...(filters.nearby ? [{ value: 'distance', label: 'Nearest to Me' }] : [])
                                        ]}
                                        customTrigger={
                                            <button className="flex items-center gap-3 sm:gap-4 px-5 sm:px-8 py-3 sm:py-4 bg-white border border-[#EBC176]/20 rounded-2xl text-[10px] font-black text-themev2-text uppercase tracking-widest hover:bg-[#FAF3E0] hover:border-[#C48B28]/40 transition-all shadow-sm whitespace-nowrap group">
                                                <span>Sort by: {
                                                    [
                                                        { value: '-published_at', label: 'Newest First' },
                                                        { value: 'created_at', label: 'Oldest First' },
                                                        { value: 'distance', label: 'Nearest' }
                                                    ].find(o => o.value === filters.ordering)?.label || 'Sort'
                                                }</span>
                                                <ChevronDown size={14} className="text-[#EBC176] group-hover:text-[#C48B28] transition-all" />
                                            </button>
                                        }
                                    />

                                    <div className="hidden md:flex items-center gap-1 bg-white border border-[#EBC176]/20 rounded-2xl p-1 shadow-sm">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[#FAF3E0] text-[#C48B28]' : 'text-[#EBC176] hover:text-[#C48B28]'}`}
                                        >
                                            <LayoutGrid size={18} />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-[#FAF3E0] text-[#C48B28]' : 'text-[#EBC176] hover:text-[#C48B28]'}`}
                                        >
                                            <ListIcon size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Bar Row */}
                        <div className="mb-10 h-px bg-[#EBC176]/10" />

                        {/* Results Section - Flex-1 to push pagination down */}
                        <div className="flex-1">
                            {isLoading ? (
                                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                        <div key={i} className="bg-white rounded-[2rem] h-[320px] animate-pulse border border-[#EBC176]/10 shadow-sm" />
                                    ))}
                                </div>
                            ) : pets.length > 0 ? (
                                <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                                    <AnimatePresence mode="popLayout">
                                        {pets.map((pet) => (
                                            <PetCard
                                                key={pet.id}
                                                pet={pet}
                                                variant="listing"
                                                viewMode={viewMode}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <NoResults
                                    title="No pets found"
                                    description="Try broadening your search or adjusting your area."
                                    onReset={clearFilters}
                                />
                            )}
                        </div>

                        {/* Pagination */}
                        {!isLoading && totalCount > 0 && (
                            <div className="pt-20 pb-12 flex items-center justify-center gap-3">
                                <button
                                    onClick={() => { setPage(Math.max(1, page - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    disabled={page === 1}
                                    className="w-12 h-12 flex items-center justify-center rounded-full border border-[#EBC176]/30 text-themev2-text/40 hover:bg-white hover:text-[#C48B28] disabled:opacity-20 transition-all bg-transparent disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="rotate-180" size={20} />
                                </button>

                                {Array.from({ length: Math.ceil(totalCount / 12) }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        className={`w-12 h-12 flex items-center justify-center rounded-full font-black text-sm transition-all ${page === p
                                            ? 'bg-[#C48B28] text-white shadow-xl shadow-[#C48B28]/20'
                                            : 'bg-white border border-[#EBC176]/30 text-themev2-text/40 hover:border-[#C48B28] hover:text-[#C48B28]'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}

                                <button
                                    onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    disabled={!hasNextPage}
                                    className="w-12 h-12 flex items-center justify-center rounded-full border border-[#EBC176]/30 text-themev2-text/40 hover:bg-white hover:text-[#C48B28] disabled:opacity-20 transition-all bg-transparent disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/50 z-[1000] backdrop-blur-sm lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 h-full w-[320px] md:w-[400px] bg-[#FEF9ED] z-[1001] shadow-2xl lg:hidden overflow-y-auto"
                        >
                            <div className="p-4 flex justify-end">
                                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-black/5 rounded-full">
                                    <X size={24} className="text-[#5A3C0B]" />
                                </button>
                            </div>
                            <div className="px-4 pb-8">
                                <FilterSidebar
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                    onClearFilters={() => { clearFilters(); setIsSidebarOpen(false); }}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <LocationMapModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                onConfirm={(location) => {
                    handleFilterChange('updateLocation', { ...location, radius: filters.radius });
                    setIsLocationModalOpen(false);
                }}
            />

            {(user?.role === 'shelter' || user?.role === 'admin') && (
                <div className="fixed bottom-8 left-8 z-40">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="w-16 h-16 bg-[#C48B28] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group"
                    >
                        <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>
            )}

            <CreatePetModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={refetch}
            />


            <style>{`
                ::placeholder { color: rgba(90, 60, 11, 0.2) !important; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default PetListingPage;
