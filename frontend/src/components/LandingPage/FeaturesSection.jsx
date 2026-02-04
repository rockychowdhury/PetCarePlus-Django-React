import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Calendar, Share2, LayoutDashboard, FileText, Sparkles, Layout } from 'lucide-react';
import SectionCursor from '../common/SectionCursor';
import star from '../../assets/star.png';

const FeaturesSection = () => {
    const [activeTab, setActiveTab] = useState('adopting');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 20,
                stiffness: 100,
            }
        }
    };

    const features = [
        {
            title: "Verified Service Directory",
            tag: "SERVICES",
            icon: <Users size={20} />,
            description: "Browse trusted veterinary clinics, groomers, and foster care providers with verified credentials and community ratings.",
            subtext: "SEARCH BY LOCATION AND SERVICE TYPE."
        },
        {
            title: "Expert Care",
            tag: "VETERINARY",
            icon: <Calendar size={20} />,
            description: "From routine checkups to specialized treatments, discover verified veterinarians and medical professionals near you.",
            subtext: "BOOK APPOINTMENTS WITH TRUSTED PROS."
        },
        {
            title: "Behavioral Disclosures",
            tag: "TRANSPARENCY",
            icon: <FileText size={20} />,
            description: "Access detailed pet profiles including mandatory behavioral history and medical records for full transparency.",
            subtext: "HONEST, DATA-DRIVEN REHOMING."
        },
        {
            title: "Rehomer Dashboards",
            tag: "DASHBOARD",
            icon: <LayoutDashboard size={20} />,
            description: "Manage your pet's journey, track inquiries, and coordinate safe transitions from your dedicated control center.",
            subtext: "BUILT FOR RESPONSIBLE LIFE TRANSITIONS."
        },
        {
            title: "WhatsApp Connect",
            tag: "COMMUNICATION",
            icon: <MessageSquare size={20} />,
            description: "Connect instantly via WhatsApp with verified providers and owners. Direct, secure, and reliable communication at your fingertips.",
            subtext: "INSTANT CONNECTIVITY & MEDIA SHARING."
        }
    ];

    return (
        <section className="py-24 bg-[#FEF9ED] relative overflow-hidden">
            <SectionCursor label="ECOSYSTEM" icon={<Layout size={14} />}>
                {/* Background Decoration Container (Clipped) */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative h-full">
                        <motion.div
                            animate={{
                                opacity: [0.2, 0.4, 0.2],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute top-20 left-4"
                        >
                            <Sparkles className="text-[#EBC176] fill-current" size={64} />
                        </motion.div>

                        <motion.img
                            animate={{
                                y: [0, -15, 0],
                                rotate: 360
                            }}
                            transition={{
                                y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                                rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                            }}
                            src={star}
                            alt=""
                            className="absolute top-1/2 left-0 w-12 h-12 opacity-15"
                            style={{ filter: 'brightness(0) sepia(1) hue-rotate(-50deg) saturate(5)' }}
                        />
                    </div>
                </div>

                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-24 relative"
                    >
                        <div className="relative inline-block mb-6">
                            <h2 className="text-5xl md:text-6xl font-black text-themev2-text leading-tight tracking-tight">
                                Everything in <span className="text-[#C48B28]">One Place</span>
                            </h2>
                            <motion.img
                                animate={{ rotate: 360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                src={star}
                                alt=""
                                className="absolute -top-10 -right-14 w-12 h-12 opacity-40 hidden md:block"
                                style={{ filter: 'brightness(0)' }}
                            />
                        </div>

                        <p className="text-themev2-text/60 text-xl max-w-3xl mx-auto font-medium leading-relaxed">
                            Discover how PetCare+ streamlines expert care and responsible rehoming with a unified, verified platform.
                        </p>
                    </motion.div>

                    <div className="flex flex-col lg:flex-row gap-16">
                        {/* Left Column: Sticky Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="lg:w-1/3 lg:sticky lg:top-32 h-fit space-y-8"
                        >
                            <h3 className="text-4xl md:text-5xl font-black text-themev2-text leading-[1.1]  tracking-tight">
                                Built for every step of the <span className="text-[#C48B28]">care journey.</span>
                            </h3>
                            <p className="text-themev2-text/60 text-lg leading-relaxed font-bold">
                                Whether you are finding expert services or navigating rehoming, our platform provides the verified tools you need for a safe and supported experience.
                            </p>

                            {/* Toggle */}
                            <div className="inline-flex bg-bg-secondary/40 rounded-full p-1.5 border border-border/60 shadow-inner">
                                <button
                                    onClick={() => setActiveTab('adopting')}
                                    className={`px-8 py-3 rounded-full text-[10px] font-black transition-all duration-500 ease-out transform tracking-[0.15em] uppercase ${activeTab === 'adopting'
                                        ? 'bg-white text-[#C48B28] shadow-lg shadow-[#1a365d]/5 scale-100'
                                        : 'text-themev2-text/40 hover:text-themev2-text hover:bg-white/50 scale-95'
                                        }`}
                                >
                                    For Adopting
                                </button>
                                <button
                                    onClick={() => setActiveTab('rehoming')}
                                    className={`px-8 py-3 rounded-full text-[10px] font-black transition-all duration-500 ease-out transform tracking-[0.15em] uppercase ${activeTab === 'rehoming'
                                        ? 'bg-white text-[#C48B28] shadow-lg shadow-[#1a365d]/5 scale-100'
                                        : 'text-themev2-text/40 hover:text-themev2-text hover:bg-white/50 scale-95'
                                        }`}
                                >
                                    For Rehoming
                                </button>
                            </div>

                            {/* Dynamic List based on Tab */}
                            <div className="space-y-6 pt-4">
                                <h4 className="text-[10px] font-black text-themev2-text/40 uppercase tracking-[0.2em]">
                                    {activeTab === 'adopting' ? "RESOURCES FOR ADOPTERS" : "REHOWER SUPPORT TOOLS"}
                                </h4>
                                <div className="flex flex-wrap gap-2.5">
                                    {activeTab === 'adopting' ? (
                                        <>
                                            <span className="px-5 py-2.5 bg-white rounded-2xl text-[13px] font-bold text-themev2-text border border-[#EBC176]/20 shadow-sm">Direct WhatsApp connection</span>
                                            <span className="px-5 py-2.5 bg-white rounded-2xl text-[13px] font-bold text-themev2-text border border-[#EBC176]/20 shadow-sm">Full behavioral disclosures</span>
                                            <span className="px-5 py-2.5 bg-white rounded-2xl text-[13px] font-bold text-themev2-text border border-[#EBC176]/20 shadow-sm">Expert Service matching</span>
                                            <span className="px-5 py-2.5 bg-white rounded-2xl text-[13px] font-bold text-themev2-text border border-[#EBC176]/20 shadow-sm">Verified medical history</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="px-5 py-2.5 bg-white rounded-2xl text-[13px] font-bold text-themev2-text border border-[#EBC176]/20 shadow-sm">Streamlined digitial dashboard</span>
                                            <span className="px-5 py-2.5 bg-white rounded-2xl text-[13px] font-bold text-themev2-text border border-[#EBC176]/20 shadow-sm">Verified location data</span>
                                            <span className="px-5 py-2.5 bg-white rounded-2xl text-[13px] font-bold text-themev2-text border border-[#EBC176]/20 shadow-sm">Screen inquiries via WhatsApp</span>
                                            <span className="px-5 py-2.5 bg-white rounded-2xl text-[13px] font-bold text-themev2-text border border-[#EBC176]/20 shadow-sm">Safe rehoming protocols</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column: Grid */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8"
                        >
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    variants={cardVariants}
                                    className={`bg-white p-10 rounded-[48px] shadow-sm border border-[#EBC176]/20 hover:border-[#C48B28]/40 transition-all duration-300 ease-out hover:-translate-y-2 group ${index === 4 ? 'sm:col-span-2' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-[#FEF9ED] group-hover:bg-[#FFF5E1] transition-all duration-500 flex items-center justify-center text-[#C48B28]">
                                            {React.cloneElement(feature.icon, { size: 24, strokeWidth: 1.5 })}
                                        </div>
                                        <span className="px-4 py-1.5 bg-[#FEF9ED] rounded-xl text-[9px] font-black text-themev2-text/40 uppercase tracking-[0.2em] group-hover:text-[#C48B28] transition-colors">
                                            {feature.tag}
                                        </span>
                                    </div>
                                    <h4 className="text-2xl font-black text-themev2-text mb-4  tracking-tight leading-tight">
                                        {feature.title}
                                    </h4>
                                    <p className="text-themev2-text/60 text-[15px] leading-relaxed mb-6 font-bold">
                                        {feature.description}
                                    </p>
                                    <div className="w-full h-px bg-[#EBC176]/20 mb-6"></div>
                                    <p className="text-[9px] text-themev2-text/40 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Sparkles size={12} className="text-[#C48B28]" />
                                        {feature.subtext}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </SectionCursor >
        </section >
    );
};

export default FeaturesSection;

