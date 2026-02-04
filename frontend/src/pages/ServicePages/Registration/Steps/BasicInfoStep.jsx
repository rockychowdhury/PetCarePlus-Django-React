import React from 'react';
import Input from '../../../../components/common/Form/Input';
import Textarea from '../../../../components/common/Form/Textarea';
import Button from '../../../../components/common/Buttons/Button';
import { ArrowLeft, ArrowRight, Loader2, Navigation } from 'lucide-react';

const BasicInfoStep = ({ formData, handleChange, onNext, onBack, categories, isSaving, onGetLocation, locationLoading }) => {

    const selectedCatName = categories.find(c => c.id == formData.category)?.name || 'Service';

    // Validation
    const isValid = formData.business_name &&
        formData.description &&
        formData.phone &&
        formData.email &&
        formData.address_line1 &&
        formData.city &&
        formData.state &&
        formData.zip_code;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold font-merriweather">Tell us about your Business</h2>
                <p className="text-text-secondary">You are registering as a <strong>{selectedCatName}</strong> provider.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-border space-y-4">
                {/* Identity */}
                <div>
                    <h3 className="font-semibold text-lg mb-2 text-brand-primary">Business Identity</h3>
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
                </div>

                <Textarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="Briefly describe your services..."
                />

                {/* Contact */}
                <div>
                    <h3 className="font-semibold text-lg mb-2 text-brand-primary">Contact Info</h3>
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

                {/* Location */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg text-brand-primary">Location</h3>
                        {onGetLocation && (
                            <button
                                type="button"
                                onClick={onGetLocation}
                                disabled={locationLoading}
                                className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:underline disabled:opacity-50"
                            >
                                {locationLoading ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                                {locationLoading ? 'Locating...' : 'Use Current Location'}
                            </button>
                        )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <Input
                            label="Address Line 1"
                            name="address_line1"
                            value={formData.address_line1}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Address Line 2 (Optional)"
                            name="address_line2"
                            value={formData.address_line2 || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
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
                            label="Zip Code"
                            name="zip_code"
                            value={formData.zip_code}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-6 border-t mt-8">
                <Button variant="ghost" onClick={onBack} type="button">
                    <ArrowLeft size={16} className="mr-2" /> Back
                </Button>
                <Button
                    variant="primary"
                    onClick={() => {
                        if (!isValid) {
                            const missing = [];
                            if (!formData.business_name) missing.push("Business Name");
                            if (!formData.description) missing.push("Description");
                            if (!formData.phone) missing.push("Phone");
                            if (!formData.email) missing.push("Email");
                            if (!formData.address_line1) missing.push("Address Line 1");
                            if (!formData.city) missing.push("City");
                            if (!formData.state) missing.push("State");
                            if (!formData.zip_code) missing.push("Zip Code");
                            alert(`Please fill in the following required fields: ${missing.join(', ')}`);
                            // Or use toast if available, but alert is safe here as prop isn't passed yet.
                            // Actually toast is used in parent. 
                            return;
                        }
                        console.log("Next Clicked", formData);
                        onNext();
                    }}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : <>Next: Service Details <ArrowRight size={16} className="ml-2" /></>}
                </Button>
            </div>
        </div>
    );
};

export default BasicInfoStep;
