import React from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, CheckCircle, MessageCircle, ShieldCheck, FileSignature, FileText, HeartHandshake, Heart } from 'lucide-react';
import SectionCursor from '../common/SectionCursor';

const AdoptionSection = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.1 },
        },
    };

    const cardReveal = {
        hidden: { opacity: 0, y: 30, scale: 0.98 },
        visible: {
            opacity: 1, y: 0, scale: 1,
            transition: { type: "spring", damping: 25, stiffness: 100 }
        }
    };

    return (
        <section className="py-24 bg-[#FEF9ED] relative overflow-hidden">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <SectionCursor label="ADOPTER JOURNEY" icon={<Heart size={14} />}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-24 relative"
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-[#402E11] mb-6 tracking-tight relative inline-block">
                            Adoption Journey <span className="text-[#C48B28]">Simplified</span>
                        </h2>
                        <p className="text-[#402E11]/60 text-base max-w-2xl mx-auto font-bold leading-relaxed ">
                            Finding your new best friend should be safe and transparent. We've built the tools to make it a reality.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid grid-cols-1 md:grid-cols-12 gap-5 max-w-7xl mx-auto"
                    >
                        {/* 1. Smart Discovery - Hero Card */}
                        <motion.div
                            variants={cardReveal}
                            className="md:col-span-7 lg:col-span-8 bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 border border-[#EBC176]/10 hover:border-[#C48B28]/20 group flex flex-col relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C48B28]/15 rounded-bl-[80px] -mr-4 -mt-4 group-hover:bg-[#C48B28]/25 transition-colors duration-700"></div>

                            <div className="w-14 h-14 text-[#C48B28] bg-[#FAF3E0] rounded-2xl border border-[#EBC176]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 relative z-10">
                                <Search size={28} strokeWidth={2} />
                            </div>

                            <h3 className="text-2xl font-black text-[#402E11] mb-3 tracking-tight relative z-10">Localized Discovery</h3>
                            <p className="text-[#402E11]/60 text-sm mb-6 font-bold leading-relaxed max-w-md relative z-10">
                                Advanced filters to find verified pets within your chosen radius. Our system prioritizes local matches to reduce travel stress for pets.
                            </p>

                            <div className="mt-auto flex flex-wrap gap-2 relative z-10">
                                <span className="text-[9px] font-black bg-[#FAF3E0] px-3 py-1.5 rounded-lg text-[#C48B28] uppercase tracking-wider border border-[#EBC176]/10">Radius Matching</span>
                                <span className="text-[9px] font-black bg-[#FAF3E0] px-3 py-1.5 rounded-lg text-[#C48B28] uppercase tracking-wider border border-[#EBC176]/10">Verified Listings</span>
                            </div>
                        </motion.div>

                        {/* 2. Universal Profile - Tall Card */}
                        <motion.div
                            variants={cardReveal}
                            className="md:col-span-5 lg:col-span-4 lg:row-span-2 bg-[#1a365d] p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col relative overflow-hidden text-white"
                        >
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),_transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                            <div className="w-14 h-14 text-white bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <UserPlus size={28} strokeWidth={2} />
                            </div>

                            <h3 className="text-2xl font-black mb-3 tracking-tight leading-tight">Adopter Wallet</h3>
                            <p className="text-white/70 text-sm font-bold leading-relaxed mb-8">
                                Create one profile, apply anywhere. Your data is encrypted and only shared with owners you choose to connect with.
                            </p>

                            <div className="mt-auto space-y-3 relative z-10">
                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-7 h-7 rounded-full bg-green-400/20 flex items-center justify-center text-green-400"><CheckCircle size={14} /></div>
                                    <span className="text-[10px] font-black uppercase tracking-wider">Identity Check</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-7 h-7 rounded-full bg-green-400/20 flex items-center justify-center text-green-400"><CheckCircle size={14} /></div>
                                    <span className="text-[10px] font-black uppercase tracking-wider">Housing Verified</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-7 h-7 rounded-full bg-green-400/20 flex items-center justify-center text-green-400"><CheckCircle size={14} /></div>
                                    <span className="text-[10px] font-black uppercase tracking-wider">Single-Click Apply</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* 3. WhatsApp Connect - Feature Card */}
                        <motion.div
                            variants={cardReveal}
                            className="md:col-span-6 lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 border border-[#EBC176]/10 hover:border-[#C48B28]/20 group flex flex-col relative"
                        >
                            <div className="w-12 h-12 text-[#25D366] bg-[#25D366]/10 rounded-xl border border-[#25D366]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                                <MessageCircle size={24} strokeWidth={2} />
                            </div>
                            <h3 className="text-xl font-black text-[#402E11] mb-2 tracking-tight">WhatsApp Direct</h3>
                            <p className="text-[#402E11]/60 text-xs font-bold leading-relaxed">
                                Skip the email tag. Connect instantly through WhatsApp to ask questions, share media, and schedule visits.
                            </p>
                        </motion.div>

                        {/* 4. Expert Care Integration - Feature Card */}
                        <motion.div
                            variants={cardReveal}
                            className="md:col-span-6 lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 border border-[#EBC176]/10 hover:border-[#C48B28]/20 group flex flex-col relative"
                        >
                            <div className="w-12 h-12 text-[#C48B28] bg-[#FAF3E0] rounded-xl border border-[#EBC176]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                                <ShieldCheck size={24} strokeWidth={2} />
                            </div>
                            <h3 className="text-xl font-black text-[#402E11] mb-2 tracking-tight">Trusted Ecosystem</h3>
                            <p className="text-[#402E11]/60 text-xs font-bold leading-relaxed">
                                Book first-visit health checks with verified vets or grooming sessions directly through our partner network.
                            </p>
                        </motion.div>

                        {/* 5. Digital Legal - Full Width Strip */}
                        <motion.div
                            variants={cardReveal}
                            className="md:col-span-12 bg-[#FAF3E0] p-8 rounded-[2.5rem] shadow-sm hover:shadow-lg transition-all duration-500 border border-[#EBC176]/20 group flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-full bg-[#C48B28]/10 -skew-x-12 transform translate-x-10 group-hover:bg-[#C48B28]/20 transition-colors"></div>

                            <div className="w-16 h-16 flex-shrink-0 text-[#C48B28] bg-white rounded-2xl border border-[#EBC176]/10 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-500 relative z-10">
                                <FileSignature size={28} strokeWidth={2} />
                            </div>

                            <div className="flex-1 text-center md:text-left relative z-10">
                                <h3 className="text-2xl font-black text-[#402E11] mb-2 tracking-tight">Digital Transfer & Legal Support</h3>
                                <p className="text-[#402E11]/60 text-sm font-bold leading-relaxed max-w-2xl">
                                    Automated Adoption Agreements, medical record transfers, and clear liability waivers generated instantly. We handle the paperwork so you can focus on your new friend.
                                </p>
                            </div>

                            <div className="relative z-10 flex-shrink-0 hidden lg:flex items-center gap-3">
                                <div className="flex -space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-white border-2 border-[#FAF3E0] flex items-center justify-center shadow-sm"><FileText size={16} className="text-[#C48B28]" /></div>
                                    <div className="w-10 h-10 rounded-full bg-white border-2 border-[#FAF3E0] flex items-center justify-center shadow-sm"><HeartHandshake size={16} className="text-[#C48B28]" /></div>
                                    <div className="w-10 h-10 rounded-full bg-[#C48B28] border-2 border-[#FAF3E0] flex items-center justify-center shadow-sm text-white font-black text-[10px]">+3</div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </SectionCursor>
            </div>
        </section>
    );
};

export default AdoptionSection;
