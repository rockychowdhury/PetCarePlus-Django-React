import React, { useState, useEffect } from 'react';
import Button from '../../common/Buttons/Button';
import useServices from '../../../hooks/useServices';

const PetSitterForm = ({ initialData, onSave, isLoading }) => {
    const { useGetSpecies } = useServices();
    const { data: speciesList } = useGetSpecies();

    const [formData, setFormData] = useState({
        service_radius_km: 5,
        walking_rate: '',
        house_sitting_rate: '',
        drop_in_rate: '',
        offers_house_sitting: false,
        offers_dog_walking: true,
        offers_drop_in_visits: false,
        is_insured: false,
        has_transport: false,
        species_accepted_ids: []
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                service_radius_km: initialData.service_radius_km || 5,
                walking_rate: initialData.walking_rate || '',
                house_sitting_rate: initialData.house_sitting_rate || '',
                drop_in_rate: initialData.drop_in_rate || '',
                offers_house_sitting: initialData.offers_house_sitting ?? false,
                offers_dog_walking: initialData.offers_dog_walking ?? true,
                offers_drop_in_visits: initialData.offers_drop_in_visits ?? false,
                is_insured: initialData.is_insured ?? false,
                has_transport: initialData.has_transport ?? false,
                species_accepted_ids: initialData.species_accepted?.map(s => s.id) || []
            });
        }
    }, [initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
        const payload = {
            ...formData,
            species_accepted_ids: formData.species_accepted_ids
        };
        onSave(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Pet Sitter Details</h3>

            {/* Service & Rates */}
            <div className="space-y-4">
                <label className="block text-sm font-medium text-text-secondary mb-2">Service Options & Rates</label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Dog Walking */}
                    <div className="p-4 border border-border rounded-lg bg-gray-50">
                        <label className="flex items-center gap-2 mb-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.offers_dog_walking}
                                onChange={(e) => handleChange('offers_dog_walking', e.target.checked)}
                                className="w-5 h-5 text-brand-primary rounded"
                            />
                            <span className="font-semibold text-text-primary">Dog Walking</span>
                        </label>
                        <div className="pl-7">
                            <label className="block text-xs text-text-secondary mb-1">Rate per Walk ($)</label>
                            <input
                                type="number"
                                disabled={!formData.offers_dog_walking}
                                value={formData.walking_rate}
                                onChange={(e) => handleChange('walking_rate', e.target.value)}
                                className="w-full p-2 border border-border rounded-lg bg-white"
                            />
                        </div>
                    </div>

                    {/* House Sitting */}
                    <div className="p-4 border border-border rounded-lg bg-gray-50">
                        <label className="flex items-center gap-2 mb-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.offers_house_sitting}
                                onChange={(e) => handleChange('offers_house_sitting', e.target.checked)}
                                className="w-5 h-5 text-brand-primary rounded"
                            />
                            <span className="font-semibold text-text-primary">House Sitting</span>
                        </label>
                        <div className="pl-7">
                            <label className="block text-xs text-text-secondary mb-1">Rate per Night ($)</label>
                            <input
                                type="number"
                                disabled={!formData.offers_house_sitting}
                                value={formData.house_sitting_rate}
                                onChange={(e) => handleChange('house_sitting_rate', e.target.value)}
                                className="w-full p-2 border border-border rounded-lg bg-white"
                            />
                        </div>
                    </div>

                    {/* Drop-in Visits */}
                    <div className="p-4 border border-border rounded-lg bg-gray-50">
                        <label className="flex items-center gap-2 mb-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.offers_drop_in_visits}
                                onChange={(e) => handleChange('offers_drop_in_visits', e.target.checked)}
                                className="w-5 h-5 text-brand-primary rounded"
                            />
                            <span className="font-semibold text-text-primary">Drop-in Visits</span>
                        </label>
                        <div className="pl-7">
                            <label className="block text-xs text-text-secondary mb-1">Rate per Visit ($)</label>
                            <input
                                type="number"
                                disabled={!formData.offers_drop_in_visits}
                                value={formData.drop_in_rate}
                                onChange={(e) => handleChange('drop_in_rate', e.target.value)}
                                className="w-full p-2 border border-border rounded-lg bg-white"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Service Radius (km)</label>
                    <input
                        type="number"
                        min="1"
                        value={formData.service_radius_km}
                        onChange={(e) => handleChange('service_radius_km', parseInt(e.target.value))}
                        className="w-full p-2 border border-border rounded-lg"
                    />
                </div>
            </div>

            {/* Additional Features */}
            <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.is_insured}
                        onChange={(e) => handleChange('is_insured', e.target.checked)}
                        className="w-5 h-5 text-brand-primary rounded"
                    />
                    <span className="font-semibold text-text-primary">Insured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.has_transport}
                        onChange={(e) => handleChange('has_transport', e.target.checked)}
                        className="w-5 h-5 text-brand-primary rounded"
                    />
                    <span className="font-semibold text-text-primary">Has Transport</span>
                </label>
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

            <div className="flex justify-end pt-4">
                <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Pet Sitter Details'}
                </Button>
            </div>
        </form>
    );
};

export default PetSitterForm;
