import React from 'react';
import PropTypes from 'prop-types';

const Textarea = ({
    label,
    placeholder,
    error,
    helperText,
    className = '',
    rows = 4,
    maxLength,
    value,
    onChange,
    id,
    name,
    ...props
}) => {
    const inputId = id || name || Math.random().toString(36).substr(2, 9);

    const baseStyles = 'w-full p-4 rounded-2xl border bg-white text-[#402E11] placeholder:text-[#402E11]/30 focus:outline-none focus:ring-4 focus:ring-[#C48B28]/5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed resize-y min-h-[100px] shadow-sm shadow-[#402E11]/5 font-medium text-sm';

    let stateStyles = 'border-[#EBC176]/20 focus:border-[#C48B28]';
    if (error) {
        stateStyles = 'border-status-error focus:border-status-error focus:ring-status-error';
    }

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <div className="flex justify-between mb-2.5 ml-1">
                    <label htmlFor={inputId} className="block text-[11px] font-black text-[#402E11] uppercase tracking-[0.2em]">
                        {label}
                    </label>
                </div>
            )}

            <div className="relative">
                <textarea
                    id={inputId}
                    name={name}
                    className={`${baseStyles} ${stateStyles}`}
                    placeholder={placeholder}
                    rows={rows}
                    maxLength={maxLength}
                    value={value}
                    onChange={onChange}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                    {...props}
                />

                {maxLength && (
                    <div className="absolute bottom-3 right-3 text-xs text-text-tertiary bg-bg-surface/80 px-1 rounded">
                        {(value?.length || 0)}/{maxLength}
                    </div>
                )}
            </div>

            {error && (
                <p id={`${inputId}-error`} className="mt-1.5 text-sm text-status-error font-medium">
                    {error}
                </p>
            )}

            {!error && helperText && (
                <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-text-secondary">
                    {helperText}
                </p>
            )}
        </div>
    );
};

Textarea.propTypes = {
    label: PropTypes.string,
    placeholder: PropTypes.string,
    error: PropTypes.string,
    helperText: PropTypes.string,
    className: PropTypes.string,
    rows: PropTypes.number,
    maxLength: PropTypes.number,
    value: PropTypes.string,
    onChange: PropTypes.func,
    id: PropTypes.string,
    name: PropTypes.string,
};

export default Textarea;
