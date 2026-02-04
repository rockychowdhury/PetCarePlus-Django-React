import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection = () => {
    return (
        <section className="py-24 bg-[#FEF9ED] relative overflow-hidden">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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

export default CTASection;
