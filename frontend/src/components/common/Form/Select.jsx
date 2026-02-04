import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Select = ({
    label,
    options = [],
    error,
    helperText,
    className = '',
    placeholder = 'Select an option',
    id,
    name,
    value,
    onChange,
    isDisabled,
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const selectId = id || name || Math.random().toString(36).substr(2, 9);

    // Handle both array of strings and array of objects {value, label}
    const normalizedOptions = options.map(opt =>
        typeof opt === 'string' ? { value: opt, label: opt } : opt
    );

    const selectedOption = normalizedOptions.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        if (isDisabled) return;
        setIsOpen(false);
        if (onChange) {
            onChange({ target: { name, value: optionValue } });
        }
    };

    return (
        <div className={`w-full ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-[11px] font-black text-[#402E11] uppercase tracking-[0.2em] mb-2.5 ml-1">
                    {label}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => !isDisabled && setIsOpen(!isOpen)}
                    disabled={isDisabled}
                    className={`
                        w-full h-12 px-4 rounded-xl border bg-white text-[#402E11] 
                        text-left flex items-center justify-between
                        transition-all duration-300 shadow-sm shadow-[#402E11]/5
                        ${isOpen ? 'border-[#C48B28] ring-4 ring-[#C48B28]/5' : 'border-[#EBC176]/20'}
                        ${error ? 'border-status-error ring-status-error/10' : ''}
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                >
                    <span className={`text-sm font-medium ${!selectedOption ? 'text-[#402E11]/40' : 'text-[#402E11]'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        className="text-[#C48B28]"
                    >
                        <ChevronDown size={18} strokeWidth={2.5} />
                    </motion.div>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 5, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute z-[100] w-full mt-1 bg-white border border-[#EBC176]/20 rounded-2xl shadow-2xl shadow-[#402E11]/10 overflow-hidden"
                        >
                            <div className="max-h-60 overflow-y-auto py-2">
                                {normalizedOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option.value)}
                                        className={`
                                            w-full px-4 py-3 text-left text-sm font-medium flex items-center justify-between
                                            transition-colors duration-200
                                            ${value === option.value ? 'bg-[#FEF9ED] text-[#C48B28]' : 'text-[#402E11] hover:bg-gray-50'}
                                        `}
                                    >
                                        {option.label}
                                        {value === option.value && <Check size={14} strokeWidth={3} />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hidden native select for form accessibility/compatibility if needed */}
                <select
                    id={selectId}
                    name={name}
                    value={value || ''}
                    onChange={handleSelect}
                    className="sr-only"
                    {...props}
                >
                    <option value="">{placeholder}</option>
                    {normalizedOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {error && (
                <p className="mt-1.5 text-sm text-status-error font-medium pl-1">
                    {error}
                </p>
            )}

            {!error && helperText && (
                <p className="mt-1.5 text-sm text-[#402E11]/40 font-medium pl-1">
                    {helperText}
                </p>
            )}
        </div>
    );
};

Select.propTypes = {
    label: PropTypes.string,
    options: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
                label: PropTypes.string.isRequired
            })
        ])
    ).isRequired,
    error: PropTypes.string,
    helperText: PropTypes.string,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
    onChange: PropTypes.func,
    isDisabled: PropTypes.bool
};

export default Select;
