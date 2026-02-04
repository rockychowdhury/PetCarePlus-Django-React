import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Calendar, MapPin, ChevronLeft, ChevronRight,
    MoreHorizontal, ArrowUpDown, SlidersHorizontal, Eye, User,
    CheckCircle2, XCircle, Clock, Send, Inbox, Sparkles, Loader2,
    PawPrint, ShieldCheck, Mail, ArrowUpRight, BarChart3,
    ArrowRight
} from 'lucide-react';
import useAPI from '../../hooks/useAPI';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Buttons/Button';
import Badge from '../../components/common/Feedback/Badge';
import SideDrawer from '../../components/common/Layout/SideDrawer';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

// --- Helpers ---
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
};

const getStatusColor = (status) => {
    switch (status) {
        case 'adopted': return 'text-green-600 bg-green-50 border-green-100';
        case 'approved_meet_greet': return 'text-blue-600 bg-blue-50 border-blue-100';
        case 'pending_review': return 'text-[#C48B28] bg-[#FAF3E0] border-[#EBC176]/20';
        case 'rejected': return 'text-red-500 bg-red-50 border-red-100';
        case 'withdrawn': return 'text-gray-500 bg-gray-50 border-gray-100';
        default: return 'text-gray-500 bg-gray-50 border-gray-100';
    }
};

const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    if (status === 'approved_meet_greet') return 'Meet & Greet';
    return status.replace(/_/g, ' ');
};

