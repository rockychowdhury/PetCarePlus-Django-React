import React from 'react';
import PropTypes from 'prop-types';
import { Check } from 'lucide-react';

const Checkbox = ({
    label,
    checked,
    onChange,
    error,
    isDisabled,
    id,
    name,
    className = '',
    ...props
}) => {
    const checkboxId = id || name || Math.random().toString(36).substr(2, 9);

    return (
        <div className={`flex items-start ${className}`}>
            <div className="relative flex items-center pt-0.5">
                <input
                    id={checkboxId}
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    disabled={isDisabled}
                    className="peer h-5 w-5 opacity-0 absolute z-10 cursor-pointer disabled:cursor-not-allowed"
                    {...props}
                />
                <div className={`
                h-5 w-5 rounded border flex items-center justify-center transition-all duration-200
                peer-focus:border-brand-secondary
                ${checked ? 'bg-brand-secondary border-brand-secondary' : 'bg-bg-surface border-border'}
                ${isDisabled ? 'opacity-50 bg-bg-secondary' : 'hover:border-brand-secondary'}
                ${error ? 'border-status-error' : ''}
            `}>
                    <Check size={14} className={`text-white transition-transform duration-200 ${checked ? 'scale-100' : 'scale-0'}`} strokeWidth={3} />
                </div>
            </div>

            {label && (
                <label
                    htmlFor={checkboxId}
                    className={`ml-3 text-sm font-medium leading-none cursor-pointer select-none mt-1 ${isDisabled ? 'text-text-tertiary' : 'text-text-primary'}`}
                >
                    {label}
                </label>
            )}
        </div>
    );
};

Checkbox.propTypes = {
    label: PropTypes.node,
    checked: PropTypes.bool,
    onChange: PropTypes.func,
    error: PropTypes.bool, // Boolean for error state on the input itself
    isDisabled: PropTypes.bool,
    id: PropTypes.string,
    name: PropTypes.string,
    className: PropTypes.string,
};

export default Checkbox;
