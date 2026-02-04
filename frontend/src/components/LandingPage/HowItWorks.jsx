import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import {
    Search, UserPlus, Send, MessageCircle, Users, Home, PartyPopper,
    ClipboardCheck, FileText, ShieldCheck, FolderOpen, HeartHandshake,
    CheckCircle, Clock, MapPin, FileSignature, ArrowRight, Sparkles, Heart
} from 'lucide-react';
import SectionCursor from '../common/SectionCursor';

import star from '../../assets/star.png';
import stars from '../../assets/stars.png';

const HowItWorks = () => {
    const rehomingRef = useRef(null);
    const stepsRef = useRef(null);

    // Scroll Progress for Timeline
    const { scrollYProgress } = useScroll({
        target: stepsRef,
        offset: ["start 60%", "end 60%"]
    });

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            },
        },
    };

    const cardReveal = {
        hidden: { opacity: 0, y: 30, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 100,
            }
        }
    };

    const rehomingSteps = [
        {
            step: "Step 01",
            title: "Assessment",
            icon: <ClipboardCheck size={24} />,
            description: "We'll help you explore all options first. If rehoming is necessary, we'll guide you through a pre-rehoming assessment to understand your situation.",
            badge: "~15 mins",
            badgeIcon: <Clock size={14} />,
            footer: "Resource check"
        },
        {
            step: "Step 02",
            title: "Pet Listing",
            icon: <FileText size={24} />,
            description: "Share your pet's story, personality, photos, and medical history. The more details you provide, the better the match.",
            badge: "~30 mins",
            badgeIcon: <Clock size={14} />,
            footer: "Medical records"
        },
        {
            step: "Step 03",
            title: "Listing Review",
            icon: <ShieldCheck size={24} />,
            description: "Our team reviews every listing to ensure quality, safety, and completeness before it goes live to our community.",
            badge: "24-48 hours",
            badgeIcon: <Clock size={14} />,
            footer: null
        },
        {
            step: "Step 04",
            title: "Review Applications",
            icon: <FolderOpen size={24} />,
            description: "Potential adopters will apply with detailed profiles. You review them and choose the best match for your pet's specific needs.",
            badge: "Varies",
            badgeIcon: <Users size={14} />,
            footer: null
        },
        {
            step: "Step 05",
            title: "Meet & Greet",
            icon: <HeartHandshake size={24} />,
            description: "Meet approved applicants in person in a safe, public place. See how they interact with your pet before making a decision.",
            badge: "In-person",
            badgeIcon: <MapPin size={14} />,
            footer: "Safety guide"
        },
        {
            step: "Step 06",
            title: "Final Adoption",
            icon: <CheckCircle size={24} />,
            description: "Sign the rehoming agreement and transfer ownership. We provide all the necessary digital documentation.",
            badge: "Final Step",
            badgeIcon: <FileSignature size={14} />,
            footer: null
        }
    ];

    const faqs = [
        {
            question: "How do I contact pet owners?",
            answer: "Directly via WhatsApp. We've integrated direct messaging so you can reach out securely, share media, and get instant updates.",
            icon: <MessageCircle className="text-[#25D366]" />,
            theme: "bg-[#25D366]/5 border-[#25D366]/10"
        },
        {
            question: "Is my personal data safe?",
            answer: "Yes. Your 'Adopter Wallet' data is encrypted. You only share sensitive details with owners once you choose to apply.",
            icon: <ShieldCheck className="text-[#1a365d]" />,
            theme: "bg-[#1a365d]/5 border-[#1a365d]/10"
        },
        {
            question: "Are adoption fees handled here?",
            answer: "We facilitate the legal agreement, but rehoming fees are paid directly between users. Our platform fee covers verification services.",
            icon: <Sparkles className="text-[#C48B28]" />,
            theme: "bg-[#C48B28]/5 border-[#C48B28]/10"
        },
        {
            question: "How is verification handled?",
            answer: "We use bank-level ID verification and community reviews to ensure every service provider and owner is a verified human.",
            icon: <Users className="text-[#1a365d]" />,
            theme: "bg-[#1a365d]/5 border-[#1a365d]/10"
        },
        {
            question: "What about legal paperwork?",
            answer: "We generate digital Adoption Agreements and Transfer of Ownership forms instantly once a match is confirmed by both parties.",
            icon: <FileSignature className="text-[#C48B28]" />,
            theme: "bg-[#C48B28]/5 border-[#C48B28]/10"
        },
        {
            question: "Can I find local vets here?",
            answer: "Absolutely. Our verified service directory includes local clinics, groomers, and boarders to support your pet's life journey.",
            icon: <MapPin className="text-[#1a365d]" />,
            theme: "bg-[#1a365d]/5 border-[#1a365d]/10"
        }
    ];

    return (
        <section className="py-24 bg-[#FEF9ED] relative overflow-hidden ">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* --- Rehoming Section --- */}
                <div className="mb-48" ref={rehomingRef}>
                    <SectionCursor label="OWNER JOURNEY" icon={<ShieldCheck size={14} />}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-20 relative"
                        >
                            <h2 className="text-4xl md:text-5xl font-black text-[#402E11] mb-6 tracking-tight relative inline-block">
                                Rehoming Your <span className="text-[#C48B28]">Pet</span>
                            </h2>
                            <p className="text-[#402E11]/60 text-base max-w-xl mx-auto font-bold">
                                A guided, verified process designed to ensure your pet's future is filled with love and stability.
                            </p>
                        </motion.div>

                        <div className="relative max-w-6xl mx-auto" ref={stepsRef}>
                            {/* Desktop Timeline Line */}
                            <div className="absolute left-1/2 top-4 bottom-4 w-[2px] bg-bg-secondary -translate-x-1/2 hidden md:block overflow-hidden">
                                <motion.div
                                    style={{ scaleY }}
                                    className="w-full h-full bg-[#C48B28] origin-top"
                                ></motion.div>
                            </div>

                            <div className="space-y-12 md:space-y-0">
                                {rehomingSteps.map((item, index) => (
                                    <TimelineStep key={index} item={item} index={index} />
                                ))}
                            </div>
                        </div>
                    </SectionCursor>
                </div>

                {/* --- Adoption Section --- */}
                <div className="mb-48">
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

                {/* --- FAQ Section --- */}
                <div className="mb-48">
                    <SectionCursor label="GENERAL INQUIRIES" icon={<MessageCircle size={14} />}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-24 relative"
                        >
                            <h2 className="text-4xl md:text-5xl font-black text-[#402E11] mb-6 tracking-tight relative inline-block">
                                Frequently Asked <span className="text-[#C48B28]">Questions</span>
                            </h2>
                            <p className="text-[#402E11]/60 text-lg max-w-2xl mx-auto font-bold leading-relaxed">
                                Transparent answers for your peace of mind.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                            {faqs.map((faq, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className={`p-10 rounded-[2.5rem] border transition-all duration-300 hover:shadow-xl group h-full flex flex-col ${faq.theme}`}
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform duration-500">
                                        {React.cloneElement(faq.icon, { size: 24, strokeWidth: 2 })}
                                    </div>
                                    <h3 className="text-xl font-black text-[#402E11] mb-4 tracking-tight leading-tight">
                                        {faq.question}
                                    </h3>
                                    <p className="text-[#402E11]/60 text-sm leading-relaxed font-bold">
                                        {faq.answer}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </SectionCursor>
                </div>

                {/* --- Call to Action --- */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative pt-12"
                >
                    <div className="bg-[#402E11] rounded-[56px] p-12 md:p-20 text-left relative overflow-hidden shadow-2xl shadow-black/20">
                        {/* Background Accents */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                            <div className="max-w-3xl">
                                <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight leading-tight">
                                    Comprehensive Care <br />
                                    <span className="text-[#C48B28] opacity-100">& Safe Adoptions</span>
                                </h2>
                                <p className="text-white/70 text-base md:text-lg mb-8 font-bold leading-relaxed max-w-2xl">
                                    We're here for every stage of your pet's life, from medical support to finding a forever home.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <Link to="/services">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="h-14 px-8 bg-white text-[#402E11] font-black rounded-full hover:bg-[#FEF9ED] transition-all duration-300 flex items-center gap-3 text-base shadow-xl shadow-black/20 group"
                                        >
                                            Find Services
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </motion.button>
                                    </Link>
                                    <Link to="/become-provider">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="h-14 px-8 bg-white/5 border border-white/10 text-white font-black rounded-full hover:bg-white/10 transition-all duration-300 flex items-center gap-3 text-base backdrop-blur-sm"
                                        >
                                            Join as Provider
                                        </motion.button>
                                    </Link>
                                </div>
                            </div>

                            {/* Trust Badge Pill */}
                            <div className="flex-shrink-0">
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-white/5 backdrop-blur-md border border-white/10 p-4 pl-4 pr-8 rounded-full flex items-center gap-6 shadow-2xl relative"
                                >
                                    <div className="flex -space-x-3">
                                        {[4, 5, 6, 7].map((i) => (
                                            <div key={i} className="w-12 h-12 rounded-full border-2 border-[#402E11] overflow-hidden shadow-lg">
                                                <img
                                                    src={`https://i.pravatar.cc/150?u=petcare${i}`}
                                                    alt="User"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                        <div className="w-12 h-12 rounded-full border-2 border-[#402E11] bg-[#C48B28] flex items-center justify-center text-white text-[10px] font-black shadow-lg">
                                            +5k
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-white font-black text-lg tracking-tight leading-none mb-1">Verified</p>
                                        <p className="text-[#C48B28] text-[8px] font-black uppercase tracking-[0.2em]">Global Community</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

// Sub-component for Rehoming Steps to handle individual scroll logic
const TimelineStep = ({ item, index }) => {
    const stepRef = useRef(null);

    // Local scroll progress for this specific step dot
    // This ensures the dot fills exactly when its center reaches the 60% line
    const { scrollYProgress: localProgress } = useScroll({
        target: stepRef,
        offset: ["center 85%", "center 60%"]
    });

    const smoothProgress = useSpring(localProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const stepColor = useTransform(
        smoothProgress,
        [0, 1],
        ["rgba(99, 140, 125, 0.2)", "#C48B28"]
    );
    const ringColor = useTransform(
        smoothProgress,
        [0, 1],
        ["rgba(99, 140, 125, 0.1)", "#C48B28"]
    );
    const stepScale = useTransform(
        smoothProgress,
        [0, 1],
        [1, 1.15]
    );

    return (
        <motion.div
            ref={stepRef}
            initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className={`flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0 relative md:min-h-[280px] ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
        >
            {/* Timeline Dot */}
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center justify-center">
                <motion.div
                    style={{
                        backgroundColor: stepColor,
                        scale: stepScale,
                        borderColor: ringColor
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-4 border-[#FEF9ED] ring-6 ring-[#FEF9ED]/50"
                >
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                </motion.div>
            </div>

            {/* Content Card */}
            <div className={`w-full md:w-[42%] group`}>
                <div className="relative p-1 rounded-[36px] bg-gradient-to-br from-border/50 to-transparent hover:from-brand-primary/20 transition-all duration-700 hover:-translate-y-2">
                    <div className="bg-bg-surface/80 backdrop-blur-xl p-6 md:p-8 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.04)] hover:shadow-brand-primary/5 transition-all duration-500 border border-border/50 relative overflow-hidden h-full">
                        <div className="absolute -top-8 -right-8 w-24 h-24 bg-brand-primary/15 rounded-full blur-2xl group-hover:bg-brand-primary/30 transition-colors"></div>

                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-xl bg-bg-secondary flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 shadow-inner">
                                {item.icon}
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1.5 text-text-tertiary text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                                    {item.badgeIcon}
                                    {item.badge}
                                </div>
                                {item.footer && (
                                    <span className="text-[10px] font-black text-brand-secondary/70 uppercase tracking-widest">{item.footer}</span>
                                )}
                            </div>
                        </div>

                        <h3 className="text-xl font-black text-text-primary mb-3 tracking-tight leading-tight group-hover:text-brand-primary transition-colors">
                            {item.title}
                        </h3>
                        <p className="text-text-secondary dark:text-text-secondary/90 leading-relaxed text-[15px] font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                            {item.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Empty side for layout */}
            <div className="hidden md:block md:w-[42%]"></div>
        </motion.div>
    );
};

export default HowItWorks;
