import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { providerService } from '../../services';
import useAuth from '../../hooks/useAuth';
import useServices from '../../hooks/useServices';
import Navbar from '../../components/common/Navbar';
import Input from '../../components/common/Form/Input';
import Select from '../../components/common/Form/Select';
import Textarea from '../../components/common/Form/Textarea';
import Switch from '../../components/common/Form/Switch';
import Button from '../../components/common/Buttons/Button';
import {
    Upload, X, Briefcase, FileText, MapPin, Send, Loader2, Navigation,
    Clock, Plus, Trash2, ChevronLeft, ChevronRight, Check, Sparkles,
    ShieldCheck, Info, Camera, Calendar, Building, AlertTriangle, Map as MapIcon, Loader, Search
} from 'lucide-react';
import LocationMapModal from '../../components/Services/LocationMapModal';
import { toast } from 'react-hot-toast';
import { uploadToImgBB } from '../../utils/imgbb';
import axios from 'axios';

// Constants
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const VET_AMENITIES = [
    'On-site Pharmacy', 'Surgery Suite', 'X-Ray/Imaging', 'Laboratory',
    'Boarding Facilities', 'Grooming Services', 'Pet Hotel', '24/7 Emergency Care',
    'Dental Services', 'Specialized Equipment'
];

const GROOMER_AMENITIES = [
    'Hypoallergenic Products', 'Organic Shampoos', 'Nail Trimming', 'Teeth Brushing',
    'Ear Cleaning', 'De-shedding Treatment', 'Cat-Friendly Facility', 'Heated Kennels',
    'Blow Drying', 'Breed-Specific Cuts'
];

