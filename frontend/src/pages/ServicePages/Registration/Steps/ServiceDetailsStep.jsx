import React from 'react';
import Input from '../../../../components/common/Form/Input';
import Select from '../../../../components/common/Form/Select';
import Textarea from '../../../../components/common/Form/Textarea';
import Switch from '../../../../components/common/Form/Switch';
import Button from '../../../../components/common/Buttons/Button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const ServiceDetailsStep = ({ formData, handleChange, handleMultiSelect, onNext, onBack, categories, speciesList, serviceOptions, isSaving }) => {

    const selectedCategory = categories.find(c => c.id == formData.category);
    const slug = selectedCategory?.slug;
    const categoryName = selectedCategory?.name || 'Service';

    const isVet = slug === 'veterinary';
    const isFoster = slug === 'foster';
    const isTrainer = slug === 'training';
    const isGroomer = slug === 'grooming';
    const isSitter = slug === 'pet_sitting';

    // Helper to render modern chip-based selector
    const renderChiplist = (label, items, fieldName) => {
        // Filter logic moved into map/display or pre-filtered
        return (
            <div className="mt-4">
                <label className="block text-sm font-bold text-text-primary mb-3">{label}</label>
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
                                        // Mimic event for parent or handle locally
                                        // We can't easily use handleMultiSelect from parent as it expects e.target.
                                        // Better to use a direct setter wrapper logic here or update parent.
                                        // But wait, the parent handleMultiSelect uses e.target.value and e.target.checked.
                                        // Let's create a synthetic event.
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

    const renderSpeciesSelector = () => renderChiplist('Accepted Species', speciesList, 'species_ids');

    const renderServiceSelector = () => {
        // We filter options based on category here!
        // IMPORTANT: formData.category is ID (string or number), o.category is ID (number)
        const relevantOptions = serviceOptions.filter(o => o.category == formData.category);
        return renderChiplist('Services Offered', relevantOptions, 'services_ids');
    };

    // Helper to determine the prefix for nested form data based on service type
    const getTypePrefix = () => {
        if (isTrainer) return 'trainer';
        if (isGroomer) return 'groomer';
        if (isSitter) return 'sitter';
        return '';
    };

    // Placeholder for specialization selector (if needed for trainer)
    const renderSpecializationSelector = () => (
        <div className="mt-4">
            <Input
                label="Specialization (e.g., Obedience, Agility)"
                name="trainer_details.specialization"
                value={formData.trainer_details?.specialization || ''}
                onChange={handleChange}
                placeholder="e.g. Puppy Training, Behavior Modification"
            />
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-xl border border-border animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold font-merriweather">Service Details</h2>
                <p className="text-text-secondary">Specifics for your <strong>{categoryName}</strong> service.</p>
            </div>

            <div className="space-y-4">
                {/* --- Foster Specifics --- */}
                {isFoster && (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-brand-primary border-b pb-1">Capacity & Rates</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                label="Max Capacity"
                                type="number"
                                name="capacity"
                                value={formData.capacity || ''}
                                onChange={handleChange}
                                min="0"
                            />
                            <Input
                                label="Daily Rate ($)"
                                type="number"
                                name="daily_rate"
                                value={formData.daily_rate || ''}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <Textarea
                            label="Environment Details"
                            name="environment_details"
                            value={formData.environment_details || ''}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Describe your home environment, yard space, etc."
                        />
                        <Textarea
                            label="Care Standards"
                            name="care_standards"
                            value={formData.care_standards || ''}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Your approach to pet care, daily routines, etc."
                        />
                        {renderSpeciesSelector()}
                    </div>
                )}

                {/* --- Vet Specifics --- */}
                {isVet && (
                    <div className="space-y-4">
                        <Textarea
                            label="Pricing & Consultation Info"
                            name="pricing_info"
                            value={formData.pricing_info || ''}
                            onChange={handleChange}
                            rows={3}
                            placeholder={`Consultation Fee: $50\nEmergency Visit: $100\nVaccinations: $20-$40`}
                        />
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 border rounded-xl bg-bg-secondary/5">
                                <Switch
                                    label="Emergency Services Available"
                                    name="emergency_services"
                                    checked={formData.emergency_services || false}
                                    onChange={handleChange}
                                />
                            </div>
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
                                placeholder="Select Clinic Type"
                            />
                            {/* Add more compact vet fields here if needed */}
                        </div>
                        {renderServiceSelector()}
                        {renderSpeciesSelector()}
                    </div>
                )}

                {/* --- Trainer Specifics --- */}
                {isTrainer && (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-brand-primary border-b pb-1">Training Details</h3>
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
                                placeholder="Select Training Method"
                            />
                            <Input
                                label="Years of Experience"
                                type="number"
                                name="years_experience"
                                value={formData.years_experience || ''}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                        <Textarea
                            label="Training Philosophy"
                            name="training_philosophy"
                            value={formData.training_philosophy || ''}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Describe your approach to training and your philosophy..."
                        />
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                label="Private Session Rate ($/hr)"
                                type="number"
                                name="base_price"
                                value={formData.base_price || ''}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                placeholder="Hourly rate for private sessions"
                                required
                            />
                            <Input
                                label="Group Class Rate ($/class)"
                                type="number"
                                name="group_class_rate"
                                value={formData.group_class_rate || ''}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                placeholder="Per-class rate (optional)"
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
                        {renderSpeciesSelector()}
                    </div>
                )}

                {/* --- Groomer Specifics --- */}
                {isGroomer && (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-brand-primary border-b pb-1">Grooming Details</h3>
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
                                placeholder="Select Salon Type"
                            />
                            <Input
                                label="Base Grooming Price ($)"
                                type="number"
                                name="base_price"
                                value={formData.base_price || ''}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                placeholder="Starting price for basic groom"
                                required
                            />
                        </div>
                        {renderSpeciesSelector()}
                    </div>
                )}

                {/* --- Pet Sitter Specifics --- */}
                {isSitter && (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-brand-primary border-b pb-1">Pet Sitting Details</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                label="Years of Experience"
                                type="number"
                                name="years_experience"
                                value={formData.years_experience || ''}
                                onChange={handleChange}
                                min="0"
                            />
                            <Input
                                label="Service Radius (km)"
                                type="number"
                                name="service_radius_km"
                                value={formData.service_radius_km || ''}
                                onChange={handleChange}
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
                            <Input label="Dog Walking Rate ($)" type="number" name="walking_rate" value={formData.walking_rate || ''} onChange={handleChange} placeholder="Per walk" step="0.01" />
                            <Input label="House Sitting Rate ($)" type="number" name="house_sitting_rate" value={formData.house_sitting_rate || ''} onChange={handleChange} placeholder="Per night" step="0.01" />
                            <Input label="Drop-in Visit Rate ($)" type="number" name="drop_in_rate" value={formData.drop_in_rate || ''} onChange={handleChange} placeholder="Per visit" step="0.01" />
                        </div>
                        {renderSpeciesSelector()}
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-6 border-t mt-8">
                <Button variant="ghost" onClick={onBack} type="button">
                    <ArrowLeft size={16} className="mr-2" /> Back
                </Button>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onNext(false)} // Save draft
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Draft'}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => onNext(true)} // Next
                        disabled={isSaving}
                    >
                        Next: Upload Media <ArrowRight size={16} className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailsStep;
