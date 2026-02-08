import React, { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Plus, Search, Grid, List, PackageOpen,
    Calendar, MapPin, Folder, Edit2, Trash2,
    AlertCircle, CheckCircle2, Clock, PauseCircle,
    AlertTriangle, Heart, Eye, Cake, Ruler, Scale, Users, CheckCircle
} from 'lucide-react';
import useRehoming from '../../hooks/useRehoming';
import ConfirmationModal from '../../components/common/Modal/ConfirmationModal';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const RehomingDashboardPage = () => {
    const queryClient = useQueryClient();
    const { useGetListings, useDeleteListing, useGetRehomingRequests, usePublishRehomingRequest, useCreateListing } = useRehoming();
    const { data: listings, isLoading: listingsLoading } = useGetListings({ owner: 'me' });
    const { data: requests, isLoading: requestsLoading } = useGetRehomingRequests();
    const deleteListingMutation = useDeleteListing();
    const publishMutation = usePublishRehomingRequest();
    const { mutate: createListing } = useCreateListing();

    // State
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'All';

    const setActiveTab = (tabId) => {
        setSearchParams({ tab: tabId });
    };
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [listingToDelete, setListingToDelete] = useState(null);

    const tabs = [
        { id: 'All', label: 'All Applications' },
        { id: 'Active', label: 'Active' },
        { id: 'Rehomed', label: 'Rehomed' }
    ];

    const listingsList = useMemo(() => Array.isArray(listings) ? listings : (listings?.results || []), [listings]);
    const requestsList = useMemo(() => Array.isArray(requests) ? requests : (requests?.results || []), [requests]);

    // Unified List
    const filteredItems = useMemo(() => {
        let items = [];

        // Helper to normalize
        const normalizeListing = (l) => ({ ...l, type: 'listing' });
        const normalizeRequest = (r) => ({
            id: r.id,
            type: 'request',
            status: r.status,
            pet: r.pet_details,
            created_at: r.created_at,
            location_city: r.location_city,
        });

        const activeListings = listingsList.map(normalizeListing);
        const activeRequests = requestsList.map(normalizeRequest);

        // Filter Logic
        switch (activeTab) {
            case 'All':
                items = [...activeListings, ...activeRequests.filter(r => r.status !== 'listed')];
                break;
            case 'Active':
                items = activeListings.filter(l => l.status === 'active');
                break;
            case 'Rehomed':
                items = activeListings.filter(l => l.status === 'rehomed');
                break;
            default:
                items = activeListings;
        }

        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            items = items.filter(item => {
                const name = item.pet?.name?.toLowerCase() || '';
                const breed = item.pet?.breed?.toLowerCase() || '';
                return name.includes(query) || breed.includes(query);
            });
        }

        return items;
    }, [listingsList, requestsList, activeTab, searchQuery]);

    const handleDeleteClick = (listing) => {
        setListingToDelete(listing);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!listingToDelete) return;
        try {
            await deleteListingMutation.mutateAsync(listingToDelete.id);
            toast.success("Listing removed successfully.");
            setDeleteModalOpen(false);
            setListingToDelete(null);
        } catch (error) {
            toast.error("Failed to delete listing.");
        }
    };

    // Helper to get status styling
    const getStatusStyle = (item) => {
        const status = item.status?.toLowerCase();
        if (item.type === 'request') {
            if (status === 'confirmed') return { bg: 'bg-green-100 text-green-700', text: 'Ready', icon: CheckCircle2 };
            if (status === 'listed') return { bg: 'bg-blue-100 text-blue-700', text: 'Listed', icon: CheckCircle2 };
            if (status === 'draft') return { bg: 'bg-gray-100 text-gray-600', text: 'Draft', icon: Edit2 };
        }
        switch (status) {
            case 'active': return { bg: 'bg-[#C48B28]', text: 'Active', icon: CheckCircle2, pulse: true };
            case 'pending_review': return { bg: 'bg-yellow-500', text: 'Reviewing', icon: Clock };
            case 'draft': return { bg: 'bg-gray-500', text: 'Draft', icon: Edit2 };
            case 'adopted':
            case 'rehomed': return { bg: 'bg-purple-500', text: 'Rehomed', icon: Heart };
            case 'rejected': return { bg: 'bg-red-500', text: 'Revision', icon: AlertTriangle };
            case 'on_hold': return { bg: 'bg-orange-500', text: 'Paused', icon: PauseCircle };
            default: return { bg: 'bg-gray-400', text: status, icon: AlertCircle };
        }
    };

    const isLoading = listingsLoading || requestsLoading;

    return (
        <div className="w-full min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 2xl:p-16 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pt-20 sm:pt-24 md:pt-12 bg-[#FEF9ED]/30 overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6 pb-6 sm:pb-8 md:pb-10 border-b-2 border-[#EBC176]/10 w-full max-w-full">
                <div className="w-full md:w-auto">
                    <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-2 sm:mb-3 block">Citizen Dashboard</span>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#402E11] tracking-tighter mb-2 sm:mb-4 font-logo break-words">
                        My Listings
                    </h1>
                    <p className="text-[#402E11]/60 font-bold text-xs sm:text-sm">
                        Orchestrate your companion rehoming timeline
                    </p>
                </div>
                <Link to="/rehoming" className="w-full md:w-auto">
                    <button className="w-full md:w-auto bg-[#402E11] text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-wider sm:tracking-widest hover:bg-[#C48B28] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 sm:gap-3">
                        <Plus size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={3} />
                        Initiate Listing
                    </button>
                </Link>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-5 md:p-6 shadow-sm border border-[#EBC176]/20 w-full max-w-full overflow-hidden">
                <div className="flex flex-col gap-4 w-full">
                    {/* Tabs */}
                    <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0">
                        <div className="flex items-center gap-2 min-w-max sm:min-w-0 pb-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest transition-all whitespace-nowrap border-2 flex-shrink-0 ${activeTab === tab.id
                                        ? 'bg-[#402E11] text-white border-[#402E11] shadow-xl shadow-black/10'
                                        : 'bg-[#FEF9ED] text-[#402E11]/40 border-transparent hover:border-[#EBC176]/30'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px w-full bg-[#EBC176]/20"></div>

                    {/* Search & View Toggle */}
                    <div className="flex flex-col sm:flex-row w-full gap-3 sm:gap-4">
                        <div className="relative flex-1 group w-full">
                            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-[#402E11]/20 group-focus-within:text-[#C48B28] transition-colors" size={14} strokeWidth={3} />
                            <input
                                type="text"
                                placeholder="Search listings..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#FEF9ED] border border-[#EBC176]/20 rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-4 sm:pr-6 outline-none text-xs font-bold text-[#402E11] placeholder:text-[#402E11]/20 focus:bg-white focus:border-[#C48B28]/40 focus:ring-4 focus:ring-[#C48B28]/5 transition-all"
                            />
                        </div>

                        <div className="bg-[#FEF9ED] p-1.5 rounded-xl sm:rounded-2xl flex items-center flex-shrink-0 w-fit self-end sm:self-auto">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-[#C48B28] shadow-md' : 'text-[#402E11]/20 hover:text-[#C48B28]'}`}
                            >
                                <Grid size={18} className="sm:w-5 sm:h-5" strokeWidth={viewMode === 'grid' ? 3 : 2} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-[#C48B28] shadow-md' : 'text-[#402E11]/20 hover:text-[#C48B28]'}`}
                            >
                                <List size={18} className="sm:w-5 sm:h-5" strokeWidth={viewMode === 'list' ? 3 : 2} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {isLoading && filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 sm:py-32 space-y-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-[#EBC176]/20 border-t-[#C48B28] rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-[#C48B28] uppercase tracking-widest">Syndicating Records...</p>
                </div>
            ) : (
                <>
                    {filteredItems.length === 0 && listingsList.length === 0 && requestsList.length === 0 ? (
                        <div className="bg-white rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-12 text-center shadow-sm border border-[#EBC176]/20 flex flex-col items-center justify-center min-h-[320px] sm:min-h-[400px]">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FEF9ED] rounded-full flex items-center justify-center mb-4 sm:mb-6 text-[#C48B28]/40 border border-[#EBC176]/20">
                                <PackageOpen size={28} className="sm:w-8 sm:h-8" strokeWidth={2} />
                            </div>
                            <h3 className="text-lg sm:text-xl font-black text-[#5A3C0B] mb-2">No listings yet</h3>
                            <p className="text-[#5A3C0B]/60 text-xs sm:text-sm font-medium mb-4 sm:mb-6">Start your first listing to find a home.</p>
                            <Link to="/rehoming">
                                <button className="text-[#C48B28] font-bold text-xs uppercase tracking-wider hover:underline">
                                    Start Rehoming
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className={`grid gap-4 sm:gap-6 md:gap-8 w-full ${viewMode === 'grid' 
                            ? 'grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' 
                            : 'grid-cols-1'
                        }`}>

                            {/* Create New Card (Grid Only) */}
                            {viewMode === 'grid' && (activeTab === 'All' || activeTab === 'Active') && !searchQuery && (
                                <Link
                                    to="/rehoming"
                                    className="group bg-white/50 backdrop-blur-sm rounded-3xl sm:rounded-[2.5rem] border-2 border-dashed border-[#EBC176]/40 hover:border-[#C48B28] hover:bg-white transition-all duration-500 flex flex-col items-center justify-center py-10 sm:py-12 px-6 sm:px-8 cursor-pointer hover:shadow-2xl hover:shadow-[#C48B28]/10 w-full mx-auto min-h-[320px] sm:min-h-[380px]"
                                >
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#FEF9ED] rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-[#C48B28]/40 group-hover:text-[#C48B28] group-hover:bg-[#FAF3E0] mb-4 sm:mb-6 group-hover:rotate-12">
                                        <Plus size={28} className="sm:w-8 sm:h-8" strokeWidth={3} />
                                    </div>
                                    <span className="text-sm font-black text-[#5A3C0B] group-hover:text-[#C48B28] transition-colors text-center uppercase tracking-tight">New Listing</span>
                                    <p className="text-[10px] font-bold text-[#5A3C0B]/30 mt-2 text-center uppercase tracking-[0.2em]">Start Rehoming</p>
                                </Link>
                            )}

                            {filteredItems.map(item => {
                                const status = getStatusStyle(item);
                                const photoUrl = item.pet?.main_photo || item.pet?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80';

                                return (
                                    <motion.div
                                        key={`${item.type}-${item.id}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex w-full ${
                                            viewMode === 'grid' 
                                                ? 'flex-col mx-auto' 
                                                : 'flex-col md:flex-row'
                                        }`}
                                    >
                                        {/* Image Section */}
                                        <div className={`relative overflow-hidden bg-[#FEF9ED] flex-shrink-0 ${
                                            viewMode === 'grid' 
                                                ? 'aspect-[4/3] w-full' 
                                                : 'w-full h-48 sm:h-56 md:w-64 md:h-full'
                                        }`}>
                                            <img
                                                src={photoUrl}
                                                alt={item.pet?.name}
                                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                            />

                                            {/* Status Badge */}
                                            <div className="absolute top-2 left-2 z-10">
                                                <div className={`px-2 py-0.5 text-white text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-sm backdrop-blur-sm ${status.bg || 'bg-[#402E11]/70'}`}>
                                                    <div className={`w-1 h-1 rounded-full ${status.pulse ? 'bg-white animate-pulse' : 'bg-white/50'}`} />
                                                    {status.text}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1 bg-white relative min-w-0">
                                            {/* Pet Name & Identity */}
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5 mb-1 overflow-hidden">
                                                    <span className="text-[9px] font-black text-[#C48B28] uppercase tracking-[0.2em] whitespace-nowrap">
                                                        {item.pet?.species || 'Pet'}
                                                    </span>
                                                    <span className="text-[9px] font-black text-[#402E11]/20 uppercase tracking-[0.1em]">•</span>
                                                    <span className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-[0.1em] truncate">
                                                        {item.pet?.breed || 'Mixed'}
                                                    </span>
                                                </div>
                                                <h3 className="text-base font-black text-[#402E11] leading-tight group-hover:text-[#C48B28] transition-colors line-clamp-1 break-words">{item.pet?.name}</h3>
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-2 gap-2 min-w-0">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Cake size={12} className="text-[#C48B28] shrink-0" />
                                                    <p className="text-[10px] font-bold text-[#402E11]/60 truncate">{item.pet?.age_display || 'N/A'}</p>
                                                </div>
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-xs text-[#C48B28] font-black leading-none shrink-0">
                                                        {item.pet?.gender?.toLowerCase() === 'female' ? '♀' : item.pet?.gender?.toLowerCase() === 'male' ? '♂' : '?'}
                                                    </span>
                                                    <p className="text-[10px] font-bold text-[#402E11]/60 capitalize truncate">{item.pet?.gender || 'N/A'}</p>
                                                </div>
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <MapPin size={12} className="text-[#C48B28] shrink-0" />
                                                    <p className="text-[10px] font-bold text-[#402E11]/60 truncate">{item.location_city || 'Regional'}</p>
                                                </div>
                                                {item.type === 'listing' && (
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <Users size={12} className="text-[#C48B28] shrink-0" />
                                                        <p className="text-[10px] font-bold text-[#402E11]/60 truncate">{item.application_count} Prospects</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 mt-auto pt-3 border-t border-[#EBC176]/10 min-w-0">
                                                {item.type === 'listing' ? (
                                                    <>
                                                        <Link
                                                            to={item.application_count > 0 ? `/rehoming/listings/${item.id}/applications` : `/rehoming/listings/${item.id}`}
                                                            className="flex-1 bg-[#402E11] text-white h-9 rounded-lg flex items-center justify-center text-[9px] font-black uppercase tracking-wider hover:bg-[#C48B28] transition-all shadow-sm min-w-0"
                                                        >
                                                            <span className="truncate px-2">
                                                                {item.application_count > 0 ? 'Review Narrative' : 'Inspect Dossier'}
                                                            </span>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteClick(item)}
                                                            className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all group/del flex-shrink-0"
                                                        >
                                                            <Trash2 size={14} strokeWidth={2.5} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <Link
                                                        to={`/rehoming/create?resume=${item.id}`}
                                                        className="flex-1 bg-[#C48B28] text-white h-9 rounded-lg flex items-center justify-center text-[9px] font-black uppercase tracking-wider hover:bg-[#402E11] transition-all shadow-sm min-w-0"
                                                    >
                                                        <span className="truncate px-2">Resume Timeline</span>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Listing?"
                message={`Are you sure you want to delete this listing for ${listingToDelete?.pet?.name}? This cannot be undone.`}
                confirmText="Delete"
                isLoading={deleteListingMutation.isPending}
            />
        </div>
    );
};

export default RehomingDashboardPage;