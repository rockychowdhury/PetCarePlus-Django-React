import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const SortDropdown = ({ currentSort, onSortChange, options, customTrigger }) => {
    const [isOpen, setIsOpen] = useState(false);
    const sortRef = useRef(null);

    const defaultOptions = options || [
        { value: '-published_at', label: 'Newest First' },
        { value: 'created_at', label: 'Oldest First' },
        { value: 'distance', label: 'Nearest to Me' },
    ];

    const currentSortLabel = defaultOptions.find(opt => opt.value === currentSort)?.label || 'Newest First';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortRef.current && !sortRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleSelect = (value) => {
        onSortChange(value);
        setIsOpen(false);
    };

    const handleToggle = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setIsOpen(prev => !prev);
    };

    return (
        <div className="relative" ref={sortRef} style={{ zIndex: isOpen ? 250 : 60 }}>
            {/* Trigger Wrapper */}
            <div
                onClick={handleToggle}
                className="cursor-pointer relative z-20 group pointer-events-auto"
            >
                {customTrigger ? (
                    <div className="pointer-events-auto transition-transform active:scale-95 duration-200">
                        {customTrigger}
                    </div>
                ) : (
                    <button
                        type="button"
                        className="flex items-center gap-4 px-6 py-4 bg-white border border-[#EBC176]/30 rounded-2xl text-[10px] font-black text-themev2-text uppercase tracking-widest hover:bg-[#FAF3E0] hover:border-[#C48B28]/40 transition-all shadow-sm active:scale-95"
                    >
                        <span>Sort by: {currentSortLabel}</span>
                        <ChevronDown size={14} className={`text-[#EBC176] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                )}
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="absolute right-0 top-[calc(100%+12px)] w-64 bg-white border border-[#EBC176]/30 rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in"
                    style={{ zIndex: 1000 }}
                >
                    <div className="max-h-[350px] overflow-y-auto no-scrollbar py-2">
                        {defaultOptions.map((option) => {
                            const isActive = currentSort === option.value;
                            return (
                                <button
                                    key={option.value}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelect(option.value);
                                    }}
                                    className={`w-full text-left px-6 py-3.5 transition-all flex items-center justify-between group/item
                                        ${isActive
                                            ? 'bg-[#FAF3E0] text-[#402E11]'
                                            : 'text-[#402E11]/60 hover:text-[#402E11] hover:bg-[#FAF3E0]/50'
                                        }
                                    `}
                                >
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'translate-x-1' : ''} transition-all duration-200`}>
                                        {option.label}
                                    </span>
                                    {isActive && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#C48B28] shadow-sm" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SortDropdown;
