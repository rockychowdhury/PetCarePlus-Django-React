
import { Link } from "react-router-dom";

const Logo = ({ className = "", variant = "default" }) => {
    const textColor = variant === 'white' ? 'text-white' : 'text-[var(--logo-text)]';

    return (
        <div className={`flex items-center gap-3.5 ${className}`}>
            {/* Next Level Icon Container */}
            <div className="relative group/logo cursor-pointer shrink-0">
                {/* Outer Decorative Circle */}
                <div className="w-12 h-12 rounded-full border border-[var(--logo-secondary)]/20 bg-[var(--logo-bg)]/50 flex items-center justify-center p-1.5 transition-all duration-500 group-hover/logo:rotate-12">
                    {/* Inner Rounded Squircle Container */}
                    <div className="w-full h-full rounded-[0.9rem] bg-white border border-[var(--logo-secondary)]/30 shadow-[0_4px_12px_rgba(var(--color-brand-primary-rgb),0.08)] flex items-center justify-center overflow-hidden relative">
                        {/* Subtle background pattern or shine could go here */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--logo-bg)]/40 to-transparent opacity-50" />

                        <img
                            src="/favicon.png"
                            alt="PetCare+ Icon"
                            className="w-5.5 h-5.5 object-contain relative z-10 transition-transform duration-500 group-hover/logo:scale-110"
                        />
                    </div>
                </div>
            </div>

            {/* Refined Typography */}
            <div className="flex flex-col text-left">
                <Link to='/'>
                <h2 className={`font-outfit font-black text-2xl tracking-tight leading-none ${textColor} flex items-center gap-0.5`}>
                    PetCare<span className="text-[var(--logo-primary)] text-3xl leading-none -mt-1">+</span>
                </h2></Link>
                <span className={`text-[8px] font-black uppercase tracking-[0.25em] ${textColor === 'text-white' ? 'text-white/40' : 'text-[var(--logo-primary)]/80'} mt-1`}>
                    Premium Pet Services
                </span>
            </div>
        </div>
    );
};

export default Logo;