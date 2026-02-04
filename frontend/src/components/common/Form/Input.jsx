import React from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, CheckCircle } from 'lucide-react';

const Input = ({
    label,
    type = 'text',
    placeholder,
    error,
    success,
    helperText,
    startIcon,
    endIcon,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

    const baseInputStyles = 'w-full h-12 px-4 rounded-xl border bg-white text-[#402E11] placeholder:text-[#402E11]/30 focus:outline-none focus:ring-4 focus:ring-[#C48B28]/5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-[#402E11]/5 font-medium text-sm';

    let stateStyles = 'border-[#EBC176]/20 focus:border-[#C48B28]';
    if (error) {
        stateStyles = 'border-status-error focus:border-status-error focus:ring-status-error pr-10';
    } else if (success) {
        stateStyles = 'border-status-success focus:border-status-success focus:ring-status-success pr-10';
    }

    const iconPaddingLeft = startIcon ? 'pl-11' : '';
    const iconPaddingRight = endIcon ? 'pr-11' : '';

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label htmlFor={inputId} className="block text-[11px] font-black text-[#402E11] uppercase tracking-[0.2em] mb-2.5 ml-1">
                    {label}
                </label>
            )}

            <div className="relative">
                {startIcon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
                        {startIcon}
                    </div>
                )}

                <input
                    id={inputId}
                    type={type}
                    className={`${baseInputStyles} ${stateStyles} ${iconPaddingLeft} ${iconPaddingRight}`}
                    placeholder={placeholder}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                    {...props}
                />

                {/* Status Icons */}
                {error && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-status-error pointer-events-none">
                        <AlertCircle size={20} />
                    </div>
                )}

                {!error && success && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-status-success pointer-events-none">
                        <CheckCircle size={20} />
                    </div>
                )}

                {/* Custom End Icon (only shown if no status icon is showing, or handled via custom logic if desired, but for now mutually exclusive with status icons in this simplified view unless we adjust positioning) */}
                {!error && !success && endIcon && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary">
                        {endIcon}
                    </div>
                )}
            </div>

            {error && (
                <p id={`${inputId}-error`} className="mt-1.5 text-sm text-status-error font-medium flex items-center gap-1">
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

Input.propTypes = {
    label: PropTypes.string,
    type: PropTypes.string,
    placeholder: PropTypes.string,
    error: PropTypes.string,
    success: PropTypes.bool,
    helperText: PropTypes.string,
    startIcon: PropTypes.node,
    endIcon: PropTypes.node,
    className: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
};

export default Input;
