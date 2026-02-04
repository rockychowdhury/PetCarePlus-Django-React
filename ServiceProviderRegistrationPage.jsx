import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { providerService } from '../../services';
import useAuth from '../../hooks/useAuth';
import useServices from '../../hooks/useServices';
import Navbar from '../../components/common/Navbar';
import Input from '../../components/common/Form/Input';
import Select from '../../components/common/Form/Select';
import Textarea from '../../components/common/Form/Textarea';
import Switch from '../../components/common/Form/Switch';
import Button from '../../components/common/Buttons/Button';
import { Upload, X, Briefcase, FileText, MapPin, Send, Loader2, Navigation, Clock, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadToImgBB } from '../../utils/imgbb';
import axios from 'axios';

// Constants
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const VET_AMENITIES = [
    'On-site Pharmacy',
    'Surgery Suite',
    'X-Ray/Imaging',
    'Laboratory',
    'Boarding Facilities',
    'Grooming Services',
    'Pet Hotel',
    '24/7 Emergency Care',
    'Dental Services',
    'Specialized Equipment'
];

const GROOMER_AMENITIES = [
    'Hypoallergenic Products',
    'Organic Shampoos',
    'Nail Trimming',
    'Teeth Brushing',
    'Ear Cleaning',
    'De-shedding Treatment',
    'Cat-Friendly Facility',
    'Heated Kennels',
    'Blow Drying',
    'Breed-Specific Cuts'
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

    // Data Hooks
    const { data: categories, isLoading: categoriesLoading } = useGetCategories();
    const { data: speciesList } = useGetSpecies();
    const { data: serviceOptions } = useGetServiceOptions();
    const { data: specializationsList } = useGetSpecializations();

    // Mutation Hook
    const createProfile = useCreateProviderProfile();

    const [locationLoading, setLocationLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Single Form State
    const [formData, setFormData] = useState({
        // Basic Info
        business_name: '',
        description: '',
        category: '',
        email: user?.email || '',
        phone: '',
        website: '',
        
        // Address
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        zip_code: '',
        latitude: null,
        longitude: null,
        
        // Veterinary Fields
        clinic_type: 'general',
        emergency_services: false,
        pricing_info: '',
        amenities: [],
        
        // Foster Fields
        capacity: '',
        current_count: 0,
        current_availability: 'available',
        daily_rate: '',
        weekly_discount: 0,
        monthly_rate: '',
        environment_details: '',
        care_standards: '',
        foster_video_url: '',
        
        // Trainer Fields
        primary_method: '',
        training_philosophy: '',
        years_experience: '',
        base_price: '',
        group_class_rate: '',
        specializations_ids: [],
        certifications: [],
        package_options: [],
        max_clients: 10,
        current_client_count: 0,
        accepting_new_clients: true,
        offers_private_sessions: true,
        offers_group_classes: false,
        offers_board_and_train: false,
        offers_virtual_training: false,
        trainer_video_url: '',
        
        // Groomer Fields
        salon_type: '',
        groomer_base_price: '',
        service_menu: [],
        groomer_amenities: [],
        
        // Pet Sitter Fields
        service_radius_km: 10,
        walking_rate: '',
        house_sitting_rate: '',
        drop_in_rate: '',
        offers_dog_walking: true,
        offers_house_sitting: false,
        offers_drop_in_visits: false,
        is_insured: false,
        has_transport: false,
        sitter_years_experience: '',
        
        // Species (shared)
        species_ids: [],
        
        // Service Options (for vet)
        services_ids: [],
        
        // Business Hours
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
            category: formData.category,
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
            
            // Business Hours
            hours: formData.business_hours,
            
            // Category-specific details
            ...(isFoster && {
                foster_details: {
                    daily_rate: parseFloat(formData.daily_rate),
                    monthly_rate: formData.monthly_rate 
                        ? parseFloat(formData.monthly_rate)
                        : parseFloat(formData.daily_rate) * 30,
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
                    group_class_rate: formData.group_class_rate 
                        ? parseFloat(formData.group_class_rate) 
                        : null,
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
                    walking_rate: formData.walking_rate 
                        ? parseFloat(formData.walking_rate) 
                        : null,
                    house_sitting_rate: formData.house_sitting_rate 
                        ? parseFloat(formData.house_sitting_rate) 
                        : null,
                    drop_in_rate: formData.drop_in_rate 
                        ? parseFloat(formData.drop_in_rate) 
                        : null,
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

    // Image Upload Handlers
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

        // Validation
        if (!formData.category) {
            toast.error("Please select a service category");
            return;
        }
        if (!formData.business_name || !formData.description) {
            toast.error("Please fill in all required fields");
            return;
        }

        const categoryList = categories?.results || [];
        const selectedCat = categoryList.find(c => c.id == formData.category);
        const slug = selectedCat?.slug;

        // Category-specific validation
        if (slug === 'training' && formData.specializations_ids.length === 0) {
            toast.error("Please select at least one training specialization");
            return;
        }

        if (slug === 'veterinary' && formData.services_ids.length === 0) {
            toast.error("Please select at least one veterinary service");
            return;
        }

        if (formData.species_ids.length === 0) {
            toast.error("Please select at least one species you work with");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = constructPayload();
            const createdProvider = await createProfile.mutateAsync(payload);

            // Upload media if any
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
            navigate('/services/provider/dashboard');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.detail || "Failed to submit application");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper functions for conditional rendering
    const categoryList = categories?.results || [];
    const selectedCat = categoryList.find(c => c.id == formData.category);
    const slug = selectedCat?.slug;
    const categoryName = selectedCat?.name || 'Service';

    const isVet = slug === 'veterinary';
    const isFoster = slug === 'foster';
    const isTrainer = slug === 'training';
    const isGroomer = slug === 'grooming';
    const isSitter = slug === 'pet_sitting';

    // Chip selector helper
    const renderChiplist = (label, items, fieldName, required = false) => {
        return (
            <div className="mt-4">
                <label className="block text-sm font-bold text-text-primary mb-3">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <div className="flex flex-wrap gap-2 p-4 border border-dashed border-border rounded-2xl bg-bg-secondary/10">
                    {items.length === 0 ? (
                        <p className="text-sm text-text-tertiary italic">No options available for this category.</p>
                    ) : (
                        items.map(item => {
                            const isSelected = formData[fieldName]?.includes(item.id);
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        const syntheticEvent = {
                                            target: {
                                                value: item.id,
                                                checked: !isSelected
                                            }
                                        };
                                        handleMultiSelect(syntheticEvent, fieldName);
                                    }}
                                    className={`
                                        px-4 py-2 rounded-full text-sm font-bold transition-all border-2
                                        ${isSelected
                                            ? 'bg-brand-primary border-brand-primary text-white shadow-md transform scale-105'
                                            : 'bg-white border-border text-text-secondary hover:border-brand-primary/50 hover:bg-brand-primary/5'
                                        }
                                    `}
                                >
                                    {item.name}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        );
    };

    const renderSpeciesSelector = () => renderChiplist('Accepted Species', speciesList?.results || [], 'species_ids', true);

    const renderServiceSelector = () => {
        const allOptions = serviceOptions?.results || [];
        const relevantOptions = allOptions.filter(o => o.category == formData.category);
        return renderChiplist('Services Offered', relevantOptions, 'services_ids', true);
    };

    const renderSpecializationsSelector = () => {
        const allSpecs = specializationsList?.results || [];
        const categorySpecs = allSpecs.filter(s => s.category == formData.category);
        return renderChiplist('Training Specializations', categorySpecs, 'specializations_ids', true);
    };

    // Certifications management
    const addCertification = () => {
        setFormData(prev => ({
            ...prev,
            certifications: [
                ...prev.certifications,
                { name: '', organization: '', year: new Date().getFullYear() }
            ]
        }));
    };

    const updateCertification = (index, field, value) => {
        setFormData(prev => {
            const newCerts = [...prev.certifications];
            newCerts[index] = { ...newCerts[index], [field]: value };
            return { ...prev, certifications: newCerts };
        });
    };

    const removeCertification = (index) => {
        setFormData(prev => ({
            ...prev,
            certifications: prev.certifications.filter((_, i) => i !== index)
        }));
    };

    // Package options management
    const addPackage = () => {
        setFormData(prev => ({
            ...prev,
            package_options: [
                ...prev.package_options,
                { name: '', sessions: 1, price: 0, description: '' }
            ]
        }));
    };

    const updatePackage = (index, field, value) => {
        setFormData(prev => {
            const newPackages = [...prev.package_options];
            newPackages[index] = { ...newPackages[index], [field]: value };
            return { ...prev, package_options: newPackages };
        });
    };

    const removePackage = (index) => {
        setFormData(prev => ({
            ...prev,
            package_options: prev.package_options.filter((_, i) => i !== index)
        }));
    };

    // Service menu management (for groomers)
    const addServiceMenuItem = () => {
        setFormData(prev => ({
            ...prev,
            service_menu: [
                ...prev.service_menu,
                { name: '', price: 0, description: '' }
            ]
        }));
    };

    const updateServiceMenuItem = (index, field, value) => {
        setFormData(prev => {
            const newMenu = [...prev.service_menu];
            newMenu[index] = { ...newMenu[index], [field]: value };
            return { ...prev, service_menu: newMenu };
        });
    };

    const removeServiceMenuItem = (index) => {
        setFormData(prev => ({
            ...prev,
            service_menu: prev.service_menu.filter((_, i) => i !== index)
        }));
    };

    if (authLoading || categoriesLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-brand-primary" size={40} />
            </div>
        );
    }

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-bg-primary to-bg-secondary">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block p-4 bg-brand-primary/10 rounded-full mb-4">
                        <Briefcase className="text-brand-primary" size={48} />
                    </div>
                    <h1 className="text-5xl font-bold font-merriweather mb-3 bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                        Become a Service Provider
                    </h1>
                    <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                        Join our network of trusted pet care professionals. Complete the form below to submit your application.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* === STEP 1: CATEGORY SELECTION === */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-border hover:border-brand-primary/30 transition-all">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-primary text-white font-bold text-lg">1</div>
                            <h2 className="text-2xl font-bold font-merriweather text-brand-primary">Service Category</h2>
                        </div>
                        <Select
                            label="What type of service do you provide?"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            options={categoryList.map(cat => ({ value: cat.id, label: cat.name }))}
                            placeholder="Select a category"
                            required
                        />
                    </div>

                    {/* Show remaining sections only if category is selected */}
                    {formData.category && (
                        <>
                            {/* === STEP 2: BASIC INFO === */}
                            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-border hover:border-brand-primary/30 transition-all space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-primary text-white font-bold text-lg">2</div>
                                    <h2 className="text-2xl font-bold font-merriweather text-brand-primary">Business Information</h2>
                                </div>
                                <div className="h-1 w-20 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full"></div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        label="Business Name"
                                        name="business_name"
                                        value={formData.business_name}
                                        onChange={handleChange}
                                        placeholder="e.g. Paws & Claws Care"
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
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows={4}
                                    placeholder="Describe your business, services, and what makes you unique..."
                                />

                                <div className="border-t pt-6 mt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <FileText size={20} className="text-brand-primary" />
                                        <h3 className="font-semibold text-lg text-brand-primary">Contact Information</h3>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <Input
                                            label="Business Email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                        <Input
                                            label="Phone"
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="border-t pt-6 mt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={20} className="text-brand-primary" />
                                            <h3 className="font-semibold text-lg text-brand-primary">Business Location</h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleGetLocation}
                                            disabled={locationLoading}
                                            className="text-sm font-bold text-brand-primary flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-brand-primary/5 transition-all disabled:opacity-50 border border-brand-primary/20"
                                        >
                                            {locationLoading ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
                                            {locationLoading ? 'Getting Location...' : 'Use My Location'}
                                        </button>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <Input
                                            label="Address Line 1"
                                            name="address_line1"
                                            value={formData.address_line1}
                                            onChange={handleChange}
                                            placeholder="Street address"
                                            required
                                        />
                                        <Input
                                            label="Address Line 2 (Optional)"
                                            name="address_line2"
                                            value={formData.address_line2 || ''}
                                            onChange={handleChange}
                                            placeholder="Apt, suite, etc."
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4 mt-4">
                                        <Input
                                            label="City"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                        />
                                        <Input
                                            label="State"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            required
                                        />
                                        <Input
                                            label="ZIP Code"
                                            name="zip_code"
                                            value={formData.zip_code}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* === STEP 3: SERVICE DETAILS (CONDITIONAL) === */}
                            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-border hover:border-brand-primary/30 transition-all space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-primary text-white font-bold text-lg">3</div>
                                    <h2 className="text-2xl font-bold font-merriweather text-brand-primary">
                                        Service Details for {categoryName}
                                    </h2>
                                </div>
                                <div className="h-1 w-20 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full mb-6"></div>

                                {/* ========== FOSTER CARE ========== */}
                                {isFoster && (
                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <Input
                                                label="Max Capacity"
                                                type="number"
                                                name="capacity"
                                                value={formData.capacity || ''}
                                                onChange={handleChange}
                                                min="1"
                                                required
                                                placeholder="Number of animals"
                                            />
                                            <Input
                                                label="Daily Rate ($)"
                                                type="number"
                                                name="daily_rate"
                                                value={formData.daily_rate || ''}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.01"
                                                required
                                                placeholder="e.g. 25.00"
                                            />
                                            <Input
                                                label="Weekly Discount (%)"
                                                type="number"
                                                name="weekly_discount"
                                                value={formData.weekly_discount || ''}
                                                onChange={handleChange}
                                                min="0"
                                                max="100"
                                                placeholder="e.g. 10"
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <Input
                                                label="Monthly Rate ($)"
                                                type="number"
                                                name="monthly_rate"
                                                value={formData.monthly_rate || ''}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.01"
                                                placeholder="Leave empty to auto-calculate"
                                            />
                                            <Select
                                                label="Current Availability"
                                                name="current_availability"
                                                value={formData.current_availability}
                                                onChange={handleChange}
                                                options={[
                                                    { value: 'available', label: 'Available' },
                                                    { value: 'limited', label: 'Limited Availability' },
                                                    { value: 'full', label: 'Currently Full' }
                                                ]}
                                            />
                                        </div>

                                        <Textarea
                                            label="Environment Details"
                                            name="environment_details"
                                            value={formData.environment_details || ''}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Describe your home environment: indoor space, yard, play areas, safety features, etc."
                                        />
                                        
                                        <Textarea
                                            label="Care Standards"
                                            name="care_standards"
                                            value={formData.care_standards || ''}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Your approach to pet care, daily routines, feeding schedules, exercise, etc."
                                        />

                                        <Input
                                            label="Facility Video URL (Optional)"
                                            name="foster_video_url"
                                            value={formData.foster_video_url || ''}
                                            onChange={handleChange}
                                            placeholder="https://youtube.com/..."
                                        />

                                        {renderSpeciesSelector()}
                                    </div>
                                )}

                                {/* ========== VETERINARY CLINIC ========== */}
                                {isVet && (
                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <Select
                                                label="Clinic Type"
                                                name="clinic_type"
                                                value={formData.clinic_type || ''}
                                                onChange={handleChange}
                                                options={[
                                                    { value: 'general', label: 'General Practice' },
                                                    { value: 'emergency', label: 'Emergency' },
                                                    { value: 'specialty', label: 'Specialty' },
                                                    { value: 'mobile', label: 'Mobile Vet' }
                                                ]}
                                                required
                                            />
                                            <div className="flex items-center gap-3 p-4 border rounded-xl bg-bg-secondary/5">
                                                <Switch
                                                    label="24/7 Emergency Services"
                                                    name="emergency_services"
                                                    checked={formData.emergency_services || false}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        <Textarea
                                            label="Pricing Information"
                                            name="pricing_info"
                                            value={formData.pricing_info || ''}
                                            onChange={handleChange}
                                            rows={4}
                                            required
                                            placeholder="Example:
Consultation: $50
Vaccinations: $20-$40
Surgery: Starting at $200
Emergency Visit: $150"
                                        />

                                        {/* Amenities */}
                                        <div>
                                            <label className="block text-sm font-bold text-text-primary mb-3">
                                                Clinic Amenities
                                            </label>
                                            <div className="grid md:grid-cols-2 gap-3">
                                                {VET_AMENITIES.map(amenity => (
                                                    <label 
                                                        key={amenity} 
                                                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.amenities?.includes(amenity)}
                                                            onChange={(e) => handleArrayToggle('amenities', amenity)}
                                                            className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                                        />
                                                        <span className="text-sm font-medium">{amenity}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {renderServiceSelector()}
                                        {renderSpeciesSelector()}
                                    </div>
                                )}

                                {/* ========== TRAINER ========== */}
                                {isTrainer && (
                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <Select
                                                label="Primary Training Method"
                                                name="primary_method"
                                                value={formData.primary_method || ''}
                                                onChange={handleChange}
                                                options={[
                                                    { value: 'positive_reinforcement', label: 'Positive Reinforcement' },
                                                    { value: 'clicker_training', label: 'Clicker Training' },
                                                    { value: 'balanced', label: 'Balanced Training' },
                                                    { value: 'other', label: 'Other Methods' }
                                                ]}
                                                required
                                            />
                                            <Input
                                                label="Years of Experience"
                                                type="number"
                                                name="years_experience"
                                                value={formData.years_experience || ''}
                                                onChange={handleChange}
                                                min="0"
                                                required
                                            />
                                        </div>

                                        <Textarea
                                            label="Training Philosophy"
                                            name="training_philosophy"
                                            value={formData.training_philosophy || ''}
                                            onChange={handleChange}
                                            rows={4}
                                            required
                                            placeholder="Describe your approach to training, your philosophy, and what makes your methods effective..."
                                        />

                                        <div className="grid md:grid-cols-3 gap-4">
                                            <Input
                                                label="Private Session Rate ($/hr)"
                                                type="number"
                                                name="base_price"
                                                value={formData.base_price || ''}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.01"
                                                required
                                                placeholder="e.g. 75.00"
                                            />
                                            <Input
                                                label="Group Class Rate ($/class)"
                                                type="number"
                                                name="group_class_rate"
                                                value={formData.group_class_rate || ''}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.01"
                                                placeholder="Optional"
                                            />
                                            <Input
                                                label="Max Concurrent Clients"
                                                type="number"
                                                name="max_clients"
                                                value={formData.max_clients || ''}
                                                onChange={handleChange}
                                                min="1"
                                                placeholder="e.g. 10"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-text-primary">Service Options</label>
                                            <div className="grid md:grid-cols-2 gap-3">
                                                <Switch
                                                    label="Private Sessions"
                                                    name="offers_private_sessions"
                                                    checked={formData.offers_private_sessions ?? true}
                                                    onChange={handleChange}
                                                />
                                                <Switch
                                                    label="Group Classes"
                                                    name="offers_group_classes"
                                                    checked={formData.offers_group_classes || false}
                                                    onChange={handleChange}
                                                />
                                                <Switch
                                                    label="Board & Train"
                                                    name="offers_board_and_train"
                                                    checked={formData.offers_board_and_train || false}
                                                    onChange={handleChange}
                                                />
                                                <Switch
                                                    label="Virtual Training"
                                                    name="offers_virtual_training"
                                                    checked={formData.offers_virtual_training || false}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        {/* Certifications */}
                                        <div className="border-t pt-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <label className="block text-sm font-bold text-text-primary">
                                                    Professional Certifications
                                                </label>
                                                <Button
                                                    type="button"
                                                    onClick={addCertification}
                                                    className="text-sm flex items-center gap-2"
                                                    variant="outline"
                                                >
                                                    <Plus size={16} />
                                                    Add Certification
                                                </Button>
                                            </div>
                                            {formData.certifications.length === 0 ? (
                                                <p className="text-sm text-text-tertiary italic">No certifications added yet</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {formData.certifications.map((cert, index) => (
                                                        <div key={index} className="flex gap-3 items-start p-4 border rounded-lg bg-gray-50">
                                                            <div className="flex-1 grid md:grid-cols-3 gap-3">
                                                                <Input
                                                                    label="Certification Name"
                                                                    value={cert.name || ''}
                                                                    onChange={(e) => updateCertification(index, 'name', e.target.value)}
                                                                    placeholder="e.g. CPDT-KA"
                                                                />
                                                                <Input
                                                                    label="Organization"
                                                                    value={cert.organization || ''}
                                                                    onChange={(e) => updateCertification(index, 'organization', e.target.value)}
                                                                    placeholder="e.g. CCPDT"
                                                                />
                                                                <Input
                                                                    label="Year Obtained"
                                                                    type="number"
                                                                    value={cert.year || ''}
                                                                    onChange={(e) => updateCertification(index, 'year', e.target.value)}
                                                                    min="1950"
                                                                    max={new Date().getFullYear()}
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeCertification(index)}
                                                                className="mt-8 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Package Options */}
                                        <div className="border-t pt-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <label className="block text-sm font-bold text-text-primary">
                                                    Training Packages
                                                </label>
                                                <Button
                                                    type="button"
                                                    onClick={addPackage}
                                                    className="text-sm flex items-center gap-2"
                                                    variant="outline"
                                                >
                                                    <Plus size={16} />
                                                    Add Package
                                                </Button>
                                            </div>
                                            {formData.package_options.length === 0 ? (
                                                <p className="text-sm text-text-tertiary italic">No packages added yet</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {formData.package_options.map((pkg, index) => (
                                                        <div key={index} className="p-4 border rounded-lg bg-gray-50">
                                                            <div className="flex gap-3 items-start">
                                                                <div className="flex-1 space-y-3">
                                                                    <div className="grid md:grid-cols-3 gap-3">
                                                                        <Input
                                                                            label="Package Name"
                                                                            value={pkg.name || ''}
                                                                            onChange={(e) => updatePackage(index, 'name', e.target.value)}
                                                                            placeholder="e.g. Puppy Package"
                                                                        />
                                                                        <Input
                                                                            label="Number of Sessions"
                                                                            type="number"
                                                                            value={pkg.sessions || ''}
                                                                            onChange={(e) => updatePackage(index, 'sessions', e.target.value)}
                                                                            min="1"
                                                                        />
                                                                        <Input
                                                                            label="Total Price ($)"
                                                                            type="number"
                                                                            value={pkg.price || ''}
                                                                            onChange={(e) => updatePackage(index, 'price', e.target.value)}
                                                                            min="0"
                                                                            step="0.01"
                                                                        />
                                                                    </div>
                                                                    <Textarea
                                                                        label="Description"
                                                                        value={pkg.description || ''}
                                                                        onChange={(e) => updatePackage(index, 'description', e.target.value)}
                                                                        rows={2}
                                                                        placeholder="What's included in this package?"
                                                                    />
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removePackage(index)}
                                                                    className="mt-8 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <Input
                                            label="Training Video URL (Optional)"
                                            name="trainer_video_url"
                                            value={formData.trainer_video_url || ''}
                                            onChange={handleChange}
                                            placeholder="https://youtube.com/..."
                                        />

                                        {renderSpecializationsSelector()}
                                        {renderSpeciesSelector()}
                                    </div>
                                )}

                                {/* ========== GROOMER ========== */}
                                {isGroomer && (
                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <Select
                                                label="Salon Type"
                                                name="salon_type"
                                                value={formData.salon_type || ''}
                                                onChange={handleChange}
                                                options={[
                                                    { value: 'salon', label: 'Salon Based' },
                                                    { value: 'mobile', label: 'Mobile Grooming' },
                                                    { value: 'both', label: 'Both' }
                                                ]}
                                                required
                                            />
                                            <Input
                                                label="Base Grooming Price ($)"
                                                type="number"
                                                name="groomer_base_price"
                                                value={formData.groomer_base_price || ''}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.01"
                                                required
                                                placeholder="Starting price"
                                            />
                                        </div>

                                        {/* Service Menu */}
                                        <div className="border-t pt-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <label className="block text-sm font-bold text-text-primary">
                                                    Service Menu
                                                </label>
                                                <Button
                                                    type="button"
                                                    onClick={addServiceMenuItem}
                                                    className="text-sm flex items-center gap-2"
                                                    variant="outline"
                                                >
                                                    <Plus size={16} />
                                                    Add Service
                                                </Button>
                                            </div>
                                            {formData.service_menu.length === 0 ? (
                                                <p className="text-sm text-text-tertiary italic">No services added yet</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {formData.service_menu.map((service, index) => (
                                                        <div key={index} className="p-4 border rounded-lg bg-gray-50">
                                                            <div className="flex gap-3 items-start">
                                                                <div className="flex-1 space-y-3">
                                                                    <div className="grid md:grid-cols-2 gap-3">
                                                                        <Input
                                                                            label="Service Name"
                                                                            value={service.name || ''}
                                                                            onChange={(e) => updateServiceMenuItem(index, 'name', e.target.value)}
                                                                            placeholder="e.g. Full Groom"
                                                                        />
                                                                        <Input
                                                                            label="Price ($)"
                                                                            type="number"
                                                                            value={service.price || ''}
                                                                            onChange={(e) => updateServiceMenuItem(index, 'price', e.target.value)}
                                                                            min="0"
                                                                            step="0.01"
                                                                        />
                                                                    </div>
                                                                    <Textarea
                                                                        label="Description"
                                                                        value={service.description || ''}
                                                                        onChange={(e) => updateServiceMenuItem(index, 'description', e.target.value)}
                                                                        rows={2}
                                                                        placeholder="What's included?"
                                                                    />
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeServiceMenuItem(index)}
                                                                    className="mt-8 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Amenities */}
                                        <div>
                                            <label className="block text-sm font-bold text-text-primary mb-3">
                                                Grooming Amenities
                                            </label>
                                            <div className="grid md:grid-cols-2 gap-3">
                                                {GROOMER_AMENITIES.map(amenity => (
                                                    <label 
                                                        key={amenity} 
                                                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.groomer_amenities?.includes(amenity)}
                                                            onChange={(e) => handleArrayToggle('groomer_amenities', amenity)}
                                                            className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                                        />
                                                        <span className="text-sm font-medium">{amenity}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {renderSpeciesSelector()}
                                    </div>
                                )}

                                {/* ========== PET SITTER ========== */}
                                {isSitter && (
                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <Input
                                                label="Years of Experience"
                                                type="number"
                                                name="sitter_years_experience"
                                                value={formData.sitter_years_experience || ''}
                                                onChange={handleChange}
                                                min="0"
                                                required
                                            />
                                            <Input
                                                label="Service Radius (km)"
                                                type="number"
                                                name="service_radius_km"
                                                value={formData.service_radius_km || ''}
                                                onChange={handleChange}
                                                min="1"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-text-primary">Services Offered</label>
                                            <div className="grid md:grid-cols-3 gap-3">
                                                <Switch
                                                    label="Dog Walking"
                                                    name="offers_dog_walking"
                                                    checked={formData.offers_dog_walking ?? true}
                                                    onChange={handleChange}
                                                />
                                                <Switch
                                                    label="House Sitting"
                                                    name="offers_house_sitting"
                                                    checked={formData.offers_house_sitting || false}
                                                    onChange={handleChange}
                                                />
                                                <Switch
                                                    label="Drop-in Visits"
                                                    name="offers_drop_in_visits"
                                                    checked={formData.offers_drop_in_visits || false}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-text-primary">Additional Details</label>
                                            <div className="grid md:grid-cols-2 gap-3">
                                                <Switch
                                                    label="Insured"
                                                    name="is_insured"
                                                    checked={formData.is_insured || false}
                                                    onChange={handleChange}
                                                />
                                                <Switch
                                                    label="Has Transport"
                                                    name="has_transport"
                                                    checked={formData.has_transport || false}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4">
                                            <Input
                                                label="Dog Walking Rate ($)"
                                                type="number"
                                                name="walking_rate"
                                                value={formData.walking_rate || ''}
                                                onChange={handleChange}
                                                placeholder="Per walk"
                                                step="0.01"
                                                min="0"
                                            />
                                            <Input
                                                label="House Sitting Rate ($)"
                                                type="number"
                                                name="house_sitting_rate"
                                                value={formData.house_sitting_rate || ''}
                                                onChange={handleChange}
                                                placeholder="Per night"
                                                step="0.01"
                                                min="0"
                                            />
                                            <Input
                                                label="Drop-in Visit Rate ($)"
                                                type="number"
                                                name="drop_in_rate"
                                                value={formData.drop_in_rate || ''}
                                                onChange={handleChange}
                                                placeholder="Per visit"
                                                step="0.01"
                                                min="0"
                                            />
                                        </div>

                                        {renderSpeciesSelector()}
                                    </div>
                                )}
                            </div>

                            {/* === STEP 4: BUSINESS HOURS === */}
                            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-border hover:border-brand-primary/30 transition-all">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-primary text-white font-bold text-lg">4</div>
                                    <h2 className="text-2xl font-bold font-merriweather text-brand-primary flex items-center gap-2">
                                        <Clock size={24} />
                                        Business Hours
                                    </h2>
                                </div>
                                <p className="text-text-secondary mb-6">Set your regular operating hours</p>

                                <div className="space-y-3">
                                    {DAYS_OF_WEEK.map((dayName, index) => {
                                        const dayHours = formData.business_hours[index];
                                        return (
                                            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="w-28 font-semibold text-sm">{dayName}</div>
                                                
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={dayHours.is_closed}
                                                        onChange={(e) => {
                                                            const newHours = [...formData.business_hours];
                                                            newHours[index].is_closed = e.target.checked;
                                                            if (e.target.checked) {
                                                                newHours[index].open_time = null;
                                                                newHours[index].close_time = null;
                                                            }
                                                            setFormData(prev => ({ ...prev, business_hours: newHours }));
                                                        }}
                                                        className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                                    />
                                                    <span className="text-sm font-medium">Closed</span>
                                                </div>
                                                
                                                {!dayHours.is_closed && (
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <input
                                                            type="time"
                                                            value={dayHours.open_time || ''}
                                                            onChange={(e) => {
                                                                const newHours = [...formData.business_hours];
                                                                newHours[index].open_time = e.target.value;
                                                                setFormData(prev => ({ ...prev, business_hours: newHours }));
                                                            }}
                                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                                        />
                                                        <span className="text-sm text-gray-500">to</span>
                                                        <input
                                                            type="time"
                                                            value={dayHours.close_time || ''}
                                                            onChange={(e) => {
                                                                const newHours = [...formData.business_hours];
                                                                newHours[index].close_time = e.target.value;
                                                                setFormData(prev => ({ ...prev, business_hours: newHours }));
                                                            }}
                                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* === STEP 5: MEDIA UPLOAD === */}
                            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-border hover:border-brand-primary/30 transition-all">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-primary text-white font-bold text-lg">5</div>
                                    <h2 className="text-2xl font-bold font-merriweather text-brand-primary flex items-center gap-2">
                                        <Upload size={24} />
                                        Business Photos
                                    </h2>
                                </div>

                                <p className="text-text-secondary mb-6">Upload photos of your facility, equipment, or previous work (optional but recommended)</p>

                                {/* Upload Area */}
                                <label className="block mb-4">
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                            disabled={uploadingImage}
                                        />
                                        {uploadingImage ? (
                                            <>
                                                <Loader2 className="animate-spin mx-auto text-brand-primary mb-3" size={40} />
                                                <p className="text-sm font-semibold text-gray-700">Uploading...</p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mx-auto text-gray-400 mb-3" size={40} />
                                                <p className="text-sm font-semibold text-gray-700 mb-1">
                                                    Click to upload image
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    PNG, JPG up to 5MB
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </label>

                                {/* Uploaded Images Grid */}
                                {uploadedMediaUrls.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                                        {uploadedMediaUrls.map((media, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={media.url}
                                                    alt={media.name}
                                                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                                >
                                                    <X size={14} />
                                                </button>
                                                {index === 0 && (
                                                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-brand-primary text-white text-xs font-bold rounded">
                                                        Primary
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* === STEP 6: SUBMIT === */}
                            <div className="bg-gradient-to-br from-brand-primary to-brand-secondary p-8 rounded-2xl shadow-xl text-white">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-brand-primary font-bold text-lg">6</div>
                                            <h2 className="text-3xl font-bold font-merriweather">Ready to Submit?</h2>
                                        </div>
                                        <p className="text-white/90 ml-13">Review your information and submit your application for approval</p>
                                    </div>
                                    <Send size={48} className="text-white/80" />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-white text-brand-primary hover:bg-white/90 font-bold text-lg py-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2" size={24} />
                                            Submitting Application...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2" size={20} />
                                            Submit Application
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ServiceProviderRegistrationPage;
