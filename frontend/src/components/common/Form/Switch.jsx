import React from 'react';
import PropTypes from 'prop-types';

const Switch = ({
    label,
    checked,
    onChange,
    isDisabled,
    id,
    name,
    className = '',
    size = 'md',
    ...props
}) => {
    const switchId = id || name || React.useMemo(() => `switch-${Math.random().toString(36).substr(2, 9)}`, []);

    const sizeClasses = {
        sm: {
            track: 'w-8 h-4',
            thumb: 'after:w-3 after:h-3',
            translate: 'peer-checked:after:translate-x-4'
        },
        md: {
            track: 'w-11 h-6',
            thumb: 'after:w-5 after:h-5',
            translate: 'peer-checked:after:translate-x-5'
        },
        lg: {
            track: 'w-14 h-7',
            thumb: 'after:w-6 after:h-6',
            translate: 'peer-checked:after:translate-x-7'
        }
    };

    const current = sizeClasses[size] || sizeClasses.md;

    return (
        <label className={`group flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:bg-bg-secondary cursor-pointer transition-all active:scale-[0.98] ${className}`}>
            {/* Toggle Switch */}
            <div className="relative inline-flex items-center shrink-0">
                <input
                    id={switchId}
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    disabled={isDisabled}
                    className="peer sr-only"
                    {...props}
                />
                <div className={`
                    ${current.track} bg-gray-200 dark:bg-gray-600 
                    rounded-full transition-all duration-300
                    after:content-[''] after:absolute after:top-[2px] after:start-[2px] 
                    after:bg-white after:rounded-full after:transition-all after:duration-300
                    after:shadow-sm
                    ${current.thumb}
                    ${current.translate}
                    peer-checked:bg-[#C48B28]
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group-hover:bg-gray-300'}
                `}></div>
            </div>

            {/* Label Text */}
            {label && (
                <span
                    className={`text-xs font-black uppercase tracking-[0.1em] transition-colors flex-1 ${checked ? 'text-[#C48B28]' : 'text-[#402E11]/60'} ${isDisabled ? 'text-text-tertiary' : ''} select-none`}
                >
                    {label}
                </span>
            )}
        </label>
    );
};

Switch.propTypes = {
    label: PropTypes.node,
    checked: PropTypes.bool,
    onChange: PropTypes.func,
    isDisabled: PropTypes.bool,
    id: PropTypes.string,
    name: PropTypes.string,
    className: PropTypes.string,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default Switch;
