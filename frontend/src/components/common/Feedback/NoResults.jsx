import React from 'react';
import { Search, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const NoResults = ({
    title = "No matches found",
    description = "Try broadening your search or adjusting your area.",
    onReset,
    actionLabel = "Reset All Filters",
    icon: Icon = Search,
    // Unused but kept for compatibility if passed
    backgroundText = "EMPTY"
}) => {
    return (
        <div className="max-w-2xl mx-auto py-10 px-6 text-center bg-white border-2 border-dashed border-[#EBC176]/30 rounded-[2.5rem] mb-8">
            <div className="w-14 h-14 bg-[#FAF3E0] rounded-full flex items-center justify-center mx-auto mb-4 text-[#C48B28]">
                <Icon size={28} strokeWidth={2.5} />
            </div>

            <h3 className="text-xl font-black text-[#402E11] mb-2 tracking-tight">
                {title}
            </h3>

            <p className="text-[#402E11]/60 font-medium text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                {description}
            </p>

            {onReset && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onReset}
                    className="bg-[#C48B28] text-white rounded-2xl px-8 py-3 font-black text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-[#C48B28]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    {actionLabel}
                </motion.button>
            )}
        </div>
    );
};

export { NoResults };
export default NoResults;
