import React from 'react';
import Card from '../../../common/Layout/Card'; // Corrected path to src/components/common

const StatsCard = ({ icon: Icon, iconColor, title, value, subtext, subtextClass, badge, badgeColor, onClick, actionLabel, highlight }) => {
    return (
        <Card className={`p-5 flex flex-col justify-between h-full border  shadow-sm hover:shadow-md transition-shadow rounded-xl ${highlight ? 'bg-orange-50 border-orange-100' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-lg ${iconColor || 'bg-brand-primary/10 text-brand-primary'}`}>
                    <Icon size={22} className="stroke-[2.5px]" />
                </div>
                {badge && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${badgeColor || 'bg-gray-100 text-gray-600'}`}>
                        {badge}
                    </span>
                )}
            </div>

            <div>
                <h3 className="text-gray-500 text-sm font-bold mb-1">{title}</h3>
                {value !== undefined && <span className="text-3xl font-black text-gray-900 block mb-1">{value}</span>}

                {(subtext || actionLabel) && (
                    <div className="flex items-center justify-between mt-2">
                        {subtext && <span className={`text-xs font-semibold ${subtextClass || 'text-gray-400'}`}>{subtext}</span>}
                        {actionLabel && (
                            <button onClick={onClick} className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1">
                                {actionLabel}
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default StatsCard;
