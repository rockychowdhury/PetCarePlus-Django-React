import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, History, HeartHandshake, Sparkles, CheckCircle } from 'lucide-react';
import SectionCursor from '../common/SectionCursor';
import star from '../../assets/star.png';

const TrustSection = () => {
    const trustCards = [
        {
            icon: <ShieldCheck className="text-brand-primary" />,
            title: "Expert Services",
            description: "Find verified veterinarians, groomers, and pet sitters committed to providing top-tier care for your furry friends.",
            badge: "Professional Care"
        },
        {
            icon: <HeartHandshake className="text-status-success" />,
            title: "Safe Rehoming",
            description: "A transparent adoption process that connects pets directly with loving new families, bypassing shelters.",
            badge: "Direct Adoption"
        },
        {
            icon: <CheckCircle className="text-brand-secondary" />,
            title: "Verified Community",
            description: "Safety first. Every member and provider is verified to ensure a trusted and secure environment for all.",
            badge: "Trusted Network"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1, y: 0,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 100,
            }
        }
    };

    return (
        <section className="py-24 bg-[#FEF9ED] relative overflow-hidden">
            <SectionCursor label="TRUST & SAFETY" icon={<ShieldCheck size={14} />}>
                {/* Background Decorative Blur */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#C48B28]/5 rounded-full blur-[120px] -z-10"></div>

                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16 relative"
                    >
                        <div className="relative inline-block">
                            <h2 className="text-4xl md:text-5xl font-black text-themev2-text mb-6 leading-tight tracking-tight">
                                Trusted Services &<br />
                                <span className="text-[#C48B28]">Responsible Rehoming</span>
                            </h2>
                            <motion.img
                                animate={{ rotate: 360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                src={star}
                                alt=""
                                className="absolute -top-8 -right-12 w-8 h-8 opacity-60 hidden md:block"
                                style={{ filter: 'brightness(0)' }}
                            />
                        </div>

                        <p className="text-themev2-text/60 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
                            Connecting you with expert pet care professionals and a safe, supportive community for finding your pet's next loving home.
                        </p>
                    </motion.div>

                    {/* Trust Cards Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid md:grid-cols-3 gap-8 lg:gap-12"
                    >
                        {trustCards.map((card, idx) => (
                            <motion.div
                                key={idx}
                                variants={cardVariants}
                                className="group relative bg-white p-12 rounded-[56px] shadow-sm hover:shadow-lg border border-[#EBC176]/20 transition-all duration-300 hover:-translate-y-3 flex flex-col items-center text-center"
                            >
                                <div className="mb-10 p-6 rounded-[32px] bg-[#FEF9ED] group-hover:bg-[#C48B28]/10 group-hover:scale-110 transition-all duration-700 flex items-center justify-center">
                                    {React.cloneElement(card.icon, { size: 36, strokeWidth: 1.5 })}
                                </div>

                                <div className="inline-block px-4 py-1.5 bg-[#FEF9ED] rounded-xl text-[10px] font-black text-themev2-text/40 uppercase tracking-[0.2em] mb-6 group-hover:text-[#C48B28] transition-colors">
                                    {card.badge}
                                </div>

                                <h3 className="text-2xl font-black text-themev2-text mb-5  tracking-tight leading-tight">
                                    {card.title}
                                </h3>
                                <p className="text-themev2-text/60 leading-relaxed font-medium text-[15px]">
                                    {card.description}
                                </p>

                                {/* Corner Accent */}
                                {idx === 1 && (
                                    <div className="absolute top-8 right-8 text-brand-primary/40 group-hover:text-brand-primary transition-colors duration-500">
                                        <CheckCircle size={22} strokeWidth={2} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>

                </div>
            </SectionCursor>
        </section>
    );
};

export default TrustSection;
