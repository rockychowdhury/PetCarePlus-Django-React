import React, { useState, useEffect } from 'react';
import Button from '../../common/Buttons/Button';
import useServices from '../../../hooks/useServices';

const GroomerForm = ({ initialData, onSave, isLoading }) => {
    const { useGetSpecies } = useServices();
    const { data: speciesList } = useGetSpecies();

    const [formData, setFormData] = useState({
        salon_type: 'salon',
        base_price: '',
        service_menu: [],
        amenities: [],
        species_accepted_ids: []
    });

    const [amenityInput, setAmenityInput] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                salon_type: initialData.salon_type || 'salon',
                base_price: initialData.base_price || '',
                service_menu: initialData.service_menu || [],
                amenities: initialData.amenities || [],
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

    const handleAddServiceItem = () => {
        setFormData(prev => ({
            ...prev,
            service_menu: [...prev.service_menu, { name: '', price: '', description: '' }]
        }));
    };

    const handleUpdateServiceItem = (index, field, value) => {
        setFormData(prev => {
            const newMenu = [...prev.service_menu];
            newMenu[index] = { ...newMenu[index], [field]: value };
            return { ...prev, service_menu: newMenu };
        });
    };

    const handleRemoveServiceItem = (index) => {
        setFormData(prev => ({
            ...prev,
            service_menu: prev.service_menu.filter((_, i) => i !== index)
        }));
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
            <h3 className="text-lg font-bold text-text-primary mb-4">Groomer Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Salon Type</label>
                    <select
                        value={formData.salon_type}
                        onChange={(e) => handleChange('salon_type', e.target.value)}
                        className="w-full p-2 border border-border rounded-lg"
                    >
                        <option value="salon">Salon Based</option>
                        <option value="mobile">Mobile Grooming</option>
                        <option value="both">Both</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Base Price / Starting At ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.base_price}
                        onChange={(e) => handleChange('base_price', e.target.value)}
                        className="w-full p-2 border border-border rounded-lg"
                        required
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

            {/* Service Menu */}
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Service Menu</label>
                <div className="space-y-2">
                    {formData.service_menu.map((item, idx) => (
                        <div key={idx} className="flex gap-2 flex-wrap md:flex-nowrap p-2 border border-border rounded-lg bg-gray-50">
                            <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleUpdateServiceItem(idx, 'name', e.target.value)}
                                className="flex-grow p-2 border border-border rounded-lg min-w-[150px]"
                                placeholder="Service Name (e.g. Full Groom)"
                            />
                            <input
                                type="number"
                                value={item.price}
                                onChange={(e) => handleUpdateServiceItem(idx, 'price', e.target.value)}
                                className="w-24 p-2 border border-border rounded-lg"
                                placeholder="Price"
                            />
                            <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleUpdateServiceItem(idx, 'description', e.target.value)}
                                className="flex-grow p-2 border border-border rounded-lg min-w-[200px]"
                                placeholder="Description"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveServiceItem(idx)}
                                className="text-red-500 hover:text-red-700 p-2"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddServiceItem}
                    >
                        + Add Service Item
                    </Button>
                </div>
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
                        placeholder="Add amenity (e.g. Hypoallergenic Shampoo)..."
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
                    {isLoading ? 'Saving...' : 'Save Groomer Details'}
                </Button>
            </div>
        </form>
    );
};

export default GroomerForm;
