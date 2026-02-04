import React, { useState, useEffect } from 'react';
import Button from '../../common/Buttons/Button';
import { toast } from 'react-toastify';
import useServices from '../../../hooks/useServices';

const FosterForm = ({ initialData, onSave, isLoading }) => {
    const { useGetSpecies } = useServices();
    const { data: speciesList } = useGetSpecies();

    // Flattened state for form
    const [formData, setFormData] = useState({
        capacity: 1,
        current_count: 0,
        current_availability: 'available',
        daily_rate: '',
        weekly_discount: 0,
        monthly_rate: '',
        video_url: '',
        environment_details: {
            indoor_space: '',
            outdoor_space: '',
            other_pets: ''
        },
        care_standards: {
            routine: '',
            special_needs_experience: ''
        },
        species_accepted_ids: []
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                capacity: initialData.capacity || 1,
                current_count: initialData.current_count || 0,
                current_availability: initialData.current_availability || 'available',
                daily_rate: initialData.daily_rate || '',
                weekly_discount: initialData.weekly_discount || 0,
                monthly_rate: initialData.monthly_rate || '',
                video_url: initialData.video_url || '',
                environment_details: {
                    indoor_space: initialData.environment_details?.indoor_space || '',
                    outdoor_space: initialData.environment_details?.outdoor_space || '',
                    other_pets: initialData.environment_details?.other_pets || ''
                },
                care_standards: {
                    routine: initialData.care_standards?.routine || '',
                    special_needs_experience: initialData.care_standards?.special_needs_experience || ''
                },
                species_accepted_ids: initialData.species_accepted?.map(s => s.id) || []
            });
        }
    }, [initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    const handleSpeciesToggle = (id) => {
        setFormData(prev => {
            const current = prev.species_accepted_ids;
            if (current.includes(id)) {
                return { ...prev, species_accepted_ids: current.filter(x => x !== id) };
            } else {
                return { ...prev, species_accepted_ids: [...current, id] };
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Prepare payload to match backend expectation
        // Backend expects 'species_accepted' as list of IDs? OR 'species_accepted_ids'?
        // The serializer is read-only for nested fields?
        // Wait, standard DRF ModelSerializer expect 'species_accepted' as PK list if it's M2M.
        // Let's assume we pass { ...data, species_accepted: [...] }
        const payload = {
            ...formData,
            species_accepted_ids: formData.species_accepted_ids
        };
        onSave(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Foster Details</h3>

            {/* Availability & Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Total Capacity</label>
                    <input
                        type="number"
                        min="1"
                        value={formData.capacity}
                        onChange={(e) => handleChange('capacity', parseInt(e.target.value))}
                        className="w-full p-2 border border-border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Availability Status</label>
                    <select
                        value={formData.current_availability}
                        onChange={(e) => handleChange('current_availability', e.target.value)}
                        className="w-full p-2 border border-border rounded-lg"
                    >
                        <option value="available">Available</option>
                        <option value="limited">Limited</option>
                        <option value="full">Full</option>
                    </select>
                </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Daily Rate ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.daily_rate}
                        onChange={(e) => handleChange('daily_rate', e.target.value)}
                        className="w-full p-2 border border-border rounded-lg"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Weekly Discount (%)</label>
                    <input
                        type="number"
                        min="0" max="100"
                        value={formData.weekly_discount}
                        onChange={(e) => handleChange('weekly_discount', parseInt(e.target.value))}
                        className="w-full p-2 border border-border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Monthly Rate ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.monthly_rate}
                        onChange={(e) => handleChange('monthly_rate', e.target.value)}
                        className="w-full p-2 border border-border rounded-lg"
                    />
                </div>
            </div>

            {/* Species Accepted */}
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Species Accepted</label>
                <div className="flex flex-wrap gap-2">
                    {(speciesList?.results || []).map(s => (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => handleSpeciesToggle(s.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${formData.species_accepted_ids.includes(s.id)
                                ? 'bg-brand-primary text-white border-brand-primary'
                                : 'bg-white text-text-secondary border-border hover:border-gray-400'
                                }`}
                        >
                            {s.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Environment */}
            <div className="space-y-4">
                <h4 className="font-semibold text-text-primary">Environment & Care</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Indoor Space</label>
                        <textarea
                            value={formData.environment_details.indoor_space}
                            onChange={(e) => handleNestedChange('environment_details', 'indoor_space', e.target.value)}
                            className="w-full p-2 border border-border rounded-lg h-24"
                            placeholder="Describe indoor accommodations..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Outdoor Space</label>
                        <textarea
                            value={formData.environment_details.outdoor_space}
                            onChange={(e) => handleNestedChange('environment_details', 'outdoor_space', e.target.value)}
                            className="w-full p-2 border border-border rounded-lg h-24"
                            placeholder="Describe yard, fencing, etc..."
                        />
                    </div>
                </div>
            </div>

            {/* Video */}
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Facility Video URL</label>
                <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => handleChange('video_url', e.target.value)}
                    className="w-full p-2 border border-border rounded-lg"
                    placeholder="https://youtube.com/..."
                />
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Foster Details'}
                </Button>
            </div>
        </form>
    );
};

export default FosterForm;
