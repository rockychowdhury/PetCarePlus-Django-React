import React from 'react';
import {
    CircleCheck, Dog, Cat, Info, Scissors, MapPin,
    Video, CheckCircle, Car, ShieldCheck, DollarSign,
    Award, Heart, Star, Sparkles, Navigation,
    ArrowRight, PawPrint, Users, Home, Calendar,
    Clock, Smartphone, BookOpen, GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../../common/Buttons/Button';

const ServicesTab = ({ provider, onBook }) => {
    if (!provider) return null;

    const details = provider.service_specific_details || {};
    const slug = provider.category?.slug;

    // Premium Pricing Item
    const renderPricingItem = (label, price, description = null, subLabel = null) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-8 bg-white border border-[#EBC176]/20 rounded-[2.5rem] hover:border-[#C48B28]/50 transition-all group shadow-sm shadow-[#EBC176]/5 mb-4"
        >
            <div className="mb-4 sm:mb-0">
                <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-lg font-black text-themev2-text tracking-tight group-hover:text-[#C48B28] transition-colors">{label}</h4>
                    {subLabel && <span className="px-3 py-0.5 bg-[#FAF3E0] text-[#C48B28] rounded-full text-[9px] font-black uppercase tracking-widest">{subLabel}</span>}
                </div>
                {description && <p className="text-[11px] font-bold text-themev2-text/40 uppercase tracking-widest leading-loose max-w-md">{description}</p>}
            </div>
            <div className="flex items-center gap-6">
                <div className="text-right">
                    <div className="text-2xl font-black text-themev2-text tracking-tight">
                        {typeof price === 'number' ? `$${price}` : price}
                    </div>
                    <p className="text-[9px] font-black text-[#C48B28] uppercase tracking-widest">Starting Price</p>
                </div>
                <button
                    onClick={() => onBook({ name: label, price })}
                    className="px-8 py-3 bg-[#FAF3E0] text-themev2-text rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#C48B28] hover:text-white transition-all active:scale-95 border border-[#EBC176]/10"
                >
                    Book Now
                </button>
            </div>
        </motion.div>
    );

    const renderSectionTitle = (title, icon) => (
        <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-[#FAF3E0] rounded-xl flex items-center justify-center text-[#C48B28] shrink-0">
                {icon}
            </div>
            <h3 className="text-[11px] font-black text-[#C48B28] uppercase tracking-[0.2em]">{title}</h3>
        </div>
    );

    // --- FOSTER ---
    if (slug === 'foster') {
        return (
            <div className="space-y-12 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
                <div>
                    {renderSectionTitle("Standard Boarding Rates", <DollarSign size={20} />)}
                    {renderPricingItem("Daily Rate", details.daily_rate, "Standard care including feeding and light exercise.", "Per Night")}
                    {renderPricingItem("Monthly Rate", details.monthly_rate, "Extended stay discount applied.", "Per Month")}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-[#EBC176]/20 shadow-sm">
                        {renderSectionTitle("Environment Details", <Home size={20} />)}
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(details.environment_details || {}).map(([key, val], i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-[#C48B28] rounded-full" />
                                    <span className="text-[10px] font-black text-themev2-text uppercase tracking-widest">
                                        {key.replace(/_/g, ' ')}: {val ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-[2.5rem] p-8 border border-[#EBC176]/20 shadow-sm">
                        {renderSectionTitle("Capacity & Availability", <Users size={20} />)}
                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-[#FAF3E0] pb-3">
                                <span className="text-[10px] font-black text-themev2-text/40 uppercase tracking-widest">Current Animals</span>
                                <span className="text-[11px] font-black text-themev2-text">{details.current_count} / {details.capacity}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[10px] font-black text-themev2-text/40 uppercase tracking-widest">Status</span>
                                <span className="px-3 py-1 bg-[#E8F5E9] text-[#2E7D32] rounded-full text-[9px] font-black uppercase tracking-widest">
                                    {details.current_availability}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- TRAINING ---
    if (slug === 'training') {
        return (
            <div className="space-y-12 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
                <div>
                    {renderSectionTitle("Training Rates", <GraduationCap size={20} />)}
                    {details.offers_private_sessions && renderPricingItem("Private Session", details.private_session_rate, "1-on-1 focused training experience.", "Per Hour")}
                    {details.offers_group_classes && renderPricingItem("Group Class", details.group_class_rate, "Socialized learning environment.", "Per Session")}
                </div>

                {details.package_options?.length > 0 && (
                    <div>
                        {renderSectionTitle("Training Packages", <Award size={20} />)}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {details.package_options.map((pkg, i) => (
                                <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-[#EBC176]/20 shadow-sm group hover:border-[#C48B28]/50 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-lg font-black text-themev2-text tracking-tight group-hover:text-[#C48B28] transition-colors">{pkg.name}</h4>
                                        <span className="text-xl font-black text-themev2-text">${pkg.price}</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-themev2-text/40 uppercase tracking-widest leading-loose mb-6">{pkg.description}</p>
                                    <Button fullWidth variant="outline" onClick={() => onBook(pkg)}>Select Package</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- GROOMING ---
    if (slug === 'grooming') {
        return (
            <div className="space-y-12 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
                <div>
                    {renderSectionTitle("Starting Rates", <Scissors size={20} />)}
                    {renderPricingItem("Basic Groom", details.base_price, "Includes bath, brush, and nail trim.")}
                </div>

                {details.service_menu?.length > 0 && (
                    <div>
                        {renderSectionTitle("Full Service Menu", <BookOpen size={20} />)}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {details.service_menu.map((svc, i) => (
                                <div key={i} className="flex justify-between items-center p-6 bg-white border border-[#EBC176]/10 rounded-[1.5rem] hover:border-[#EBC176]/50 transition-all">
                                    <div>
                                        <h5 className="text-[11px] font-black text-themev2-text uppercase tracking-widest line-clamp-1">{svc.name}</h5>
                                        <p className="text-[8px] font-black text-[#C48B28] uppercase tracking-[0.2em]">{svc.description || 'Service details'}</p>
                                    </div>
                                    <span className="text-sm font-black text-themev2-text">${svc.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- PET SITTING ---
    if (slug === 'pet_sitting') {
        return (
            <div className="space-y-12 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
                <div>
                    {renderSectionTitle("Sitting & Walking Rates", <Star size={20} />)}
                    {details.offers_dog_walking && renderPricingItem("Dog Walking", details.walking_rate, "Active exercise for your companion.", "Per Walk")}
                    {details.offers_house_sitting && renderPricingItem("House Sitting", details.house_sitting_rate, "Overnight care in your own home.", "Per Night")}
                    {details.offers_drop_in_visits && renderPricingItem("Drop-in Visit", details.drop_in_rate, "Quick check-in and feeding.", "Per Visit")}
                </div>
            </div>
        );
    }

    // --- VETERINARY ---
    if (slug === 'veterinary') {
        return (
            <div className="space-y-12 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
                {/* Emergency Services Badge */}
                {details.emergency_services && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-50 border border-red-100 p-8 rounded-[2.5rem] flex items-center gap-6 text-red-800"
                    >
                        <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center shrink-0">
                            <Sparkles className="text-red-600" size={32} />
                        </div>
                        <div>
                            <div className="text-[11px] font-black uppercase tracking-widest mb-1">Critical Care Available</div>
                            <h4 className="text-xl font-black tracking-tight mb-2">Emergency Services</h4>
                            <p className="text-sm font-medium opacity-70">This clinic provides 24/7 emergency care. Priority handling for urgent matters.</p>
                        </div>
                    </motion.div>
                )}

                <div>
                    {renderSectionTitle("Available Services", <ShieldCheck size={20} />)}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {details.services_offered?.map((svc) => (
                            <div key={svc.id} className="bg-white rounded-[2.5rem] p-8 border border-[#EBC176]/20 shadow-sm hover:border-[#C48B28]/30 transition-all group">
                                <h4 className="text-lg font-black text-themev2-text tracking-tight mb-3 group-hover:text-[#C48B28] transition-colors">{svc.name}</h4>
                                <p className="text-[10px] font-black text-themev2-text/40 uppercase tracking-widest leading-loose mb-8 h-12 line-clamp-2">{svc.description}</p>
                                <div className="flex justify-between items-center bg-[#FAF3E0]/30 p-4 rounded-2xl">
                                    <div>
                                        <span className="text-[8px] font-black text-[#C48B28] uppercase tracking-[0.2em] block mb-1">From</span>
                                        <span className="text-xl font-black text-themev2-text">${svc.base_price}</span>
                                    </div>
                                    <button
                                        onClick={() => onBook({ name: svc.name, price: svc.base_price })}
                                        className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-themev2-text hover:bg-themev2-text hover:text-white transition-all shadow-sm border border-[#EBC176]/10"
                                    >
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Default Fallback
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
            {renderSectionTitle("Services & Rates", <DollarSign size={20} />)}
            <div className="bg-[#FAF3E0]/20 rounded-[2.5rem] p-12 text-center border border-dashed border-[#EBC176]/30">
                <Info size={32} className="text-[#C48B28]/20 mx-auto mb-4" />
                <p className="text-[10px] font-black text-themev2-text/40 uppercase tracking-widest leading-loose">
                    Detailed pricing for {slug || 'this provider'} is currently being updated.
                </p>
                <button onClick={() => onBook()} className="mt-8 px-10 py-4 bg-[#C48B28] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#C48B28]/20 hover:scale-105 transition-all active:scale-95">
                    Request Custom Quote
                </button>
            </div>
        </div>
    );
};

export default ServicesTab;
