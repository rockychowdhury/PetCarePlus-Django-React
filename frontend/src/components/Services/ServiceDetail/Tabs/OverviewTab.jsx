import React from 'react';
import { MapPin, Phone, Mail, Globe, Clock, ArrowRight, Star, CheckCircle, Info, ShieldCheck, Award, Building2, Scissors, GraduationCap, Car, PawPrint, DollarSign, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../../../common/Layout/Card';
import Badge from '../../../common/Feedback/Badge';
import Button from '../../../common/Buttons/Button';
import ServiceLocationMap from '../ServiceLocationMap';

const OverviewTab = ({ provider, onViewMap, onReadReviews }) => {

    // Dynamic Key Info Logic
    const renderKeyInfo = () => {
        if (!provider) return null;

        const details = provider.service_specific_details || {};
        const slug = provider.category?.slug;

        const isFoster = slug === 'foster-care';
        const isTrainer = slug === 'training';
        const isVet = slug === 'veterinary';
        const isGroomer = slug === 'grooming';
        const isSitter = slug === 'pet-sitting';

        // service_specific_details IS the nested object (foster_details, trainer_details, etc.)
        // No need for double nesting

        const items = [];

        // 1. Capacity / Type / Experience
        if (isFoster) items.push({ label: 'Capacity', value: `${details.current_count || 0} / ${details.capacity || 0} animals`, icon: PawPrint });
        if (isTrainer) items.push({ label: 'Experience', value: `${details.years_experience || 0} Years`, icon: GraduationCap });
        if (isVet) items.push({ label: 'Clinic Type', value: details.clinic_type || 'General', icon: Building2 });
        if (isGroomer) items.push({ label: 'Salon Type', value: details.salon_type || 'Salon', icon: Scissors });
        if (isSitter) items.push({ label: 'Experience', value: `${details.years_experience || 0} Years`, icon: Award });

        // 2. Species / Focus
        const speciesList = details.species_accepted || details.species_trained || details.species_treated || [];
        const species = speciesList.slice(0, 3).map(s => s.name).join(', ');
        if (species) items.push({ label: 'Species Accepted', value: species, icon: PawPrint });

        // 3. Environment / Specialties
        if (isFoster && details.environment_details) {
            const envType = details.environment_details.indoor_space ? 'Indoor + Outdoor' : 'Home Environment';
            items.push({ label: 'Environment', value: envType, icon: Building2 });
        }
        if (isTrainer && details.specializations?.[0]) items.push({ label: 'Specialty', value: details.specializations[0].name, icon: Star });
        if (isSitter) items.push({ label: 'Transport', value: details.has_transport ? 'Provided' : 'Not Provided', icon: Car });

        // 4. Rate
        if (isFoster && details.daily_rate) items.push({ label: 'Daily Rate', value: `$${details.daily_rate} / night`, icon: DollarSign });
        if (isTrainer && details.private_session_rate) items.push({ label: 'Session Rate', value: `$${details.private_session_rate} / hr`, icon: DollarSign });
        if (isGroomer && details.base_price) items.push({ label: 'Starting Rate', value: `$${details.base_price}`, icon: DollarSign });
        if (isSitter && details.walking_rate) items.push({ label: 'Walk Rate', value: `$${details.walking_rate} / walk`, icon: DollarSign });

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                {items.map((item, idx) => (
                    <div key={idx} className="bg-[#FAF3E0] rounded-2xl p-6 flex items-start gap-4 border border-[#EBC176]/10">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#C48B28] shadow-sm shrink-0">
                            <item.icon size={22} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-widest">{item.label}</span>
                            <span className="text-base font-black text-themev2-text tracking-tight">{item.value}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* --- MAIN COLUMN --- */}
                <div className="lg:col-span-2 space-y-12">

                    {/* Key Info Section */}
                    <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-[#EBC176]/20 shadow-sm shadow-[#EBC176]/5">
                        <h3 className="text-[11px] font-black text-[#C48B28] uppercase tracking-[0.2em] mb-8">Key Information</h3>
                        {renderKeyInfo()}
                    </div>

                    {/* About Section */}
                    <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-[#EBC176]/20 shadow-sm shadow-[#EBC176]/5">
                        <h3 className="text-[11px] font-black text-[#C48B28] uppercase tracking-[0.2em] mb-8">About {provider.business_name}</h3>
                        <p className="text-sm font-bold text-themev2-text/60 leading-relaxed uppercase tracking-widest leading-loose">
                            {provider.description}
                        </p>
                        <button className="flex items-center gap-2 text-[10px] font-black text-[#C48B28] uppercase tracking-widest mt-6 hover:translate-x-1 transition-transform">
                            Read more <ArrowRight size={14} />
                        </button>
                    </div>

                    {/* Featured Reviews Section */}
                    <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-[#EBC176]/20 shadow-sm shadow-[#EBC176]/5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
                            <h3 className="text-[11px] font-black text-[#C48B28] uppercase tracking-[0.2em]">Featured Reviews</h3>
                            <button onClick={onReadReviews} className="text-[10px] font-black text-themev2-text/40 hover:text-[#C48B28] uppercase tracking-widest transition-colors">
                                See all {provider.reviews_count} reviews
                            </button>
                        </div>

                        <div className="space-y-6">
                            {(provider.reviews?.length > 0) ? provider.reviews.slice(0, 2).map((review) => (
                                <div key={review.id} className="bg-[#FAF3E0]/30 rounded-[2rem] p-8 border border-[#EBC176]/10">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
                                        <div className="relative">
                                            {review.reviewer?.photoURL ? (
                                                <img
                                                    src={review.reviewer.photoURL}
                                                    alt={review.reviewer.first_name}
                                                    className="w-14 h-14 rounded-full object-cover border-4 border-white shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-xl font-black text-[#C48B28] border-4 border-white shadow-sm uppercase">
                                                    {review.reviewer?.first_name?.[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div>
                                                    <h4 className="text-base font-black text-themev2-text tracking-tight">{review.reviewer?.first_name} {review.reviewer?.last_name}</h4>
                                                    <p className="text-[10px] font-black text-themev2-text/30 uppercase tracking-widest mt-1">{new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</p>
                                                </div>
                                                <div className="flex text-[#C48B28] gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold text-themev2-text/60 leading-relaxed uppercase tracking-widest leading-loose">
                                        {review.comment}
                                    </p>
                                    {review.verified_client && (
                                        <div className="inline-flex items-center gap-2 mt-6 px-4 py-1.5 bg-white border border-green-100 rounded-full">
                                            <ShieldCheck size={12} className="text-green-500" />
                                            <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Verified Client</span>
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <div className="py-12 flex flex-col items-center justify-center bg-[#FAF3E0]/20 rounded-[2rem] border border-dashed border-[#EBC176]/30">
                                    <Star size={32} className="text-[#C48B28]/20 mb-4" />
                                    <p className="text-[10px] font-black text-themev2-text/30 uppercase tracking-widest">No reviews yet for this provider</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- SIDEBAR COLUMN --- */}
                <div className="lg:col-span-1 space-y-8">

                    {/* Location & Contact Card */}
                    <div className="bg-white rounded-[2.5rem] overflow-hidden border border-[#EBC176]/20 shadow-sm shadow-[#EBC176]/5">
                        <div className="p-6 border-b border-[#EBC176]/10">
                            <h3 className="text-[11px] font-black text-[#C48B28] uppercase tracking-[0.2em]">Location & Contact</h3>
                        </div>

                        {/* Map Section */}
                        <div className="p-4 relative">
                            <div className="rounded-[1.5rem] overflow-hidden border border-[#EBC176]/10 h-[220px]">
                                <ServiceLocationMap provider={provider} />
                            </div>
                        </div>

                        <div className="px-8 pb-10 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-[#FAF3E0] rounded-xl flex items-center justify-center shrink-0">
                                        <MapPin size={18} className="text-[#C48B28]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-[#C48B28] uppercase tracking-widest mb-1">Address</p>
                                        <p className="text-[11px] font-black text-themev2-text leading-relaxed">
                                            {provider.address?.area_name || 'Dhaka'}, {provider.address?.city || 'Bangladesh'}
                                            <br />
                                            <span className="text-themev2-text/40 text-[9px]">{provider.latitude}, {provider.longitude}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-[#FAF3E0] rounded-xl flex items-center justify-center shrink-0">
                                        <Phone size={18} className="text-[#C48B28]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-[#C48B28] uppercase tracking-widest mb-1">Phone</p>
                                        <a href={`tel:${provider.phone}`} className="text-[11px] font-black text-themev2-text hover:text-[#C48B28] transition-colors tracking-widest">{provider.phone}</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-[#FAF3E0] rounded-xl flex items-center justify-center shrink-0">
                                        <Mail size={18} className="text-[#C48B28]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-[#C48B28] uppercase tracking-widest mb-1">Email</p>
                                        <a href={`mailto:${provider.email}`} className="text-[11px] font-black text-themev2-text hover:text-[#C48B28] transition-colors truncate block">{provider.email}</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Business Hours Card */}
                    <div className="bg-white rounded-[2.5rem] overflow-hidden border border-[#EBC176]/20 shadow-sm shadow-[#EBC176]/5">
                        <div className="p-8 pb-4 flex justify-between items-center">
                            <h3 className="text-xl font-black text-themev2-text tracking-tight">Business Hours</h3>
                            <div className="px-3 py-1 bg-[#E8F5E9] rounded-full">
                                <span className="text-[9px] font-black text-[#2E7D32] uppercase tracking-widest">Open Now</span>
                            </div>
                        </div>
                        <div className="px-8 pb-8">
                            <div className="space-y-0">
                                {provider.hours?.map((h, i) => (
                                    <div key={i} className={`flex justify-between items-center py-5 ${i !== provider.hours.length - 1 ? 'border-b border-dashed border-[#EBC176]/20' : ''}`}>
                                        <span className="text-sm font-bold text-[#D4A056]">{h.day_display}</span>
                                        <span className={`text-sm font-black tracking-tight ${h.is_closed ? 'text-[#EF5350]' : 'text-themev2-text'}`}>
                                            {h.is_closed ? 'Closed' : `${h.open_time?.slice(0, 5)} - ${h.close_time?.slice(0, 5)}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
