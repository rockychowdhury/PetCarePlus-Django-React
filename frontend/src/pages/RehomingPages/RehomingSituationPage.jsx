import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import RehomingActionBar from './components/RehomingActionBar';

const RehomingSituationPage = () => {
    const { formData, updateFormData, markStepComplete } = useOutletContext();
    const navigate = useNavigate();

    const [errors, setErrors] = React.useState({});

    const validate = () => {
        const newErrors = {};
        if (!formData.reason || formData.reason.length < 50) {
            newErrors.reason = "Please provide more detail (minimum 50 characters).";
        }
        if (!formData.urgency) {
            newErrors.urgency = "Selection required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) {
            markStepComplete('situation');
            navigate('/rehoming/details');
            window.scrollTo(0, 0);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-black text-[#402E11] mb-2 tracking-tight">The <span className="text-[#C48B28]">Situation</span></h1>
                <p className="text-[#402E11]/60 text-xs font-bold uppercase tracking-[0.15em]">Tell us your story</p>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-[#EBC176]/20 shadow-2xl shadow-[#402E11]/5 p-8 md:p-10 mb-10">
                {/* Reason */}
                <div className="space-y-4 mb-10">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-black text-[#402E11] uppercase tracking-wider">
                            Why are you rehoming?
                        </label>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${(formData.reason?.length || 0) >= 50 ? "text-[#5A856D]" : "text-[#402E11]/30"}`}>
                            {formData.reason?.length || 0} / 50 min
                        </span>
                    </div>
                    <textarea
                        value={formData.reason || ''}
                        onChange={(e) => updateFormData({ reason: e.target.value })}
                        placeholder="Please share details about your situation..."
                        className={`w-full h-36 p-5 text-sm font-medium rounded-2xl bg-[#FAF3E0]/30 border-2 resize-none focus:ring-4 focus:ring-[#C48B28]/5 outline-none transition-all duration-300 ${errors.reason ? 'border-red-300 bg-red-50/30' : 'border-[#EBC176]/10 focus:border-[#C48B28] focus:bg-white'}`}
                    />
                    {errors.reason && (
                        <p className="text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <AlertTriangle size={12} /> {errors.reason}
                        </p>
                    )}
                </div>

                {/* Urgency */}
                <div className="space-y-4">
                    <label className="text-sm font-black text-[#402E11] uppercase tracking-wider block">
                        How urgent is this?
                    </label>
                    <div className="grid gap-3">
                        {[
                            { value: 'immediate', label: 'Immediate', sub: '< 3 days', desc: 'Emergency situations.', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50/50 hover:bg-red-50', activeBg: 'bg-red-50 border-red-200 ring-red-500/20' },
                            { value: 'soon', label: 'Soon', sub: '1-2 weeks', desc: 'Moving or life changes.', icon: Clock, color: 'text-[#C48B28]', bg: 'bg-[#FAF3E0]/50 hover:bg-[#FAF3E0]', activeBg: 'bg-[#FAF3E0] border-[#C48B28]/30 ring-[#C48B28]/10' },
                            { value: 'flexible', label: 'Flexible', sub: '> 2 weeks', desc: 'Finding the right match.', icon: CheckCircle2, color: 'text-[#5A856D]', bg: 'bg-[#EBF1ED]/50 hover:bg-[#EBF1ED]', activeBg: 'bg-[#EBF1ED] border-[#5A856D]/30 ring-[#5A856D]/10' }
                        ].map((option) => (
                            <label
                                key={option.value}
                                className={`
                                    flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300
                                    ${formData.urgency === option.value
                                        ? `${option.activeBg} ring-4 translate-x-1`
                                        : `border-transparent ${option.bg} opacity-70 hover:opacity-100 hover:translate-x-1`}
                                `}
                            >
                                <input
                                    type="radio"
                                    name="urgency"
                                    value={option.value}
                                    checked={formData.urgency === option.value}
                                    onChange={(e) => updateFormData({ urgency: e.target.value })}
                                    className="sr-only"
                                />
                                <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center ${option.color} shadow-sm transition-transform ${formData.urgency === option.value ? 'scale-110 shadow-md' : ''}`}>
                                    <option.icon size={20} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-black text-sm ${formData.urgency === option.value ? 'text-[#402E11]' : 'text-[#402E11]/60'}`}>
                                            {option.label}
                                        </span>
                                        <span className="text-[9px] font-black text-[#C48B28] uppercase tracking-[0.1em] opacity-60">
                                            {option.sub}
                                        </span>
                                    </div>
                                    <div className="text-[10px] font-bold text-[#402E11]/40 lowercase tracking-tight">
                                        {option.desc}
                                    </div>
                                </div>
                                {formData.urgency === option.value && (
                                    <div className="w-6 h-6 rounded-full bg-[#402E11] flex items-center justify-center text-white scale-110 transition-all">
                                        <CheckCircle2 size={14} strokeWidth={3} />
                                    </div>
                                )}
                            </label>
                        ))}
                    </div>
                </div>
                {errors.urgency && <p className="text-red-500 text-[10px] mt-4 font-black uppercase tracking-widest">{errors.urgency}</p>}
            </div>

            {/* Premium Action Bar */}
            <RehomingActionBar
                onBack={() => navigate('/rehoming/select-pet')}
                onNext={handleNext}
                nextLabel="Next Step"
                statusText="Tell us why you are rehoming"
            />
        </div>
    );
};

export default RehomingSituationPage;