const ServiceProviderRegistrationPage = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const {
        useCreateProviderProfile,
        useGetCategories,
        useGetSpecies,
        useGetServiceOptions,
        useGetSpecializations
    } = useServices();

    // Wizard State
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    // Data Hooks
    const { data: categories, isLoading: categoriesLoading } = useGetCategories();
    const { data: speciesList } = useGetSpecies();
    const { data: serviceOptions } = useGetServiceOptions();
    const { data: specializationsList } = useGetSpecializations();

    // Mutation Hook
    const createProfile = useCreateProviderProfile();

    const [locationLoading, setLocationLoading] = useState(false);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Single Form State
    const [formData, setFormData] = useState({
        business_name: '', description: '', category: '', email: user?.email || '',
        phone: '', website: '', address_line1: '', address_line2: '',
        city: '', state: '', zip_code: '', latitude: null, longitude: null,
        clinic_type: 'general', emergency_services: false, pricing_info: '', amenities: [],
        capacity: '', current_count: 0, current_availability: 'available', daily_rate: '',
        weekly_discount: 0, monthly_rate: '', environment_details: '', care_standards: '',
        foster_video_url: '', primary_method: '', training_philosophy: '',
        years_experience: '', base_price: '', group_class_rate: '', specializations_ids: [],
        certifications: [], package_options: [], max_clients: 10, current_client_count: 0,
        accepting_new_clients: true, offers_private_sessions: true, offers_group_classes: false,
        offers_board_and_train: false, offers_virtual_training: false, trainer_video_url: '',
        salon_type: '', groomer_base_price: '', service_menu: [], groomer_amenities: [],
        service_radius_km: 10, walking_rate: '', house_sitting_rate: '', drop_in_rate: '',
        offers_dog_walking: true, offers_house_sitting: false, offers_drop_in_visits: false,
        is_insured: false, has_transport: false, sitter_years_experience: '',
        species_ids: [], services_ids: [],
        business_hours: [
            { day: 0, open_time: '09:00', close_time: '17:00', is_closed: false },
            { day: 1, open_time: '09:00', close_time: '17:00', is_closed: false },
            { day: 2, open_time: '09:00', close_time: '17:00', is_closed: false },
            { day: 3, open_time: '09:00', close_time: '17:00', is_closed: false },
            { day: 4, open_time: '09:00', close_time: '17:00', is_closed: false },
            { day: 5, open_time: '09:00', close_time: '15:00', is_closed: false },
            { day: 6, open_time: null, close_time: null, is_closed: true },
        ]
    });

    const [uploadedMediaUrls, setUploadedMediaUrls] = useState([]);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Sync user email
    useEffect(() => {
        if (user?.email) {
            setFormData(prev => ({ ...prev, email: user.email }));
        }
    }, [user]);

    // Auto-calculate monthly rate for foster
    useEffect(() => {
        const categoryList = categories?.results || [];
        const selectedCat = categoryList.find(c => c.id == formData.category);
        if (selectedCat?.slug === 'foster' && formData.daily_rate) {
            const daily = parseFloat(formData.daily_rate) || 0;
            const discount = parseFloat(formData.weekly_discount) || 0;
            const calculatedMonthly = (daily * 30 * (1 - discount / 100)).toFixed(2);
            if (formData.monthly_rate !== calculatedMonthly) {
                setFormData(prev => ({ ...prev, monthly_rate: calculatedMonthly }));
            }
        }
    }, [formData.daily_rate, formData.weekly_discount, categories, formData.category]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleMultiSelect = (e, field) => {
        const value = parseInt(e.target.value);
        const checked = e.target.checked;
        setFormData(prev => {
            const current = prev[field] || [];
            if (checked) return { ...prev, [field]: [...current, value] };
            else return { ...prev, [field]: current.filter(id => id !== value) };
        });
    };

    const handleArrayToggle = (field, item) => {
        setFormData(prev => {
            const current = prev[field] || [];
            if (current.includes(item)) {
                return { ...prev, [field]: current.filter(i => i !== item) };
            } else {
                return { ...prev, [field]: [...current, item] };
            }
        });
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser.");
            return;
        }
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                if (res.data && res.data.address) {
                    const addr = res.data.address;
                    const street = addr.road || addr.street || addr.pedestrian || addr.highway || addr.suburb || addr.neighbourhood || '';
                    const number = addr.house_number || '';
                    let line1 = `${number} ${street}`.trim();
                    if (!line1 && res.data.display_name) {
                        line1 = res.data.display_name.split(',')[0].trim();
                    }
                    setFormData(prev => ({
                        ...prev,
                        city: addr.city || addr.town || addr.village || addr.municipality || '',
                        state: addr.state || addr.region || '',
                        zip_code: addr.postcode || '',
                        address_line1: line1 || prev.address_line1,
                        latitude: latitude,
                        longitude: longitude
                    }));
                    toast.success("Location updated!");
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to fetch address details.");
            } finally {
                setLocationLoading(false);
            }
        }, (err) => {
            console.error(err);
            toast.error("Failed to get location. Please allow permissions.");
            setLocationLoading(false);
        });
    };

    const handleMapConfirm = async (result) => {
        const { lat, lng } = result;
        setLocationLoading(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            const addr = data.address;
            const street = addr.road || addr.street || addr.pedestrian || addr.highway || addr.suburb || addr.neighbourhood || '';
            const number = addr.house_number || '';
            let line1 = `${number} ${street}`.trim();
            if (!line1 && data.display_name) {
                line1 = data.display_name.split(',')[0].trim();
            }

            setFormData(prev => ({
                ...prev,
                city: addr.city || addr.town || addr.village || addr.municipality || '',
                state: addr.state || addr.region || '',
                zip_code: addr.postcode || '',
                address_line1: line1 || prev.address_line1,
                latitude: parseFloat(lat.toFixed(6)),
                longitude: parseFloat(lng.toFixed(6))
            }));
            toast.success("Location set from map!");
        } catch (error) {
            console.error('Map reverse geocoding error:', error);
            setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
        } finally {
            setLocationLoading(false);
        }
    };

    const geocodeAddress = async () => {
        const address = `${formData.address_line1}, ${formData.city}, ${formData.state} ${formData.zip_code}`.trim();
        if (address.length < 5) return;

        setIsGeocoding(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
            const data = await response.json();
            if (data && data[0]) {
                setFormData(prev => ({
                    ...prev,
                    latitude: parseFloat(parseFloat(data[0].lat).toFixed(6)),
                    longitude: parseFloat(parseFloat(data[0].lon).toFixed(6))
                }));
                toast.success("Coordinates updated from address!");
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        } finally {
            setIsGeocoding(false);
        }
    };

    const constructPayload = () => {
        const categoryList = categories?.results || [];
        const selectedCat = categoryList.find(c => c.id == formData.category);
        const slug = selectedCat?.slug;

        const isVet = slug === 'veterinary';
        const isFoster = slug === 'foster';
        const isTrainer = slug === 'training';
        const isGroomer = slug === 'grooming';
        const isSitter = slug === 'pet_sitting';

        return {
            business_name: formData.business_name,
            description: formData.description,
            category: slug,
            email: formData.email,
            phone: formData.phone,
            website: formData.website || null,
            address_line1: formData.address_line1,
            address_line2: formData.address_line2 || '',
            city: formData.city,
            state: formData.state,
            zip_code: formData.zip_code,
            latitude: formData.latitude ? parseFloat(formData.latitude).toFixed(6) : null,
            longitude: formData.longitude ? parseFloat(formData.longitude).toFixed(6) : null,
            hours: formData.business_hours,
            ...(isFoster && {
                foster_details: {
                    daily_rate: parseFloat(formData.daily_rate).toFixed(2),
                    monthly_rate: parseFloat(formData.monthly_rate || 0).toFixed(2),
                    weekly_discount: parseInt(formData.weekly_discount || 0),
                    capacity: parseInt(formData.capacity),
                    current_count: parseInt(formData.current_count || 0),
                    current_availability: formData.current_availability || 'available',
                    species_accepted_ids: formData.species_ids,
                    environment_details: formData.environment_details || '',
                    care_standards: formData.care_standards || '',
                    video_url: formData.foster_video_url || null
                }
            }),
            ...(isVet && {
                vet_details: {
                    clinic_type: formData.clinic_type,
                    emergency_services: formData.emergency_services,
                    pricing_info: formData.pricing_info,
                    amenities: formData.amenities || [],
                    services_offered_ids: formData.services_ids,
                    species_treated_ids: formData.species_ids
                }
            }),
            ...(isTrainer && {
                trainer_details: {
                    specializations_ids: formData.specializations_ids,
                    years_experience: parseInt(formData.years_experience || 0),
                    species_trained_ids: formData.species_ids,
                    private_session_rate: parseFloat(formData.base_price),
                    group_class_rate: formData.group_class_rate ? parseFloat(formData.group_class_rate) : null,
                    primary_method: formData.primary_method,
                    training_philosophy: formData.training_philosophy,
                    certifications: formData.certifications || [],
                    package_options: formData.package_options || [],
                    max_clients: parseInt(formData.max_clients || 10),
                    current_client_count: parseInt(formData.current_client_count || 0),
                    accepting_new_clients: formData.accepting_new_clients ?? true,
                    offers_private_sessions: formData.offers_private_sessions ?? true,
                    offers_group_classes: formData.offers_group_classes || false,
                    offers_board_and_train: formData.offers_board_and_train || false,
                    offers_virtual_training: formData.offers_virtual_training || false,
                    video_url: formData.trainer_video_url || null
                }
            }),
            ...(isGroomer && {
                groomer_details: {
                    base_price: parseFloat(formData.groomer_base_price),
                    salon_type: formData.salon_type,
                    service_menu: formData.service_menu || [],
                    amenities: formData.groomer_amenities || [],
                    species_accepted_ids: formData.species_ids
                }
            }),
            ...(isSitter && {
                sitter_details: {
                    service_radius_km: parseInt(formData.service_radius_km || 10),
                    walking_rate: formData.walking_rate ? parseFloat(formData.walking_rate) : null,
                    house_sitting_rate: formData.house_sitting_rate ? parseFloat(formData.house_sitting_rate) : null,
                    drop_in_rate: formData.drop_in_rate ? parseFloat(formData.drop_in_rate) : null,
                    species_accepted_ids: formData.species_ids,
                    years_experience: parseInt(formData.sitter_years_experience || 0),
                    offers_dog_walking: formData.offers_dog_walking ?? true,
                    offers_house_sitting: formData.offers_house_sitting || false,
                    offers_drop_in_visits: formData.offers_drop_in_visits || false,
                    is_insured: formData.is_insured || false,
                    has_transport: formData.has_transport || false
                }
            })
        };
    };

    const handleImageSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }
        setUploadingImage(true);
        try {
            const imgbbUrl = await uploadToImgBB(file);
            setUploadedMediaUrls(prev => [...prev, { url: imgbbUrl, name: file.name }]);
            toast.success('Image uploaded!');
        } catch (error) {
            console.error('Image upload error:', error);
            toast.error('Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleRemoveImage = (index) => {
        setUploadedMediaUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const categoryList = categories?.results || [];
        const selectedCat = categoryList.find(c => c.id == formData.category);
        const slug = selectedCat?.slug;

        // Final Validation
        if (formData.species_ids.length === 0) {
            toast.error("Please select at least one species you work with");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = constructPayload();
            const createdProvider = await createProfile.mutateAsync(payload);

            if (uploadedMediaUrls.length > 0 && createdProvider?.id) {
                for (let i = 0; i < uploadedMediaUrls.length; i++) {
                    try {
                        await providerService.uploadMedia(createdProvider.id, {
                            file_url: uploadedMediaUrls[i].url,
                            thumbnail_url: uploadedMediaUrls[i].url,
                            is_primary: i === 0,
                            alt_text: uploadedMediaUrls[i].name
                        });
                    } catch (err) {
                        console.error('Failed to save media:', err);
                    }
                }
            }
            toast.success("Application submitted successfully!");
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.detail || "Failed to submit application");
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        if (currentStep === 1) {
            if (!formData.category) { toast.error("Select a category"); return; }
            if (!formData.business_name) { toast.error("Enter business name"); return; }
        }
        if (currentStep === 2) {
            if (!formData.city || !formData.address_line1) { toast.error("Enter location details"); return; }
        }
        setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        window.scrollTo(0, 0);
    };
    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        window.scrollTo(0, 0);
    };

    // Category Helpers
    const categoryList = categories?.results || [];
    const selectedCat = categoryList.find(c => c.id == formData.category);
    const slug = selectedCat?.slug;
    const categoryName = selectedCat?.name || 'Service';

    const isVet = slug === 'veterinary';
    const isFoster = slug === 'foster';
    const isTrainer = slug === 'training';
    const isGroomer = slug === 'grooming';
    const isSitter = slug === 'pet_sitting';

    // UI Helpers
    const renderChiplist = (label, items, fieldName, required = false) => {
        const value = formData[fieldName] || [];
        return (
            <div className="space-y-4">
                <div className="flex flex-col">
                    <label className="text-sm font-black text-[#402E11] uppercase tracking-[0.2em] mb-1">
                        {label} {required && <span className="text-red-500">*</span>}
                    </label>
                    <p className="text-[10px] font-bold text-[#402E11]/40">Select all that apply to your business</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {items.map(item => {
                        const isSelected = value.includes(item.id);
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleMultiSelect({ target: { value: item.id, checked: !isSelected } }, fieldName)}
                                className={`group px-4 py-4 rounded-3xl text-[11px] font-black uppercase tracking-[0.1em] transition-all border-2 flex flex-col items-center justify-center text-center gap-3
                                    ${isSelected
                                        ? 'bg-[#C48B28]/10 border-[#C48B28] text-[#C48B28] shadow-sm transform scale-[1.02]'
                                        : 'bg-white border-[#EBC176]/10 text-[#402E11]/40 hover:border-[#C48B28]/40 hover:bg-[#C48B28]/5 hover:text-[#402E11]/60'
                                    }`}
                            >
                                <div className={`w-2 h-2 rounded-full transition-all ${isSelected ? 'bg-[#C48B28] scale-150' : 'bg-gray-100 group-hover:bg-[#C48B28]/30'}`} />
                                <span className="leading-tight">{item.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderSpeciesSelector = () => renderChiplist('Accepted Species', speciesList?.results || [], 'species_ids', true);
    const renderServiceSelector = () => {
        const relevantOptions = (serviceOptions?.results || []).filter(o => String(o.category) === String(formData.category));
        return renderChiplist('Services Offered', relevantOptions, 'services_ids', true);
    };
    const renderSpecializationsSelector = () => {
        const categorySpecs = (specializationsList?.results || []).filter(s => String(s.category) === String(formData.category));
        return renderChiplist('Specializations', categorySpecs, 'specializations_ids', true);
    };

    if (authLoading || categoriesLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FEF9ED]">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Loader2 className="text-[#C48B28]" size={48} />
                </motion.div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-[#402E11]/40">Securing your journey...</p>
            </div>
        );
    }

    if (!user) { navigate('/login'); return null; }

    return (
        <div className="min-h-screen bg-[#FEF9ED]">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
                {/* Progress Header */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.4em] mb-2 block">Application Wizard</span>
                            <h1 className="text-3xl font-black text-[#402E11] tracking-tight leading-none">
                                {currentStep === 1 && "Business Identity"}
                                {currentStep === 2 && "Location & Contact"}
                                {currentStep === 3 && "Professional Details"}
                                {currentStep === 4 && "Media & Availability"}
                            </h1>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black text-[#402E11]/40 uppercase tracking-[0.3em] block">Step</span>
                            <span className="text-2xl font-black text-[#402E11]">{currentStep}<span className="text-[#402E11]/20 font-light">/{totalSteps}</span></span>
                        </div>
                    </div>

                    {/* Progress Bar V2 */}
                    <div className="h-1.5 w-full bg-white rounded-full overflow-hidden border border-[#EBC176]/10 flex">
                        {[...Array(totalSteps)].map((_, i) => (
                            <div
                                key={i}
                                className={`h-full flex-1 transition-all duration-500 border-r border-[#FEF9ED]/20 last:border-0 ${i + 1 <= currentStep ? 'bg-[#C48B28]' : 'bg-[#EBC176]/10'}`}
                            />
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-[#EBC176]/10 shadow-2xl shadow-[#402E11]/5 space-y-8">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-10 h-10 rounded-2xl bg-[#C48B28]/10 text-[#C48B28] flex items-center justify-center">
                                            <Briefcase size={20} strokeWidth={2.5} />
                                        </div>
                                        <h2 className="text-xl font-black text-[#402E11] tracking-tight">Service Category</h2>
                                    </div>
                                    <Select
                                        label="What type of service do you provide?"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        options={categoryList.map(cat => ({ value: cat.id, label: cat.name }))}
                                        placeholder="Select category..."
                                        required
                                    />
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <Input
                                            label="Business Name"
                                            name="business_name"
                                            value={formData.business_name}
                                            onChange={handleChange}
                                            placeholder="e.g. Premium Pet Grooming"
                                            required
                                        />
                                        <Input
                                            label="Website (Optional)"
                                            name="website"
                                            value={formData.website || ''}
                                            onChange={handleChange}
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <Textarea
                                        label="Business Description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        rows={4}
                                        placeholder="Tell us about your heritage, expertise, and passion..."
                                    />
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-[#EBC176]/10 shadow-2xl shadow-[#402E11]/5 space-y-10">
                                    {/* Contact Section */}
                                    <div>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                                <Info size={20} strokeWidth={2.5} />
                                            </div>
                                            <h2 className="text-xl font-black text-[#402E11] tracking-tight">Contact Information</h2>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <Input label="Professional Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
                                            <Input label="Phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                                        </div>
                                    </div>

                                    {/* Location Section */}
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                                                <MapPin size={20} strokeWidth={2.5} />
                                            </div>
                                            <h2 className="text-xl font-black text-[#402E11] tracking-tight">Business Location</h2>
                                        </div>
                                    </div>

                                    {(!formData.latitude || !formData.longitude) && (
                                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4 mb-8 animate-in fade-in slide-in-from-top-4">
                                            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                                            <div>
                                                <p className="text-[11px] font-black text-red-900 uppercase tracking-widest leading-tight">Coordinates Missing</p>
                                                <p className="text-[10px] font-bold text-red-700/70 mt-1">Please select your location on the map to help pet owners find you.</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <button
                                            type="button"
                                            onClick={handleGetLocation}
                                            disabled={locationLoading}
                                            className="flex items-center justify-center gap-3 p-4 bg-[#FAF3E0]/40 rounded-2xl border-2 border-dashed border-[#EBC176]/20 hover:border-[#C48B28] hover:bg-[#FAF3E0] text-[#402E11]/60 hover:text-[#402E11] transition-all font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
                                        >
                                            {locationLoading ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={14} strokeWidth={3} />}
                                            Auto Detect
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsMapModalOpen(true)}
                                            className="flex items-center justify-center gap-3 p-4 bg-[#FAF3E0]/40 rounded-2xl border-2 border-dashed border-[#EBC176]/20 hover:border-[#C48B28] hover:bg-[#FAF3E0] text-[#402E11]/60 hover:text-[#402E11] transition-all font-black text-[10px] uppercase tracking-widest"
                                        >
                                            <MapIcon size={14} strokeWidth={3} />
                                            Pick on Map
                                        </button>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <Input label="Address Line 1" name="address_line1" value={formData.address_line1} onChange={handleChange} required />
                                        <Input label="Address Line 2 (Opt)" name="address_line2" value={formData.address_line2 || ''} onChange={handleChange} />
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-6 mt-6 pb-8 border-b border-[#EBC176]/10">
                                        <Input label="City" name="city" value={formData.city} onChange={handleChange} required />
                                        <Input label="State" name="state" value={formData.state} onChange={handleChange} required />
                                        <Input label="ZIP" name="zip_code" value={formData.zip_code} onChange={handleChange} required />
                                    </div>

                                    {/* Coord Display */}
                                    <div className="p-5 bg-gray-50/50 rounded-[1.8rem] border border-[#EBC176]/10 mt-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-widest">Map Coordinates</span>
                                            <button
                                                type="button"
                                                onClick={geocodeAddress}
                                                disabled={isGeocoding}
                                                className="text-[9px] font-black text-[#402E11]/40 hover:text-[#402E11] transition-colors flex items-center gap-1.5 uppercase tracking-widest pb-0.5 border-b border-[#402E11]/10"
                                            >
                                                {isGeocoding ? <Loader size={10} className="animate-spin" /> : <Search size={10} strokeWidth={3} />}
                                                Update from Address
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-[0.2em] mb-1">Latitude</span>
                                                <span className="text-sm font-black text-[#402E11] font-mono leading-none">{formData.latitude ? parseFloat(formData.latitude).toFixed(6) : '---'}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-[#402E11]/30 uppercase tracking-[0.2em] mb-1">Longitude</span>
                                                <span className="text-sm font-black text-[#402E11] font-mono leading-none">{formData.longitude ? parseFloat(formData.longitude).toFixed(6) : '---'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-[#EBC176]/10 shadow-2xl shadow-[#402E11]/5 space-y-10">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                            <ShieldCheck size={20} strokeWidth={2.5} />
                                        </div>
                                        <h2 className="text-xl font-black text-[#402E11] tracking-tight">{categoryName} Expertise</h2>
                                    </div>

                                    {/* FOSTER DETAILS */}
                                    {isFoster && (
                                        <div className="space-y-8 animate-in fade-in duration-500">
                                            <div className="grid md:grid-cols-3 gap-6">
                                                <Input label="Capacity" type="number" name="capacity" value={formData.capacity} onChange={handleChange} required />
                                                <Input label="Daily Rate ($)" type="number" name="daily_rate" value={formData.daily_rate} onChange={handleChange} required />
                                                <Select
                                                    label="Availability"
                                                    name="current_availability"
                                                    value={formData.current_availability}
                                                    onChange={handleChange}
                                                    options={[{ value: 'available', label: 'Available' }, { value: 'limited', label: 'Limited' }, { value: 'full', label: 'Full' }]}
                                                />
                                            </div>
                                            <Textarea label="Environment Details" name="environment_details" value={formData.environment_details} onChange={handleChange} rows={3} placeholder="Indoor/Outdoor details..." />
                                            <Textarea label="Care Standards" name="care_standards" value={formData.care_standards} onChange={handleChange} rows={3} placeholder="Routines, feeding, etc..." />
                                        </div>
                                    )}

                                    {/* VET DETAILS */}
                                    {isVet && (
                                        <div className="space-y-8 animate-in fade-in duration-500">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <Select
                                                    label="Clinic Type"
                                                    name="clinic_type"
                                                    value={formData.clinic_type}
                                                    onChange={handleChange}
                                                    options={[{ value: 'general', label: 'General' }, { value: 'emergency', label: 'Emergency' }, { value: 'specialty', label: 'Specialty' }, { value: 'mobile', label: 'Mobile' }]}
                                                    required
                                                />
                                                <div className="p-4 border border-[#EBC176]/10 rounded-3xl bg-gray-50/50 flex items-center h-[52px] mt-8">
                                                    <Switch label="24/7 Emergency Care" name="emergency_services" checked={formData.emergency_services} onChange={handleChange} />
                                                </div>
                                            </div>
                                            <Textarea label="Pricing Info" name="pricing_info" value={formData.pricing_info} onChange={handleChange} rows={4} required placeholder="Fee structure..." />
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-[#402E11] uppercase tracking-[0.2em]">Clinic Amenities</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {VET_AMENITIES.map(a => (
                                                        <button
                                                            key={a} type="button"
                                                            onClick={() => handleArrayToggle('amenities', a)}
                                                            className={`px-4 py-3 rounded-2xl text-[11px] font-bold text-left border-2 transition-all ${formData.amenities.includes(a) ? 'bg-[#C48B28]/10 border-[#C48B28] text-[#C48B28]' : 'bg-white border-[#EBC176]/10 text-[#402E11]/40'}`}
                                                        >
                                                            {a}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {renderServiceSelector()}
                                        </div>
                                    )}

                                    {/* TRAINER DETAILS */}
                                    {isTrainer && (
                                        <div className="space-y-8 animate-in fade-in duration-500">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <Select
                                                    label="Primary Method"
                                                    name="primary_method"
                                                    value={formData.primary_method}
                                                    onChange={handleChange}
                                                    options={[{ value: 'positive_reinforcement', label: 'Positive Reinforcement' }, { value: 'clicker_training', label: 'Clicker' }, { value: 'balanced', label: 'Balanced' }]}
                                                    required
                                                />
                                                <Input label="Years Experience" type="number" name="years_experience" value={formData.years_experience} onChange={handleChange} required />
                                            </div>
                                            <Textarea label="Training Philosophy" name="training_philosophy" value={formData.training_philosophy} onChange={handleChange} rows={4} required />
                                            <div className="grid md:grid-cols-3 gap-6">
                                                <Input label="Session Rate ($)" type="number" name="base_price" value={formData.base_price} onChange={handleChange} required />
                                                <Input label="Max Clients" type="number" name="max_clients" value={formData.max_clients} onChange={handleChange} />
                                                <div className="p-4 border border-[#EBC176]/10 rounded-3xl bg-gray-50/50 flex items-center h-[52px] mt-8">
                                                    <Switch label="Accepting New" name="accepting_new_clients" checked={formData.accepting_new_clients} onChange={handleChange} />
                                                </div>
                                            </div>
                                            {renderSpecializationsSelector()}
                                        </div>
                                    )}

                                    {/* GROOMER DETAILS */}
                                    {isGroomer && (
                                        <div className="space-y-8 animate-in fade-in duration-500">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <Select
                                                    label="Salon Type"
                                                    name="salon_type"
                                                    value={formData.salon_type}
                                                    onChange={handleChange}
                                                    options={[{ value: 'salon', label: 'Salon Based' }, { value: 'mobile', label: 'Mobile Only' }, { value: 'both', label: 'Hybrid' }]}
                                                />
                                                <Input label="Base Price ($)" type="number" name="groomer_base_price" value={formData.groomer_base_price} onChange={handleChange} required />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-[#402E11] uppercase tracking-[0.2em]">Amenities</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {GROOMER_AMENITIES.map(a => (
                                                        <button
                                                            key={a} type="button"
                                                            onClick={() => handleArrayToggle('groomer_amenities', a)}
                                                            className={`px-4 py-3 rounded-2xl text-[11px] font-bold text-left border-2 transition-all ${formData.groomer_amenities.includes(a) ? 'bg-[#C48B28]/10 border-[#C48B28] text-[#C48B28]' : 'bg-white border-[#EBC176]/10 text-[#402E11]/40'}`}
                                                        >
                                                            {a}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* SITTER DETAILS */}
                                    {isSitter && (
                                        <div className="space-y-8 animate-in fade-in duration-500">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <Input label="Years Exp" type="number" name="sitter_years_experience" value={formData.sitter_years_experience} onChange={handleChange} required />
                                                <Input label="Radius (km)" type="number" name="service_radius_km" value={formData.service_radius_km} onChange={handleChange} required />
                                            </div>
                                            <div className="grid grid-cols-3 gap-6">
                                                <Input label="Walking ($)" name="walking_rate" value={formData.walking_rate} onChange={handleChange} />
                                                <Input label="Sitting ($)" name="house_sitting_rate" value={formData.house_sitting_rate} onChange={handleChange} />
                                                <Input label="Drop-in ($)" name="drop_in_rate" value={formData.drop_in_rate} onChange={handleChange} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="border-t border-[#EBC176]/10 pt-10">
                                        {renderSpeciesSelector()}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                {/* Hours Section */}
                                <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-[#EBC176]/10 shadow-2xl shadow-[#402E11]/5">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-10 h-10 rounded-2xl bg-[#C48B28]/10 text-[#C48B28] flex items-center justify-center">
                                            <Clock size={20} strokeWidth={2.5} />
                                        </div>
                                        <h2 className="text-xl font-black text-[#402E11] tracking-tight">Business Hours</h2>
                                    </div>
                                    <div className="space-y-3">
                                        {DAYS_OF_WEEK.map((day, ix) => (
                                            <div key={ix} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-gray-50/50 rounded-2xl border border-[#EBC176]/5 group hover:bg-white hover:border-[#C48B28]/20 transition-all">
                                                <div className="w-32 text-xs font-black uppercase tracking-widest text-[#402E11]">{day}</div>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.business_hours[ix].is_closed}
                                                        onChange={(e) => {
                                                            const h = [...formData.business_hours];
                                                            h[ix].is_closed = e.target.checked;
                                                            if (e.target.checked) { h[ix].open_time = null; h[ix].close_time = null; }
                                                            setFormData(p => ({ ...p, business_hours: h }));
                                                        }}
                                                        className="w-5 h-5 rounded-lg border-[#EBC176]/30 text-[#C48B28] focus:ring-[#C48B28]"
                                                    />
                                                    <span className="text-[11px] font-bold text-[#402E11]/40">Mark Closed</span>
                                                </div>
                                                {!formData.business_hours[ix].is_closed && (
                                                    <div className="flex items-center gap-3 flex-1 justify-end">
                                                        <input type="time" value={formData.business_hours[ix].open_time || ''} onChange={(e) => { const h = [...formData.business_hours]; h[ix].open_time = e.target.value; setFormData(p => ({ ...p, business_hours: h })) }} className="px-4 py-2 rounded-xl border-[#EBC176]/10 focus:ring-0 focus:border-[#C48B28] text-sm font-bold bg-white" />
                                                        <span className="text-[#402E11]/20 font-light">to</span>
                                                        <input type="time" value={formData.business_hours[ix].close_time || ''} onChange={(e) => { const h = [...formData.business_hours]; h[ix].close_time = e.target.value; setFormData(p => ({ ...p, business_hours: h })) }} className="px-4 py-2 rounded-xl border-[#EBC176]/10 focus:ring-0 focus:border-[#C48B28] text-sm font-bold bg-white" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Photos Section */}
                                <div className="bg-white p-10 lg:p-12 rounded-[3.5rem] border border-[#EBC176]/10 shadow-2xl shadow-[#402E11]/5">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                            <Camera size={22} strokeWidth={2.5} />
                                        </div>
                                        <h2 className="text-2xl font-black text-[#402E11] tracking-tight">Business Showcase</h2>
                                    </div>
                                    <p className="text-[11px] font-bold text-[#402E11]/40 uppercase tracking-[0.2em] mb-10 ml-16">High-quality photos increase trust</p>

                                    <label className="block mb-10 group">
                                        <div className="border-2 border-dashed border-[#EBC176]/20 rounded-[3rem] p-12 text-center cursor-pointer group-hover:border-[#C48B28] group-hover:bg-[#C48B28]/5 transition-all">
                                            <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" disabled={uploadingImage} />
                                            {uploadingImage ? <Loader2 className="animate-spin mx-auto text-[#C48B28] mb-4" size={40} /> : <Upload className="mx-auto text-[#EBC176] mb-4 group-hover:text-[#C48B28] transition-colors" size={40} />}
                                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#402E11]">Drag or Tap to Upload</p>
                                        </div>
                                    </label>

                                    {uploadedMediaUrls.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {uploadedMediaUrls.map((m, ix) => (
                                                <div key={ix} className="relative group aspect-square rounded-[2rem] overflow-hidden border border-[#EBC176]/10 shadow-lg">
                                                    <img src={m.url} className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => handleRemoveImage(ix)} className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl"><X size={14} /></button>
                                                    {ix === 0 && <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-[#C48B28] text-white text-[8px] font-black uppercase tracking-widest rounded-full">Primary</div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Step Controls */}
                    <div className="mt-16 flex items-center justify-between">
                        {currentStep > 1 ? (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-10 py-5 rounded-full border-2 border-[#EBC176]/10 text-[10px] font-black uppercase tracking-[0.3em] text-[#402E11]/40 flex items-center gap-3 hover:bg-[#EBC176]/5 transition-all"
                            >
                                <ChevronLeft size={18} strokeWidth={3} /> Previous
                            </button>
                        ) : (
                            <div />
                        )}

                        {currentStep < totalSteps ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="px-12 py-5 bg-[#402E11] text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 hover:scale-105 transition-all shadow-xl shadow-[#402E11]/20 active:scale-95"
                            >
                                Continue <ChevronRight size={18} strokeWidth={3} />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-12 py-5 bg-[#C48B28] text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 hover:scale-105 transition-all shadow-xl shadow-[#C48B28]/20 disabled:opacity-50 active:scale-95"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} strokeWidth={3} />}
                                Submit Application
                            </button>
                        )}
                    </div>
                </form>

                {/* Secure Trust Footer */}
                <div className="mt-24 text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-[#EBC176]/10 shadow-xl shadow-[#402E11]/5 rounded-full">
                        <ShieldCheck size={16} className="text-[#C48B28]" />
                        <span className="text-[10px] font-black text-[#402E11]/30 uppercase tracking-[0.2em]">PCP Secure Enrollment Certified</span>
                    </div>
                </div>
            </div>

            <LocationMapModal
                isOpen={isMapModalOpen}
                onClose={() => setIsMapModalOpen(false)}
                onConfirm={handleMapConfirm}
                initialPosition={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : [23.8103, 90.4125]}
                initialSearch={`${formData.address_line1 || ''}, ${formData.city || ''}, ${formData.state || ''} ${formData.zip_code || ''}`.trim()}
            />
        </div>
    );
};

export default ServiceProviderRegistrationPage;
