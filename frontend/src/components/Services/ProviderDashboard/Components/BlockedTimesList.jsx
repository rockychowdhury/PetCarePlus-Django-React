import React from 'react';
import {
    Calendar, X, Clock, AlertCircle,
    RefreshCcw, ArrowRight, Ban, Info, Trash2
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
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
                <div className="w-8 h-8 border-2 border-[#402E11]/5 border-t-[#C48B28] rounded-full animate-spin" />
                <p className="text-[#402E11]/40 text-[9px] font-black uppercase tracking-widest">Syncing</p>
            </div>
        );
    }

    if (blocks?.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12 bg-[#FAF9F6]/50 rounded-[2rem] border-2 border-dashed border-[#EAE6E2]"
            >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#402E11]/10 shadow-sm mb-4">
                    <Ban size={24} />
                </div>
                <h3 className="text-sm font-black text-[#402E11] mb-1">Clear Schedule</h3>
                <p className="text-[#402E11]/40 text-[10px] font-bold max-w-[200px] text-center">
                    No active exceptions registered.
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
            className="group bg-white border border-[#EAE6E2] rounded-2xl p-4 hover:shadow-lg hover:shadow-[#402E11]/5 transition-all relative overflow-hidden"
        >
            <div className="flex items-start justify-between relative z-10">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        {isRecurring ? (
                            <div className="w-7 h-7 rounded-lg bg-brand-accent flex items-center justify-center text-brand-primary border border-brand-secondary/30 shadow-sm">
                                <RefreshCcw size={12} />
                            </div>
                        ) : (
                            <div className="w-7 h-7 rounded-lg bg-[#FFF9F0] flex items-center justify-center text-[#C48B28] border border-[#EBC176]/30 shadow-sm">
                                <Calendar size={12} />
                            </div>
                        )}
                        <span className="text-[8px] font-black uppercase tracking-widest text-[#402E11]/40">
                            {isRecurring ? 'Recurring' : 'One-Time'}
                        </span>
                    </div>

                    <div className="mb-3">
                        <div className="text-sm font-black text-[#402E11] leading-tight">
                            {isRecurring
                                ? `Every ${daysOfWeek[block.day_of_week]}`
                                : format(new Date(block.block_date), 'MMM d, yyyy')
                            }
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-[#402E11]/60">
                            <Clock size={10} className="text-[#C48B28]" />
                            {block.is_all_day ? 'All Day Closure' : `${block.start_time} — ${block.end_time}`}
                        </div>
                    </div>

                    {block.reason && (
                        <div className="bg-[#FAF9F6] border border-[#EAE6E2] rounded-lg p-2 text-[9px] font-bold text-[#402E11]/60 flex items-start gap-2">
                            <Info size={10} className="text-[#C48B28] flex-shrink-0 mt-0.5" />
                            {block.reason}
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end gap-2 ml-3">
                    <button
                        onClick={() => onDelete(block.id)}
                        className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all border border-rose-100 shadow-sm shadow-rose-500/5 hover:shadow-rose-500/20 active:scale-95"
                        title="Remove exception"
                    >
                        <Trash2 size={12} strokeWidth={2.5} />
                    </button>
                    {isRecurring && (
                        <Badge variant="outline" className="bg-brand-accent/50 text-brand-primary border-brand-secondary/20 text-[7px] font-black uppercase px-2 py-0.5 shadow-sm shadow-brand-primary/5">
                            {block.recurrence_pattern}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Subtle background decoration */}
            <div className="absolute -bottom-4 -right-4 text-[#402E11]/[0.02] pointer-events-none">
                {isRecurring ? <RefreshCcw size={60} /> : <Calendar size={60} />}
            </div>
        </motion.div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
