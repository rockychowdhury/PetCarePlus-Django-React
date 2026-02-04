import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SortDropdown = ({ currentSort, onSortChange, options, customTrigger }) => {
    const [isOpen, setIsOpen] = useState(false);
    const sortRef = useRef(null);

    const defaultOptions = [
        { value: '-published_at', label: 'Newest First' },
        { value: 'created_at', label: 'Oldest First' },
        { value: 'distance', label: 'Nearest to Me' },
    ];

    const displayOptions = options || defaultOptions;
    const currentSortLabel = displayOptions.find(opt => opt.value === currentSort)?.label || 'Newest First';

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortRef.current && !sortRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (value) => {
        onSortChange(value);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={sortRef}>
            {customTrigger ? (
                <div onClick={() => setIsOpen(!isOpen)}>
                    {customTrigger}
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-4 px-6 py-4 bg-white border border-[#EBC176]/20 rounded-2xl text-[10px] font-black text-themev2-text uppercase tracking-widest hover:bg-[#FAF3E0] transition-all shadow-sm active:scale-95"
                >
                    <span>Sort by: {currentSortLabel}</span>
                    <ChevronDown size={14} className={`text-[#EBC176] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            )}

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#EBC176]/20 rounded-2xl shadow-xl py-2 z-50 overflow-hidden"
                    >
                        {displayOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between
                                    ${currentSort === option.value ? 'bg-[#FAF3E0] text-[#C48B28]' : 'text-themev2-text/60 hover:bg-[#FAF3E0]/50 hover:text-themev2-text'}
                                `}
                            >
                                {option.label}
                                {currentSort === option.value && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#C48B28]" />
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SortDropdown;
