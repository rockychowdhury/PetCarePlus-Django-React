import React, { useState } from 'react';
import { X, Clock, Calendar, RefreshCcw, Info, Check, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const BlockTimeModal = ({ isOpen, onClose, onSubmit }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        block_date: new Date(),
        start_time: '09:00',
        end_time: '17:00',
        is_all_day: false,
        is_recurring: false,
        recurrence_pattern: 'WEEKLY',
        day_of_week: new Date().getDay() === 0 ? 6 : new Date().getDay() - 1,
        reason: ''
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.is_recurring && !formData.block_date) {
            toast.error('Please select a date');
            return;
        }

        if (!formData.is_all_day && formData.start_time >= formData.end_time) {
            toast.error('End time must be after start time');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                block_date: formData.block_date.toISOString().split('T')[0],
            };
            await onSubmit(payload);
            toast.success('Exception registered');
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create block');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#402E11]/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-[#EAE6E2] overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-[#FAF9F6] px-6 py-4 flex items-center justify-between border-b border-[#EAE6E2]">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#402E11] rounded-xl flex items-center justify-center text-[#C48B28] shadow-lg shadow-[#402E11]/10">
                                <Plus size={16} />
                            </div>
                            <h2 className="text-sm font-black text-[#402E11] uppercase tracking-widest">Add Exception</h2>
                        </div>
                        <button onClick={onClose} className="text-[#402E11]/30 hover:text-[#402E11] transition-colors p-1">
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-4">
                            {/* Type Toggle */}
                            <div className="flex p-1 bg-[#FAF9F6] rounded-xl border border-[#EAE6E2]">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, is_recurring: false }))}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!formData.is_recurring ? 'bg-white text-[#402E11] shadow-sm' : 'text-[#402E11]/30'}`}
                                >
                                    <Calendar size={11} />
                                    One-Time
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, is_recurring: true }))}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${formData.is_recurring ? 'bg-white text-[#402E11] shadow-sm' : 'text-[#402E11]/30'}`}
                                >
                                    <RefreshCcw size={11} />
                                    Recurring
                                </button>
                            </div>

                            {/* Date/Day Selection */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-widest ml-1">
                                    {formData.is_recurring ? 'Effective Day' : 'Target Date'}
                                </label>
                                {formData.is_recurring ? (
                                    <div className="grid grid-cols-7 gap-1">
                                        {days.map((day, idx) => (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, day_of_week: idx }))}
                                                className={`h-7 rounded-lg flex items-center justify-center text-[9px] font-black border transition-all ${formData.day_of_week === idx ? 'bg-[#402E11] border-[#402E11] text-white' : 'bg-white border-[#EAE6E2] text-[#402E11]/40'}`}
                                            >
                                                {day[0]}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="relative custom-datepicker">
                                        <DatePicker
                                            selected={formData.block_date}
                                            onChange={(date) => setFormData(prev => ({ ...prev, block_date: date }))}
                                            className="w-full bg-[#FAF9F6] border border-[#EAE6E2] rounded-xl px-3 py-2 text-[11px] font-bold text-[#402E11] focus:ring-1 focus:ring-[#C48B28] outline-none"
                                            placeholderText="Select date"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Time Selection */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-widest ml-1">Temporal Scope</label>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, is_all_day: !prev.is_all_day }))}
                                        className={`text-[7px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-md transition-all ${formData.is_all_day ? 'bg-green-500 text-white' : 'bg-[#FAF9F6] text-[#402E11]/30 border border-[#EAE6E2]'}`}
                                    >
                                        All Day
                                    </button>
                                </div>

                                {!formData.is_all_day && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <input
                                                type="time"
                                                value={formData.start_time}
                                                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                                                className="w-full bg-[#FAF9F6] border border-[#EAE6E2] rounded-xl px-3 py-2 text-[11px] font-black text-[#402E11] outline-none"
                                            />
                                        </div>
                                        <div className="w-2 h-[1px] bg-[#EAE6E2]" />
                                        <div className="flex-1">
                                            <input
                                                type="time"
                                                value={formData.end_time}
                                                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                                                className="w-full bg-[#FAF9F6] border border-[#EAE6E2] rounded-xl px-3 py-2 text-[11px] font-black text-[#402E11] outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Reason */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-widest ml-1">Context</label>
                                <textarea
                                    value={formData.reason}
                                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                    placeholder="e.g. Doctor's appointment, Vacation..."
                                    className="w-full bg-[#FAF9F6] border border-[#EAE6E2] rounded-xl px-3 py-2 text-[11px] font-bold text-[#402E11] focus:ring-1 focus:ring-[#C48B28] outline-none min-h-[60px] resize-none"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-1.5 text-[9px] font-black text-[#402E11]/50 uppercase tracking-[0.1em] border border-[#EAE6E2] rounded-xl hover:bg-[#FAF9F6] hover:text-[#402E11] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[1.5] py-1.5 bg-[#C48B28] hover:bg-[#B37A1F] text-white rounded-xl font-black text-[9px] uppercase tracking-[0.1em] shadow-md shadow-[#C48B28]/10 disabled:opacity-50 transition-all flex items-center justify-center gap-2 border border-[#B37A1F]/20"
                            >
                                {loading ? (
                                    <div className="w-2 h-2 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Check size={12} strokeWidth={3} />
                                )}
                                Register
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BlockTimeModal;