const ApplicationCard = ({ app, viewMode, onClick }) => {
    const isSent = viewMode === 'sent';
    const counterpart = isSent ? app.listing.owner : app.applicant;
    const pet = app.pet;
    const status = app.application.status;
    const date = app.application.submitted_at;
    const matchScore = app.application.match_percentage;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={onClick}
            className="bg-white rounded-[2.5rem] p-6 border border-[#EBC176]/10 hover:shadow-xl hover:shadow-[#402E11]/5 transition-all group cursor-pointer relative overflow-hidden"
        >
            <div className="flex flex-col md:flex-row items-center gap-6">

                {/* Left: Counterpart Info */}
                <div className="flex items-center gap-4 flex-1 w-full md:w-auto min-w-0">
                    <div className="w-14 h-14 rounded-full bg-[#FAF3E0] overflow-hidden border border-[#EBC176]/20 shrink-0">
                        <img src={counterpart?.photo_url || "https://ui-avatars.com/api/?name=User&background=FAF3E0&color=C48B28"} alt={counterpart?.full_name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-[0.2em] mb-1">{isSent ? 'Owner' : 'Applicant'}</p>
                        <h4 className="text-sm font-black text-[#402E11] leading-tight mb-0.5 truncate text-lg">{counterpart?.full_name}</h4>
                        <div className="flex items-center gap-1 text-[#402E11]/40">
                            <MapPin size={10} />
                            <p className="text-[9px] font-bold uppercase tracking-wide truncate max-w-[120px]">
                                {counterpart?.location?.city || 'Unknown Location'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Middle: Application/Pet Info */}
                <div className="flex flex-col items-center justify-center flex-[1.2] text-center w-full md:w-auto md:border-x border-[#EBC176]/10 py-4 md:py-0 md:px-6">
                    <div className="mb-2">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusColor(status)}`}>
                            {getStatusLabel(status)}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-xl bg-[#FAF3E0] overflow-hidden border border-[#EBC176]/20 shrink-0">
                            <img src={pet.primary_photo || "https://images.unsplash.com/photo-1543466835-00a7907e9de1"} alt={pet.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-[#402E11]/30 uppercase tracking-widest mb-0.5">Application For</p>
                            <h4 className="text-sm font-black text-[#402E11] leading-none">{pet.name}</h4>
                        </div>
                    </div>
                </div>

                {/* Right: AI & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-6 flex-1 w-full md:w-auto">
                    {!isSent && app.application.ai_processed && (
                        <div className="flex items-center gap-3 bg-[#F3E8FF]/30 px-3 py-1.5 rounded-full border border-[#8B5CF6]/10">
                            <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="16" cy="16" r="14" stroke="#F3E8FF" strokeWidth="3" fill="transparent" />
                                    <circle cx="16" cy="16" r="14" stroke="#8B5CF6" strokeWidth="3" fill="transparent" strokeDasharray={2 * Math.PI * 14} strokeDashoffset={(2 * Math.PI * 14) * (1 - matchScore / 100)} strokeLinecap="round" />
                                </svg>
                                <span className="absolute text-[8px] font-black text-[#8B5CF6]">{matchScore}%</span>
                            </div>
                            <div className="flex flex-col text-left">
                                <div className="flex items-center gap-1">
                                    <Sparkles size={8} className="text-[#8B5CF6]" />
                                    <span className="text-[8px] font-black text-[#8B5CF6] uppercase tracking-widest leading-none">AI Match</span>
                                </div>
                                <span className="text-[8px] font-bold text-[#402E11]/30 leading-none mt-0.5">Compatibility</span>
                            </div>
                        </div>
                    )}

                    <button className="w-10 h-10 rounded-full bg-[#FAF3E0] flex items-center justify-center text-[#C48B28] hover:bg-[#C48B28] hover:text-white transition-all shadow-sm hover:scale-105 shrink-0 ml-auto md:ml-0">
                        <ArrowRight size={16} strokeWidth={2.5} />
                    </button>
                </div>

            </div>

            {/* Date Badge Absolute */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="px-2 py-0.5 bg-[#402E11] text-white text-[8px] font-bold rounded-b-lg uppercase tracking-wider">{formatDate(date)}</span>
            </div>
        </motion.div>
    );
};

const MyApplicationsPage = () => {
    const api = useAPI();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // View State
    const [searchParams, setSearchParams] = useSearchParams();
    const viewMode = searchParams.get('view') || 'received'; // 'sent' | 'received'
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    // Drawer State
    const [selectedApp, setSelectedApp] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [meetGreetDate, setMeetGreetDate] = useState('');
    const [meetGreetTime, setMeetGreetTime] = useState('');

    // Fetch Data
    const { data: applications = [], isLoading } = useQuery({
        queryKey: ['applications'],
        queryFn: async () => {
            const res = await api.get('/rehoming/inquiries/');
            return res.data.results || res.data;
        }
    });

    // --- Data Processing ---
    const data = useMemo(() => {
        if (!user) return [];

        let filtered = applications.filter(app => {
            if (viewMode === 'sent') {
                return app.applicant.id === user.id;
            } else {
                return app.listing.owner?.id === user.id || app.listing.owner === user.id;
            }
        });

        if (statusFilter !== 'all') {
            filtered = filtered.filter(app => app.application.status === statusFilter);
        }

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(app =>
                app.pet?.name.toLowerCase().includes(lower) ||
                (viewMode === 'sent' ? app.listing.owner?.full_name : app.applicant.full_name)?.toLowerCase().includes(lower)
            );
        }

        return filtered;
    }, [applications, user, viewMode, statusFilter, searchTerm]);

    // Pagination Logic
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return data.slice(start, start + itemsPerPage);
    }, [data, currentPage]);

    // Reset page on filter change
    useMemo(() => setCurrentPage(1), [viewMode, statusFilter, searchTerm]);

    // Stats
    const stats = useMemo(() => {
        const total = data.length;
        const pending = data.filter(a => a.application.status === 'pending_review').length;
        const approved = data.filter(a => ['approved_meet_greet', 'adopted'].includes(a.application.status)).length;
        return { total, pending, approved };
    }, [data]);

    // --- Action Handlers ---
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status, notes }) => {
            return await api.post(`/rehoming/inquiries/${id}/update_status/`, { status, owner_notes: notes });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['applications']);
            toast.success("Application updated successfully");
            setIsDrawerOpen(false);
        },
        onError: () => toast.error("Failed to update status")
    });

    const withdrawMutation = useMutation({
        mutationFn: async (id) => {
            return await api.post(`/rehoming/inquiries/${id}/withdraw/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['applications']);
            toast.success("Application withdrawn successfully");
            setIsDrawerOpen(false);
        },
        onError: (err) => toast.error(err.response?.data?.detail || "Failed to withdraw application")
    });

    return (
        <div className="w-full md:p-12 lg:p-20 space-y-12 bg-[#FEF9ED]/30 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.4em] mb-4 block">Application Center</span>
                    <h1 className="text-4xl font-black text-[#402E11] tracking-tighter mb-4">
                        My Applications
                    </h1>
                    <div className="flex items-center gap-4">
                        <p className="text-[#402E11]/60 font-bold text-sm">Manage your adoption journey and incoming requests.</p>
                        <div className="flex items-center gap-2.5 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-[#EBC176]/20 shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black text-[#402E11]/40 uppercase tracking-widest leading-none">
                                {viewMode === 'sent' ? 'Applicant Mode' : 'Owner Mode'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-1.5 rounded-full border border-[#EBC176]/20 shadow-sm flex items-center gap-1 self-start md:self-auto">
                    <button
                        onClick={() => setSearchParams({ view: 'received' })}
                        className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'received'
                            ? 'bg-[#C48B28] text-white shadow-md'
                            : 'text-[#402E11]/40 hover:text-[#402E11] hover:bg-[#FAF3E0]'
                            }`}
                    >
                        <Inbox size={14} strokeWidth={2.5} /> Received
                    </button>
                    <button
                        onClick={() => setSearchParams({ view: 'sent' })}
                        className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'sent'
                            ? 'bg-[#C48B28] text-white shadow-md'
                            : 'text-[#402E11]/40 hover:text-[#402E11] hover:bg-[#FAF3E0]'
                            }`}
                    >
                        <Send size={14} strokeWidth={2.5} /> Sent
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: List (8 cols) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Filter Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-[#EBC176]/10 pb-8">
                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'pending_review', label: 'Pending' },
                                { id: 'approved_meet_greet', label: 'Meet & Greet' },
                                { id: 'adopted', label: 'Adopted' },
                                { id: 'rejected', label: 'Rejected' },
                            ].map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => setStatusFilter(filter.id)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${statusFilter === filter.id
                                        ? 'bg-[#402E11] text-white border-[#402E11]'
                                        : 'bg-white text-[#402E11]/40 border-[#EBC176]/10 hover:border-[#EBC176]/30'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                        {/* Search */}
                        <div className="relative w-full md:w-64">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#402E11]/30" />
                            <input
                                type="text"
                                placeholder="Search pets or people..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-[#EBC176]/20 rounded-2xl text-xs font-bold text-[#402E11] focus:ring-2 focus:ring-[#C48B28]/20 outline-none transition-all placeholder:text-[#402E11]/20 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    {isLoading ? (
                        <div className="p-20 text-center">
                            <Loader2 className="animate-spin w-10 h-10 text-[#C48B28] mx-auto mb-6" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#402E11]/40">Loading Applications...</p>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] p-20 text-center border border-[#EBC176]/10 shadow-sm">
                            <div className="w-20 h-20 bg-[#FAF3E0] rounded-full flex items-center justify-center mx-auto mb-6 text-[#C48B28]">
                                {viewMode === 'sent' ? <Send size={32} /> : <Inbox size={32} />}
                            </div>
                            <h3 className="text-xl font-black text-[#402E11] tracking-tight mb-2">No applications found</h3>
                            <p className="text-[#402E11]/40 font-bold text-sm max-w-sm mx-auto mb-8">
                                {viewMode === 'sent' ? "You haven't submitted any adoption applications yet." : "No inquiries received matching your filters."}
                            </p>
                            {viewMode === 'sent' && (
                                <Link to="/pets">
                                    <button className="px-8 py-4 bg-[#C48B28] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#C48B28]/20 hover:scale-105 transition-all">
                                        Browse Pets
                                    </button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-5">
                            <AnimatePresence mode='wait'>
                                {paginatedData.map(app => (
                                    <ApplicationCard
                                        key={app.application.id}
                                        app={app}
                                        viewMode={viewMode}
                                        onClick={() => {
                                            setSelectedApp(app);
                                            setIsDrawerOpen(true);
                                        }}
                                    />
                                ))}
                            </AnimatePresence>

                            {/* Pagination Controls */}
                            <div className="flex justify-start items-center gap-2 mt-8">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#402E11]/60 hover:text-[#402E11] hover:bg-[#FAF3E0] disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
                                >
                                    <ChevronLeft size={14} strokeWidth={3} />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm transition-all ${currentPage === page
                                            ? 'bg-[#C48B28] text-white shadow-[#C48B28]/20 scale-110'
                                            : 'bg-white text-[#402E11]/60 hover:text-[#402E11] hover:bg-[#FAF3E0]'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#402E11]/60 hover:text-[#402E11] hover:bg-[#FAF3E0] disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
                                >
                                    <ChevronRight size={14} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Stats & Actions (4 cols) */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Stats Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-[#EBC176]/20 shadow-xl shadow-[#C48B28]/5 relative overflow-hidden">
                        <h3 className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                            <BarChart3 size={14} /> Overview
                        </h3>

                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center justify-between p-6 bg-[#FAF3E0] rounded-3xl border border-[#EBC176]/10">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#402E11]/60">Total</span>
                                <span className="text-2xl font-black tracking-tight text-[#402E11]">{stats.total}</span>
                            </div>
                            <div className="flex items-center justify-between p-6 bg-[#FAF3E0] rounded-3xl border border-[#EBC176]/10">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C48B28]">Pending</span>
                                <span className="text-2xl font-black tracking-tight text-[#C48B28]">{stats.pending}</span>
                            </div>
                            <div className="flex items-center justify-between p-6 bg-[#FAF3E0] rounded-3xl border border-[#EBC176]/10">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">Actioned</span>
                                <span className="text-2xl font-black tracking-tight text-green-600">{stats.approved}</span>
                            </div>
                        </div>
                    </div>

                    {/* Helper Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-[#EBC176]/20 shadow-xl shadow-[#C48B28]/5 relative overflow-hidden">
                        <div className="w-16 h-16 bg-[#F3E8FF] rounded-[1.5rem] flex items-center justify-center text-[#8B5CF6] mb-6 relative z-10">
                            <Sparkles size={28} strokeWidth={2} />
                        </div>
                        <h4 className="text-xl font-black text-[#402E11] mb-3 leading-tight relative z-10">AI Matching</h4>
                        <p className="text-xs font-medium text-[#402E11]/50 leading-relaxed mb-8 relative z-10 max-w-[260px]">
                            Our AI analyzes compatibility based on lifestyle, home environment, and pet needs to help you find the perfect match.
                        </p>
                        <div className="px-6 py-5 bg-[#F3E8FF] rounded-[2rem] border border-[#EBC176]/10 flex items-center gap-4 relative z-10">
                            <div className="relative w-8 h-8 flex-shrink-0">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="16" cy="16" r="14" stroke="#EBC176" strokeWidth="2.5" fill="transparent" className="opacity-30" />
                                    <circle cx="16" cy="16" r="14" stroke="#8B5CF6" strokeWidth="2.5" fill="transparent" strokeDasharray={2 * Math.PI * 14} strokeDashoffset={25} strokeLinecap="round" />
                                </svg>
                            </div>
                            <p className="text-[10px] font-black text-[#8B5CF6] uppercase tracking-[0.15em]">High score = Better fit</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Drawer */}
            <SideDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title={viewMode === 'sent' ? 'Application Details' : 'Review Application'}
            >
                {selectedApp && (
                    <div className="space-y-8 pb-20">
                        {/* Header Profile */}
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-3xl bg-[#FAF3E0] overflow-hidden border-2 border-[#EBC176]/20 shrink-0 shadow-lg shadow-[#C48B28]/10">
                                <img src={viewMode === 'sent' ? selectedApp.listing.owner?.photo_url : selectedApp.applicant.photo_url} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-[#402E11] tracking-tight">
                                    {viewMode === 'sent' ? selectedApp.listing.owner?.full_name : selectedApp.applicant.full_name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2.5 py-1 bg-[#FAF3E0] text-[#C48B28] rounded-md text-[9px] font-black uppercase tracking-widest">
                                        {viewMode === 'sent' ? 'Owner' : 'Applicant'}
                                    </span>
                                    <span className="text-[10px] font-bold text-[#402E11]/40 flex items-center gap-1">
                                        <MapPin size={10} /> {viewMode === 'sent' ? selectedApp.listing.owner?.location?.city : selectedApp.applicant.location?.city}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Status Banner */}
                        <div className="p-5 bg-[#FAF3E0]/30 rounded-2xl border border-[#EBC176]/10 flex justify-between items-center">
                            <div>
                                <p className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-widest mb-1">Current Status</p>
                                <span className={`text-xs font-black uppercase tracking-wider ${getStatusColor(selectedApp.application.status).split(' ')[0]}`}>
                                    {getStatusLabel(selectedApp.application.status)}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-widest mb-1">Submitted on</p>
                                <p className="text-xs font-bold text-[#402E11]">{formatDate(selectedApp.application.submitted_at)}</p>
                            </div>
                        </div>

                        {/* Trust & Verification */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-white rounded-3xl border border-[#EBC176]/10 shadow-sm">
                                <p className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-widest mb-3">Verification</p>
                                <div className="space-y-2">
                                    {selectedApp.trust_snapshot.email_verified && (
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-green-600">
                                            <CheckCircle2 size={12} className="fill-green-100" /> Email Verified
                                        </div>
                                    )}
                                    {selectedApp.trust_snapshot.phone_verified && (
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-green-600">
                                            <CheckCircle2 size={12} className="fill-green-100" /> Phone Verified
                                        </div>
                                    )}
                                    {!selectedApp.trust_snapshot.email_verified && !selectedApp.trust_snapshot.phone_verified && (
                                        <p className="text-[10px] italic text-[#402E11]/30">No verification data</p>
                                    )}
                                </div>
                            </div>
                            <div className="p-5 bg-white rounded-3xl border border-[#EBC176]/10 shadow-sm flex flex-col justify-center items-center text-center">
                                <p className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-widest mb-1">Trust Score</p>
                                <p className="text-3xl font-black text-[#C48B28] tracking-tighter">{selectedApp.trust_snapshot.average_rating}<span className="text-sm text-[#402E11]/30">/5</span></p>
                                <p className="text-[9px] font-bold text-[#402E11]/40 mt-1">{selectedApp.trust_snapshot.reviews_count} Reviews</p>
                            </div>
                        </div>

                        {/* Intro Message */}
                        <div>
                            <h4 className="text-[10px] font-black text-[#402E11]/40 uppercase tracking-[0.2em] mb-4">Intro Message</h4>
                            <div className="p-6 bg-white rounded-3xl border border-[#EBC176]/10 text-sm font-medium text-[#402E11]/80 leading-relaxed whitespace-pre-wrap shadow-sm">
                                {selectedApp.application_message.intro_message}
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="fixed bottom-0 right-0 w-full md:w-[480px] bg-white/90 backdrop-blur-xl border-t border-[#EBC176]/20 p-6 flex gap-4 z-50">
                            {viewMode === 'received' && selectedApp.application.status === 'pending_review' && (
                                <>
                                    <Button
                                        onClick={() => updateStatusMutation.mutate({ id: selectedApp.application.id, status: 'rejected' })}
                                        className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 py-4 h-auto rounded-xl text-xs font-black uppercase tracking-widest"
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={() => setShowScheduleModal(true)}
                                        className="flex-[2] bg-[#C48B28] text-white hover:bg-[#A37320] py-4 h-auto rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[#C48B28]/20"
                                    >
                                        Approve & Schedule
                                    </Button>
                                </>
                            )}
                            {viewMode === 'sent' && !['withdrawn', 'rejected', 'adopted'].includes(selectedApp.application.status) && (
                                <Button
                                    onClick={() => {
                                        if (window.confirm("Confirm withdraw?")) withdrawMutation.mutate(selectedApp.application.id)
                                    }}
                                    className="w-full bg-gray-50 text-gray-600 hover:bg-gray-100 py-4 h-auto rounded-xl text-xs font-black uppercase tracking-widest border border-gray-200"
                                >
                                    Withdraw Application
                                </Button>
                            )}
                            {viewMode === 'received' && selectedApp.application.status === 'approved_meet_greet' && (
                                <Button
                                    onClick={() => updateStatusMutation.mutate({ id: selectedApp.application.id, status: 'adopted' })}
                                    className="w-full bg-green-600 text-white hover:bg-green-700 py-4 h-auto rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-green-600/20"
                                >
                                    Mark as Adopted
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </SideDrawer>

            {/* Meet & Greet Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#402E11]/40 backdrop-blur-md">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-md space-y-6 border border-[#EBC176]/20">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black text-[#402E11] tracking-tight">Schedule Meet & Greet</h3>
                            <button onClick={() => setShowScheduleModal(false)} className="bg-[#FAF3E0] p-2 rounded-full text-[#C48B28] hover:bg-[#C48B28] hover:text-white transition-colors">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-[#402E11]/40 uppercase tracking-widest mb-2">Date</label>
                                <input
                                    type="date"
                                    className="w-full px-5 py-4 rounded-xl bg-[#FAF3E0]/30 border border-[#EBC176]/20 font-bold text-[#402E11] focus:ring-2 focus:ring-[#C48B28] outline-none"
                                    value={meetGreetDate}
                                    onChange={(e) => setMeetGreetDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-[#402E11]/40 uppercase tracking-widest mb-2">Time</label>
                                <input
                                    type="time"
                                    className="w-full px-5 py-4 rounded-xl bg-[#FAF3E0]/30 border border-[#EBC176]/20 font-bold text-[#402E11] focus:ring-2 focus:ring-[#C48B28] outline-none"
                                    value={meetGreetTime}
                                    onChange={(e) => setMeetGreetTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <Button onClick={() => setShowScheduleModal(false)} className="flex-1 bg-transparent border border-[#EBC176]/20 text-[#402E11]/60 font-bold hover:bg-[#FAF3E0]">Cancel</Button>
                            <Button
                                disabled={!meetGreetDate || !meetGreetTime}
                                onClick={() => {
                                    const combinedDateTime = new Date(`${meetGreetDate}T${meetGreetTime}`);
                                    const formattedString = `[SCHEDULED: ${combinedDateTime.toISOString()}]`;
                                    updateStatusMutation.mutate({
                                        id: selectedApp.application.id,
                                        status: 'approved_meet_greet',
                                        notes: formattedString
                                    });
                                    setShowScheduleModal(false);
                                }}
                                className="flex-[2] bg-[#C48B28] text-white font-black uppercase tracking-widest shadow-lg shadow-[#C48B28]/20"
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyApplicationsPage;
