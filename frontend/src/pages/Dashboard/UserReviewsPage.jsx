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
        <div className="w-full p-4 md:p-12 lg:p-20 space-y-12 bg-[#FEF9ED]/30 min-h-screen pt-20 md:pt-12">
            {/* Page Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 overflow-hidden">
                <div className="animate-in slide-in-from-left duration-700">
                    <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.4em] mb-4 block">Engagement History</span>
                    <h1 className="text-3xl md:text-4xl font-black text-[#402E11] tracking-tighter mb-4">
                        My Feedback
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                        <p className="text-[#402E11]/60 font-bold text-sm">Reviewing your experiences helps the community grow.</p>
                        <span className="px-4 py-1.5 bg-white text-[#C48B28] rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-[#EBC176]/10 shadow-sm">
                            {stats.total} Published Reviews
                        </span>
                    </div>
                </div>
                <div className="relative group w-full xl:w-80">
                    <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#402E11]/20 group-focus-within:text-[#C48B28] transition-all" strokeWidth={3} />
                    <input
                        type="text"
                        placeholder="Search provider feedback..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white border border-[#EBC176]/20 rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#402E11] placeholder:text-[#402E11]/20 focus:border-[#C48B28]/40 focus:ring-4 focus:ring-[#C48B28]/5 shadow-xl shadow-[#402E11]/2 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Content - Left Column */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Filters Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#EBC176]/10 pb-10">
                        <div className="hidden md:block">
                            <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.3em] mb-2 block">Timeline</span>
                            <p className="text-[#402E11]/40 font-bold text-xs uppercase tracking-widest">Chronological records</p>
                        </div>
                        <div className="flex p-1.5 bg-white rounded-2xl border border-[#EBC176]/20 shadow-sm overflow-x-auto w-full md:w-auto no-scrollbar">
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'high', label: 'Top Rated' },
                                { id: 'low', label: 'Critical' },
                                { id: 'responded', label: 'Responded' }
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilterRating(f.id)}
                                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterRating === f.id
                                        ? 'bg-[#C48B28] text-white shadow-xl shadow-[#C48B28]/20'
                                        : 'text-[#402E11]/40 hover:text-[#C48B28] hover:bg-[#FAF3E0]/30'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-32 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-[#EBC176]/10">
                                <div className="w-12 h-12 rounded-full border-4 border-[#FAF3E0] border-t-[#C48B28] animate-spin mb-6" />
                                <p className="text-[10px] font-black text-[#C48B28] uppercase tracking-widest">Retrieving history...</p>
                            </div>
                        ) : reviews.length > 0 ? (
                            <AnimatePresence mode="popLayout">
                                {reviews.map((review, idx) => (
                                    <motion.div
                                        key={review.id}
                                        layout
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 100,
                                            damping: 20,
                                            delay: idx * 0.05
                                        }}
                                    >
                                        <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-[#EBC176]/10 hover:shadow-2xl hover:shadow-[#402E11]/10 transition-all group overflow-hidden relative">
                                            {/* Decorative Quote Background */}
                                            <Quote size={140} className="absolute -bottom-8 -right-8 text-[#C48B28]/5 -rotate-12 pointer-events-none transition-transform group-hover:rotate-0 duration-1000" strokeWidth={0.5} />

                                            <div className="relative z-10">
                                                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                                                    <div className="flex gap-6 flex-1 w-full">
                                                        {/* Provider Avatar/Icon */}
                                                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-[2rem] bg-[#FAF3E0] border-2 border-[#EBC176]/20 flex items-center justify-center text-[#C48B28] shrink-0 overflow-hidden relative shadow-lg shadow-[#402E11]/5 group-hover:rotate-3 transition-all duration-500">
                                                            <span className="text-2xl font-black">{review.provider_details?.business_name?.charAt(0)}</span>
                                                            <div className="absolute inset-0 bg-gradient-to-tr from-[#C48B28]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <Link
                                                                to={`/services/provider/${review.provider}`}
                                                                className="inline-flex items-center gap-3 mb-2 group/link"
                                                            >
                                                                <h4 className="text-xl md:text-2xl font-black text-[#402E11] tracking-tight group-hover/link:text-[#C48B28] transition-colors truncate max-w-[200px] md:max-w-none">
                                                                    {review.provider_details?.business_name}
                                                                </h4>
                                                                <ArrowUpRight size={16} className="text-[#402E11]/20 group-hover/link:text-[#C48B28] transition-all shrink-0" strokeWidth={3} />
                                                            </Link>
                                                            <div className="flex flex-wrap items-center gap-3">
                                                                <span className="px-3 py-1 bg-[#FAF3E0] text-[#C48B28] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#EBC176]/20 shadow-sm">
                                                                    {review.provider_details?.category}
                                                                </span>
                                                                <div className="flex items-center gap-2 text-[#402E11]/30">
                                                                    <CalendarDays size={12} strokeWidth={3} />
                                                                    <p className="text-[9px] font-black uppercase tracking-[0.1em]">{format(new Date(review.created_at), 'MMM dd, yyyy')}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto border-t md:border-t-0 border-[#EBC176]/10 pt-4 md:pt-0">
                                                        {renderStars(review.rating_overall, 20)}
                                                        <span className="text-[10px] font-black text-[#402E11]/20 uppercase tracking-[0.2em]">Overall Score</span>
                                                    </div>
                                                </div>

                                                {/* Review Comment Section */}
                                                <div className="mt-10 relative">
                                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#C48B28]/20 to-transparent rounded-full" />
                                                    <div className="pl-8">
                                                        <p className="text-base md:text-lg font-bold text-[#402E11]/80 leading-relaxed tracking-tight italic">
                                                            "{review.review_text || review.comment}"
                                                        </p>

                                                        {/* Sub-ratings Tags */}
                                                        <div className="mt-6 flex flex-wrap gap-3">
                                                            {[
                                                                { label: 'Comm.', score: review.rating_communication },
                                                                { label: 'Clean.', score: review.rating_cleanliness },
                                                                { label: 'Quality', score: review.rating_quality },
                                                                { label: 'Value', score: review.rating_value }
                                                            ].filter(r => r.score).map((r, i) => (
                                                                <div key={i} className="px-3 py-1.5 bg-[#FAF3E0]/30 border border-[#EBC176]/10 rounded-xl flex items-center gap-2.5 shadow-sm hover:bg-[#FAF3E0]/50 transition-colors">
                                                                    <span className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-widest leading-none">{r.label}</span>
                                                                    <span className="text-xs font-black text-[#C48B28] leading-none">{r.score}.0</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Provider Response Panel */}
                                                <AnimatePresence>
                                                    {review.provider_response && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="mt-10 pl-8 border-t border-[#EBC176]/10 pt-10"
                                                        >
                                                            <div className="bg-[#402E11] rounded-3xl p-6 md:p-8 relative shadow-2xl shadow-black/10 overflow-hidden">
                                                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-xl bg-[#C48B28]/20 flex items-center justify-center text-[#C48B28]">
                                                                            <MessageCircle size={16} strokeWidth={3} />
                                                                        </div>
                                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#EBC176]">Management Response</span>
                                                                    </div>
                                                                    <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">{format(new Date(review.response_date || new Date()), 'MMMM dd')}</span>
                                                                </div>
                                                                <p className="text-sm text-white/80 font-bold leading-relaxed relative z-10">
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
                            <div className="bg-white rounded-[3rem] p-16 md:p-24 text-center border-2 border-dashed border-[#EBC176]/20 shadow-xl shadow-[#402E11]/5">
                                <div className="w-24 h-24 bg-[#FAF3E0] rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-[#EBC176]/10 rotate-12">
                                    <SearchX size={40} className="text-[#C48B28]/40" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black text-[#402E11] tracking-tighter mb-4">
                                    {searchQuery ? 'No matching records' : 'Awaiting first record'}
                                </h3>
                                <p className="text-[#402E11]/40 font-bold text-sm max-w-sm mx-auto mb-10 uppercase tracking-wide leading-relaxed">
                                    {searchQuery ? `We couldn't locate any feedback regarding "${searchQuery}" in your history.` : "Your engagement history is currently empty. Start your journey by reviewing a service."}
                                </p>
                                <Link to="/services">
                                    <button className="px-12 py-5 bg-[#C48B28] text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-[#C48B28]/20 hover:scale-105 active:scale-95 transition-all outline-none">
                                        Browse Active Services
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Right Column */}
                <div className="lg:col-span-4 space-y-10">
                    {/* Performance Overview Card */}
                    <div className="bg-[#FAF3E0] rounded-[3rem] p-10 border-2 border-[#EBC176]/40 shadow-2xl shadow-[#C48B28]/10 relative overflow-hidden group">
                        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#C48B28]/10 rounded-full blur-3xl pointer-events-none transition-transform duration-1000 group-hover:scale-125" />

                        <div className="relative z-10 text-center">
                            <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.4em] mb-8 block underline decoration-[#C48B28]/20 underline-offset-8">Scoreboard Index</span>
                            <div className="relative inline-block mb-6">
                                <h2 className="text-8xl font-black text-[#402E11] tracking-tighter leading-none">{stats.avg}</h2>
                                <div className="absolute -top-4 -right-8 px-2.5 py-1 bg-[#C48B28] text-white rounded-lg text-[10px] font-black shadow-lg">AVG</div>
                            </div>
                            <div className="flex justify-center mb-8">
                                {renderStars(Math.round(parseFloat(stats.avg)), 28)}
                            </div>
                            <p className="text-[10px] font-black text-[#402E11]/30 uppercase tracking-[0.3em] mb-10">Aggregated Community Impact</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-white rounded-3xl border border-[#EBC176]/20 shadow-sm group-hover:translate-y-[-4px] transition-transform">
                                    <p className="text-2xl font-black text-[#C48B28] mb-1">{stats.responded}</p>
                                    <p className="text-[8px] font-black text-[#402E11]/40 uppercase tracking-widest">Responses</p>
                                </div>
                                <div className="p-5 bg-white rounded-3xl border border-[#EBC176]/20 shadow-sm group-hover:translate-y-[-4px] transition-transform delay-75">
                                    <div className="flex items-center justify-center gap-1.5 mb-1">
                                        <CheckCircle2 size={12} className="text-green-500" strokeWidth={4} />
                                        <p className="text-lg font-black text-[#402E11]">100%</p>
                                    </div>
                                    <p className="text-[8px] font-black text-[#402E11]/40 uppercase tracking-widest">Verified</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Meta Snapshot Card */}
                    <div className="bg-white rounded-[2.5rem] p-10 border border-[#EBC176]/20 shadow-xl shadow-[#C48B28]/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#FAF3E0]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-[#C48B28]/10 rounded-2xl shadow-sm">
                                    <BarChart3 size={18} className="text-[#C48B28]" strokeWidth={3} />
                                </div>
                                <h3 className="text-[10px] font-black text-[#402E11] uppercase tracking-[0.2em]">Metadata</h3>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>

                        <div className="space-y-4">
                            <div className="p-6 bg-[#FAF3E0]/20 rounded-2xl border border-[#EBC176]/10 hover:bg-[#FAF3E0]/40 transition-all group/stat cursor-default">
                                <p className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-[0.2em] mb-2">Most Recent Entry</p>
                                <p className="text-sm font-black text-[#402E11] tracking-tight group-hover/stat:text-[#C48B28] transition-colors">{stats.recentDate}</p>
                            </div>
                            <div className="p-6 bg-[#FAF3E0]/20 rounded-2xl border border-[#EBC176]/10 hover:bg-[#FAF3E0]/40 transition-all group/stat cursor-default">
                                <p className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-[0.2em] mb-2">Social Contribution</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-black text-[#402E11] tracking-tight group-hover/stat:text-[#C48B28] transition-colors">Tier 1</p>
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[8px] font-black rounded uppercase">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Policy Card */}
                    <div className="p-8 bg-[#402E11] rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8" />
                        <h4 className="text-[10px] font-black text-[#EBC176] uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-[#C48B28] rounded-full animate-ping" />
                            Guide Lines
                        </h4>
                        <p className="text-[12px] font-bold text-white/50 leading-relaxed italic">
                            Detailed feedback helps clinics optimize their care models. Professional responses are prioritized for members with high-quality contribution scores.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserReviewsPage;
