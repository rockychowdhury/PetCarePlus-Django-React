import React, { useState, useEffect } from 'react';
import Button from '../../common/Buttons/Button';
import useServices from '../../../hooks/useServices';

const VetForm = ({ initialData, onSave, isLoading }) => {
    const { useGetSpecies, useGetServiceOptions } = useServices();
    const { data: speciesList } = useGetSpecies();
    const { data: serviceOptions } = useGetServiceOptions();

    // Filter services for Vet category? Ideally backend filters or we do client side
    // For now assuming all options are available or we filter by visual
    // Note: Model 'ServiceOption' belongs to 'ServiceCategory'.
    // We should filter options where category.slug == 'veterinary' ideally.
    // But data returned might not have category slug attached?
    // Serializer for ServiceOption: ['id', 'name', 'base_price', 'description']. No category.
    // We might need to fetch categories to know which ID is veterinary?
    // Or just show all.

    const [formData, setFormData] = useState({
        clinic_type: 'general',
        pricing_info: '',
        amenities: [],
        emergency_services: false,
        species_treated_ids: [],
        services_offered_ids: []
    });

    const [amenityInput, setAmenityInput] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                clinic_type: initialData.clinic_type || 'general',
                pricing_info: initialData.pricing_info || '',
                amenities: initialData.amenities || [],
                emergency_services: initialData.emergency_services || false,
                species_treated_ids: initialData.species_treated?.map(s => s.id) || [],
                services_offered_ids: initialData.services_offered?.map(s => s.id) || []
            });
        }
    }, [initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMultiSelectToggle = (field, id) => {
        setFormData(prev => {
            const current = prev[field];
            if (current.includes(id)) {
                return { ...prev, [field]: current.filter(x => x !== id) };
            } else {
                return { ...prev, [field]: [...current, id] };
            }
        });
    };

    const handleAddAmenity = (e) => {
        e.preventDefault();
        if (amenityInput.trim()) {
            setFormData(prev => ({
                ...prev,
                amenities: [...prev.amenities, amenityInput.trim()]
            }));
            setAmenityInput('');
        }
    };

    const handleRemoveAmenity = (index) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            species_treated_ids: formData.species_treated_ids,
            services_offered_ids: formData.services_offered_ids
        };
        onSave(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Veterinary Clinic Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Clinic Type</label>
                    <select
                        value={formData.clinic_type}
                        onChange={(e) => handleChange('clinic_type', e.target.value)}
                        className="w-full p-2 border border-border rounded-lg"
                    >
                        <option value="general">General Practice</option>
                        <option value="emergency">Emergency</option>
                        <option value="specialty">Specialty</option>
                        <option value="mobile">Mobile Vet</option>
                    </select>
                </div>

                <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.emergency_services}
                            onChange={(e) => handleChange('emergency_services', e.target.checked)}
                            className="w-5 h-5 text-brand-primary rounded focus:ring-brand-primary"
                        />
                        <span className="font-medium text-text-primary">Emergency Services Available</span>
                    </label>
                </div>
            </div>

            {/* Species Treated */}
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Species Treated</label>
                <div className="flex flex-wrap gap-2">
                    {(speciesList?.results || []).map(s => (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => handleMultiSelectToggle('species_treated_ids', s.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${formData.species_treated_ids.includes(s.id)
                                ? 'bg-brand-primary text-white border-brand-primary'
                                : 'bg-white text-text-secondary border-border hover:border-gray-400'
                                }`}
                        >
                            {s.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Services Offered */}
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Services Offered</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(serviceOptions?.results || []).map(option => (
                        <label key={option.id} className="flex items-center gap-2 p-2 border border-border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.services_offered_ids.includes(option.id)}
                                onChange={() => handleMultiSelectToggle('services_offered_ids', option.id)}
                                className="w-4 h-4 text-brand-primary rounded"
                            />
                            <span className="text-sm">{option.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Pricing Info */}
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Pricing Information</label>
                <textarea
                    value={formData.pricing_info}
                    onChange={(e) => handleChange('pricing_info', e.target.value)}
                    className="w-full p-2 border border-border rounded-lg h-32"
                    placeholder="General checkup: $50... (Markdown supported)"
                />
            </div>

            {/* Amenities */}
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Amenities</label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={amenityInput}
                        onChange={(e) => setAmenityInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddAmenity(e)}
                        className="flex-1 p-2 border border-border rounded-lg"
                        placeholder="Add amenity (e.g. Free Wi-Fi)..."
                    />
                    <Button type="button" onClick={handleAddAmenity} variant="outline" size="sm">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.amenities.map((amenity, idx) => (
                        <span key={idx} className="bg-gray-100 text-text-secondary px-3 py-1 rounded-full text-sm flex items-center gap-1">
                            {amenity}
                            <button type="button" onClick={() => handleRemoveAmenity(idx)} className="hover:text-red-500"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Clinic Details'}
                </Button>
            </div>
        </form>
    );
};

export default VetForm;
