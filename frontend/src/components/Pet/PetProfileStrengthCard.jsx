import React from 'react';
import { CheckCircle } from 'lucide-react';
import { calculateCompletion } from '../../utils/petProfileUtils';

const PetProfileStrengthCard = ({ values }) => {
    const { score, total, missing } = calculateCompletion(values);
    const percentage = Math.round((score / total) * 100);

    return (
        <div className="bg-white border border-[#EBC176]/20 p-6 rounded-[2rem] shadow-sm space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="font-outfit font-black text-[11px] text-[#402E11]/40 uppercase tracking-[0.2em]">Profile Strength</h4>
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black bg-[#FAF3E0] text-[#C48B28] px-2.5 py-1 rounded-lg">
                        {percentage}%
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-[#FAF3E0] rounded-full overflow-hidden p-0.5">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${score === total ? 'bg-green-500' : 'bg-[#C48B28]'}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>

            <p className="text-xs text-text-secondary font-medium">
                {score}/{total} Requirements Met
            </p>

            {missing.length > 0 && (
                <div className="space-y-2.5 pt-4 border-t border-[#EBC176]/10">
                    <p className="text-[9px] uppercase font-black text-[#402E11]/20 tracking-widest">To be 100% complete:</p>
                    <ul className="space-y-2">
                        {missing.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-[10px] font-bold text-[#C48B28]">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#EBC176] flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {score === total && (
                <div className="flex items-center gap-2.5 text-green-700 bg-green-50 p-3.5 rounded-2xl border border-green-100 animate-in fade-in zoom-in duration-300">
                    <CheckCircle size={16} strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Profile is 100% Complete!</span>
                </div>
            )}
        </div>
    );
};

export default PetProfileStrengthCard;
