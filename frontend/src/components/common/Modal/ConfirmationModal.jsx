import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../Buttons/Button'; // Adjust path if needed, assuming generic Button exists

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText = "Delete",
    cancelText = "Cancel",
    isLoading = false,
    variant = "danger" // danger | warning | info
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-transparent transition-all"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm bg-bg-surface rounded-3xl shadow-2xl p-6 overflow-hidden border border-border"
                    >
                        {/* Blob Background Effect */}
                        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-radial from-status-error/5 to-transparent pointer-events-none" />

                        <div className="relative flex flex-col items-center text-center">
                            {/* Icon */}
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${variant === 'danger' ? 'bg-[#FAEAEA] text-[#E55C5C]' : 'bg-[#FAF3E0] text-[#C48B28]'}`}>
                                <AlertTriangle size={36} strokeWidth={2.5} />
                            </div>

                            {/* Text */}
                            <h3 className="text-2xl font-black text-[#402E11] mb-3 tracking-tight">
                                {title}
                            </h3>
                            <p className="text-[#402E11]/50 font-bold text-[13px] leading-relaxed mb-10 px-2 uppercase tracking-wide">
                                {message}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-4 w-full mt-2">
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-[#402E11]/40 hover:text-[#402E11] hover:bg-[#FAF3E0] transition-all disabled:opacity-50"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all disabled:opacity-50 disabled:shadow-none hover:scale-[1.02] active:scale-[0.98] ${variant === 'danger' ? 'bg-[#E55C5C] shadow-[#E55C5C]/20 hover:bg-[#D44B4B]' : 'bg-[#C48B28] shadow-[#C48B28]/20 hover:bg-[#A06D1B]'}`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {confirmText === 'Delete' ? 'Deleting...' : 'Processing...'}
                                        </span>
                                    ) : (
                                        confirmText
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
