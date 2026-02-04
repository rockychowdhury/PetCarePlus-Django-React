import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAPI from '../../hooks/useAPI';
import useAuth from '../../hooks/useAuth';
import useImgBB from '../../hooks/useImgBB';
import Card from '../../components/common/Layout/Card';
import Button from '../../components/common/Buttons/Button';
import Input from '../../components/common/Form/Input';
import Radio from '../../components/common/Form/Radio';
import {
    ChevronRight, ArrowLeft, CheckCircle, Upload, PawPrint, Heart, Activity, X, Loader2,
    Camera, Info, Dog, Cat, Rabbit, Bird, Plus, Check, Calendar, Sparkles
} from 'lucide-react';
import PetProfileStrengthCard from '../../components/Pet/PetProfileStrengthCard';
import PetCard from '../../components/Pet/PetCard';

const deepEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true;
    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) return false;
    if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;
    }
    return true;
};

const SECTIONS = [
    { id: 'basic', label: 'Identity', icon: PawPrint },
    { id: 'photos', label: 'Visuals', icon: Camera },
    { id: 'personality', label: 'Personality', icon: Heart },
    { id: 'medical', label: 'Health', icon: Activity },
];

const SPECIES_OPTIONS = [
    { value: 'dog', label: 'Dog', icon: <Dog size={20} /> },
    { value: 'cat', label: 'Cat', icon: <Cat size={20} /> },
    { value: 'rabbit', label: 'Rabbit', icon: <Rabbit size={20} /> },
    { value: 'bird', label: 'Bird', icon: <Bird size={20} /> },
    { value: 'other', label: 'Other', icon: <Plus size={20} /> },
];

// PERSONALITY_TRAITS removed - fetched from API

const SIZE_OPTIONS = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
];

