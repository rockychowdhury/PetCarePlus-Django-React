import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Filter, Map as MapIcon, List as ListIcon, LayoutGrid, ChevronRight, ChevronDown, Info, ArrowUpDown, X, List, SlidersHorizontal, Star } from 'lucide-react';
import Button from '../../components/common/Buttons/Button';
import { motion, AnimatePresence } from 'framer-motion';

import useServices from '../../hooks/useServices';
import NoResults from '../../components/common/Feedback/NoResults';
import ServiceFilterSidebar from '../../components/Services/ServiceFilterSidebar';
import ServiceCard from '../../components/Services/ServiceCard';
import SortDropdown from '../../components/Pet/SortDropdown';
import LocationMapModal from '../../components/Services/LocationMapModal';

const ServiceSearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Unified Filter Drawer State
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    // State from URL
    const providerType = searchParams.get('providerType') || '';
    const search = searchParams.get('search') || '';
    const nearby = searchParams.get('nearby') || '';
    const city = searchParams.get('location') || '';
    const nearbyRadius = nearby.split(',')[2];
    const radius = searchParams.get('radius') || nearbyRadius || '25';
    const sortBy = searchParams.get('ordering') || '-created_at';
    const [page, setPage] = useState(1);
    const species = searchParams.get('species') || '';
    const availability = searchParams.get('availability') || '';
    const verificationStatus = searchParams.get('verification_status') || '';
    const minRating = searchParams.get('min_rating') || '';

    // Map internal type to API Category Slug
    const categoryMapping = {
        'vet': 'veterinary',
        'trainer': 'training',
        'foster': 'foster-care',
        'groomer': 'grooming',
        'sitter': 'pet-sitting'
    };
    const categorySlug = categoryMapping[providerType] || undefined;


    // Location & IP Detection
    const [suggestedLocation, setSuggestedLocation] = useState(null);

    useEffect(() => {
        if (!city) {
            fetch('https://ipwho.is/')
                .then(res => res.json())
                .then(data => {
                    if (data.success) setSuggestedLocation(`${data.city}, ${data.region_code}`);
                })
                .catch(err => console.error("Location detection failed", err));
        }
    }, [city]);

    // Query Construction
    const queryParams = {
        category: categorySlug,
        search,
        ordering: sortBy,
        species,
        availability,
        verification_status: verificationStatus,
        min_rating: minRating,
        page
    };

    if (nearby) {
        queryParams.nearby = nearby;
    } else if (city) {
        queryParams.location = city;
        queryParams.radius = radius;
    }

    if (!queryParams.category) delete queryParams.category;

    const { useGetProviders } = useServices();
    const { data: providersData, isLoading } = useGetProviders(queryParams);

    const providersList = Array.isArray(providersData) ? providersData : (providersData?.results || []);
    const totalCount = providersData?.count || providersList.length;
    const hasNextPage = !!providersData?.next;

    const handleFilterChange = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (key === 'updateLocation' && typeof value === 'object') {
            newParams.set('nearby', value.nearby);
            newParams.set('locationName', value.locationName);
            newParams.delete('location');
            newParams.delete('radius');
        } else if (key === 'clearLocation') {
            newParams.delete('nearby');
            newParams.delete('locationName');
            newParams.delete('location');
            newParams.delete('radius');
        } else if (key === 'openMapModal') {
            setIsLocationModalOpen(true);
            setIsFilterDrawerOpen(false);
            return;
        } else {
            if (value === '' || value === null) newParams.delete(key);
            else newParams.set(key, value);
        }
        newParams.delete('page');
        setSearchParams(newParams);
        setPage(1);
    };

    const handleClearFilters = () => {
        setSearchParams({});
        setPage(1);
    };

    const sortOptions = [
        { value: '-created_at', label: 'Recommended' },
        { value: '-avg_rating', label: 'Highest Rated' },
        { value: '-reviews_count', label: 'Most Reviewed' },
        ...(nearby ? [{ value: 'distance', label: 'Nearest to Me' }] : [])
    ];

    const currentSortLabel = sortOptions.find(o => o.value === sortBy)?.label || 'Recommended';

    return (
        <div className="min-h-screen bg-[#FEF9ED]">

            <div className="max-w-[1600px] mx-auto px-4 md:px-10 py-8 md:py-12">

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Container - Desktop Only */}
                    <aside className="hidden lg:block w-[320px] shrink-0 sticky top-8 h-fit">
                        <ServiceFilterSidebar
                            filters={Object.fromEntries(searchParams.entries())}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                        />
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0 flex flex-col min-h-[calc(100vh-80px)]">
                        {/* Hero / Header Section */}
                        <div className="mb-10">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                                <div className="max-w-2xl">
                                    <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.2em] mb-4 block">Pet services near you</span>
                                    <h1 className="text-2xl sm:text-3xl font-black text-themev2-text tracking-tighter mb-2 leading-none">Find trusted care for your pet</h1>
                                    <p className="text-[10px] sm:text-xs font-bold text-themev2-text/40 max-w-lg leading-relaxed">
                                        Browse highly rated foster homes, vets, and trainers loved by pet parents like you.
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

                            {/* Search & Quick Filters Row */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-themev2-text/20" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search by name, service, or keyword"
                                        value={search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="w-full pl-14 pr-8 py-4 bg-white border border-[#EBC176]/20 rounded-2xl text-[13px] font-bold text-themev2-text placeholder:text-themev2-text/20 shadow-sm focus:border-[#C48B28]/40 outline-none transition-all"
                                    />
                                </div>

                                <div className="flex items-center gap-3 sm:gap-4 shrink-0 pb-1 md:pb-0 overflow-x-auto md:overflow-visible no-scrollbar">
                                    {/* Mobile Filter Toggle */}
                                    <button
                                        onClick={() => setIsFilterDrawerOpen(true)}
                                        className="lg:hidden flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-white border border-[#EBC176]/20 rounded-2xl text-[9px] sm:text-[10px] font-black text-themev2-text uppercase tracking-widest hover:bg-[#FAF3E0] transition-all shadow-sm"
                                    >
                                        <Filter size={14} className="text-[#C48B28]" />
                                        Filters
                                    </button>

                                    <SortDropdown
                                        currentSort={sortBy}
                                        onSortChange={(val) => handleFilterChange('ordering', val)}
                                        options={sortOptions}
                                        customTrigger={
                                            <button className="flex items-center gap-3 sm:gap-4 px-5 sm:px-8 py-3 sm:py-4 bg-white border border-[#EBC176]/20 rounded-2xl text-[10px] font-black text-themev2-text uppercase tracking-widest hover:bg-[#FAF3E0] hover:border-[#C48B28]/40 transition-all shadow-sm whitespace-nowrap group">
                                                <span>Sort by: {currentSortLabel}</span>
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

                        {/* Results Section - Flex 1 pushing pagination */}
                        <div className="flex-1">
                            {/* Results Grid */}
                            {isLoading ? (
                                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                        <div key={i} className="bg-white rounded-[2rem] h-[320px] animate-pulse border border-[#EBC176]/10 shadow-sm" />
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                                        <AnimatePresence mode="popLayout">
                                            {providersList.map((provider) => (
                                                <ServiceCard
                                                    key={provider.id}
                                                    provider={provider}
                                                    viewMode={viewMode}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </div>

                                    {providersList.length === 0 && (
                                        <div className="py-24 bg-white rounded-[3rem] border-2 border-dashed border-[#EBC176]/20">
                                            <NoResults
                                                title="No matches found"
                                                description="Try broadening your search or adjusting your area."
                                                onReset={handleClearFilters}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Pagination */}
                        {!isLoading && totalCount > 0 && (
                            <div className="pt-20 pb-12 flex items-center justify-center gap-3">
                                <button
                                    onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    disabled={page === 1}
                                    className="w-12 h-12 flex items-center justify-center rounded-full border border-[#EBC176]/30 text-themev2-text/40 hover:bg-white hover:text-[#C48B28] disabled:opacity-20 transition-all bg-transparent"
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
                                    onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    disabled={!hasNextPage}
                                    className="w-12 h-12 flex items-center justify-center rounded-full border border-[#EBC176]/30 text-themev2-text/40 hover:bg-white hover:text-[#C48B28] disabled:opacity-20 transition-all bg-transparent"
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
                {isFilterDrawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFilterDrawerOpen(false)}
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
                                <button onClick={() => setIsFilterDrawerOpen(false)} className="p-2 hover:bg-black/5 rounded-full">
                                    <X size={24} className="text-[#5A3C0B]" />
                                </button>
                            </div>
                            <div className="px-4 pb-8">
                                <ServiceFilterSidebar
                                    filters={Object.fromEntries(searchParams.entries())}
                                    onFilterChange={handleFilterChange}
                                    onClearFilters={handleClearFilters}
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
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('nearby', `${location.lat},${location.lng},${radius}`);
                    newParams.set('locationName', location.name);
                    newParams.delete('location');
                    newParams.delete('radius');
                    setSearchParams(newParams);
                    setIsLocationModalOpen(false);
                }}
                initialPosition={nearby ? [parseFloat(nearby.split(',')[0]), parseFloat(nearby.split(',')[1])] : [23.8103, 90.4125]}
            />

            {/* Global V1 to V2 Override Styles */}
            <style>{`
                ::placeholder { color: rgba(90, 60, 11, 0.2) !important; }
            `}</style>
        </div >
    );
};

export default ServiceSearchPage;
