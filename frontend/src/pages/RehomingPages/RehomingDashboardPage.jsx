
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
import HistoryTable from './components/HistoryTable';

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

    return (
        <div className="w-full min-h-screen p-6 md:p-12 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#5A3C0B] tracking-tight font-logo mb-1">
                        My Listings
                    </h1>
                    <p className="text-[#5A3C0B]/60 font-bold text-sm">
                        Manage your rehoming listings and applications
                    </p>
                </div>
                <Link to="/rehoming">
                    <button className="bg-[#C48B28] text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#A06D1B] hover:shadow-lg hover:shadow-[#C48B28]/20 transition-all active:scale-95 flex items-center gap-2">
                        <Plus size={16} strokeWidth={3} />
                        Start Rehoming
                    </button>
                </Link>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-[#EBC176]/20">
                <div className="flex flex-col xl:flex-row gap-6 items-center justify-between">
                    <div className="flex items-center gap-4 w-full xl:w-auto">
                        {/* Tabs */}
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-[#FEF9ED] p-1.5 rounded-full">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-[#C48B28] text-white shadow-md'
                                        : 'text-[#5A3C0B]/50 hover:text-[#C48B28] hover:bg-white/50'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search & View */}
                    <div className="flex w-full xl:w-auto gap-3">
                        <div className="relative flex-1 xl:w-64 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A3C0B]/30 group-focus-within:text-[#C48B28] transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search listings..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#FEF9ED] border border-[#EBC176]/20 rounded-2xl py-3 pl-10 pr-4 outline-none focus:ring-0 focus-visible:ring-0 text-sm font-bold text-[#5A3C0B] placeholder:text-[#5A3C0B]/30 focus:border-[#C48B28]/40 focus:bg-white focus:shadow-inner transition-all placeholder:font-bold"
                            />
                        </div>

                        <div className="bg-[#FEF9ED] p-1 rounded-2xl flex shrink-0">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-[#C48B28] shadow-sm' : 'text-[#5A3C0B]/40 hover:text-[#C48B28]'}`}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-[#C48B28] shadow-sm' : 'text-[#5A3C0B]/40 hover:text-[#C48B28]'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {!listings && !requests ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#C48B28] border-t-transparent" />
                </div>
            ) : (
                <>
                    {filteredItems.length === 0 && listingsList.length === 0 && requestsList.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-sm border border-[#EBC176]/20 flex flex-col items-center justify-center min-h-[400px]">
                            <div className="w-20 h-20 bg-[#FEF9ED] rounded-full flex items-center justify-center mb-6 text-[#C48B28]/40 border border-[#EBC176]/20">
                                <PackageOpen size={32} strokeWidth={2} />
                            </div>
                            <h3 className="text-xl font-black text-[#5A3C0B] mb-2">No listings yet</h3>
                            <p className="text-[#5A3C0B]/60 text-sm font-medium mb-6">Start your first listing to find a home.</p>
                            <Link to="/rehoming">
                                <button className="text-[#C48B28] font-bold text-xs uppercase tracking-wider hover:underline">
                                    Start Rehoming
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : 'grid-cols-1'}`}>

                            {/* Create New Card (Grid Only) */}
                            {viewMode === 'grid' && (activeTab === 'All' || activeTab === 'Active') && !searchQuery && filteredItems.length > 0 && (
                                <Link
                                    to="/rehoming"
                                    className="group bg-white rounded-[2rem] border-2 border-dashed border-[#EBC176] hover:border-[#C48B28] hover:bg-[#FEF9ED]/50 transition-all duration-300 flex flex-col items-center justify-center py-10 px-6 cursor-pointer hover:shadow-xl hover:shadow-[#C48B28]/5 min-h-[380px]"
                                >
                                    <div className="w-16 h-16 bg-[#FEF9ED] rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-[#C48B28]/60 group-hover:text-[#C48B28] group-hover:bg-white mb-4">
                                        <Plus size={32} strokeWidth={2.5} />
                                    </div>
                                    <span className="text-sm font-black text-[#5A3C0B]/70 group-hover:text-[#C48B28] transition-colors text-center">New Listing</span>
                                    <p className="text-[10px] font-bold text-[#5A3C0B]/30 mt-1 text-center uppercase tracking-wider">Start Rehoming</p>
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
                                        className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex ${viewMode === 'grid' ? 'flex-col max-w-[280px] w-full mx-auto' : 'flex-row h-52 w-full'}`}
                                    >
                                        {/* Image Section - 4:3 Aspect */}
                                        <div className={`relative overflow-hidden bg-gradient-to-br from-[#FEF9ED] to-[#C48B28] ${viewMode === 'grid' ? 'aspect-[4/3] w-full' : 'w-56 h-full shrink-0'}`}>
                                            <img
                                                src={photoUrl}
                                                alt={item.pet?.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />

                                            {/* Status Badge - Top Left (Pill) */}
                                            <div className="absolute top-3 left-3">
                                                <div className={`px-2.5 py-1 text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-sm backdrop-blur-md ${status.bg || 'bg-black/50'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${status.pulse ? 'bg-white animate-pulse' : 'bg-white/50'}`} />
                                                    {status.text}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-3 flex flex-col gap-2.5 flex-1">
                                            {/* Pet Name & Breed */}
                                            <div>
                                                <h3 className="text-sm font-black text-[#5A3C0B] leading-tight mb-0.5 truncate">{item.pet?.name}</h3>
                                                <p className="text-[9px] font-bold text-[#5A3C0B]/50 uppercase tracking-widest truncate">
                                                    {item.pet?.species || 'Pet'} • {item.pet?.breed || 'Unknown'}
                                                </p>
                                            </div>

                                            {/* Stats Grid - Ultra Compact (Matches PetCard) */}
                                            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <Cake size={10} className="text-[#C48B28] flex-shrink-0" />
                                                    <p className="text-[10px] font-bold text-[#5A3C0B] truncate">{item.pet?.age_display || 'N/A'}</p>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs text-[#C48B28] flex-shrink-0 leading-none">
                                                        {item.pet?.gender?.toLowerCase() === 'female' ? '♀' : item.pet?.gender?.toLowerCase() === 'male' ? '♂' : '?'}
                                                    </span>
                                                    <p className="text-[10px] font-bold text-[#5A3C0B] capitalize truncate">{item.pet?.gender || 'N/A'}</p>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin size={10} className="text-[#C48B28] flex-shrink-0" />
                                                    <p className="text-[10px] font-bold text-[#5A3C0B] truncate">{item.location_city || 'No Location'}</p>
                                                </div>
                                                {/* Views Count */}
                                                {item.type === 'listing' && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Folder size={10} className="text-[#C48B28] flex-shrink-0" />
                                                        <p className="text-[10px] font-bold text-[#5A3C0B] truncate">
                                                            {item.application_count} Applications
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Timestamp / Meta */}
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-[#FEF9ED] text-[#5A3C0B]/40 border border-[#EBC176]/20">
                                                    <Clock size={8} />
                                                    Listed {new Date(item.created_at || Date.now()).toLocaleDateString()}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-1.5 mt-auto pt-1">
                                                {item.type === 'listing' ? (
                                                    <>
                                                        <Link
                                                            to={item.application_count > 0 ? `/rehoming/listings/${item.id}/applications` : `/rehoming/listings/${item.id}`}
                                                            className="flex-1 bg-[#5A3C0B] text-white h-7 rounded-lg flex items-center justify-center text-[9px] font-bold uppercase tracking-wide hover:bg-[#C48B28] transition-all shadow-sm"
                                                        >
                                                            {item.application_count > 0 ? 'Review Apps' : 'View'}
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteClick(item)}
                                                            className="w-7 h-7 flex items-center justify-center border border-red-100 bg-red-50 rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition-all"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <Link
                                                        to={`/rehoming/create?resume=${item.id}`}
                                                        className="flex-1 bg-[#C48B28] text-white h-7 rounded-lg flex items-center justify-center text-[9px] font-bold uppercase tracking-wide hover:bg-[#A06D1B] transition-all shadow-sm"
                                                    >
                                                        Resume
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
