import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

const RehomingActionBar = ({
    onBack,
    onNext,
    canNext = true,
    nextLabel = 'Continue',
    backLabel = 'Back',
    statusText = '',
    isLoading = false,
    nextIcon: NextIcon = ArrowRight,
    variant = 'primary' // 'primary' (brown) or 'success' (green)
}) => {
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-3xl z-[100]">
            <div className="bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(64,46,17,0.08)] rounded-[2.5rem] p-1.5 flex items-center justify-between border border-white/50 ring-1 ring-[#402E11]/5">
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2.5 text-[#402E11]/40 hover:text-[#402E11] font-black transition-all px-6 py-3.5 rounded-full hover:bg-[#FAF3E0]/50 group"
                >
                    <ArrowLeft size={16} strokeWidth={2.5} className="transition-transform group-hover:-translate-x-0.5" />
                    <span className="uppercase tracking-[0.2em] text-[10px]">{backLabel}</span>
                </button>

                {/* Status Text / Center Content */}
                <div className="hidden sm:block overflow-hidden px-4">
                    <p className="text-[10px] font-black text-[#402E11]/20 uppercase tracking-[0.2em] truncate text-center">
                        {statusText}
                    </p>
                </div>

                {/* Next/Action Button */}
                <button
                    onClick={onNext}
                    disabled={!canNext || isLoading}
                    className={`
                        h-12 min-w-[10rem] px-8 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3
                        ${canNext && !isLoading
                            ? variant === 'success'
                                ? 'bg-status-success text-white shadow-lg shadow-status-success/20 hover:scale-[1.02] hover:-translate-y-0.5'
                                : 'bg-[#C48B28] text-white shadow-lg shadow-[#C48B28]/20 hover:scale-[1.02] hover:-translate-y-0.5'
                            : 'bg-[#F4F1EA] text-[#402E11]/20 cursor-not-allowed'
                        }
                    `}
                >
                    {isLoading ? 'Processing...' : nextLabel}
                    {!isLoading && <NextIcon size={16} strokeWidth={2.5} className={canNext ? 'animate-pulse' : ''} />}
                </button>
            </div>
        </div>
    );
};

export default RehomingActionBar;
