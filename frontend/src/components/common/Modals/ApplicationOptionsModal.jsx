import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Sparkles, AlertCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

const ApplicationOptionsModal = ({ isOpen, onClose, listingId }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { getUser, user } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [localUser, setLocalUser] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            getUser()
                .then((userData) => {
                    setLocalUser(userData);
                })
                .catch((error) => {
                    console.error('Error fetching user:', error);
                })
                .finally(() => {
                    setTimeout(() => setIsLoading(false), 400);
                });
        }
    }, [isOpen, getUser]);

    // Use localUser or fallback to user from hook
    const currentUser = localUser || user;

    const missingFields = [];

    if (!isLoading && currentUser) {
        if (currentUser.missing_profile_fields && Array.isArray(currentUser.missing_profile_fields)) {
            currentUser.missing_profile_fields.forEach(field => {
                if (field === 'first_name' || field === 'last_name') {
                    if (!missingFields.includes("Full Name")) missingFields.push("Full Name");
                }
                else if (field === 'email') missingFields.push("Email");
                else if (field === 'phone_number') missingFields.push("Phone Number");
                else if (field === 'location_city' || field === 'location_state') {
                    if (!missingFields.includes("Location (City/State)")) missingFields.push("Location (City/State)");
                }
                else if (field === 'date_of_birth') missingFields.push("Date of Birth");
                else if (field === 'email_verified') missingFields.push("Email Verification");
            });
        } else {
            if (!currentUser.first_name || !currentUser.last_name) missingFields.push("Full Name");
            if (!currentUser.email) missingFields.push("Email");
            if (!currentUser.phone_number) missingFields.push("Phone Number");
            if (!currentUser.location_city || !currentUser.location_state) missingFields.push("Location (City/State)");
            if (!currentUser.date_of_birth) missingFields.push("Date of Birth");

            if (!currentUser.email_verified) missingFields.push("Email Verification");
        }

        if (!missingFields.includes("Email Verification") && !currentUser.email_verified) {
            missingFields.push("Email Verification");
        }
    }

    const isProfileComplete = currentUser && missingFields.length === 0;

    const handleManual = () => {
        navigate(`/rehoming/listings/${listingId}/inquiry`);
        onClose();
    };

    const handleAI = () => {
        navigate(`/rehoming/listings/${listingId}/apply-ai`);
        onClose();
    };

    const handleCompleteProfile = () => {
        navigate('/dashboard/profile/settings', { state: { from: location.pathname } });
        onClose();
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[#402E11]/60 backdrop-blur-md z-[9999] cursor-pointer"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#FEF9ED] rounded-3xl sm:rounded-[2.5rem] shadow-2xl shadow-[#402E11]/20 w-full max-w-lg overflow-hidden pointer-events-auto border border-[#EBC176]/20 my-8"
                        >
                            {/* Header */}
                            <div className="p-6 sm:p-8 pb-4 flex justify-between items-center">
                                <h3 className="text-xl sm:text-2xl font-black text-[#402E11] tracking-tight">
                                    Start Application
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-[#EBC176]/10 text-[#402E11]/40 hover:text-[#402E11] transition-colors flex-shrink-0"
                                >
                                    <X size={20} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex flex-col justify-center min-h-[280px] sm:min-h-[300px]">
                                {isLoading ? (
                                    // Loading State
                                    <div className="flex flex-col items-center justify-center space-y-6 py-8">
                                        <div className="relative">
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-[#C48B28]/20 rounded-full"></div>
                                            <div className="absolute inset-0 border-4 border-[#C48B28] border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                        <p className="text-[10px] font-black text-[#402E11]/50 tracking-[0.2em] uppercase">Verifying Profile...</p>
                                    </div>
                                ) : !currentUser ? (
                                    // Not Logged In State
                                    <div className="space-y-6 text-center py-8">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-100">
                                            <AlertCircle size={28} className="sm:w-8 sm:h-8" strokeWidth={2.5} />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-lg sm:text-xl font-black text-[#402E11]">Login Required</h4>
                                            <p className="text-xs sm:text-sm font-bold text-[#402E11]/60">
                                                Please log in to continue with your application.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigate('/login', { state: { from: location.pathname } });
                                                onClose();
                                            }}
                                            className="group relative w-full bg-gradient-to-r from-[#C48B28] to-[#D4A34D] text-white rounded-xl sm:rounded-2xl py-3 sm:py-4 font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-[#C48B28]/20 hover:shadow-2xl hover:shadow-[#C48B28]/40 hover:-translate-y-0.5 transition-all active:scale-[0.98] overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                                            <span>Login Now</span>
                                            <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px] group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                                        </button>
                                    </div>
                                ) : !isProfileComplete ? (
                                    // Incomplete Profile State
                                    <div className="space-y-6 text-center">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-100">
                                            <AlertCircle size={28} className="sm:w-8 sm:h-8" strokeWidth={2.5} />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-lg sm:text-xl font-black text-[#402E11]">Complete Your Profile</h4>
                                            <p className="text-xs sm:text-sm font-bold text-[#402E11]/60 px-4">
                                                To ensure trust and safety, please complete the following fields before applying:
                                            </p>
                                        </div>

                                        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[1.5rem] text-left space-y-3 border border-[#EBC176]/20 shadow-sm max-h-[200px] overflow-y-auto">
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500 mb-2">Missing Requirements</p>
                                            <ul className="space-y-2">
                                                {missingFields.map((field, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-xs font-bold text-[#402E11]/80">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                                                        <span className="flex-1">{field}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <button
                                            onClick={handleCompleteProfile}
                                            className="group relative w-full bg-gradient-to-r from-[#C48B28] to-[#D4A34D] text-white rounded-xl sm:rounded-2xl py-3 sm:py-4 font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-[#C48B28]/20 hover:shadow-2xl hover:shadow-[#C48B28]/40 hover:-translate-y-0.5 transition-all active:scale-[0.98] overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                                            <span>Complete Profile</span>
                                            <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px] group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                                        </button>
                                    </div>
                                ) : (
                                    // Profile Complete - Show Options
                                    <div className="space-y-6 sm:space-y-8">
                                        <div className="text-center space-y-3">
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#E8FDF0] rounded-full flex items-center justify-center mx-auto text-[#22C55E] mb-2 shadow-sm border border-[#22C55E]/10">
                                                <CheckCircle2 size={28} className="sm:w-8 sm:h-8" strokeWidth={3} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg sm:text-xl font-black text-[#402E11] mb-1">Choose Application Method</h4>
                                                <p className="text-xs sm:text-sm font-bold text-[#402E11]/50 px-4">Your profile is verified. How would you like to proceed?</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <button
                                                onClick={handleManual}
                                                className="group relative flex flex-col items-center justify-center gap-3 sm:gap-4 p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-white border-2 border-[#EBC176]/10 hover:border-[#C48B28] hover:shadow-xl hover:shadow-[#C48B28]/10 transition-all text-center active:scale-95"
                                            >
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#FEF9ED] group-hover:bg-[#C48B28] flex items-center justify-center text-[#C48B28] group-hover:text-white transition-all duration-300">
                                                    <Mail size={20} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                                                </div>
                                                <div>
                                                    <h5 className="font-black text-[#402E11] text-base sm:text-lg mb-1 leading-tight">Manual<br />Application</h5>
                                                    <p className="text-[9px] sm:text-[10px] text-[#402E11]/40 group-hover:text-[#C48B28] uppercase tracking-[0.2em] font-black transition-colors">Send Message</p>
                                                </div>
                                            </button>

                                            <button
                                                onClick={handleAI}
                                                className="group relative flex flex-col items-center justify-center gap-3 sm:gap-4 p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-white border-2 border-purple-100 hover:border-[#8B5CF6] hover:shadow-xl hover:shadow-purple-200 transition-all text-center active:scale-95"
                                            >
                                                <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                                                    <Sparkles size={14} className="sm:w-4 sm:h-4 text-[#8B5CF6] animate-pulse" />
                                                </div>
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-purple-50 group-hover:bg-[#8B5CF6] flex items-center justify-center text-[#8B5CF6] group-hover:text-white transition-all duration-300">
                                                    <Sparkles size={20} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                                                </div>
                                                <div>
                                                    <h5 className="font-black text-[#402E11] text-base sm:text-lg mb-1 leading-tight">AI<br />Assistant</h5>
                                                    <p className="text-[9px] sm:text-[10px] text-[#8B5CF6] uppercase tracking-[0.2em] font-black">Smart Draft</p>
                                                </div>
                                            </button>
                                        </div>

                                        <p className="text-center text-[8px] sm:text-[9px] text-[#402E11]/30 max-w-xs mx-auto font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] px-4">
                                            Both methods submit directly to owner
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ApplicationOptionsModal;