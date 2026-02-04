import React, { useState, useEffect } from 'react';
import Button from '../../common/Buttons/Button';
import useServices from '../../../hooks/useServices';

const TrainerForm = ({ initialData, onSave, isLoading }) => {
    const { useGetSpecies, useGetSpecializations } = useServices();
    const { data: speciesList } = useGetSpecies();
    const { data: specializations } = useGetSpecializations();

    // Method choices hardcoded as per model, or could be fetched if backend provides choices metadata
    const METHODS = [
        { value: 'positive_reinforcement', label: 'Positive Reinforcement' },
        { value: 'clicker_training', label: 'Clicker Training' },
        { value: 'balanced', label: 'Balanced Training' },
        { value: 'other', label: 'Other Methods' },
    ];

    const [formData, setFormData] = useState({
        primary_method: 'positive_reinforcement',
        training_philosophy: '',
        years_experience: 0,
        specializations_ids: [],
        species_trained_ids: [],
        offers_private_sessions: true,
        offers_group_classes: false,
        offers_board_and_train: false,
        offers_virtual_training: false,
        private_session_rate: '',
        group_class_rate: '',
        max_clients: 10,
        accepting_new_clients: true,
        video_url: '',
        certifications: [],
        package_options: []
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                primary_method: initialData.primary_method || 'positive_reinforcement',
                training_philosophy: initialData.training_philosophy || '',
                years_experience: initialData.years_experience || 0,
                specializations_ids: initialData.specializations?.map(s => s.id) || [],
                species_trained_ids: initialData.species_trained?.map(s => s.id) || [],
                offers_private_sessions: initialData.offers_private_sessions ?? true,
                offers_group_classes: initialData.offers_group_classes || false,
                offers_board_and_train: initialData.offers_board_and_train || false,
                offers_virtual_training: initialData.offers_virtual_training || false,
                private_session_rate: initialData.private_session_rate || '',
                group_class_rate: initialData.group_class_rate || '',
                max_clients: initialData.max_clients || 10,
                accepting_new_clients: initialData.accepting_new_clients ?? true,
                video_url: initialData.video_url || '',
                certifications: initialData.certifications || [],
                package_options: initialData.package_options || []
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            specializations_ids: formData.specializations_ids,
            species_trained_ids: formData.species_trained_ids
        };
        onSave(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Trainer Details</h3>

            {/* Philosophy & Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Primary Training Method</label>
                        <select
                            value={formData.primary_method}
                            onChange={(e) => handleChange('primary_method', e.target.value)}
                            className="w-full p-2 border border-border rounded-lg"
                        >
                            {METHODS.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Years of Experience</label>
                        <input
                            type="number"
                            min="0"
                            value={formData.years_experience}
                            onChange={(e) => handleChange('years_experience', parseInt(e.target.value))}
                            className="w-full p-2 border border-border rounded-lg"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Training Philosophy</label>
                    <textarea
                        value={formData.training_philosophy}
                        onChange={(e) => handleChange('training_philosophy', e.target.value)}
                        className="w-full p-2 border border-border rounded-lg h-32"
                        placeholder="Describe your approach..."
                    />
                </div>
            </div>

            {/* Specializations */}
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Specializations</label>
                <div className="flex flex-wrap gap-2">
                    {(specializations?.results || []).map(s => (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => handleMultiSelectToggle('specializations_ids', s.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${formData.specializations_ids.includes(s.id)
                                ? 'bg-brand-primary text-white border-brand-primary'
                                : 'bg-white text-text-secondary border-border hover:border-gray-400'
                                }`}
                        >
                            {s.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Certifications - JSON List */}
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Certifications</label>
                <div className="space-y-2">
                    {formData.certifications.map((cert, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input
                                type="text"
                                value={cert.name}
                                onChange={(e) => {
                                    const newCerts = [...formData.certifications];
                                    newCerts[idx] = { ...newCerts[idx], name: e.target.value };
                                    handleChange('certifications', newCerts);
                                }}
                                className="flex-1 p-2 border border-border rounded-lg"
                                placeholder="Certification Name (e.g. CPDT-KA)"
                            />
                            <input
                                type="text"
                                value={cert.organization}
                                onChange={(e) => {
                                    const newCerts = [...formData.certifications];
                                    newCerts[idx] = { ...newCerts[idx], organization: e.target.value };
                                    handleChange('certifications', newCerts);
                                }}
                                className="flex-1 p-2 border border-border rounded-lg"
                                placeholder="Issuing Org"
                            />
                            <button
                                type="button"
                                onClick={() => handleChange('certifications', formData.certifications.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:text-red-700 font-bold px-2"
                            >
                                X
                            </button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleChange('certifications', [...formData.certifications, { name: '', organization: '' }])}
                    >
                        + Add Certification
                    </Button>
                </div>
            </div>

            {/* Services & Rates */}
            <div className="space-y-4">
                <label className="block text-sm font-medium text-text-secondary mb-2">Service Options & Rates</label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-border rounded-lg bg-gray-50">
                        <label className="flex items-center gap-2 mb-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.offers_private_sessions}
                                onChange={(e) => handleChange('offers_private_sessions', e.target.checked)}
                                className="w-5 h-5 text-brand-primary rounded"
                            />
                            <span className="font-semibold text-text-primary">Private Sessions</span>
                        </label>
                        <div className="pl-7">
                            <label className="block text-xs text-text-secondary mb-1">Hourly Rate ($)</label>
                            <input
                                type="number"
                                disabled={!formData.offers_private_sessions}
                                value={formData.private_session_rate}
                                onChange={(e) => handleChange('private_session_rate', e.target.value)}
                                className="w-full p-2 border border-border rounded-lg bg-white"
                            />
                        </div>
                    </div>

                    <div className="p-4 border border-border rounded-lg bg-gray-50">
                        <label className="flex items-center gap-2 mb-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.offers_group_classes}
                                onChange={(e) => handleChange('offers_group_classes', e.target.checked)}
                                className="w-5 h-5 text-brand-primary rounded"
                            />
                            <span className="font-semibold text-text-primary">Group Classes</span>
                        </label>
                        <div className="pl-7">
                            <label className="block text-xs text-text-secondary mb-1">Rate per Class ($)</label>
                            <input
                                type="number"
                                disabled={!formData.offers_group_classes}
                                value={formData.group_class_rate}
                                onChange={(e) => handleChange('group_class_rate', e.target.value)}
                                className="w-full p-2 border border-border rounded-lg bg-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Package Options */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Training Packages</label>
                    <p className="text-xs text-text-tertiary mb-2">Create bundles (e.g. "Puppy Starter: 5 sessions for $400")</p>
                    <div className="space-y-2">
                        {formData.package_options.map((pkg, idx) => (
                            <div key={idx} className="flex gap-2 flex-wrap md:flex-nowrap p-2 border border-border rounded-lg bg-gray-50">
                                <input
                                    type="text"
                                    value={pkg.name}
                                    onChange={(e) => {
                                        const newPkgs = [...formData.package_options];
                                        newPkgs[idx] = { ...newPkgs[idx], name: e.target.value };
                                        handleChange('package_options', newPkgs);
                                    }}
                                    className="flex-grow p-2 border border-border rounded-lg min-w-[150px]"
                                    placeholder="Package Name"
                                />
                                <input
                                    type="text"
                                    value={pkg.price}
                                    onChange={(e) => {
                                        const newPkgs = [...formData.package_options];
                                        newPkgs[idx] = { ...newPkgs[idx], price: e.target.value };
                                        handleChange('package_options', newPkgs);
                                    }}
                                    className="w-24 p-2 border border-border rounded-lg"
                                    placeholder="Price"
                                />
                                <input
                                    type="text"
                                    value={pkg.description}
                                    onChange={(e) => {
                                        const newPkgs = [...formData.package_options];
                                        newPkgs[idx] = { ...newPkgs[idx], description: e.target.value };
                                        handleChange('package_options', newPkgs);
                                    }}
                                    className="flex-grow p-2 border border-border rounded-lg min-w-[200px]"
                                    placeholder="Description (e.g. 5x 1hr sessions)"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleChange('package_options', formData.package_options.filter((_, i) => i !== idx))}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <span className="sr-only">Delete</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleChange('package_options', [...formData.package_options, { name: '', price: '', description: '' }])}
                        >
                            + Add Package
                        </Button>
                    </div>
                </div>

                <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.offers_board_and_train}
                            onChange={(e) => handleChange('offers_board_and_train', e.target.checked)}
                            className="w-4 h-4 text-brand-primary rounded"
                        />
                        <span className="text-sm text-text-secondary font-medium">Board & Train</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.offers_virtual_training}
                            onChange={(e) => handleChange('offers_virtual_training', e.target.checked)}
                            className="w-4 h-4 text-brand-primary rounded"
                        />
                        <span className="text-sm text-text-secondary font-medium">Virtual Training</span>
                    </label>
                </div>
            </div>

            {/* Video */}
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Demo Video URL</label>
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
                    {isLoading ? 'Saving...' : 'Save Trainer Details'}
                </Button>
            </div>
        </form>
    );
};

export default TrainerForm;
