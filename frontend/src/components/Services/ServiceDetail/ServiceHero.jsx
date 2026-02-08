import React from 'react';
import { Star, Share2, Heart, MessageCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ServiceHero = ({ provider, onBook, onContact, onShare, onFavorite, isFavorite }) => {
    const navigate = useNavigate();

    // Determine type based on category
    const serviceType = provider.category?.name || 'Service Provider';

    // Calculate starting price string
    const details = provider.service_specific_details || {};
    let priceString = "";
    if (details.daily_rate) priceString = `From $${details.daily_rate}`;
    else if (details.private_session_rate) priceString = `From $${details.private_session_rate}`;
    else if (details.base_price) priceString = `From $${details.base_price}`;
    else if (details.walking_rate) priceString = `From $${details.walking_rate}`;

    return (
        <div className="w-full bg-[#FEF9ED] pt-8 md:pt-12 pb-6 md:pb-8">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                {/* Back Link */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-themev2-text/40 hover:text-themev2-text mb-8 transition-colors text-[10px] font-black uppercase tracking-widest outline-none"
                    id="back-to-search"
                >
                    <ArrowLeft size={14} /> Back to Search
                </button>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    {/* Left: Provider Brief */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 sm:gap-4 mb-3 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-themev2-text tracking-tighter leading-tight" id="provider-name">
                                {provider.business_name}
                            </h1>
                            {provider.is_verified && (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-[#EBC176]/30 shadow-sm" id="verified-badge">
                                    <ShieldCheck size={12} className="text-[#C48B28]" />
                                    <span className="text-[9px] font-black text-[#C48B28] uppercase tracking-widest">Verified</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-black uppercase tracking-widest text-themev2-text/40">
                            <span className="text-[#C48B28]">{serviceType}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EBC176]/30" />
                            <div className="flex items-center gap-1.5">
                                <Star size={14} className="text-[#C48B28]" fill="currentColor" />
                                <span className="text-themev2-text">
                                    {provider.avg_rating ? Number(provider.avg_rating).toFixed(1) : 'New'}
                                </span>
                                <span className="lowercase font-bold">({provider.reviews_count} reviews)</span>
                            </div>
                            {priceString && (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#EBC176]/30" />
                                    <span>{priceString}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                onClick={onFavorite}
                                id="toggle-favorite"
                                className={`flex-1 sm:flex-none p-3.5 sm:p-4 rounded-2xl bg-white border transition-all shadow-sm active:scale-95 flex items-center justify-center ${isFavorite ? 'border-red-500/20 text-red-500 bg-red-50/30' : 'border-[#EBC176]/20 text-themev2-text/40 hover:text-themev2-text'}`}
                            >
                                <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                            </button>

                            <button
                                onClick={onShare}
                                id="share-button"
                                className="flex-1 sm:flex-none p-3.5 sm:p-4 rounded-2xl bg-white border border-[#EBC176]/20 text-themev2-text/40 hover:text-themev2-text transition-all shadow-sm active:scale-95 flex items-center justify-center"
                            >
                                <Share2 size={20} />
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                            <button
                                onClick={() => {
                                    if (provider.phone) {
                                        const phone = provider.phone.replace(/\D/g, '');
                                        window.open(`https://wa.me/${phone}`, '_blank');
                                    } else {
                                        onContact();
                                    }
                                }}
                                id="whatsapp-contact"
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 bg-[#22C55E] border border-green-500/10 rounded-full text-[10px] sm:text-[11px] font-black text-white uppercase tracking-widest hover:bg-[#1BA94C] transition-all shadow-lg shadow-green-500/10 active:scale-95 sm:min-w-[160px]"
                            >
                                <MessageCircle size={18} className="text-white" />
                                WhatsApp
                            </button>

                            <button
                                onClick={onBook}
                                id="book-now"
                                className="w-full sm:w-auto px-6 sm:px-10 py-3.5 sm:py-4 bg-[#C48B28] text-white rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#C48B28]/20 hover:bg-[#A6751F] transition-all active:scale-95 sm:min-w-[160px]"
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceHero;
