import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, ArrowLeft, ArrowRight, Home,
    Dog, Clock, CheckCircle2, Loader2, ChevronDown
} from 'lucide-react';
import Button from '../../components/common/Buttons/Button';
import useAPI from '../../hooks/useAPI';
import { toast } from 'react-toastify';

const STEPS = [
    { id: 1, title: 'Living Situation', icon: <Home size={18} /> },
    { id: 2, title: 'Pet History', icon: <Dog size={18} /> },
    { id: 3, title: 'Daily Care', icon: <Clock size={18} /> },
    { id: 4, title: 'Review', icon: <CheckCircle2 size={18} /> }
];

const Dropdown = ({ label, options, value, onChange, placeholder = "Select..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

    return (
        <div className="space-y-1.5 block group" ref={dropdownRef}>
            <span className="text-[9px] font-black uppercase text-[#C48B28] tracking-[0.2em] group-focus-within:text-[#402E11] transition-colors pl-1">
                {label}
            </span>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full py-3 px-4 bg-white border rounded-xl text-left font-bold text-xs flex items-center justify-between transition-all shadow-sm
                        ${isOpen
                            ? 'border-[#C48B28] ring-2 ring-[#C48B28]/10 text-[#402E11]'
                            : 'border-[#EBC176]/30 text-[#402E11] hover:border-[#C48B28]/60'
                        }
                    `}
                >
                    <span className={value ? "text-[#402E11]" : "text-[#402E11]/40"}>
                        {selectedLabel}
                    </span>
                    <ChevronDown
                        size={16}
                        className={`text-[#C48B28] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        strokeWidth={3}
                    />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 5, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#EBC176]/30 rounded-xl shadow-xl shadow-[#402E11]/10 overflow-hidden z-50 p-1.5"
                        >
                            <div className="max-h-52 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#EBC176] scrollbar-track-transparent">
                                {options.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full py-2.5 px-3 rounded-lg text-left text-xs font-bold transition-all flex items-center justify-between
                                            ${value === option.value
                                                ? 'bg-[#C48B28]/10 text-[#C48B28]'
                                                : 'text-[#402E11]/70 hover:bg-[#FEF9ED] hover:text-[#402E11]'
                                            }
                                        `}
                                    >
                                        {option.label}
                                        {value === option.value && <CheckCircle2 size={14} strokeWidth={3} />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const AIApplicationPage = () => {
    const navigate = useNavigate();
    const { id: listingId } = useParams();
    const api = useAPI();

    const [currentStep, setCurrentStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedText, setGeneratedText] = useState('');

    const [formData, setFormData] = useState({
        living_situation: {
            home_type: '',
            ownership: '',
            landlord_permission: '',
            outdoor_space: '',
            household_members: ''
        },
        pet_history: {
            previous_ownership: '',
            types_owned: '',
            outcome: ''
        },
        daily_care: {
            primary_caregiver: '',
            routine: '',
            time_alone: ''
        }
    });

    const updateFormData = (category, field, value) => {
        setFormData(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };

    const handleNext = async () => {
        if (currentStep < 3) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Generate
            setIsGenerating(true);
            try {
                const res = await api.post('/rehoming/generate-application/', {
                    listing_id: listingId,
                    form_data: formData
                });
                setGeneratedText(res.data.content);
                setCurrentStep(4);
            } catch (error) {
                console.error(error);
                toast.error("Failed to generate application. Please try again.");
            } finally {
                setIsGenerating(false);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
        else navigate(-1);
    };

    const handleSubmit = () => {
        // Navigate to final submission page with generated text
        const state = { initialMessage: generatedText };
        // If route is /rehoming/listings/:id/inquiry, we pass state there
        navigate(`/rehoming/listings/${listingId}/inquiry`, { state });
    };

    const isStepValid = () => {
        const { living_situation, pet_history, daily_care } = formData;
        if (currentStep === 1) {
            return living_situation.home_type && living_situation.ownership && living_situation.outdoor_space;
        }
        if (currentStep === 2) {
            return pet_history.previous_ownership;
        }
        if (currentStep === 3) {
            return daily_care.routine && daily_care.time_alone;
        }
        return true;
    };

    return (
        <div className="min-h-screen bg-[#FEF9ED] py-8 px-4 font-sans text-[#402E11] flex justify-center pt-24 items-start">
            <div className="w-full max-w-2xl">

                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <button onClick={handleBack} className="text-[#C48B28] hover:text-[#402E11] transition-colors flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em]">
                        <ArrowLeft size={14} strokeWidth={3} /> Back
                    </button>
                    {/* AI Badge Reverted to Purple */}
                    <div className="bg-[#8B5CF6]/10 px-3 py-1.5 rounded-full flex items-center gap-2 text-[#8B5CF6] font-black uppercase tracking-[0.2em] text-[9px] border border-[#8B5CF6]/20">
                        <Sparkles size={10} fill="#8B5CF6" /> AI Assistant
                    </div>
                </div>

                {/* Wizard Container */}
                <div className="bg-white rounded-[2rem] shadow-2xl shadow-[#402E11]/5 border border-[#EBC176]/20 transition-all duration-500">

                    {/* Stepper */}
                    <div className="bg-white py-6 px-8 scale-90 origin-center border-b border-[#EBC176]/10 rounded-t-[2rem]">
                        <div className="flex justify-between relative max-w-md mx-auto">
                            {/* Background Line */}
                            <div className="absolute top-[1rem] left-0 w-full h-0.5 bg-[#FAF3E0] rounded-full -z-10" />
                            {/* Active Progress Line */}
                            <div
                                className="absolute top-[1rem] left-0 h-0.5 bg-[#C48B28] rounded-full -z-10 transition-all duration-500 ease-out"
                                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                            />

                            {STEPS.map((step) => {
                                const isActive = step.id === currentStep;
                                const isCompleted = step.id < currentStep;

                                return (
                                    <div key={step.id} className="flex flex-col items-center gap-2 relative z-10 w-20 group cursor-default">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 border-[1.5px]
                                            ${isActive
                                                ? 'bg-[#C48B28] border-[#C48B28] text-white shadow-lg shadow-[#C48B28]/20 scale-110'
                                                : isCompleted
                                                    ? 'bg-[#C48B28] border-[#C48B28] text-white'
                                                    : 'bg-white border-[#EBC176]/30 text-[#C48B28]/40'}
                                        `}>
                                            {isCompleted ? <CheckCircle2 size={14} strokeWidth={3} /> : step.id}
                                        </div>
                                        <span className={`
                                            text-[8px] font-black uppercase tracking-[0.2em] text-center transition-colors duration-300
                                            ${isActive ? 'text-[#C48B28]' : isCompleted ? 'text-[#C48B28]/60' : 'text-[#402E11]/20'}
                                        `}>
                                            {step.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-10 min-h-[350px]">
                        <AnimatePresence mode="wait">

                            {/* STEP 1: Living Situation */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-1 text-center mb-6">
                                        <h2 className="text-2xl font-black text-[#402E11] tracking-tight">Tell us about your home</h2>
                                        <p className="text-[#402E11]/60 font-bold text-[10px] uppercase tracking-wider">Help the owner understand where their pet will be living.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Dropdown
                                            label="Home Type"
                                            value={formData.living_situation.home_type}
                                            onChange={(val) => updateFormData('living_situation', 'home_type', val)}
                                            options={[
                                                { label: 'House', value: 'House' },
                                                { label: 'Apartment', value: 'Apartment' },
                                                { label: 'Condo', value: 'Condo' },
                                                { label: 'Townhouse', value: 'Townhouse' }
                                            ]}
                                        />
                                        <Dropdown
                                            label="Ownership"
                                            value={formData.living_situation.ownership}
                                            onChange={(val) => updateFormData('living_situation', 'ownership', val)}
                                            options={[
                                                { label: 'Owned', value: 'Owned' },
                                                { label: 'Rented', value: 'Rented' }
                                            ]}
                                        />
                                    </div>

                                    {formData.living_situation.ownership === 'Rented' && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <span className="text-[9px] font-black uppercase text-[#C48B28] tracking-[0.2em] pl-1">Landlord Permission?</span>
                                            <div className="flex gap-2">
                                                {['Yes', 'No', 'Not Checked'].map(opt => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => updateFormData('living_situation', 'landlord_permission', opt)}
                                                        className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all border ${formData.living_situation.landlord_permission === opt
                                                            ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white shadow-md shadow-purple-500/20'
                                                            : 'bg-white border-[#EBC176]/30 text-[#402E11]/60 hover:border-[#8B5CF6] hover:text-[#8B5CF6]'
                                                            }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Dropdown
                                            label="Outdoor Space"
                                            value={formData.living_situation.outdoor_space}
                                            onChange={(val) => updateFormData('living_situation', 'outdoor_space', val)}
                                            options={[
                                                { label: 'Fenced Yard', value: 'Fenced Yard' },
                                                { label: 'Unfenced Yard', value: 'Unfenced Yard' },
                                                { label: 'Patio / Balcony', value: 'Patio/Balcony' },
                                                { label: 'No Private Outdoor Space', value: 'No Outdoor Space' }
                                            ]}
                                        />

                                        <label className="space-y-1.5 block group">
                                            <span className="text-[9px] font-black uppercase text-[#C48B28] tracking-[0.2em] group-focus-within:text-[#402E11] transition-colors pl-1">Household Members</span>
                                            <input
                                                type="text"
                                                placeholder="e.g. 2 adults, 1 child"
                                                className="w-full py-3 px-4 bg-white border border-[#EBC176]/30 focus:border-[#C48B28] rounded-xl text-[#402E11] text-xs font-bold focus:ring-2 focus:ring-[#C48B28]/10 outline-none transition-all placeholder:text-[#402E11]/30 shadow-sm"
                                                value={formData.living_situation.household_members}
                                                onChange={e => updateFormData('living_situation', 'household_members', e.target.value)}
                                            />
                                        </label>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 2: Pet History */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-1 text-center mb-6">
                                        <h2 className="text-2xl font-black text-[#402E11] tracking-tight">Pet Experience</h2>
                                        <p className="text-[#402E11]/60 font-bold text-[10px] uppercase tracking-wider">Tell us a bit about your past or current pets.</p>
                                    </div>

                                    <div className="space-y-3">
                                        <span className="text-[9px] font-black uppercase text-[#C48B28] tracking-[0.2em] pl-1">Have you owned pets before?</span>
                                        <div className="flex gap-3">
                                            {['Yes', 'No'].map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => updateFormData('pet_history', 'previous_ownership', opt.toLowerCase())}
                                                    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border ${formData.pet_history.previous_ownership === opt.toLowerCase()
                                                        ? 'bg-[#C48B28] border-[#C48B28] text-white shadow-lg shadow-[#C48B28]/20 scale-105'
                                                        : 'bg-transparent border-[#EBC176]/30 text-[#402E11]/60 hover:border-[#C48B28] hover:text-[#C48B28] hover:bg-white'
                                                        }`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {formData.pet_history.previous_ownership === 'yes' && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="space-y-1.5 block group">
                                                <span className="text-[9px] font-black uppercase text-[#C48B28] tracking-[0.2em] group-focus-within:text-[#402E11] transition-colors pl-1">Types of pets owned</span>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 2 Golden Retrievers, 1 Siamese Cat"
                                                    className="w-full py-3 px-4 bg-white border border-[#EBC176]/30 focus:border-[#C48B28] rounded-xl text-[#402E11] text-xs font-bold focus:ring-2 focus:ring-[#C48B28]/10 outline-none transition-all placeholder:text-[#402E11]/30 shadow-sm"
                                                    value={formData.pet_history.types_owned}
                                                    onChange={e => updateFormData('pet_history', 'types_owned', e.target.value)}
                                                />
                                            </label>
                                            <label className="space-y-1.5 block group">
                                                <span className="text-[9px] font-black uppercase text-[#C48B28] tracking-[0.2em] group-focus-within:text-[#402E11] transition-colors pl-1">Outcome (Briefly)</span>
                                                <textarea
                                                    placeholder="e.g. They are still with us / Passed away due to old age..."
                                                    className="w-full py-3 px-4 bg-white border border-[#EBC176]/30 focus:border-[#C48B28] rounded-xl text-[#402E11] text-xs font-bold focus:ring-2 focus:ring-[#C48B28]/10 outline-none transition-all placeholder:text-[#402E11]/30 h-24 resize-none shadow-sm"
                                                    value={formData.pet_history.outcome}
                                                    onChange={e => updateFormData('pet_history', 'outcome', e.target.value)}
                                                />
                                            </label>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* STEP 3: Daily Care */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-1 text-center mb-6">
                                        <h2 className="text-2xl font-black text-[#402E11] tracking-tight">Daily Care Plan</h2>
                                        <p className="text-[#402E11]/60 font-bold text-[10px] uppercase tracking-wider">How will you care for this pet on a daily basis?</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <Dropdown
                                            label="Primary Caregiver"
                                            value={formData.daily_care.primary_caregiver}
                                            onChange={(val) => updateFormData('daily_care', 'primary_caregiver', val)}
                                            options={[
                                                { label: 'Myself', value: 'Self' },
                                                { label: 'Partner/Spouse', value: 'Partner' },
                                                { label: 'Whole Family', value: 'Whole Family' }
                                            ]}
                                        />

                                        <label className="space-y-1.5 block group">
                                            <span className="text-[9px] font-black uppercase text-[#C48B28] tracking-[0.2em] group-focus-within:text-[#402E11] transition-colors pl-1">Planned Daily Routine</span>
                                            <textarea
                                                placeholder="Briefly describe feeding, walking, and play schedule..."
                                                className="w-full py-3 px-4 bg-white border border-[#EBC176]/30 focus:border-[#C48B28] rounded-xl text-[#402E11] text-xs font-bold focus:ring-2 focus:ring-[#C48B28]/10 outline-none transition-all placeholder:text-[#402E11]/30 h-28 resize-none shadow-sm"
                                                value={formData.daily_care.routine}
                                                onChange={e => updateFormData('daily_care', 'routine', e.target.value)}
                                            />
                                        </label>

                                        <Dropdown
                                            label="Time Alone (Average per day)"
                                            value={formData.daily_care.time_alone}
                                            onChange={(val) => updateFormData('daily_care', 'time_alone', val)}
                                            options={[
                                                { label: 'Less than 2 hours', value: 'Less than 2 hours' },
                                                { label: '2-4 hours', value: '2-4 hours' },
                                                { label: '4-8 hours', value: '4-8 hours' },
                                                { label: '8+ hours', value: '8+ hours' }
                                            ]}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 4: Review Generation */}
                            {currentStep === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-5"
                                >
                                    <div className="text-center space-y-3 mb-6">
                                        {/* Reverted Bouncing Sparkle to Purple */}
                                        <div className="w-16 h-16 bg-[#8B5CF6]/10 rounded-full flex items-center justify-center mx-auto text-[#8B5CF6] mb-3 animate-bounce">
                                            <Sparkles size={32} fill="#8B5CF6" className="text-[#8B5CF6]" />
                                        </div>
                                        <h2 className="text-3xl font-black text-[#402E11] tracking-tight">Application Ready!</h2>
                                        <p className="text-[#402E11]/60 font-bold text-xs tracking-wide max-w-sm mx-auto">
                                            Our AI has crafted a personalized application for you. Review it below and make any final tweaks.
                                        </p>
                                    </div>

                                    <div className="bg-[#FAF3E0]/20 p-6 rounded-[2rem] border border-[#EBC176]/30 relative group shadow-inner">
                                        <div className="absolute top-6 right-6 text-[#C48B28]/40">
                                            <Sparkles size={20} />
                                        </div>
                                        <textarea
                                            className="w-full h-80 bg-transparent border-none outline-none resize-none text-[#402E11] leading-loose font-bold text-sm selection:bg-[#C48B28]/20"
                                            value={generatedText}
                                            onChange={e => setGeneratedText(e.target.value)}
                                        />
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>

                    {/* Footer Actions */}
                    <div className="py-6 px-8 border-t border-[#EBC176]/10 bg-white flex justify-end rounded-b-[2rem]">
                        {isGenerating ? (
                            <div className="px-8 py-4 bg-[#FAF3E0] rounded-xl text-[#C48B28] font-black uppercase tracking-[0.2em] text-[9px] flex items-center gap-2 animate-pulse border border-[#EBC176]/20">
                                <Loader2 className="animate-spin" size={14} /> Generating Magic...
                            </div>
                        ) : currentStep === 4 ? (
                            <button
                                onClick={handleSubmit}
                                className="px-10 py-4 bg-[#C48B28] hover:brightness-110 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-[#C48B28]/30 active:scale-95 transition-all flex items-center gap-2 border border-[#C48B28]"
                            >
                                Continue to Submission <ArrowRight size={14} strokeWidth={3} />
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                disabled={!isStepValid()}
                                className={`
                                    px-10 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center gap-2
                                    ${isStepValid()
                                        ? 'bg-[#402E11] hover:bg-black text-white shadow-lg shadow-[#402E11]/20 hover:shadow-xl hover:-translate-y-0.5'
                                        : 'bg-[#F9F8F6] text-[#402E11]/20 cursor-not-allowed'}
                                `}
                            >
                                {currentStep === 3 ? 'Generate Application' : 'Next Step'} <ArrowRight size={14} strokeWidth={3} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIApplicationPage;
