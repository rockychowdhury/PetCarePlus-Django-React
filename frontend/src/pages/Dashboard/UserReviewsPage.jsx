import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Star,
    MessageSquare,
    CalendarDays,
    Clock,
    Search,
    Filter,
    MapPin,
    ChevronRight,
    User,
    BarChart3,
    Quote,
    ArrowUpRight,
    SearchX,
    MessageCircle,
    CheckCircle2
} from 'lucide-react';
import useReviews from '../../hooks/useReviews';
import useAuth from '../../hooks/useAuth';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const UserReviewsPage = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRating, setFilterRating] = useState('all'); // 'all' | 'high' | 'low' | 'responded'
    const { useGetMyReviews } = useReviews();

    // Fetch Given Reviews with Backend Filters
    const { data: reviewsData, isLoading } = useGetMyReviews({
        reviewer: user?.id,
        search: searchQuery || undefined,
        rating_min: filterRating === 'high' ? 4 : undefined,
        rating_max: filterRating === 'low' ? 3 : undefined,
        has_response: filterRating === 'responded' ? true : undefined
    });

    const reviews = useMemo(() => {
        return Array.isArray(reviewsData) ? reviewsData : (reviewsData?.results || []);
    }, [reviewsData]);

    // Calculate Summary Stats
    const stats = useMemo(() => {
        const rawReviews = Array.isArray(reviewsData) ? reviewsData : (reviewsData?.results || []);
        const total = rawReviews.length;
        const avg = total > 0
            ? (rawReviews.reduce((acc, r) => acc + (r.rating_overall || 0), 0) / total).toFixed(1)
            : '0.0';
        const responded = rawReviews.filter(r => r.provider_response).length;
        const recentDate = total > 0
            ? format(new Date(rawReviews[0].created_at), 'MMM dd, yyyy')
            : 'N/A';

        return { total, avg, responded, recentDate };
    }, [reviewsData]);

    const renderStars = (rating, size = 14) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={size}
                        fill={star <= rating ? "#C48B28" : "transparent"}
                        className={star <= rating ? 'text-[#C48B28]' : 'text-[#402E11]/10'}
                        strokeWidth={2.5}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="w-full md:p-12 lg:p-20 space-y-12 bg-[#FEF9ED]/30 min-h-screen">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.3em] mb-3 block">Engagement</span>
                    <h1 className="text-4xl font-black text-[#402E11] tracking-tight mb-2">
                        My Feedback
                    </h1>
                    <div className="flex items-center gap-3">
                        <p className="text-[#402E11]/60 font-bold text-sm">Reviewing your experiences helps the community grow.</p>
                        <span className="px-3 py-1 bg-[#C48B28]/10 text-[#C48B28] rounded-full text-[10px] font-black uppercase tracking-wider border border-[#C48B28]/10">
                            {stats.total} Total Reviews
                        </span>
                    </div>
                </div>
                <div className="relative group min-w-[300px]">
                    <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#402E11]/20 group-focus-within:text-[#C48B28] transition-all" strokeWidth={3} />
                    <input
                        type="text"
                        placeholder="Search specific provider..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white border border-[#EBC176]/20 rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#402E11] placeholder:text-[#402E11]/20 focus:border-[#C48B28]/50 shadow-xl shadow-[#402E11]/5 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content - Left Column */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Filters Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#EBC176]/10 pb-8">
                        <div>
                            <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.3em] mb-2 block">History</span>
                            <p className="text-[#402E11]/60 font-medium text-sm">Your feedback timeline</p>
                        </div>
                        <div className="flex p-1.5 bg-white rounded-2xl border border-[#EBC176]/20 shadow-sm">
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'high', label: 'Top Rated' },
                                { id: 'low', label: 'Critical' },
                                { id: 'responded', label: 'Responded' }
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilterRating(f.id)}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterRating === f.id
                                        ? 'bg-[#C48B28] text-white shadow-lg shadow-[#C48B28]/20'
                                        : 'text-[#402E11]/40 hover:text-[#402E11]'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-[#EBC176]/10">
                                <div className="w-12 h-12 rounded-full border-4 border-[#FAF3E0] border-t-[#C48B28] animate-spin mb-4" />
                                <p className="text-[10px] font-black text-[#C48B28] uppercase tracking-widest">Retrieving history...</p>
                            </div>
                        ) : reviews.length > 0 ? (
                            <AnimatePresence mode="popLayout">
                                {reviews.map((review, idx) => (
                                    <motion.div
                                        key={review.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-[#EBC176]/10 hover:shadow-2xl hover:shadow-[#402E11]/5 transition-all group overflow-hidden relative">
                                            {/* Decorative Quote Background */}
                                            <Quote size={120} className="absolute -bottom-4 -right-4 text-[#C48B28]/5 -rotate-12 pointer-events-none transition-transform group-hover:rotate-0 duration-700" strokeWidth={0.5} />

                                            <div className="relative z-10">
                                                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                                    <div className="flex gap-5 flex-1">
                                                        {/* Provider Avatar/Icon */}
                                                        <div className="w-16 h-16 rounded-[1.5rem] bg-[#FAF3E0] border border-[#EBC176]/20 flex items-center justify-center text-[#C48B28] shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform">
                                                            {review.provider_details?.business_name?.charAt(0) || <User size={24} />}
                                                            <div className="absolute inset-0 bg-gradient-to-tr from-[#C48B28]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>

                                                        <Link
                                                            to={`/services/provider/${review.provider}`}
                                                            className="flex-1 min-w-0"
                                                        >
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <h4 className="text-xl font-black text-[#402E11] tracking-tight group-hover:text-[#C48B28] transition-colors truncate">
                                                                    {review.provider_details?.business_name}
                                                                </h4>
                                                                <ArrowUpRight size={14} className="text-[#402E11]/20 group-hover:text-[#C48B28] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-3">
                                                                <span className="px-3 py-1 bg-[#FAF3E0] text-[#C48B28] rounded-full text-[10px] font-black uppercase tracking-wider border border-[#EBC176]/10 shadow-sm">
                                                                    {review.provider_details?.category}
                                                                </span>
                                                                <div className="flex items-center gap-1.5 text-[#402E11]/40">
                                                                    <CalendarDays size={12} strokeWidth={2.5} />
                                                                    <p className="text-[10px] font-bold uppercase tracking-widest">{format(new Date(review.created_at), 'MMMM dd, yyyy')}</p>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-2">
                                                        {renderStars(review.rating_overall, 18)}
                                                        <span className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-[0.2em]">Rating Overall</span>
                                                    </div>
                                                </div>

                                                {/* Review Comment Section */}
                                                <div className="mt-8 relative">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#C48B28]/20 to-transparent rounded-full" />
                                                    <div className="pl-6">
                                                        <p className="text-sm font-bold text-[#402E11]/70 leading-relaxed tracking-tight italic">
                                                            "{review.review_text || review.comment}"
                                                        </p>

                                                        {/* Sub-ratings Tags */}
                                                        <div className="mt-4 flex flex-wrap gap-2">
                                                            {[
                                                                { label: 'Comm.', score: review.rating_communication },
                                                                { label: 'Clean.', score: review.rating_cleanliness },
                                                                { label: 'Quality', score: review.rating_quality },
                                                                { label: 'Value', score: review.rating_value }
                                                            ].filter(r => r.score).map((r, i) => (
                                                                <div key={i} className="px-2 py-1 bg-white border border-[#EBC176]/10 rounded-lg flex items-center gap-2 shadow-sm">
                                                                    <span className="text-[8px] font-black text-[#402E11]/30 uppercase tracking-widest">{r.label}</span>
                                                                    <span className="text-[10px] font-black text-[#C48B28]">{r.score}.0</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Provider Response Panel */}
                                                <AnimatePresence>
                                                    {review.provider_response && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="mt-8 pl-6 border-t border-[#EBC176]/5 pt-6"
                                                        >
                                                            <div className="bg-[#FAF3E0]/40 rounded-2xl p-4 border border-[#EBC176]/10 relative">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <MessageCircle size={14} className="text-[#C48B28]" />
                                                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#C48B28]">Provider Response</span>
                                                                    <span className="text-[9px] text-[#402E11]/30 font-bold">• {format(new Date(review.response_date || new Date()), 'MMM dd')}</span>
                                                                </div>
                                                                <p className="text-xs text-[#402E11]/60 font-bold leading-relaxed">
                                                                    {review.provider_response}
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        ) : (
                            <div className="bg-white rounded-[2.5rem] p-24 text-center border border-[#EBC176]/10 shadow-xl shadow-[#402E11]/5">
                                <div className="w-20 h-20 bg-[#FAF3E0] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <SearchX size={32} className="text-[#C48B28]" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl font-black text-[#402E11] tracking-tight mb-3">
                                    {searchQuery ? 'No matching reviews' : 'No history yet'}
                                </h3>
                                <p className="text-[#402E11]/40 font-bold text-sm max-w-sm mx-auto mb-8">
                                    {searchQuery ? `We couldn't find any reviews matching "${searchQuery}".` : "You haven't shared your feedback on any services yet."}
                                </p>
                                <Link to="/services">
                                    <button className="px-10 py-4 bg-[#C48B28] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#C48B28]/20 hover:scale-105 active:scale-95 transition-all">
                                        Browse recent visits
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Right Column */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Review Overview Card */}
                    <div className="bg-[#FAF3E0] rounded-[2rem] p-8 border border-[#EBC176]/30 shadow-xl shadow-[#C48B28]/10 relative overflow-hidden group">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#C48B28]/5 rounded-full blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-110" />

                        <div className="relative z-10 text-center">
                            <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.3em] mb-6 block">Overall Rating</span>
                            <h2 className="text-7xl font-black text-[#402E11] tracking-tighter mb-4">{stats.avg}</h2>
                            <div className="flex justify-center mb-6">
                                {renderStars(Math.round(parseFloat(stats.avg)), 24)}
                            </div>
                            <p className="text-xs font-bold text-[#402E11]/40 uppercase tracking-widest">Across {stats.total} total reviews</p>

                            <div className="mt-8 grid grid-cols-2 gap-3">
                                <div className="p-4 bg-white/60 rounded-2xl border border-[#EBC176]/20">
                                    <p className="text-[10px] font-black text-[#C48B28] uppercase tracking-widest mb-1.5">{stats.responded}</p>
                                    <p className="text-[8px] font-black text-[#402E11]/40 uppercase tracking-widest">Responses</p>
                                </div>
                                <div className="p-4 bg-white/60 rounded-2xl border border-[#EBC176]/20">
                                    <div className="flex items-center justify-center gap-1.5 mb-1.5">
                                        <CheckCircle2 size={12} className="text-green-500" />
                                        <p className="text-[10px] font-black text-[#402E11]">100%</p>
                                    </div>
                                    <p className="text-[8px] font-black text-[#402E11]/40 uppercase tracking-widest">Verified</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Summary Card (Shiny) */}
                    <div className="bg-gradient-to-br from-[#FDFBF7] via-white to-[#FAF3E0]/40 rounded-[2rem] p-6 border-2 border-[#EBC176]/25 shadow-xl shadow-[#C48B28]/10 relative overflow-hidden group">
                        {/* Dynamic Shine Sweep */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -skew-x-[35deg] -translate-x-full group-hover:translate-x-[250%] transition-transform duration-[2000ms] ease-in-out pointer-events-none opacity-60 z-20" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-[#C48B28]/10 rounded-lg">
                                        <BarChart3 size={14} className="text-[#C48B28]" />
                                    </div>
                                    <h3 className="text-[10px] font-black text-[#402E11] uppercase tracking-[0.2em]">Summary</h3>
                                </div>
                                <span className="text-[8px] font-black text-[#402E11]/30 uppercase tracking-[0.2em]">All Time</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-[#FAF3E0]/20 rounded-2xl border border-[#EBC176]/10 hover:bg-[#FAF3E0]/40 transition-colors group/stat">
                                    <p className="text-[8px] font-black text-[#402E11]/40 uppercase tracking-widest mb-1">Recent</p>
                                    <p className="text-[10px] font-black text-[#402E11] tracking-tight group-hover/stat:text-[#C48B28] transition-colors">{stats.recentDate}</p>
                                </div>
                                <div className="p-4 bg-[#FAF3E0]/20 rounded-2xl border border-[#EBC176]/10 hover:bg-[#FAF3E0]/40 transition-colors group/stat">
                                    <p className="text-[8px] font-black text-[#402E11]/40 uppercase tracking-widest mb-1">Impact</p>
                                    <p className="text-xl font-black text-[#402E11] tracking-tight group-hover/stat:text-[#C48B28] transition-colors">High</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pro-Tip Card */}
                    <div className="p-6 bg-white rounded-[2rem] border border-[#EBC176]/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#C48B28]/5 rounded-bl-[2rem]" />
                        <h4 className="text-[10px] font-black text-[#402E11] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#C48B28] rounded-full" />
                            Review Impact
                        </h4>
                        <p className="text-[11px] font-bold text-[#402E11]/50 leading-relaxed">
                            Provider responses show that your feedback is being heard. Reviews with detailed comments are 4x more likely to receive structured responses from clinics.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserReviewsPage;
