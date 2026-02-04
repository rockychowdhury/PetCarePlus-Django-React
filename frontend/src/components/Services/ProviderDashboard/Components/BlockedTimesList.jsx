import React from 'react';
import {
    Calendar, X, Clock, AlertCircle,
    RefreshCcw, ArrowRight, Ban, Info
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../../components/common/Buttons/Button';
import Badge from '../../../../components/common/Display/Badge';

const BlockedTimesList = ({ blocks, onDelete, loading }) => {
    const oneTimeBlocks = blocks?.filter(b => !b.is_recurring) || [];
    const recurringBlocks = blocks?.filter(b => b.is_recurring) || [];

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="w-12 h-12 border-4 border-[#402E11]/5 border-t-[#C48B28] rounded-full animate-spin" />
                <p className="text-[#402E11]/40 text-xs font-black uppercase tracking-[0.2em]">Synchronizing Exceptions</p>
            </div>
        );
    }

    if (blocks?.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24 bg-[#FAF9F6]/50 rounded-[3rem] border-2 border-dashed border-[#EAE6E2]"
            >
                <div className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center text-[#402E11]/10 shadow-sm mb-6">
                    <Ban size={40} />
                </div>
                <h3 className="text-xl font-black text-[#402E11] mb-2">Clear Schedule</h3>
                <p className="text-[#402E11]/40 text-sm font-bold max-w-xs text-center">
                    You haven't added any availability exceptions yet. Your weekly schedule is currently fully active.
                </p>
            </motion.div>
        );
    }

    const BlockCard = ({ block, isRecurring }) => (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="group bg-white border border-[#EAE6E2] rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-[#402E11]/5 transition-all relative overflow-hidden"
        >
            <div className="flex items-start justify-between relative z-10">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        {isRecurring ? (
                            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                                <RefreshCcw size={14} />
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
                                <Calendar size={14} />
                            </div>
                        )}
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#402E11]/40">
                            {isRecurring ? 'Recurring Logic' : 'Date Exception'}
                        </span>
                    </div>

                    <div className="mb-4">
                        <div className="text-lg font-black text-[#402E11]">
                            {isRecurring
                                ? `Every ${daysOfWeek[block.day_of_week]}`
                                : format(new Date(block.block_date), 'MMMM d, yyyy')
                            }
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm font-bold text-[#402E11]/60">
                            <Clock size={14} className="text-[#C48B28]" />
                            {block.is_all_day ? 'All Day Closure' : `${block.start_time} — ${block.end_time}`}
                        </div>
                    </div>

                    {block.reason && (
                        <div className="bg-[#FAF9F6] border border-[#EAE6E2] rounded-2xl p-4 text-[11px] font-bold text-[#402E11]/60 flex items-start gap-3">
                            <Info size={14} className="text-[#C48B28] flex-shrink-0 mt-0.5" />
                            {block.reason}
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end gap-4 ml-4">
                    <button
                        onClick={() => onDelete(block.id)}
                        className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all border border-red-100"
                        title="Remove block"
                    >
                        <Trash2 size={16} />
                    </button>
                    {isRecurring && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-100 text-[8px] font-black uppercase tracking-wider px-2 py-0.5">
                            {block.recurrence_pattern}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Subtle background decoration */}
            <div className="absolute -bottom-6 -right-6 text-[#402E11]/[0.02] pointer-events-none">
                {isRecurring ? <RefreshCcw size={120} /> : <Calendar size={120} />}
            </div>
        </motion.div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
                {/* One-time Blocks */}
                {oneTimeBlocks.map(block => (
                    <BlockCard key={block.id} block={block} isRecurring={false} />
                ))}

                {/* Recurring Blocks */}
                {recurringBlocks.map(block => (
                    <BlockCard key={block.id} block={block} isRecurring={true} />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default BlockedTimesList;