const AddPetPage = () => {
    const { id: paramId } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); // Add hook
    const api = useAPI();
    const { user } = useAuth();
    const { uploadImage, uploading } = useImgBB();

    // Draft State
    const [petId, setPetId] = useState(paramId || null);
    const [isDraftCreated, setIsDraftCreated] = useState(!!paramId);
    const [initialPayload, setInitialPayload] = useState(null);

    const [activeSection, setActiveSection] = useState('basic');
    const [isSaving, setIsSaving] = useState(false);

    const [availableTraits, setAvailableTraits] = useState([]);

    const { register, control, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm({
        mode: 'onChange',
        defaultValues: {
            pet_name: '',
            species: 'dog',
            breed: '',
            birth_date: '',
            gender: 'unknown',
            size: 'medium',
            weight: '',
            rehoming_story: '',
            personality_traits: [],
            medical_history: {
                spayed_neutered: false,
                microchipped: false,
            },
            photos: []
        }
    });

    const watchedValues = watch();

    const getPayload = useCallback((data) => ({
        id: petId || 'preview', // For PetCard mapping
        name: data.pet_name,
        pet_name: data.pet_name, // Support both mappings
        species: data.species,
        breed: data.breed,
        birth_date: data.birth_date || null,
        gender: data.gender,
        size_category: data.size,
        weight_kg: parseFloat(data.weight) || 0,
        description: data.rehoming_story,
        media: data.photos?.map(p => ({ url: p.url })), // For PetCard mapping
        media_data: data.photos, // Required by backend
        photos: data.photos, // Backward compatibility
        traits: data.personality_traits,
        status: 'active',
        spayed_neutered: data.medical_history?.spayed_neutered,
        microchipped: data.medical_history?.microchipped,
    }), [petId]);

    // Load Existing Pet
    useEffect(() => {
        if (paramId) {
            const fetchPet = async () => {
                try {
                    const res = await api.get(`/pets/profiles/${paramId}/`);
                    const pet = res.data;
                    const formData = {
                        pet_name: pet.name,
                        species: pet.species,
                        breed: pet.breed || '',
                        birth_date: pet.birth_date || '',
                        gender: pet.gender || 'unknown',
                        size: pet.size_category || 'medium',
                        weight: pet.weight_kg || '',
                        rehoming_story: pet.description || '',
                        personality_traits: pet.traits ? pet.traits.map(t => t.name) : [],
                        medical_history: {
                            spayed_neutered: pet.spayed_neutered || false,
                            microchipped: pet.microchipped || false,
                        },
                        photos: pet.media ? pet.media.map(m => ({ url: m.url, delete_url: m.delete_url })) : []
                    };
                    Object.keys(formData).forEach(key => setValue(key, formData[key]));

                    // Set initial payload for comparison
                    const initial = getPayload(formData);
                    setInitialPayload(initial);
                } catch (error) {
                    console.error("Failed to fetch pet", error);
                    toast.error("Could not load pet details.");
                }
            };
            fetchPet();
        }
    }, [paramId, api, setValue, user]);

    // Fetch Traits
    useEffect(() => {
        const fetchTraits = async () => {
            try {
                const res = await api.get('/pets/traits/');
                // API might return list or { results: list } if paginated
                const traitsData = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setAvailableTraits(traitsData);
            } catch (error) {
                console.error("Failed to fetch traits", error);
            }
        };
        fetchTraits();
    }, [api]);

    // Step Navigation Handlers
    const currentSectionIndex = SECTIONS.findIndex(s => s.id === activeSection);
    const isFirstSection = currentSectionIndex === 0;
    const isLastSection = currentSectionIndex === SECTIONS.length - 1;

    const handleNext = async () => {
        const isValid = await trigger();
        if (!isValid) return;

        setIsSaving(true);
        try {
            if (!isDraftCreated) {
                const payload = getPayload(watchedValues);
                const res = await api.post('/pets/profiles/', payload);
                const newPetId = res.data.id;
                setPetId(newPetId);
                setIsDraftCreated(true);
                // Update URL without reload
                window.history.replaceState(null, '', `/dashboard/pets/${newPetId}/edit`);
                setInitialPayload(payload);
                toast.success("Draft created! You can finish this later.");
            } else {
                // Update existing draft
                const payload = getPayload(watchedValues);

                // Only save if data changed
                if (!initialPayload || !deepEqual(payload, initialPayload)) {
                    await api.patch(`/pets/profiles/${petId}/`, payload);
                    setInitialPayload(payload);
                    toast.success("Progress saved.");
                }
            }
            if (!isLastSection) setActiveSection(SECTIONS[currentSectionIndex + 1].id);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save progress.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrev = () => {
        if (!isFirstSection) setActiveSection(SECTIONS[currentSectionIndex - 1].id);
    };

    const handleFinalSubmit = async () => {
        const isValid = await trigger();
        if (!isValid) return;

        setIsSaving(true);
        try {
            const payload = getPayload(watchedValues);
            if (isDraftCreated) {
                if (!initialPayload || !deepEqual(payload, initialPayload)) {
                    await api.patch(`/pets/profiles/${petId}/`, payload);
                }
                toast.success("Profile updated successfully!");
            } else {
                await api.post('/pets/profiles/', payload);
                toast.success("Profile created successfully!");
            }

            // Redirect based on returnTo context or default
            if (location.state?.returnTo) {
                navigate(location.state.returnTo);
            } else {
                navigate('/dashboard/my-pets');
            }
        } catch (error) {
            console.error("Final submit failed", error);
            toast.error("Failed to save profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        try {
            const uploadPromises = files.map(file => uploadImage(file));
            const results = await Promise.all(uploadPromises);
            const validPhotos = results.filter(res => res && res.success).map(res => ({
                url: res.url,
                delete_url: res.delete_url
            }));
            if (validPhotos.length > 0) {
                const current = watch('photos') || [];
                setValue('photos', [...current, ...validPhotos].slice(0, 10));
            }
        } catch (err) {
            toast.error("Upload failed");
        }
    };

    const removePhoto = (index) => {
        const currentPhotos = watch('photos') || [];
        setValue('photos', currentPhotos.filter((_, i) => i !== index));
    };

    const toggleTrait = (traitName) => {
        const currentTraits = watch('personality_traits') || [];
        if (currentTraits.includes(traitName)) {
            setValue('personality_traits', currentTraits.filter(t => t !== traitName));
        } else {
            setValue('personality_traits', [...currentTraits, traitName].slice(0, 5)); // Limit to 5 traits
        }
    };



    // --- Render Sections ---
    const renderSectionContent = () => {
        switch (activeSection) {
            case 'basic':
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <label className="text-[11px] font-black uppercase tracking-[0.15em] text-[#402E11]/40 ml-1">Pet Name <span className="text-[#C48B28]">*</span></label>
                                <input
                                    {...register('pet_name', { required: "Name is required" })}
                                    className={`w-full bg-[#FAF3E0]/50 border border-[#EBC176]/20 rounded-2xl px-6 py-4 outline-none transition-all duration-300 font-bold text-[#402E11] placeholder:text-[#402E11]/20 focus:border-[#C48B28]/40 focus:bg-white focus:shadow-inner ${errors.pet_name ? 'border-red-200 focus:border-red-400' : ''}`}
                                    placeholder="e.g. Luna"
                                />
                                {errors.pet_name && <p className="text-red-500 text-[10px] font-bold ml-2 uppercase tracking-wider">{errors.pet_name.message}</p>}
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[11px] font-black uppercase tracking-[0.15em] text-[#402E11]/40 ml-1">Breed</label>
                                <input
                                    {...register('breed')}
                                    className="w-full bg-[#FAF3E0]/50 border border-[#EBC176]/20 focus:border-[#C48B28]/40 focus:bg-white focus:shadow-inner rounded-2xl px-6 py-4 outline-none transition-all duration-300 font-bold text-[#402E11] placeholder:text-[#402E11]/20"
                                    placeholder="e.g. Golden Retriever"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase tracking-[0.15em] text-[#402E11]/40 ml-1">Species</label>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {SPECIES_OPTIONS.map(option => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setValue('species', option.value, { shouldValidate: true })}
                                        className={`flex flex-col items-center justify-center p-4 rounded-[2rem] border transition-all duration-300 group ${watchedValues.species === option.value ? 'border-[#C48B28] bg-[#C48B28]/10 text-[#C48B28] shadow-sm' : 'border-transparent bg-[#FAF3E0]/50 text-[#402E11]/20 hover:bg-[#FAF3E0]'}`}
                                    >
                                        <div className={`mb-2 transition-transform duration-500 ${watchedValues.species === option.value ? 'scale-110' : 'group-hover:scale-110'}`}>
                                            {option.icon}
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-black uppercase tracking-[0.15em] text-[#402E11]/40 ml-1">Birth Date</label>
                                    <div className="relative group">
                                        <style>
                                            {`
                                                input[type="date"]::-webkit-calendar-picker-indicator {
                                                    position: absolute;
                                                    right: 0;
                                                    top: 0;
                                                    width: 100%;
                                                    height: 100%;
                                                    margin: 0;
                                                    padding: 0;
                                                    cursor: pointer;
                                                    opacity: 0;
                                                }
                                            `}
                                        </style>
                                        <input
                                            type="date"
                                            {...register('birth_date', {
                                                required: "Birth date is required",
                                                onChange: (e) => {
                                                    const birthDate = new Date(e.target.value);
                                                    const today = new Date();
                                                    let age = today.getFullYear() - birthDate.getFullYear();
                                                    const m = today.getMonth() - birthDate.getMonth();
                                                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                                        age--;
                                                    }
                                                    setValue('age', Math.max(0, age));
                                                }
                                            })}
                                            className={`w-full bg-[#FAF3E0]/50 border border-[#EBC176]/20 rounded-2xl px-6 py-4 outline-none transition-all duration-300 font-bold text-[#402E11] pr-12 cursor-pointer focus:border-[#C48B28]/40 focus:bg-white focus:shadow-inner ${errors.birth_date ? 'border-red-200 focus:border-red-400' : ''}`}
                                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                        />
                                        <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#C48B28]/30 group-focus-within:text-[#C48B28] transition-colors" size={18} />
                                    </div>
                                    {errors.birth_date && <p className="text-red-500 text-[10px] font-bold ml-2 uppercase tracking-wider">{errors.birth_date.message}</p>}
                                    {watch('birth_date') && (
                                        <div className="px-4 py-2 bg-[#C48B28]/10 rounded-xl text-[#C48B28] text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                            <Sparkles size={12} />
                                            {watch('age') === 0 ? "Less than a year old" : `${watch('age')} Years Old`}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <input type="hidden" {...register('age')} />

                            <div className="space-y-2.5">
                                <label className="text-[11px] font-black uppercase tracking-[0.15em] text-[#402E11]/40 ml-1">Gender</label>
                                <div className="bg-[#FAF3E0]/50 border border-[#EBC176]/10 p-1.5 rounded-[1.5rem] flex gap-1.5">
                                    {['male', 'female', 'unknown'].map(g => (
                                        <button
                                            key={g} type="button"
                                            onClick={() => setValue('gender', g, { shouldValidate: true })}
                                            className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${watchedValues.gender === g ? 'bg-white text-[#C48B28] shadow-md shadow-[#C48B28]/5' : 'text-[#402E11]/30 hover:text-[#C48B28] hover:bg-white/40'}`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="text-[11px] font-black uppercase tracking-[0.15em] text-[#402E11]/40 ml-1">Physical Details</label>
                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-[#402E11]/30 ml-1 uppercase tracking-[0.2em]">Size Category</label>
                                    <div className="flex flex-wrap gap-2">
                                        {SIZE_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value} type="button"
                                                onClick={() => setValue('size', opt.value, { shouldValidate: true })}
                                                className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 border-2 ${watchedValues.size === opt.value ? 'border-[#C48B28] bg-[#C48B28]/10 text-[#C48B28]' : 'border-transparent bg-[#FAF3E0]/50 text-[#402E11]/30 hover:bg-[#FAF3E0]'}`}
                                                title={opt.label}
                                            >
                                                {opt.value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-[#402E11]/30 ml-1 uppercase tracking-[0.2em]">Weight (lbs)</label>
                                    <input
                                        type="number" step="0.1"
                                        {...register('weight')}
                                        className="w-full bg-[#FAF3E0]/50 border border-[#EBC176]/20 focus:border-[#C48B28]/40 focus:bg-white focus:shadow-inner rounded-2xl px-6 py-4 outline-none transition-all duration-300 font-bold text-[#402E11] placeholder:text-[#402E11]/20"
                                        placeholder="e.g. 15.5"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'photos':
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="relative aspect-square">
                                <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} disabled={uploading} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                <div className={`h-full w-full rounded-[2rem] border-2 border-dashed border-border bg-bg-secondary/50 flex flex-col items-center justify-center gap-3 transition-colors ${uploading ? 'opacity-50' : 'group-hover:bg-bg-secondary'}`}>
                                    <div className="w-12 h-12 rounded-2xl bg-bg-surface shadow-soft flex items-center justify-center text-text-tertiary">
                                        {uploading ? <Loader2 className="animate-spin" /> : <Plus size={24} />}
                                    </div>
                                    <span className="text-xs font-bold text-text-secondary">{uploading ? 'Uploading...' : 'Add Photos'}</span>
                                </div>
                            </div>
                            {(watch('photos') || []).map((photo, idx) => (
                                <div key={idx} className="relative aspect-square rounded-[2rem] overflow-hidden group shadow-lg">
                                    <img src={photo.url} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <button type="button" onClick={() => removePhoto(idx)} className="absolute top-2 right-2 p-2 bg-white/90 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'personality':
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase tracking-[0.15em] text-[#402E11]/40 ml-1">Personality Traits</label>
                            <div className="flex flex-wrap gap-2.5">
                                {availableTraits.map((trait) => {
                                    const isSelected = watchedValues.personality_traits?.includes(trait.name);
                                    return (
                                        <button
                                            key={trait.id} type="button"
                                            onClick={() => toggleTrait(trait.name)}
                                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 border-2 ${isSelected ? 'border-[#C48B28] bg-[#C48B28]/10 text-[#C48B28] shadow-sm' : 'border-transparent bg-[#FAF3E0]/50 text-[#402E11]/30 hover:bg-[#FAF3E0]'}`}
                                        >
                                            {trait.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase tracking-[0.15em] text-[#402E11]/40 ml-1">Pet's Story / Bio</label>
                            <textarea
                                {...register('rehoming_story')}
                                rows={8}
                                className="w-full bg-[#FAF3E0]/50 border border-[#EBC176]/20 focus:border-[#C48B28]/40 focus:bg-white focus:shadow-inner rounded-3xl px-8 py-6 outline-none transition-all duration-300 font-bold text-[#402E11] placeholder:text-[#402E11]/20 resize-none"
                                placeholder="Tell potential adopters about your pet's personality, history, and what makes them special..."
                            />
                        </div>
                    </div>
                );
            case 'medical':
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[11px] font-black uppercase tracking-[0.15em] text-[#402E11]/40 ml-1">Spayed / Neutered</label>
                                <div className="bg-[#FAF3E0]/50 border border-[#EBC176]/10 p-1.5 rounded-[1.5rem] flex gap-1.5">
                                    {[true, false].map(v => {
                                        const isSelected = watchedValues.medical_history?.spayed_neutered === v;
                                        return (
                                            <button
                                                key={v.toString()} type="button"
                                                onClick={() => setValue('medical_history.spayed_neutered', v, { shouldValidate: true })}
                                                className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isSelected ? 'bg-white text-[#C48B28] shadow-md shadow-[#C48B28]/5' : 'text-[#402E11]/30 hover:text-[#C48B28] hover:bg-white/40'}`}
                                            >
                                                {v ? 'Yes' : 'No'}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[11px] font-black uppercase tracking-[0.15em] text-[#402E11]/40 ml-1">Microchipped</label>
                                <div className="bg-[#FAF3E0]/50 border border-[#EBC176]/10 p-1.5 rounded-[1.5rem] flex gap-1.5">
                                    {[true, false].map(v => {
                                        const isSelected = watchedValues.medical_history?.microchipped === v;
                                        return (
                                            <button
                                                key={v.toString()} type="button"
                                                onClick={() => setValue('medical_history.microchipped', v, { shouldValidate: true })}
                                                className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isSelected ? 'bg-white text-[#C48B28] shadow-md shadow-[#C48B28]/5' : 'text-[#402E11]/30 hover:text-[#C48B28] hover:bg-white/40'}`}
                                            >
                                                {v ? 'Yes' : 'No'}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#FAF3E0] p-8 rounded-[2rem] border border-[#EBC176]/30 flex gap-6 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#C48B28]/20 group-hover:bg-[#C48B28] transition-colors" />
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#C48B28] flex-shrink-0">
                                <Info size={24} strokeWidth={2.5} />
                            </div>
                            <div className="space-y-1.5">
                                <h4 className="text-[11px] font-black text-[#402E11] uppercase tracking-[0.2em]">Medical Privacy</h4>
                                <p className="text-[10px] font-bold text-[#402E11]/40 leading-relaxed uppercase tracking-[0.15em]">
                                    We only display the basics (Spayed/Neutered status) publicly. Detailed medical records will be handled securely during the adoption process if needed.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    }

    return (
        <div className="min-h-screen bg-[#FEF9ED] relative overflow-hidden font-sans pb-20 pt-4">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#EBC176]/10 rounded-full blur-[120px] -z-10"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#C48B28]/5 rounded-full blur-[120px] -z-10"></div>

            <div className="max-w-7xl mx-auto px-6 py-6 md:py-10 animate-in fade-in duration-700">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <button onClick={() => navigate('/dashboard/my-pets')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#402E11]/40 hover:text-[#C48B28] transition-colors mb-4 group">
                            <ArrowLeft size={14} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
                            Back to My Pets
                        </button>
                        <h1 className="text-4xl md:text-5xl font-black text-[#402E11] tracking-tight mb-2">
                            Add a New <span className="text-[#C48B28]">Companion</span>
                        </h1>
                        <p className="text-sm font-bold text-[#402E11]/50 uppercase tracking-widest">Create a beautiful profile for your friend.</p>
                    </div>

                    {/* Horizontal Stepper (Visual) */}
                    <div className="bg-white/70 backdrop-blur-md border border-[#EBC176]/20 p-2 rounded-[2rem] shadow-xl shadow-[#C48B28]/5 flex gap-1 items-center">
                        {SECTIONS.map((section, idx) => {
                            const isActive = activeSection === section.id;
                            const isCompleted = SECTIONS.findIndex(s => s.id === activeSection) > idx;
                            const Icon = section.icon;
                            return (
                                <div key={section.id} className={`flex items-center gap-2.5 px-5 py-2.5 rounded-[1.25rem] transition-all duration-300 ${isActive ? 'bg-[#C48B28] text-white shadow-lg shadow-[#C48B28]/20' : isCompleted ? 'text-green-600 bg-green-50' : 'text-[#402E11]/30'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${isActive ? 'bg-white/20' : isCompleted ? 'bg-green-100' : 'bg-[#FEF9ED]'}`}>
                                        {isCompleted ? <Check size={12} strokeWidth={4} /> : idx + 1}
                                    </div>
                                    <Icon size={16} strokeWidth={2.5} className={`${isActive ? 'text-white' : ''}`} />
                                    <span className="text-[11px] font-black uppercase tracking-wider whitespace-nowrap hidden sm:block">{section.label}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="grid lg:grid-cols-[1fr_400px] gap-12">

                    {/* Mobile Profile Strength (Visible on small screens) */}
                    <div className="lg:hidden mb-8">
                        <div className="bg-white/60 backdrop-blur-md border border-white/40 p-1 rounded-3xl shadow-sm">
                            <div className="bg-bg-surface rounded-[1.25rem] border border-border/50">
                                <PetProfileStrengthCard values={watchedValues} />
                            </div>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-[3rem] border border-[#EBC176]/20 p-8 md:p-12 shadow-2xl shadow-[#C48B28]/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-[#C48B28]/10" />
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-10">
                            {renderSectionContent()}

                            <div className="flex justify-between items-center pt-10 border-t border-[#EBC176]/10 mt-12">
                                <button
                                    type="button"
                                    onClick={handlePrev}
                                    disabled={isFirstSection}
                                    className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-3 ${isFirstSection ? 'opacity-0 pointer-events-none' : 'text-[#402E11]/40 hover:text-[#C48B28] hover:bg-[#FAF3E0]'}`}
                                >
                                    <ArrowLeft size={16} strokeWidth={3} /> Previous Step
                                </button>

                                <div className="flex items-center gap-4">
                                    {isSaving && <Loader2 className="animate-spin text-[#C48B28]" />}
                                    {isLastSection ? (
                                        <button
                                            type="button"
                                            onClick={handleFinalSubmit}
                                            disabled={isSaving}
                                            className="bg-[#402E11] text-white px-12 py-5 rounded-[1.25rem] text-[11px] font-black uppercase tracking-[0.25em] shadow-2xl shadow-[#402E11]/20 hover:bg-[#C48B28] hover:shadow-[#C48B28]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 flex items-center gap-4 group"
                                        >
                                            {isSaving ? 'Processing...' : (
                                                <>
                                                    Finish Profile
                                                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                                        <Check size={12} strokeWidth={4} />
                                                    </div>
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            disabled={isSaving}
                                            className="bg-[#C48B28] text-white px-10 py-5 rounded-[1.25rem] text-[11px] font-black uppercase tracking-[0.25em] shadow-xl shadow-[#C48B28]/20 hover:bg-[#402E11] hover:shadow-[#402E11]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 flex items-center gap-4 group"
                                        >
                                            Next Step
                                            <ChevronRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Live Preview (PetCard V2 Integration) */}
                    <div className="hidden lg:block space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-[#EBC176]/10 p-8 shadow-xl shadow-[#C48B28]/5 space-y-8 sticky top-24">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[11px] font-black text-[#C48B28] uppercase tracking-[0.2em]">Profile Preview</h3>
                                <div className="px-3 py-1 bg-[#FAF3E0] rounded-full flex items-center gap-1.5">
                                    <Sparkles size={10} className="text-[#C48B28]" />
                                    <span className="text-[9px] font-black text-[#402E11]/60 uppercase tracking-widest">Real-time</span>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <PetCard
                                    pet={getPayload(watchedValues)}
                                    variant="profile"
                                    viewMode="grid"
                                    isPreview={true}
                                />
                            </div>

                            {/* Profile Strength Card */}
                            <PetProfileStrengthCard values={watchedValues} />
                        </div>
                    </div>
                </div >
            </div >
        </div >
    );
};

export default AddPetPage;
