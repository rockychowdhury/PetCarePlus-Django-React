import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Heart, FileText, CheckCircle, MapPin, Search, UserCheck, AlertTriangle, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';

const RehomingFlowLayout = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    const fieldLabels = {
        'first_name': 'First Name',
        'last_name': 'Last Name',
        'phone_number': 'Phone Number',
        'location_city': 'City',
        'location_state': 'State',
        'date_of_birth': 'Date of Birth'
    };

    const [petId, setPetId] = useState(null);
    const [formData, setFormData] = useState({
        reason: '',
        urgency: '',
        location_city: '',
        location_state: '',
        enable_location_edit: false,
        ideal_home_notes: '',
        privacy_level: '',
        terms_accepted: false
    });

    const [completedSteps, setCompletedSteps] = useState({
        selection: false,
        situation: false,
        details: false
    });

    const updateFormData = (newData) => {
        setFormData(prev => ({ ...prev, ...newData }));
    };

    const markStepComplete = (stepName) => {
        setCompletedSteps(prev => ({ ...prev, [stepName]: true }));
    };

    useEffect(() => {
        if (location.state?.petId) {
            setPetId(location.state.petId);
            markStepComplete('selection');
        }
    }, [location.state]);

    const steps = [
        { path: '/rehoming/select-pet', label: 'Select Pet', icon: Search, id: 'selection' },
        { path: '/rehoming/situation', label: 'The Situation', icon: Heart, id: 'situation' },
        { path: '/rehoming/details', label: 'Pet Details', icon: MapPin, id: 'details' },
        { path: '/rehoming/review', label: 'Review & Publish', icon: FileText, id: 'review' },
    ];

    const getCurrentStepIndex = () => {
        const index = steps.findIndex(step => step.path === currentPath);
        if (index !== -1) return index;
        if (currentPath.includes('select-pet')) return 0;
        if (currentPath.includes('situation')) return 1;
        if (currentPath.includes('details')) return 2;
        if (currentPath.includes('review')) return 3;
        return 0;
    };

    const activeStep = getCurrentStepIndex();
    const progressPercentage = Math.round(((activeStep) / (steps.length - 1)) * 100);

    const [maxReachedStep, setMaxReachedStep] = useState(0);

    useEffect(() => {
        setMaxReachedStep(prev => Math.max(prev, activeStep));
    }, [activeStep]);

    const handleStepClick = (stepPath, index) => {
        if (index <= maxReachedStep) {
            navigate(stepPath);
        }
    };

    return (
        <div className="min-h-screen bg-[#FEF9ED]/50 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* Modern Stepper Header */}
                <div className="max-w-4xl mx-auto mb-16">
                    <div className="flex flex-col items-center text-center mb-10">
                        <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.3em] mb-3 block">Rehoming Journey</span>
                        <h2 className="text-3xl font-black text-[#402E11] tracking-tight">
                            Find a <span className="text-[#C48B28]">loving home</span>
                        </h2>
                    </div>

                    <div className="md:hidden w-full px-4 mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C48B28]">
                                Step {activeStep + 1}/{steps.length}
                            </span>
                            <span className="text-[10px] font-bold text-[#402E11]/50">
                                {steps[activeStep].label}
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-[#EBC176]/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#C48B28] transition-all duration-500 rounded-full"
                                style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="relative">
                        {/* Desktop Stepper */}
                        <div className="hidden md:flex items-center justify-between relative z-10 w-full px-8">
                            {/* Background Line */}
                            <div className="absolute top-[1.35rem] left-0 w-full h-[1px] bg-[#EBC176]/20 -z-10" />
                            {/* Progress Line */}
                            <div
                                className="absolute top-[1.35rem] left-0 h-[1.5px] bg-[#C48B28] transition-all duration-700 ease-out -z-10"
                                style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
                            />

                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = index === activeStep;
                                const isCompleted = index < activeStep;
                                const isUnlocked = index <= maxReachedStep;

                                return (
                                    <button
                                        key={step.path}
                                        onClick={() => handleStepClick(step.path, index)}
                                        disabled={!isUnlocked}
                                        className={`
                                            group relative flex flex-col items-center gap-4
                                            transition-all duration-300
                                            ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}
                                        `}
                                    >
                                        <div
                                            className={`
                                                w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-500
                                                ${isActive
                                                    ? 'bg-[#402E11] border-[#402E11] text-white shadow-xl shadow-[#402E11]/20 scale-110'
                                                    : isCompleted
                                                        ? 'bg-[#C48B28] border-[#C48B28] text-white'
                                                        : 'bg-white border-[#EBC176]/30 text-[#402E11]/30'
                                                }
                                            `}
                                        >
                                            {isCompleted ? <CheckCircle size={18} strokeWidth={3} /> : <Icon size={18} />}
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span
                                                className={`
                                                    text-[9px] font-black uppercase tracking-[0.15em] transition-colors duration-300 whitespace-nowrap
                                                    ${isActive ? 'text-[#402E11]' : isCompleted ? 'text-[#C48B28]' : 'text-[#402E11]/30'}
                                                `}
                                            >
                                                {step.label}
                                            </span>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="step-indicator"
                                                    className="w-1 h-1 rounded-full bg-[#C48B28] mt-1.5"
                                                />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="min-h-[500px]">
                    {!user?.profile_is_complete ? (
                        <div className="max-w-xl mx-auto py-12">
                            <div className="bg-white rounded-[2.5rem] border border-[#EBC176]/20 shadow-2xl shadow-[#402E11]/5 p-10 text-center">
                                <div className="w-16 h-16 bg-[#FAF3E0] rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#C48B28]">
                                    <UserCheck size={28} strokeWidth={2.5} />
                                </div>
                                <h2 className="text-2xl font-black text-[#402E11] tracking-tight mb-3">Profile incomplete</h2>
                                <p className="text-[#402E11]/60 font-medium text-sm max-w-sm mx-auto mb-8 leading-relaxed">
                                    To ensure a safe community for rehoming, we need you to finish setting up your profile first.
                                </p>

                                <div className="space-y-6 mb-10">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C48B28] flex items-center justify-center gap-2">
                                        <AlertTriangle size={14} />
                                        Required Information
                                    </h3>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {user?.missing_profile_fields?.map(field => (
                                            <div key={field} className="px-3 py-1.5 bg-[#FAF3E0]/40 rounded-full border border-[#EBC176]/10 text-[10px] font-black text-[#402E11]/70 uppercase tracking-widest">
                                                {fieldLabels[field] || field}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/dashboard/profile/edit', { state: { from: '/rehoming/select-pet' } })}
                                    className="w-full bg-[#C48B28] text-white rounded-full py-4.5 font-black text-[13px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-[#C48B28]/20 transition-all active:scale-[0.98]"
                                >
                                    <Edit size={16} strokeWidth={3} />
                                    Complete Profile
                                </button>

                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full mt-6 text-[#402E11]/30 text-[10px] font-black hover:text-[#402E11] transition-colors uppercase tracking-[0.2em]"
                                >
                                    Return Home
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Outlet context={{
                            petId,
                            setPetId,
                            formData,
                            updateFormData,
                            markStepComplete
                        }} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default RehomingFlowLayout;
