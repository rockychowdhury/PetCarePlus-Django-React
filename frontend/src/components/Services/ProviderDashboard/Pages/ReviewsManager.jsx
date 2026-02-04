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
                <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.4em] mb-4 block">Feedback Center</span>
                <h1 className="text-4xl md:text-5xl font-black text-[#402E11] tracking-tighter mb-4">
                    Guest Reviews
                </h1>
                <p className="text-[#402E11]/60 font-bold text-sm">Monitor your performance and build trust with your clients.</p>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Overall Rating */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="lg:col-span-4 bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] border border-[#EBC176]/20 shadow-2xl shadow-[#402E11]/5 flex flex-col items-center justify-center text-center relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FAF3E0]/40 rounded-bl-[4rem] group-hover:scale-110 transition-transform" />

                    <div className="relative z-10">
                        <div className="text-6xl font-black text-[#402E11] tracking-tighter mb-4">{provider.rating || '0.0'}</div>
                        <div className="flex gap-1.5 mb-6 justify-center">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                    key={star}
                                    size={24}
                                    strokeWidth={2.5}
                                    className={`${star <= Math.round(provider.rating || 0) ? 'text-[#C48B28] fill-[#C48B28]' : 'text-[#FAF3E0]'}`}
                                />
                            ))}
                        </div>
                        <p className="text-[10px] font-black text-[#402E11]/40 uppercase tracking-[0.3em]">Overall Experience</p>
                    </div>
                </motion.div>

                {/* Rating Breakdown */}
                <div className="lg:col-span-8 bg-[#402E11] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-[#402E11]/10">
                    <div className="flex items-center gap-3 mb-8">
                        <Sparkles className="text-[#C48B28]" size={24} />
                        <h3 className="text-xl font-black tracking-tight">Performance Metrics</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {[
                            { label: 'Communication', value: provider.avg_communication || 0 },
                            { label: 'Cleanliness', value: provider.avg_cleanliness || 0 },
                            { label: 'Service Quality', value: provider.avg_quality || 0 },
                            { label: 'Value for Money', value: provider.avg_value || 0 },
                        ].map((item) => (
                            <div key={item.label} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{item.label}</span>
                                    <span className="font-black text-[#C48B28]">{item.value.toFixed(1)}</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.value / 5) * 100}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-[#C48B28] rounded-full shadow-[0_0_12px_rgba(196,139,40,0.5)]"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                    <h3 className="text-2xl font-black text-[#402E11] tracking-tight flex items-center gap-3">
                        Client Testimonials
                        <span className="px-3 py-1 bg-[#FAF3E0] text-[#C48B28] text-[10px] rounded-full border border-[#EBC176]/20">
                            {filteredReviews.length} Matches
                        </span>
                    </h3>

                    <div className="flex bg-[#FAF3E0]/50 backdrop-blur-md p-1.5 rounded-2xl border border-[#EBC176]/20">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'today', label: 'Today' },
                            { id: 'week', label: 'This Week' },
                            { id: 'month', label: 'This Month' }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setFilter(btn.id)}
                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === btn.id
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
                        <div className="bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-[#EBC176]/20 p-20 text-center flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-[#FAF3E0] flex items-center justify-center text-[#C48B28] mb-6">
                                <MessageCircle size={32} />
                            </div>
                            <h4 className="text-xl font-black text-[#402E11] mb-2 tracking-tight">No matches found</h4>
                            <p className="text-sm font-bold text-[#402E11]/40 uppercase tracking-widest">Adjust your filter to see more feedback.</p>
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
                                            <div className="w-10 h-10 bg-[#402E11] rounded-xl flex items-center justify-center text-[#C48B28] text-sm font-black shadow-md group-hover:scale-105 transition-transform duration-300">
                                                {review.reviewer?.first_name?.[0] || review.client_name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-[#402E11] text-sm leading-none mb-1.5">
                                                    {review.reviewer?.first_name || review.client_name || 'Anonymous Guest'}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-widest">{format(new Date(review.created_at), 'MMM dd, yyyy')}</span>
                                                    <div className="w-0.5 h-0.5 rounded-full bg-[#C48B28]/30" />
                                                    <div className="flex bg-[#FAF3E0] px-1.5 py-0.5 rounded-full text-[#C48B28] font-black text-[8px] uppercase tracking-widest border border-[#EBC176]/10">
                                                        {review.rating_overall || review.rating} / 5
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {!review.provider_response && (
                                            <button
                                                onClick={() => handleOpenReply(review)}
                                                className="opacity-0 group-hover:opacity-100 flex items-center gap-2 px-3 py-1.5 bg-[#402E11] text-white text-[8px] font-black uppercase tracking-widest rounded-lg hover:scale-105 transition-all"
                                            >
                                                Reply
                                            </button>
                                        )}
                                    </div>

                                    <p className="text-[#402E11]/70 text-sm font-bold italic leading-relaxed mb-4 max-w-4xl line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                                        "{review.review_text || review.comment}"
                                    </p>

                                    {/* Response Logic */}
                                    {review.provider_response && (
                                        <div className="mt-4 pt-4 border-t border-[#EBC176]/10">
                                            <div className="bg-[#FAF3E0]/30 rounded-xl p-3 border border-[#EBC176]/10">
                                                <div className="flex items-center gap-2 mb-1.5 text-[8px] font-black uppercase tracking-widest">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                    <span className="text-[#402E11]">Internal managed</span>
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
                            className="bg-white rounded-[3rem] max-w-xl w-full p-10 shadow-2xl relative z-10 border border-[#EBC176]/20"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h2 className="text-2xl font-black text-[#402E11] tracking-tight">Compose Response</h2>
                                    <p className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.3em] mt-1">Replying to {replyModal.review?.reviewer?.first_name || 'Guest'}</p>
                                </div>
                                <button onClick={handleCloseReply} className="w-10 h-10 rounded-full bg-[#FAF3E0] flex items-center justify-center text-[#C48B28] hover:bg-[#C48B28] hover:text-white transition-all">
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
                                    className="w-full bg-[#FAF3E0]/30 border border-[#EBC176]/20 rounded-[2rem] p-6 text-base font-bold text-[#402E11] focus:ring-4 focus:ring-[#C48B28]/10 focus:border-[#C48B28]/30 transition-all outline-none min-h-[160px] placeholder:text-[#402E11]/20"
                                />

                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={handleSubmitReply}
                                        disabled={submitting}
                                        className="w-full bg-[#402E11] text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-[#402E11]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {submitting ? 'Transmitting...' : (
                                            <>
                                                Post Official Response <Send size={16} />
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleCloseReply}
                                        className="w-full py-4 text-[10px] font-black text-[#402E11]/30 uppercase tracking-[0.2em] hover:text-[#C48B28] transition-colors"
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
