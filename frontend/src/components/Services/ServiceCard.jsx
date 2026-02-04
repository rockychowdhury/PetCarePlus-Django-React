import React from 'react';
import { Link } from 'react-router-dom';
import {
    MapPin,
    Star,
    ShieldCheck,
    Heart,
    Stethoscope,
    Home,
    GraduationCap,
    Scissors,
    Armchair,
    Clock,
    CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

const ServiceCard = ({ provider, viewMode = 'grid' }) => {
    // -------------------------------------------------------------------------
    // 1. Data Parsing
    // -------------------------------------------------------------------------
    const {
        business_name,
        avg_rating,
        reviews_count,
        address,
        media,
        category,
        service_specific_details,
        user
    } = provider;

    const rating = parseFloat(avg_rating || 0).toFixed(1);
    const reviewCount = reviews_count || 0;

    const displayCity = address?.city || provider.city || 'Location';
    const displayState = address?.state || provider.state || '';
    const locationLabel = displayState ? `${displayCity}, ${displayState}` : displayCity;

    // Service Type Config & Styling
    let TypeIcon = Stethoscope;
    let typeLabel = category?.name || 'Service';
    let headerColor = 'bg-[#EBC176]'; // Default V2 surface color
    let headerLabel = 'PetCircle Service';

    // Tags aggregation
    const tags = [];
    let priceDisplay = '';
    let pricingUnit = '';
    let secondaryBadge = null;

    const details = service_specific_details || {};

    if (category?.slug === 'veterinary') {
        TypeIcon = Stethoscope;
        typeLabel = 'Veterinary';
        headerColor = 'bg-[#D4A056]';
        headerLabel = 'PetCircle Vet';
        secondaryBadge = "24/7 emergency";
        if (details.clinic_type) tags.push(details.clinic_type.replace('_', ' '));
        if (details.emergency_services) tags.push('Emergency');
        if (details.base_price) {
            priceDisplay = `$${Math.round(details.base_price)}`;
            pricingUnit = '/ visit';
        }
    } else if (category?.slug === 'training') {
        TypeIcon = GraduationCap;
        typeLabel = 'Pet Trainer';
        headerColor = 'bg-[#EBC176]';
        headerLabel = 'PetCircle Trainer';
        secondaryBadge = "Flexible hours";
        if (details.primary_method) tags.push(details.primary_method.replace('_', ' '));
        if (details.offers_group_classes) tags.push('Group classes');
        if (details.offers_board_and_train) tags.push('Board & train');
        if (details.private_session_rate) {
            priceDisplay = `$${Math.round(details.private_session_rate)}`;
            pricingUnit = '/ hour';
        }
    } else if (category?.slug === 'foster' || category?.slug === 'pet_sitting') {
        TypeIcon = Home;
        typeLabel = category?.slug === 'foster' ? 'Foster home' : 'Pet sitter';
        headerColor = 'bg-[#8B5E34]'; // Darker earthy brown
        headerLabel = 'PetCare+ Home';
        secondaryBadge = "Verified host";
        if (details.current_availability === 'available') tags.push('Available now');
        if (details.capacity) tags.push(`Up to ${details.capacity} pets`);
        tags.push('Daily photo updates');

        const rate = details.daily_rate || details.house_sitting_rate || details.walking_rate;
        if (rate) {
            priceDisplay = `$${Math.round(rate)}`;
            pricingUnit = category?.slug === 'foster' ? '/ day' : '/ service';
        }
    } else if (category?.slug === 'grooming') {
        TypeIcon = Scissors;
        typeLabel = 'Grooming';
        headerColor = 'bg-[#C48B28]';
        headerLabel = 'PetCircle Grooming';
        secondaryBadge = "Certified expert";
        if (details.salon_type) tags.push(details.salon_type);
        if (details.base_price) {
            priceDisplay = `$${Math.round(details.base_price)}`;
            pricingUnit = 'starts at';
        }
    }

    // fallback for pricing if still empty
    if (!priceDisplay) {
        priceDisplay = 'Quote';
        pricingUnit = 'required';
    }

    // Avatar/Logo/Media
    const userPhoto = user?.photoURL || (media?.[0]?.file_url);
    const coverImage = media?.[0]?.file_url;

    // -------------------------------------------------------------------------
    // 2. Render
    // -------------------------------------------------------------------------
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`group bg-white rounded-[2.5rem] border border-[#EBC176]/20 overflow-hidden hover:shadow-2xl hover:shadow-[#EBC176]/10 transition-all duration-300 flex flex-col h-full ${viewMode === 'list' ? 'md:flex-row' : ''}`}
        >
            {/* Header / Brand Area */}
            <div className={`relative ${headerColor} flex items-center justify-center overflow-hidden transition-colors duration-500 ${viewMode === 'list' ? 'w-full md:w-80 h-48 md:h-full' : 'h-36'}`}>
                {/* Image Overlay */}
                {coverImage ? (
                    <img
                        src={coverImage}
                        alt={business_name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }}></div>
                )}

                {/* Subtle Gradient for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Favorite Button */}
                <button className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-red-500 transition-all active:scale-90 border border-white/20 shadow-sm z-20">
                    <Heart size={18} fill="currentColor" className="fill-transparent hover:fill-current transition-all" />
                </button>
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-1 relative bg-white">
                {/* Meta Badges */}
                <div className="flex items-center gap-1.5 mb-3">
                    <span className="px-2 py-0.5 bg-[#FDF8F3] border border-[#EBC176]/30 text-[#C48B28] text-[9px] font-black uppercase tracking-wider rounded-full shadow-sm">
                        {typeLabel}
                    </span>
                    {secondaryBadge && (
                        <span className="px-2 py-0.5 bg-[#FDF8F3] border border-[#EBC176]/30 text-themev2-text/60 text-[9px] font-black uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1">
                            {secondaryBadge}
                        </span>
                    )}
                </div>

                {/* Name & Basic Info */}
                <div className="mb-3">
                    <Link to={`/services/${provider.id}`} className="block group/link">
                        <h3 className="text-sm font-black text-themev2-text tracking-tight group-hover/link:text-[#C48B28] transition-colors leading-tight mb-1">
                            {business_name}
                        </h3>
                    </Link>

                    <div className="flex items-center gap-3">
                        {/* Rating */}
                        <div className="flex items-center gap-1.5 bg-[#FAF3E0]/40 px-2 py-0.5 rounded-lg border border-[#EBC176]/10">
                            <Star size={14} fill="#C48B28" className="text-[#C48B28]" />
                            <span className="text-sm font-black text-themev2-text">{rating}</span>
                            <span className="text-xs text-themev2-text/50 font-bold">({reviewCount} reviews)</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-themev2-text/30 mt-1">
                        <MapPin size={10} strokeWidth={2.5} className="text-[#C48B28]/40" />
                        <span className="text-[10px] font-bold">{locationLabel}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4 items-start align-top min-h-[36px]">
                    {tags.slice(0, 3).map((tag, idx) => (
                        <span
                            key={idx}
                            className="px-2.5 py-1 bg-[#FDF8F3]/50 border border-[#EBC176]/20 rounded-md text-[10px] font-bold text-themev2-text/60 shadow-sm whitespace-nowrap hover:bg-[#FDF8F3] transition-colors cursor-default"
                        >
                            {tag}
                        </span>
                    ))}
                    {tags.length > 3 && (
                        <span className="text-[10px] font-bold text-themev2-text/30 ml-1 py-1">+{tags.length - 3} more</span>
                    )}
                </div>

                {/* Footer / Pricing & CTA */}
                <div className="mt-auto pt-6 border-t border-[#EBC176]/10 flex items-center justify-between">
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-themev2-text tracking-tight">{priceDisplay}</span>
                            <span className="text-[10px] font-black text-themev2-text/40 uppercase tracking-widest">{pricingUnit}</span>
                        </div>
                    </div>

                    <Link
                        to={`/services/${provider.id}`}
                        className="px-6 py-2.5 bg-[#D4A056] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#C48B28] transition-all shadow-md shadow-[#D4A056]/10 active:scale-95"
                    >
                        Details
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default React.memo(ServiceCard);
