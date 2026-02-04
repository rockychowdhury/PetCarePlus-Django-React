import React from 'react';
import { ShieldCheck, FileText, MapPin, BadgeCheck, Lock, ExternalLink, MessageCircle, Info } from 'lucide-react';
import ServiceLocationMap from '../ServiceLocationMap';

const AboutTab = ({ provider, onContact }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-10">
                <div className="bg-white rounded-[2.5rem] p-10 border border-[#EBC176]/20 shadow-sm shadow-[#EBC176]/5">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-[#FAF3E0] rounded-xl flex items-center justify-center text-[#C48B28]">
                            <FileText size={20} />
                        </div>
                        <h3 className="text-[11px] font-black text-[#C48B28] uppercase tracking-[0.2em]">Detailed Biography</h3>
                    </div>
                    <div className="prose prose-stone max-w-none">
                        <p className="text-sm font-bold text-themev2-text/60 leading-relaxed uppercase tracking-widest leading-loose whitespace-pre-line">
                            {provider.description}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 border border-[#EBC176]/20 shadow-sm shadow-[#EBC176]/5">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-[#FAF3E0] rounded-xl flex items-center justify-center text-[#C48B28]">
                            <MapPin size={20} />
                        </div>
                        <h3 className="text-[11px] font-black text-[#C48B28] uppercase tracking-[0.2em]">Service Location</h3>
                    </div>
                    <div className="rounded-[1.5rem] overflow-hidden border border-[#EBC176]/10 h-[400px]">
                        <ServiceLocationMap provider={provider} />
                    </div>
                    <div className="mt-6 flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#FAF3E0] rounded-full border border-[#EBC176]/10">
                            <Navigation className="text-[#C48B28]" size={14} />
                            <span className="text-[9px] font-black text-themev2-text/60 uppercase tracking-widest">{provider.address?.city || provider.city || 'Location Details'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-1 space-y-8">
                <div className="bg-white rounded-[2.5rem] p-10 border border-[#EBC176]/20 shadow-sm shadow-[#EBC176]/5">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-[#FAF3E0] rounded-xl flex items-center justify-center text-[#C48B28]">
                            <BadgeCheck size={20} />
                        </div>
                        <h3 className="text-[11px] font-black text-[#C48B28] uppercase tracking-[0.2em]">Verification</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-4 border-b border-[#FAF3E0] last:border-0 hover:translate-x-1 transition-transform cursor-default">
                            <span className="text-[10px] font-black text-themev2-text/40 uppercase tracking-widest">Identity Verified</span>
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full text-[9px] font-black text-green-600 uppercase tracking-widest">
                                <ShieldCheck size={10} /> Verified
                            </span>
                        </div>
                        {provider.license_number && (
                            <div className="flex justify-between items-center py-4 border-b border-[#FAF3E0] last:border-0 hover:translate-x-1 transition-transform cursor-default">
                                <span className="text-[10px] font-black text-themev2-text/40 uppercase tracking-widest">License Status</span>
                                <span className="text-[10px] font-black text-themev2-text tracking-widest bg-[#FAF3E0] px-3 py-1 rounded-full border border-[#EBC176]/10">{provider.license_number}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center py-4 border-b border-[#FAF3E0] last:border-0 hover:translate-x-1 transition-transform cursor-default">
                            <span className="text-[10px] font-black text-themev2-text/40 uppercase tracking-widest">Background Check</span>
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full text-[9px] font-black text-green-600 uppercase tracking-widest">
                                <ShieldCheck size={10} /> Passed
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-4 border-b border-[#FAF3E0] last:border-0 hover:translate-x-1 transition-transform cursor-default">
                            <span className="text-[10px] font-black text-themev2-text/40 uppercase tracking-widest">Insurance</span>
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${provider.is_insurance_verified ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                {provider.is_insurance_verified ? <ShieldCheck size={10} /> : <Lock size={10} />}
                                {provider.is_insurance_verified ? 'Verified' : 'Unverified'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Direct Contact Card */}
                <div className="bg-[#FAF3E0] rounded-[2.5rem] p-10 border border-[#EBC176]/20 text-center shadow-sm shadow-[#EBC176]/10 group">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-[#C48B28] mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                        <MessageCircle size={32} />
                    </div>
                    <h4 className="text-lg font-black text-themev2-text tracking-tight mb-3">Still have questions?</h4>
                    <p className="text-[10px] font-black text-themev2-text/30 uppercase tracking-[0.2em] leading-loose mb-8 px-4">Contact the provider directly to discuss tailored services.</p>
                    <button
                        onClick={onContact}
                        className="w-full py-5 bg-white border border-[#EBC176]/30 text-themev2-text rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-[#C48B28] hover:text-white transition-all active:scale-95 shadow-sm"
                    >
                        Send Direct Message
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper Icon
const Navigation = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
);

export default AboutTab;
