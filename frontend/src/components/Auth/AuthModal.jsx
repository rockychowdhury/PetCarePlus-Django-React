import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import FeatureCarousel from './FeatureCarousel';
import AuthForm from './AuthForm';
import useAuth from '../../hooks/useAuth';
import { getRoleBasedRedirect } from '../../utils/roleRedirect';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!isOpen) return null;

    const handleSuccess = (options = {}) => {
        onClose();
        if (options.preventRedirect) return;

        // Navigate based on role after successful login
        const redirectPath = getRoleBasedRedirect(user);
        navigate(redirectPath, { replace: true });
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
            {/* Modal Container */}
            <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden flex min-h-[580px] animate-scale-up">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 p-2.5 bg-[#FAF3E0] hover:bg-[#EBC176]/20 rounded-full transition-all duration-300 shadow-sm border border-[#402E11]/10 group"
                >
                    <X size={20} strokeWidth={3} className="text-[#402E11]/40 group-hover:text-[#402E11]" />
                </button>

                {/* Left Side - Carousel (Hidden on Mobile) */}
                <div className="hidden lg:block w-1/2 relative">
                    <FeatureCarousel />
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 p-8 md:p-10 lg:p-12 flex flex-col justify-center bg-white">
                    <AuthForm initialMode={initialMode} onSuccess={handleSuccess} />
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
