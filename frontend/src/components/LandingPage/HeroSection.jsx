import React from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import bannerImg from '../../assets/bannerimg.png';
import catImg from '../../assets/cat.png';
import star from '../../assets/star.png';
import stars from '../../assets/stars.png';
import aboutImage1 from '../../assets/about1.png';
import aboutImage2 from '../../assets/about2.jpg';
import { Heart, ShieldCheck, MessageCircle, Sparkles, Star } from 'lucide-react';
import SectionCursor from '../common/SectionCursor';
import Button from '../common/Buttons/Button';

const HeroSection = () => {
    // Animation Variants
    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 20,
                stiffness: 100,
            },
        },
    };

    const revealVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    return (
        <section className="relative w-full min-h-screen md:pt-24 pt-24 flex flex-col lg:flex-row overflow-hidden bg-[#FEF9ED] transition-colors duration-300">
            <SectionCursor label="PET NETWORK" icon={<Sparkles size={14} />} className="w-full h-full">


                {/* Content Container */}
                <div className="max-w-[1700px] mx-auto px-8 sm:px-12 lg:px-32 relative z-10 flex flex-col lg:flex-row h-full items-center flex-1 py-12 lg:pt-0 lg:pb-32">

                    {/* Left Side */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="w-full lg:w-1/2 flex-1 flex flex-col lg:space-y-8 justify-center py-12 lg:py-0 relative"
                    >
                        {/* Decorative Stars Left */}
                        <motion.img
                            variants={itemVariants}
                            src={stars}
                            alt="stars"
                            className="absolute top-1/4 -left-12 w-16 h-16 opacity-30 pointer-events-none"
                            style={{ filter: 'brightness(0)' }}
                        />

                        {/* Main Heading */}
                        <motion.div
                            variants={revealVariants}
                            className="mb-8"
                        >
                            <motion.h1
                                variants={itemVariants}
                                className="text-4xl sm:text-5xl lg:text-6xl leading-tight font-black text-themev2-text relative"
                            >
                                Expert Services & <br />
                                <span className="text-[#C48B28] relative inline-block">
                                    Trusted
                                </span> Rehoming<br /> Care
                            </motion.h1>
                        </motion.div>

                        {/* Subheading */}
                        <motion.div
                            variants={itemVariants}
                            className="mb-10 max-w-lg relative"
                        >
                            <p className="text-themev2-text/60 text-lg leading-relaxed font-bold max-w-lg">
                                Connect with verified veterinarians, groomers, and foster carers. The trusted community for expert pet care and responsible rehoming.
                            </p>
                        </motion.div>

                        {/* Social Proof */}
                        <motion.div
                            variants={itemVariants}
                            className="flex items-center gap-6 mb-12"
                        >
                            <div className="relative flex items-center">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="relative w-12 h-12 rounded-full border-[3px] border-[#FEF9ED] overflow-hidden -ml-4 first:ml-0 shadow-lg">
                                        <img
                                            className="w-full h-full object-cover"
                                            src={`https://i.pravatar.cc/100?img=${i + 25}`}
                                            alt="User"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col justify-center">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} className="fill-[#C48B28] text-[#C48B28]" />
                                    ))}
                                </div>
                                <p className="text-[11px] font-black text-[#C48B28] uppercase tracking-[0.2em] leading-none">
                                    25K+ Verified Pet Lovers
                                </p>
                            </div>
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-wrap gap-4"
                        >
                            <Link to="/services" className="flex items-center justify-center rounded-full px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] bg-[#C48B28] text-white hover:bg-[#A9761F] shadow-xl shadow-[#C48B28]/20 transition-all duration-300 hover:scale-105 active:scale-95">
                                Find Services
                            </Link>
                            <Link to="/dashboard/pets/create" className="flex items-center justify-center rounded-full px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] bg-[#FEF9ED] text-[#C48B28] border-2 border-[#C48B28] hover:bg-[#C48B28] hover:text-white transition-all duration-300 hover:scale-105 active:scale-95">
                                Add Your Pet
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Right Side - Layered Image Layout */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="w-full lg:w-1/2 flex-1 flex items-center justify-center relative mt-12 lg:mt-0"
                    >
                        {/* Layered Content Container - Trusting children for height */}
                        <div className="relative w-full max-w-2xl px-4 flex justify-center items-center">

                            {/* Elegant Decorative Elements (Behind) */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] bg-[#C48B28]/10 rounded-[100px] blur-[100px] -z-10 rotate-12"></div>

                            {/* Images Layout Container */}
                            <div className="relative h-[450px] lg:h-[550px] w-full">
                                {/* Main Image */}
                                <motion.div
                                    variants={itemVariants}
                                    className="absolute top-20 right-20 w-[80%] h-[80%] rounded-[2.5rem] overflow-hidden  z-0"
                                >
                                    {/* Overlay for Dark Mode contrast */}
                                    <div className="absolute inset-0 bg-black/5 dark:bg-black/40 mix-blend-multiply z-20 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-500"></div>
                                    <img
                                        src={aboutImage1}
                                        alt="Dog running"
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>

                                {/* Overlapping Image (Bottom Right) */}
                                <motion.div
                                    variants={itemVariants}
                                    className="absolute -bottom-10 right-0 w-[40%] h-[40%] rounded-[2rem] overflow-hidden shadow-2xl border-[12px] border-[#FEF9ED] z-10"
                                >
                                    <img
                                        src={aboutImage2}
                                        alt="Puppy detail"
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>
                            </div>

                            {/* Decorative Star */}
                            <motion.img
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                src={star}
                                alt=""
                                className="absolute top-0 right-0 w-12 h-12 opacity-40 hidden md:block dark:invert transition-all duration-300 z-20"
                                style={{ filter: 'brightness(0)' }}
                            />
                        </div>
                    </motion.div>
                </div>


            </SectionCursor>

        </section>
    );
};

export default HeroSection;

