import React from 'react';
import { Star, ThumbsUp, ShieldCheck, Filter } from 'lucide-react';
import Card from '../../../common/Layout/Card';

const ReviewsTab = ({ provider }) => {
    // Helper to render rating bars
    const renderRatingBar = (label, score) => (
        <div className="flex items-center gap-6 mb-4">
            <span className="text-[10px] font-black text-themev2-text/40 uppercase tracking-widest w-28 shrink-0">{label}</span>
            <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden border border-[#EBC176]/10">
                <div
                    className="h-full bg-[#C48B28] rounded-full"
                    style={{ width: `${(score / 5) * 100}%` }}
                />
            </div>
            <span className="text-[11px] font-black text-themev2-text w-6 text-right">{score ? score.toFixed(1) : '-'}</span>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1200px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-6 bg-white rounded-3xl p-6 border border-[#EBC176]/20 shadow-sm shadow-[#EBC176]/5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FAF3E0] rounded-2xl flex items-center justify-center text-[#C48B28]">
                        <Star size={24} fill="currentColor" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-themev2-text tracking-tight">Client Reviews</h3>
                        <p className="text-[10px] font-black text-[#C48B28] uppercase tracking-widest mt-0.5">{provider.reviews_count} Total Reviews</p>
                    </div>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <select className="appearance-none w-full px-8 py-4 bg-[#FAF3E0] border border-[#EBC176]/20 rounded-2xl text-[10px] font-black text-[#402E11] uppercase tracking-widest cursor-pointer hover:bg-[#F2E8CF] transition-all pr-14 focus:outline-none focus:ring-0 focus:border-[#C48B28]/40">
                            <option>Most Recent</option>
                            <option>Highest Rated</option>
                            <option>Lowest Rated</option>
                        </select>
                        <Filter size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#C48B28] pointer-events-none" />
                    </div>
                    <div className="relative flex-1 sm:flex-none">
                        <select className="appearance-none w-full px-8 py-4 bg-[#FAF3E0] border border-[#EBC176]/20 rounded-2xl text-[10px] font-black text-[#402E11] uppercase tracking-widest cursor-pointer hover:bg-[#F2E8CF] transition-all pr-14 focus:outline-none focus:ring-0 focus:border-[#C48B28]/40">
                            <option>All Stars</option>
                            <option>5 Stars</option>
                            <option>4 Stars</option>
                            <option>3 Stars</option>
                        </select>
                        <Filter size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#C48B28] pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16 px-4 sm:px-0">
                {/* Rating Summary Card */}
                <div className="col-span-1 bg-white rounded-[2.5rem] p-10 border border-[#EBC176]/20 shadow-sm shadow-[#EBC176]/5 flex flex-col items-center justify-center text-center">
                    <div className="text-[120px] font-black text-themev2-text tracking-tighter leading-none mb-4">
                        {provider.avg_rating ? Number(provider.avg_rating).toFixed(1) : '0.0'}
                    </div>
                    <div className="flex gap-1.5 text-[#C48B28] mb-6">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={28} fill={i < Math.round(provider.avg_rating || 0) ? "currentColor" : "none"} strokeWidth={1.5} />
                        ))}
                    </div>
                    <p className="text-[10px] font-black text-themev2-text/30 uppercase tracking-[0.2em]">Overall Rating Score</p>
                </div>

                {/* Breakdown Column */}
                <div className="col-span-1 lg:col-span-2 bg-[#FAF3E0] rounded-[2.5rem] p-10 border border-[#EBC176]/10 flex flex-col justify-center">
                    <div className="space-y-2">
                        {renderRatingBar('Communication', provider.avg_communication || 0)}
                        {renderRatingBar('Cleanliness', provider.avg_cleanliness || 0)}
                        {renderRatingBar('Quality of Care', provider.avg_quality || 0)}
                        {renderRatingBar('Value for Money', provider.avg_value || 0)}
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-8 px-4 sm:px-0">
                {provider.reviews?.length > 0 ? provider.reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-[2.5rem] p-10 border border-[#EBC176]/20 shadow-sm shadow-[#EBC176]/5 group hover:border-[#C48B28]/30 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-8">
                            <div className="flex items-center gap-6">
                                {review.reviewer?.photoURL ? (
                                    <img
                                        src={review.reviewer.photoURL}
                                        alt={review.reviewer.first_name}
                                        className="w-16 h-16 rounded-3xl object-cover border-4 border-[#FAF3E0] shadow-sm"
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-[#FAF3E0] rounded-3xl flex items-center justify-center text-[#C48B28] font-black text-xl border-4 border-[#FAF3E0] shadow-sm uppercase">
                                        {review.reviewer?.first_name?.[0] || 'U'}
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-lg font-black text-themev2-text tracking-tight group-hover:text-[#C48B28] transition-colors">{review.reviewer?.first_name || 'Anonymous User'}</h4>
                                    <p className="text-[10px] font-black text-themev2-text/30 uppercase tracking-widest mt-1">{new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                            </div>
                            <div className="flex text-[#C48B28] gap-1 bg-[#FAF3E0] px-4 py-2 rounded-full border border-[#EBC176]/10">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={1.5} />
                                ))}
                            </div>
                        </div>

                        <p className="text-sm font-bold text-themev2-text/60 leading-relaxed uppercase tracking-widest leading-loose mb-8">
                            {review.comment}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-8 border-t border-[#FAF3E0]">
                            {review.verified_client && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-[#F0FDF4] border border-green-100 rounded-full">
                                    <ShieldCheck size={14} className="text-green-500" />
                                    <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Verified Client</span>
                                </div>
                            )}
                            <button className="flex items-center gap-2 text-[10px] font-black text-themev2-text/40 hover:text-themev2-text uppercase tracking-widest transition-colors ml-auto">
                                <ThumbsUp size={14} /> Helpful?
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="py-24 text-center bg-white rounded-[2.5rem] border border-[#EBC176]/20 border-dashed">
                        <Star size={48} className="text-[#C48B28]/10 mx-auto mb-6" />
                        <h4 className="text-base font-black text-themev2-text/40 uppercase tracking-widest">No reviews yet</h4>
                        <p className="text-[10px] font-black text-themev2-text/20 uppercase tracking-widest mt-2">Check back later once clients have shared their experience</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewsTab;
