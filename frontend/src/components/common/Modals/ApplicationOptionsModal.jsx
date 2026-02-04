import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Sparkles, AlertCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import Button from '../Buttons/Button';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

const ApplicationOptionsModal = ({ isOpen, onClose, listingId }) => {
    const navigate = useNavigate();
    const { getUser, user } = useAuth(); // Use 'user' from context

    const [isLoading, setIsLoading] = useState(true);
    // Removed local freshUser state, relying on context 'user' which getUser() updates

    // Fetch fresh user data when modal opens
    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            getUser()
                .finally(() => {
                    // Small artificial delay for smoother UX if fetch is too fast to see loading
                    setTimeout(() => setIsLoading(false), 800);
                });
        }
    }, [isOpen, getUser]);

    // Field Check Logic (Based on context user)
    const missingFields = [];

    // Only run checks if loading is complete to avoid flicker
    if (!isLoading) {
        if (!user) {
            missingFields.push("Please log in to continue.");
        } else {
            // Use backend source of truth if available, otherwise fallback to local check
            if (user.missing_profile_fields && Array.isArray(user.missing_profile_fields)) {
                user.missing_profile_fields.forEach(field => {
                    if (field === 'first_name' || field === 'last_name') {
                        if (!missingFields.includes("Full Name")) missingFields.push("Full Name");
                    }
                    else if (field === 'email') missingFields.push("Email");
                    else if (field === 'phone_number') missingFields.push("Phone Number");
                    else if (field === 'location_city' || field === 'location_state') {
                        if (!missingFields.includes("Location (City/State)")) missingFields.push("Location (City/State)");
                    }
                    else if (field === 'date_of_birth') missingFields.push("Date of Birth");
                    else if (field === 'phone_verified') missingFields.push("Phone Verification (Verify in settings)");
                    else if (field === 'email_verified') missingFields.push("Email Verification");
                });
            } else {
                // Fallback client-side check if backend data not quite clear (e.g. older session)
                if (!user.first_name || !user.last_name) missingFields.push("Full Name");
                if (!user.email) missingFields.push("Email");
                if (!user.phone_number) missingFields.push("Phone Number");
                if (!user.location_city || !user.location_state) missingFields.push("Location (City/State)");
                if (!user.date_of_birth) missingFields.push("Date of Birth");

                // Only check verification in fallback mode if missing
                if (!user.phone_verified) missingFields.push("Phone Verification (Verify in settings)");
                if (!user.email_verified) missingFields.push("Email Verification");
            }

            // Always enforce verification for applications, even if backend "Profile" (data) is complete
            if (!missingFields.includes("Phone Verification (Verify in settings)") && !user.phone_verified) {
                missingFields.push("Phone Verification (Verify in settings)");
            }
            if (!missingFields.includes("Email Verification") && !user.email_verified) {
                missingFields.push("Email Verification");
            }
        }
    }

    const isProfileComplete = user && missingFields.length === 0;



    const handleManual = () => {
        // Redirect to new Mailbox page
        navigate(`/rehoming/listings/${listingId}/inquiry`);
        onClose();
    };

    const handleAI = () => {
        navigate(`/rehoming/listings/${listingId}/apply-ai`);
        onClose();
    };

    const handleCompleteProfile = () => {
        // Redirect to settings
        navigate('/dashboard/profile/settings', { state: { from: `/pets/${listingId}` } });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[#402E11]/40 backdrop-blur-sm z-50 transition-opacity"
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#FEF9ED] rounded-[2.5rem] shadow-2xl shadow-[#402E11]/20 w-full max-w-lg overflow-hidden pointer-events-auto border border-[#EBC176]/20"
                        >
                            {/* Header */}
                            <div className="p-8 pb-4 flex justify-between items-center">
                                <h3 className="text-2xl font-black text-[#402E11] tracking-tight">
                                    Start Application
                                </h3>
                                <button onClick={onClose} className="p-2 rounded-full hover:bg-[#EBC176]/10 text-[#402E11]/40 hover:text-[#402E11] transition-colors">
                                    <X size={24} strokeWidth={2.5} />
                                </button>
                            </div>

                            <div className="px-8 pb-8 flex flex-col justify-center min-h-[300px]">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
                                        <div className="relative">
                                            <div className="w-16 h-16 border-4 border-[#C48B28]/20 rounded-full"></div>
                                            <div className="absolute inset-0 border-4 border-[#C48B28] border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                        <p className="text-[10px] font-black text-[#402E11]/50 tracking-[0.2em] uppercase">Verifying Profile...</p>
                                    </div>
                                ) : !isProfileComplete ? (
                                    <div className="space-y-6 text-center animate-in slide-in-from-bottom-4 duration-500">
                                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-100">
                                            <AlertCircle size={32} strokeWidth={2.5} />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-xl font-black text-[#402E11]">Complete Your Profile</h4>
                                            <p className="text-sm font-bold text-[#402E11]/60">
                                                To ensure trust and safety, please complete the following fields before applying:
                                            </p>
                                        </div>

                                        <div className="bg-white p-6 rounded-[1.5rem] text-left space-y-3 border border-[#EBC176]/20 shadow-sm">
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500 mb-2">Missing Requirements</p>
                                            <ul className="space-y-2">
                                                {missingFields.map((field, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-xs font-bold text-[#402E11]/80">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                                        {field}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <Button
                                            onClick={handleCompleteProfile}
                                            className="w-full py-4 bg-[#C48B28] hover:bg-[#A06D1B] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-[#C48B28]/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                        >
                                            Complete Profile <ArrowRight size={16} strokeWidth={3} />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                        <div className="text-center space-y-3">
                                            <div className="w-16 h-16 bg-[#E8FDF0] rounded-full flex items-center justify-center mx-auto text-[#22C55E] mb-2 shadow-sm border border-[#22C55E]/10">
                                                <CheckCircle2 size={32} strokeWidth={3} />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-[#402E11] mb-1">Choose Application Method</h4>
                                                <p className="text-sm font-bold text-[#402E11]/50">Your profile is verified. How would you like to proceed?</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Manual */}
                                            <button
                                                onClick={handleManual}
                                                className="group relative flex flex-col items-center justify-center gap-4 p-6 rounded-[2rem] bg-white border-2 border-[#EBC176]/10 hover:border-[#C48B28] hover:shadow-xl hover:shadow-[#C48B28]/10 transition-all text-center"
                                            >
                                                <div className="w-14 h-14 rounded-2xl bg-[#FEF9ED] group-hover:bg-[#C48B28] flex items-center justify-center text-[#C48B28] group-hover:text-white transition-all duration-300">
                                                    <Mail size={24} strokeWidth={2.5} />
                                                </div>
                                                <div>
                                                    <h5 className="font-black text-[#402E11] text-lg mb-1 leading-tight">Manual<br />Application</h5>
                                                    <p className="text-[10px] text-[#402E11]/40 group-hover:text-[#C48B28] uppercase tracking-[0.2em] font-black transition-colors">Send Message</p>
                                                </div>
                                            </button>

                                            {/* AI */}
                                            <button
                                                onClick={handleAI}
                                                className="group relative flex flex-col items-center justify-center gap-4 p-6 rounded-[2rem] bg-white border-2 border-purple-100 hover:border-[#8B5CF6] hover:shadow-xl hover:shadow-purple-200 transition-all text-center"
                                            >
                                                <div className="absolute top-4 right-4">
                                                    <Sparkles size={16} className="text-[#8B5CF6] animate-pulse" />
                                                </div>
                                                <div className="w-14 h-14 rounded-2xl bg-purple-50 group-hover:bg-[#8B5CF6] flex items-center justify-center text-[#8B5CF6] group-hover:text-white transition-all duration-300">
                                                    <Sparkles size={24} strokeWidth={2.5} />
                                                </div>
                                                <div>
                                                    <h5 className="font-black text-[#402E11] text-lg mb-1 leading-tight">AI<br />Assistant</h5>
                                                    <p className="text-[10px] text-[#8B5CF6] uppercase tracking-[0.2em] font-black">Smart Draft</p>
                                                </div>
                                            </button>
                                        </div>

                                        <p className="text-center text-[9px] text-[#402E11]/30 max-w-xs mx-auto font-black uppercase tracking-[0.2em]">
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
