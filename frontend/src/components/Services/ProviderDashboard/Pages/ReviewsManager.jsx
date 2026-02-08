import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Star, MessageCircle, Filter, X, Sparkles, Quote, ThumbsUp, Send } from 'lucide-react';
import { format, isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Card from '../../../../components/common/Layout/Card';
import useServices from '../../../../hooks/useServices';
import useAPI from '../../../../hooks/useAPI';

const ReviewsManager = () => {
    const { provider } = useOutletContext();
    const { useRespondToReview } = useServices();
    const respondMutation = useRespondToReview();

    const [replyModal, setReplyModal] = useState({ isOpen: false, review: null });
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState('all');

    const reviews = provider.reviews || [];

    const filteredReviews = reviews.filter(review => {
        const date = parseISO(review.created_at);
        if (filter === 'today') return isToday(date);
        if (filter === 'week') return isThisWeek(date);
        if (filter === 'month') return isThisMonth(date);
        return true;
    });

    const handleOpenReply = (review) => {
        setReplyModal({ isOpen: true, review });
        setReplyText('');
    };

    const handleCloseReply = () => {
        setReplyModal({ isOpen: false, review: null });
        setReplyText('');
    };

    const handleSubmitReply = async () => {
        if (!replyText.trim()) {
            toast.error('Please enter a response');
            return;
        }

        setSubmitting(true);
        try {
            await respondMutation.mutateAsync({
                providerId: provider.id,
                reviewId: replyModal.review.id,
                response: replyText
            });
            toast.success('Response posted successfully');
            handleCloseReply();
        } catch (error) {
            console.error(error);
            toast.error('Failed to post response');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.4em] mb-2 sm:mb-4 block">Feedback Center</span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#402E11] tracking-tighter mb-2 sm:mb-4">
                    Guest Reviews
                </h1>
                <p className="text-[#402E11]/60 font-bold text-xs sm:text-sm">Monitor your performance and build trust with your clients.</p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Reviews List */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                        <h3 className="text-2xl font-black text-[#402E11] tracking-tight flex items-center gap-3">
                            Testimonials
                            <span className="px-3 py-1 bg-[#FAF3E0] text-[#C48B28] text-[10px] rounded-full border border-[#EBC176]/20">
                                {filteredReviews.length}
                            </span>
                        </h3>

                        <div className="flex bg-[#FAF3E0]/50 backdrop-blur-md p-1.5 rounded-2xl border border-[#EBC176]/20 overflow-x-auto no-scrollbar flex-nowrap shrink-0">
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'today', label: 'Today' },
                                { id: 'week', label: 'Week' },
                                { id: 'month', label: 'Month' }
                            ].map((btn) => (
                                <button
                                    key={btn.id}
                                    onClick={() => setFilter(btn.id)}
                                    className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === btn.id
                                        ? 'bg-[#402E11] text-white shadow-lg'
                                        : 'text-[#402E11]/40 hover:text-[#402E11]'
                                        }`}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {filteredReviews.length === 0 ? (
                            <div className="bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-[#EBC176]/20 py-24 text-center flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-[#FAF3E0] flex items-center justify-center text-[#C48B28] mb-6">
                                    <MessageCircle size={28} />
                                </div>
                                <h4 className="text-lg font-black text-[#402E11] mb-2 tracking-tight">No matches found</h4>
                                <p className="text-[10px] font-bold text-[#402E11]/40 uppercase tracking-widest">Adjust your search parameters.</p>
                            </div>
                        ) : (
                            filteredReviews.map((review, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={review.id}
                                    className="group bg-white/80 backdrop-blur-xl rounded-[1.5rem] p-6 border border-[#EBC176]/20 shadow-lg shadow-[#402E11]/5 hover:shadow-xl hover:border-[#C48B28]/30 transition-all duration-300 relative overflow-hidden"
                                >
                                    <Quote className="absolute -top-2 -right-2 text-[#FAF3E0]/30 group-hover:text-[#C48B28]/5 transition-colors pointer-events-none" size={100} />

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start gap-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#402E11] rounded-xl flex items-center justify-center text-[#C48B28] text-sm font-black shadow-md">
                                                    {review.reviewer?.first_name?.[0] || review.client_name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-[#402E11] text-sm leading-none mb-1.5">
                                                        {review.reviewer?.first_name || review.client_name || 'Anonymous Guest'}
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-widest">{format(new Date(review.created_at), 'MMM dd, yyyy')}</span>
                                                        <div className="w-1 h-1 rounded-full bg-[#C48B28]/20" />
                                                        <div className="flex items-center gap-1">
                                                            <Star size={10} className="text-[#C48B28] fill-[#C48B28]" />
                                                            <span className="text-[#C48B28] font-black text-[9px]">{review.rating_overall || review.rating}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {!review.provider_response && (
                                                <button
                                                    onClick={() => handleOpenReply(review)}
                                                    className="opacity-0 group-hover:opacity-100 flex items-center gap-2 px-3 py-1.5 bg-[#402E11] text-white text-[8px] font-black uppercase tracking-widest rounded-lg hover:scale-105 transition-all shadow-lg shadow-[#402E11]/20"
                                                >
                                                    Reply
                                                </button>
                                            )}
                                        </div>

                                        <p className="text-[#402E11]/70 text-sm font-bold italic leading-relaxed mb-4 max-w-4xl line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                                            "{review.review_text || review.comment}"
                                        </p>

                                        {review.provider_response && (
                                            <div className="mt-4 pt-4 border-t border-[#EBC176]/10">
                                                <div className="bg-[#FAF3E0]/30 rounded-xl p-3 border border-[#EBC176]/10">
                                                    <div className="flex items-center gap-2 mb-1.5 text-[8px] font-black uppercase tracking-widest">
                                                        <Sparkles size={10} className="text-[#C48B28]" />
                                                        <span className="text-[#402E11]">Your Response</span>
                                                        <span className="text-[#402E11]/30 ml-auto">{format(new Date(review.response_date), 'MMM dd')}</span>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-[#402E11]/60 leading-relaxed italic">{review.provider_response}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Cards & Stats */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Rating Snapshot Card */}
                    <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] border border-[#EBC176]/20 shadow-xl shadow-[#402E11]/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#FAF3E0]/40 rounded-bl-[3rem] group-hover:scale-110 transition-transform" />
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="text-5xl font-black text-[#402E11] tracking-tighter mb-2">{provider.avg_rating?.toFixed(1) || '0.0'}</div>
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                        key={star}
                                        size={18}
                                        strokeWidth={2.5}
                                        className={`${star <= Math.round(provider.avg_rating || 0) ? 'text-[#C48B28] fill-[#C48B28]' : 'text-[#FAF3E0]'}`}
                                    />
                                ))}
                            </div>
                            <div className="px-4 py-1 bg-[#402E11] text-[#C48B28] text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
                                {provider.reviews_count > 0 ? 'Rated Provider' : 'New Provider'}
                            </div>
                        </div>
                    </div>

                    {/* Performance Breakdown Card */}
                    <div className="bg-[#402E11] rounded-[2rem] p-8 text-white shadow-xl shadow-[#402E11]/10">
                        <div className="flex items-center gap-2 mb-8">
                            <Sparkles className="text-[#C48B28]" size={18} />
                            <h3 className="text-base font-black tracking-tight uppercase tracking-widest">Category Scores</h3>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: 'Communication', value: provider.avg_communication || 0 },
                                { label: 'Cleanliness', value: provider.avg_cleanliness || 0 },
                                { label: 'Service Quality', value: provider.avg_quality || 0 },
                                { label: 'Service Value', value: provider.avg_value || 0 },
                            ].map((item) => (
                                <div key={item.label} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-white/40">{item.label}</span>
                                        <span className="font-black text-[#C48B28] text-xs">{item.value.toFixed(1)}</span>
                                    </div>
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(item.value / 5) * 100}%` }}
                                            className="h-full bg-[#C48B28] rounded-full"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats Card */}
                    <div className="bg-[#FAF3E0]/50 backdrop-blur-md p-8 rounded-[2rem] border border-[#EBC176]/30">
                        <h3 className="text-xs font-black text-[#402E11] uppercase tracking-widest mb-6 border-b border-[#EBC176]/20 pb-4">Monthly Insights</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#C48B28] shadow-sm">
                                        <ThumbsUp size={14} />
                                    </div>
                                    <span className="text-[10px] font-bold text-[#402E11]/60">Trust Score</span>
                                </div>
                                <span className="text-sm font-black text-[#402E11]">
                                    {provider.avg_rating ? `${Math.round((provider.avg_rating / 5) * 100)}%` : 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#C48B28] shadow-sm">
                                        <Sparkles size={14} />
                                    </div>
                                    <span className="text-[10px] font-bold text-[#402E11]/60">Verification</span>
                                </div>
                                <span className="text-sm font-black text-[#402E11]">
                                    {provider.is_verified ? 'Verified' : 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reply Modal */}
            <AnimatePresence>
                {replyModal.isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#402E11]/40 backdrop-blur-xl"
                            onClick={handleCloseReply}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl sm:rounded-[3rem] max-w-xl w-full p-6 sm:p-10 shadow-2xl relative z-10 border border-[#EBC176]/20 overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-6 sm:mb-10">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-[#402E11] tracking-tight">Compose Response</h2>
                                    <p className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.3em] mt-1">Replying to {replyModal.review?.reviewer?.first_name || 'Guest'}</p>
                                </div>
                                <button onClick={handleCloseReply} className="w-10 h-10 rounded-full bg-[#FAF3E0] flex items-center justify-center text-[#C48B28] hover:bg-[#C48B28] hover:text-white transition-all shrink-0 ml-4">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mb-8 p-6 bg-[#FEF9ED] rounded-[2rem] border border-[#EBC176]/20 italic text-sm font-bold text-[#402E11]/40 leading-relaxed relative">
                                <Quote size={20} className="absolute -top-3 -left-1 text-[#C48B28]/20" />
                                "{replyModal.review?.review_text || replyModal.review?.comment}"
                            </div>

                            <div className="space-y-6">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your message of appreciation..."
                                    className="w-full bg-[#FAF3E0]/30 border border-[#EBC176]/20 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 text-sm sm:text-base font-bold text-[#402E11] focus:ring-4 focus:ring-[#C48B28]/10 focus:border-[#C48B28]/30 transition-all outline-none min-h-[140px] sm:min-h-[160px] placeholder:text-[#402E11]/20"
                                />

                                <div className="flex flex-col gap-3 sm:gap-4">
                                    <button
                                        onClick={handleSubmitReply}
                                        disabled={submitting}
                                        className="w-full bg-[#402E11] text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-[#402E11]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {submitting ? 'Transmitting...' : (
                                            <>
                                                Post Official Response <Send size={16} />
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleCloseReply}
                                        className="w-full py-3 sm:py-4 text-[9px] sm:text-[10px] font-black text-[#402E11]/30 uppercase tracking-[0.2em] hover:text-[#C48B28] transition-colors"
                                    >
                                        Discard Draft
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReviewsManager;
