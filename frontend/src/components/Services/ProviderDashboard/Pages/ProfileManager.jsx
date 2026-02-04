import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, ClipboardList, Clock, Image as ImageIcon, ExternalLink, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../../../components/common/Buttons/Button';
import useServices from '../../../../hooks/useServices';
import ServiceSpecificForm from '../ServiceSpecificForm';
import BusinessHoursEditor from '../BusinessHoursEditor';
import MediaGalleryEditor from '../MediaGalleryEditor';

const ProfileManager = () => {
    const { provider } = useOutletContext();
    const [activeTab, setActiveTab] = useState('basic');
    const { useUpdateProviderProfile, useUpdateProviderHours, useUpdateProviderMedia, useGetCategories } = useServices();

    // Mutations & Queries
    const updateProfile = useUpdateProviderProfile();
    const updateHours = useUpdateProviderHours();
    const updateMedia = useUpdateProviderMedia();
    const { data: categories } = useGetCategories();

    // Basic Info State
    const [basicInfo, setBasicInfo] = useState({
        business_name: provider.business_name || '',
        business_type: provider.category?.slug || '',
        description: provider.description || '',
        phone: provider.phone || '',
        website: provider.website || '',
        city: provider.address?.city || '',
        state: provider.address?.state || '',
        zip_code: provider.address?.zip || '',
        address_line1: provider.address?.line1 || '', // Changed from address to address_line1 for clarity and matching backend expectation if flattened
    });

    const handleBasicInfoChange = (e) => {
        const { name, value } = e.target;
        setBasicInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveBasic = () => {
        // Prepare payload - address fields need to be at root for serializer as per previous analysis? 
        // Serializer extra_kwargs showed them as write_only at root.
        // So we send { business_name, city, state, ... }

        // Map address_line1 back to key backend expects. 
        // If backend expects 'address_line1', we used that in state key so it's fine.
        // Wait, previous state had 'address', but serializer has 'address_line1'.
        // Let's ensure we send correct keys.

        const payload = {
            ...basicInfo,
            // If we used address_line1 in state, it passes through.
        };

        updateProfile.mutate(
            { id: provider.id, data: payload },
            {
                onSuccess: () => toast.success("Profile updated successfully!"),
                onError: (error) => {
                    const message = error.response?.data?.detail || error.response?.data?.message || "Failed to update profile.";
                    toast.error(message);
                    console.error("Profile update error:", error);
                }
            }
        );
    };

    // ... handlers for other tabs (kept similar or placeholders)
    const handleSaveServiceDetails = (data) => {
        updateProfile.mutate({ id: provider.id, data }, {
            onSuccess: () => toast.success("Service details updated!"),
            onError: (error) => {
                const message = error.response?.data?.detail || error.response?.data?.message || "Failed to update service details.";
                toast.error(message);
                console.error("Service details update error:", error);
            }
        });
    };

    const handleSaveHours = (hoursData) => {
        updateHours.mutate({ id: provider.id, data: hoursData }, {
            onSuccess: () => toast.success("Business hours updated!"),
            onError: (error) => {
                const message = error.response?.data?.detail || error.response?.data?.message || "Failed to update hours.";
                toast.error(message);
                console.error("Hours update error:", error);
            }
        });
    };

    const handleSaveMedia = (mediaData) => {
        updateMedia.mutate({ id: provider.id, data: mediaData }, {
            onSuccess: () => toast.success("Media gallery updated!"),
            onError: (error) => {
                const message = error.response?.data?.detail || error.response?.data?.message || "Failed to update media.";
                toast.error(message);
                console.error("Media update error:", error);
            }
        });
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info' },
        { id: 'service', label: 'Service Details' },
        { id: 'media', label: 'Media' },
        { id: 'hours', label: 'Business Hours' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <Button variant="outline" className="flex items-center gap-2 text-gray-700 border-gray-200 hover:bg-gray-50 bg-white">
                    <ExternalLink size={16} />
                    View Public Profile
                </Button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-all
                                ${activeTab === tab.id
                                    ? 'border-teal-500 text-teal-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {activeTab === 'basic' && (
                    <div className="animate-in fade-in duration-300 space-y-6">
                        {/* Business Information Card */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Business Information</h3>
                            <p className="text-sm text-gray-500 mb-6">General details about your service visible to clients.</p>

                            <div className="space-y-6">
                                {/* Business Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Name</label>
                                    <input
                                        name="business_name"
                                        value={basicInfo.business_name}
                                        onChange={handleBasicInfoChange}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                        placeholder="e.g. City Paws Clinic"
                                    />
                                </div>

                                {/* Category & Website */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                                        <select
                                            name="business_type" // Or category depending on backend
                                            value={basicInfo.business_type}
                                            onChange={handleBasicInfoChange}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                        >
                                            <option value="">Select Category</option>
                                            {categories?.results?.map(cat => (
                                                <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Website</label>
                                        <input
                                            name="website"
                                            value={basicInfo.website}
                                            onChange={handleBasicInfoChange}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                            placeholder="https://"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                                    <div className="relative">
                                        <div className="absolute top-2 left-2 flex gap-2 p-1 bg-gray-100 rounded opacity-50 pointer-events-none">
                                            {/* Fake Toolbar for visual match */}
                                            <span className="w-4 h-4 bg-gray-400 rounded-sm"></span>
                                            <span className="w-4 h-4 bg-gray-400 rounded-sm"></span>
                                            <span className="w-4 h-4 bg-gray-400 rounded-sm"></span>
                                        </div>
                                        <textarea
                                            name="description"
                                            value={basicInfo.description}
                                            onChange={handleBasicInfoChange}
                                            className="w-full p-4 pt-10 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all min-h-[160px]"
                                            placeholder="Describe your services..."
                                        />
                                        <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                                            {basicInfo.description.length} / 500 characters min
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact & Location Card */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Contact & Location</h3>
                            <p className="text-sm text-gray-500 mb-6">How clients can reach you and find your location.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                                    <input
                                        name="phone"
                                        value={basicInfo.phone}
                                        onChange={handleBasicInfoChange}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-3">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
                                        <input
                                            name="address_line1"
                                            value={basicInfo.address_line1}
                                            onChange={handleBasicInfoChange}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                            placeholder="Street address"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                                        <input
                                            name="city"
                                            value={basicInfo.city}
                                            onChange={handleBasicInfoChange}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                                        <input
                                            name="state"
                                            value={basicInfo.state}
                                            onChange={handleBasicInfoChange}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Zip Code</label>
                                        <input
                                            name="zip_code"
                                            value={basicInfo.zip_code}
                                            onChange={handleBasicInfoChange}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                                onClick={handleSaveBasic}
                                disabled={updateProfile.isPending}
                            >
                                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                )}

                {activeTab === 'service' && (
                    <div className="animate-in fade-in duration-300">
                        <ServiceSpecificForm
                            provider={provider}
                            onSave={handleSaveServiceDetails}
                            isLoading={updateProfile.isPending}
                        />
                    </div>
                )}

                {activeTab === 'media' && (
                    <div className="animate-in fade-in duration-300">
                        <MediaGalleryEditor
                            customMedia={provider.media}
                            onSave={handleSaveMedia}
                            isLoading={updateMedia.isPending}
                        />
                    </div>
                )}

                {activeTab === 'hours' && (
                    <div className="max-w-3xl animate-in fade-in duration-300">
                        <BusinessHoursEditor
                            initialHours={provider.hours}
                            onSave={handleSaveHours}
                            isLoading={updateHours.isPending}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileManager;
