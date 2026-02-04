import React from 'react';
import { User, LogIn } from 'lucide-react';

const AuthToggle = ({ mode, onToggle }) => {
    return (
        <div className="bg-[#FAF3E0] p-1.5 rounded-full flex relative w-max mx-auto mb-6 shadow-inner shadow-[#402E11]/5">
            <button
                type="button"
                onClick={() => onToggle('register')}
                className={`relative z-10 flex items-center gap-2 px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${mode === 'register'
                    ? 'text-white'
                    : 'text-[#402E11]/60 hover:text-[#402E11]'
                    }`}
            >
                <User size={14} strokeWidth={3} />
                Sign Up
            </button>
            <button
                type="button"
                onClick={() => onToggle('login')}
                className={`relative z-10 flex items-center gap-2 px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${mode === 'login'
                    ? 'text-white'
                    : 'text-[#402E11]/60 hover:text-[#402E11]'
                    }`}
            >
                <LogIn size={14} strokeWidth={3} />
                Sign In
            </button>

            {/* Sliding Background */}
            <div
                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full shadow-lg shadow-[#402E11]/20 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] bg-[#402E11] ${mode === 'login'
                    ? 'translate-x-[calc(100%+0px)]'
                    : 'translate-x-0'
                    }`}
            />
        </div>
    );
};

export default AuthToggle;
