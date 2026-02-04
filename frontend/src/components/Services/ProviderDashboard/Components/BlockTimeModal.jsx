import React, { useState } from 'react';
import { X, Clock, Calendar, RefreshCcw, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Button from '../../../../components/common/Buttons/Button';
import DatePicker from 'react-datepicker';

const BlockTimeModal = ({ isOpen, onClose, onSubmit }) => {
    const [blockType, setBlockType] = useState('single'); // single, all-day, recurring
    const [blockDate, setBlockDate] = useState(new Date());
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [dayOfWeek, setDayOfWeek] = useState(0); // Monday
    const [recurrencePattern, setRecurrencePattern] = useState('weekly');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const daysOfWeek = [
        { value: 0, label: 'Monday' },
        { value: 1, label: 'Tuesday' },
        { value: 2, label: 'Wednesday' },
        { value: 3, label: 'Thursday' },
        { value: 4, label: 'Friday' },
        { value: 5, label: 'Saturday' },
        { value: 6, label: 'Sunday' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (blockType !== 'recurring' && !blockDate) {
            toast.error('Please select a date');
            return;
        }

        if (blockType === 'single' && startTime >= endTime) {
            toast.error('End time must be after start time');
            return;
        }

        setSubmitting(true);

        const blockData = {
            is_recurring: blockType === 'recurring',
            is_all_day: blockType === 'all-day',
        };

        if (blockType === 'recurring') {
            blockData.day_of_week = dayOfWeek;
            blockData.recurrence_pattern = recurrencePattern;
            blockData.start_time = startTime;
            blockData.end_time = endTime;
        } else {
            blockData.block_date = blockDate.toISOString().split('T')[0];
            if (blockType === 'single') {
                blockData.start_time = startTime;
                blockData.end_time = endTime;
            }
        }

        if (reason.trim()) {
            blockData.reason = reason;
        }

        try {
            await onSubmit(blockData);
            toast.success('Exception registered');
            onClose();
            // Reset form
            setBlockType('single');
            setReason('');
            setStartTime('09:00');
            setEndTime('17:00');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to block time');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-[#402E11]/40 backdrop-blur-md flex items-center justify-center z-[100] p-4 text-[#402E11]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-[3rem] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-[#FAF9F6]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-10 border-b border-[#FAF9F6] bg-[#FAF9F6]/30">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Register Exception</h2>
                            <p className="text-[#402E11]/40 text-xs font-bold uppercase tracking-widest mt-1">Configure schedule override</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-12 h-12 bg-white rounded-2xl border border-[#EAE6E2] flex items-center justify-center text-[#402E11]/40 hover:text-[#402E11] transition-all shadow-sm"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto">
                        {/* Block Type Selection */}
                        <div className="grid grid-cols-3 gap-3 p-1.5 bg-[#FAF9F6] rounded-3xl border border-[#EAE6E2]">
                            {[
                                { id: 'single', label: 'Time Slot', icon: Clock },
                                { id: 'all-day', label: 'All Day', icon: Calendar },
                                { id: 'recurring', label: 'Recurring', icon: RefreshCcw }
                            ].map(type => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setBlockType(type.id)}
                                    className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl transition-all ${blockType === type.id
                                            ? 'bg-white text-[#402E11] shadow-xl shadow-[#402E11]/5 border border-[#EAE6E2]'
                                            : 'text-[#402E11]/30 hover:text-[#402E11]/60'
                                        }`}
                                >
                                    <type.icon size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Date Selection (for non-recurring) */}
                        {blockType !== 'recurring' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1">Target Date</label>
                                <div className="relative">
                                    <DatePicker
                                        selected={blockDate}
                                        onChange={(date) => setBlockDate(date)}
                                        minDate={new Date()}
                                        className="w-full bg-[#FAF9F6] border border-[#EAE6E2] rounded-2xl px-5 py-4 text-sm font-black focus:ring-2 focus:ring-[#C48B28] transition-all outline-none"
                                        dateFormat="MMMM d, yyyy"
                                    />
                                    <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 text-[#402E11]/20 pointer-events-none" size={18} />
                                </div>
                            </motion.div>
                        )}

                        {/* Recurring Options */}
                        {blockType === 'recurring' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1">Day of Week</label>
                                        <select
                                            value={dayOfWeek}
                                            onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                                            className="w-full bg-[#FAF9F6] border border-[#EAE6E2] rounded-2xl px-5 py-4 text-sm font-black focus:ring-2 focus:ring-[#C48B28] transition-all outline-none"
                                        >
                                            {daysOfWeek.map((day) => (
                                                <option key={day.value} value={day.value}>{day.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1">Recurrence</label>
                                        <select
                                            value={recurrencePattern}
                                            onChange={(e) => setRecurrencePattern(e.target.value)}
                                            className="w-full bg-[#FAF9F6] border border-[#EAE6E2] rounded-2xl px-5 py-4 text-sm font-black focus:ring-2 focus:ring-[#C48B28] transition-all outline-none"
                                        >
                                            <option value="weekly">Every Week</option>
                                            <option value="biweekly">Every 2 Weeks</option>
                                            <option value="monthly">Every Month</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Time Range (for single and recurring) */}
                        {blockType !== 'all-day' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1">Starts At</label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full bg-[#FAF9F6] border border-[#EAE6E2] rounded-2xl px-5 py-4 text-sm font-black focus:ring-2 focus:ring-[#C48B28] transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1">Ends At</label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full bg-[#FAF9F6] border border-[#EAE6E2] rounded-2xl px-5 py-4 text-sm font-black focus:ring-2 focus:ring-[#C48B28] transition-all outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Reason */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1">Reason / Note</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g., Vacation, Family Commitment, Cleaning Day..."
                                rows={3}
                                className="w-full bg-[#FAF9F6] border border-[#EAE6E2] rounded-3xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-[#C48B28] transition-all outline-none resize-none placeholder:text-[#402E11]/20"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-6 border-t border-[#FAF9F6]">
                            <Button
                                type="button"
                                onClick={onClose}
                                variant="outline"
                                className="flex-1 py-4 border-[#EAE6E2] text-[#402E11]/40 font-black uppercase tracking-widest text-[10px] rounded-2xl"
                            >
                                Abandon
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={submitting}
                                className="flex-1 py-4 bg-[#C48B28] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-[#C48B28]/20"
                            >
                                {submitting ? 'Registering...' : 'Confirm Exception'}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BlockTimeModal;
