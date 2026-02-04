import React from 'react';
import { Search, RefreshCcw, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../Buttons/Button';
import noResultsImage from '../../../assets/no_results_dog.png'; // Updated later if needed

const NoResults = ({
    title = "No pets found",
    description = "Try broadening your search or adjusting your area.",
    onReset,
    icon: Icon = Search,
    backgroundText = "EMPTY"
}) => {
    return (
        <div className="relative py-20 px-6 overflow-hidden bg-[#FAF9F6]/50 rounded-[3rem] border border-[#EBC176]/10">
            {/* Background Text Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12rem] md:text-[18rem] font-black text-[#F3EAD3]/40 select-none pointer-events-none z-0 uppercase tracking-tighter">
                {backgroundText}
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto text-center">
                {/* Image Section */}
                <div className="relative mb-8">
                    <motion.div
                        initial={{ rotate: -3, scale: 0.9, opacity: 0 }}
                        animate={{ rotate: -3, scale: 1, opacity: 1 }}
                        whileHover={{ rotate: 0, scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        className="w-48 h-48 md:w-56 md:h-56 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white bg-white relative"
                    >
                        <img
                            src={noResultsImage}
                            alt="No Results"
                            className="w-full h-full object-cover"
                        />
                    </motion.div>

                    {/* Magnifying Glass Badge */}
                    <motion.div
                        initial={{ scale: 0, rotate: 45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.4, type: 'spring' }}
                        className="absolute -top-3 -right-3 w-12 h-12 bg-[#638C7D] text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white"
                    >
                        <Search size={20} strokeWidth={3} />
                    </motion.div>
                </div>

                {/* Text Content */}
                <h3 className="text-2xl md:text-3xl font-black text-[#2D2418] mb-3 leading-tight tracking-tight">
                    {title}
                </h3>
                <p className="text-[#2D2418]/50 text-xs md:text-sm mb-10 max-w-[280px] mx-auto font-bold leading-relaxed">
                    {description}
                </p>

                {/* Reset Action */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onReset}
                    className="flex items-center gap-3 px-8 py-4 bg-[#638C7D] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#638C7D]/20 hover:bg-[#527a6b] transition-all group"
                >
                    <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                    Reset All Filters
                </motion.button>
            </div>
        </div>
    );
};

export { NoResults };
export default NoResults;
