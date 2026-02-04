import React, { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ClipboardCheck, FileText, ShieldCheck, FolderOpen, HeartHandshake, CheckCircle, Clock, Users, MapPin, FileSignature } from 'lucide-react';
import SectionCursor from '../common/SectionCursor';

const RehomingSection = () => {
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

    return (
        <section className="py-24 bg-[#FEF9ED] relative overflow-hidden">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
        </section>
    );
};

// Sub-component for Rehoming Steps
const TimelineStep = ({ item, index }) => {
    const stepRef = useRef(null);
    const { scrollYProgress: localProgress } = useScroll({
        target: stepRef,
        offset: ["center 85%", "center 60%"]
    });

    const smoothProgress = useSpring(localProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const stepColor = useTransform(smoothProgress, [0, 1], ["rgba(99, 140, 125, 0.2)", "#C48B28"]);
    const ringColor = useTransform(smoothProgress, [0, 1], ["rgba(99, 140, 125, 0.1)", "#C48B28"]);
    const stepScale = useTransform(smoothProgress, [0, 1], [1, 1.15]);

    return (
        <motion.div
            ref={stepRef}
            initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className={`flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0 relative md:min-h-[280px] ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
        >
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center justify-center">
                <motion.div
                    style={{ backgroundColor: stepColor, scale: stepScale, borderColor: ringColor }}
                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-4 border-[#FEF9ED] ring-6 ring-[#FEF9ED]/50"
                >
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                </motion.div>
            </div>

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
                                    {item.badgeIcon} {item.badge}
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

            <div className="hidden md:block md:w-[42%]"></div>
        </motion.div>
    );
};

export default RehomingSection;
