import React, { useState } from 'react';
import { User, ClipboardList, Clock, Image as ImageIcon } from 'lucide-react';
import useServices from '../../../hooks/useServices';
import Button from '../../common/Buttons/Button';
import ServiceSpecificForm from './ServiceSpecificForm';
import BusinessHoursEditor from './BusinessHoursEditor';
import MediaGalleryEditor from './MediaGalleryEditor';
import { toast } from 'react-toastify';

const TABS = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'service', label: 'Service Details', icon: ClipboardList },
    { id: 'hours', label: 'Business Hours', icon: Clock },
    { id: 'media', label: 'Media Gallery', icon: ImageIcon },
];

const ProviderProfileEditor = ({ provider, onClose }) => {
    const [activeTab, setActiveTab] = useState('basic');
    const { useUpdateProviderProfile, useUpdateProviderHours, useUpdateProviderMedia } = useServices();

    // Mutations
    const updateProfile = useUpdateProviderProfile();
    const updateHours = useUpdateProviderHours();
    const updateMedia = useUpdateProviderMedia();

    // Basic Info State
    const [basicInfo, setBasicInfo] = useState({
        business_name: provider.business_name || '',
        description: provider.description || '',
        phone: provider.phone || '',
        website: provider.website || '',
        city: provider.city || '',
        state: provider.state || '',
        zip_code: provider.zip_code || '',
    });

    const handleBasicInfoChange = (e) => {
        const { name, value } = e.target;
        setBasicInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveBasic = () => {
        updateProfile.mutate(
            { id: provider.id, data: basicInfo },
            {
                onSuccess: () => toast.success("Basic info updated!"),
                onError: () => toast.error("Failed to update basic info.")
            }
        );
    };

    const handleSaveServiceDetails = (data) => {
        updateProfile.mutate(
            { id: provider.id, data },
            {
                onSuccess: () => toast.success("Service details updated!"),
                onError: () => toast.error("Failed to update service details.")
            }
        );
    };

    const handleSaveHours = (hoursData) => {
        updateHours.mutate(
            { id: provider.id, data: hoursData },
            {
                onSuccess: () => toast.success("Business hours updated!"),
                onError: () => toast.error("Failed to update hours.")
            }
        );
    };

    const handleSaveMedia = (mediaData) => {
        updateMedia.mutate(
            { id: provider.id, data: mediaData },
            {
                onSuccess: () => toast.success("Media gallery updated!"),
                onError: () => toast.error("Failed to update media.")
            }
        );
    };

    return (
        <div className="bg-[#FAF9F6] rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden flex flex-col md:flex-row min-h-[700px]">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-72 bg-[#FAF9F6] border-r border-[#EAE6E2] flex-shrink-0 flex flex-col">
                <div className="p-8 pb-4">
                    <h2 className="text-2xl font-black text-[#402E11] tracking-tight mb-1">Edit Profile</h2>
                    <p className="text-[10px] font-bold text-[#C48B28] uppercase tracking-[0.2em]">{provider.business_name}</p>
                </div>
                <nav className="px-4 space-y-2 flex-1 overflow-y-auto">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${isActive
                                        ? 'bg-white text-[#C48B28] shadow-lg shadow-[#402E11]/5 border border-[#EAE6E2] translate-x-2'
                                        : 'text-[#402E11]/40 hover:text-[#402E11] hover:bg-white/50'
                                    }`}
                            >
                                <Icon size={18} className={isActive ? 'text-[#C48B28]' : 'opacity-50'} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
                <div className="p-6 border-t border-[#EAE6E2]">
                    <Button
                        variant="outline"
                        className="w-full border-[#EAE6E2] text-[#402E11]/60 hover:text-[#402E11] hover:border-[#402E11] rounded-xl py-4"
                        onClick={onClose}
                    >
                        Exit Editor
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-white/50 relative">
                <div className="max-w-4xl mx-auto">
                    {activeTab === 'basic' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Card 1: Business Identity */}
                            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-[#402E11]/5 border border-[#EAE6E2]">
                                <div className="mb-6 flex items-center gap-3 pb-6 border-b border-[#FAF3E0]">
                                    <div className="p-3 bg-[#FAF3E0] rounded-xl">
                                        <User size={20} className="text-[#C48B28]" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-[#402E11]">Business Identity</h3>
                                        <p className="text-[10px] font-bold text-[#402E11]/40 uppercase tracking-widest">General details visible to your clients.</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-[0.1em] ml-2 mb-1 block">Business Name</label>
                                        <input
                                            name="business_name"
                                            value={basicInfo.business_name}
                                            onChange={handleBasicInfoChange}
                                            className="w-full pl-4 pr-4 py-3 bg-[#FAF9F6] border border-[#EBC176]/20 rounded-xl text-sm font-bold text-[#402E11] focus:ring-2 focus:ring-[#EBC176] focus:border-transparent outline-none transition-all placeholder:text-[#402E11]/20"
                                            placeholder="e.g. Happy Paws"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-[0.1em] ml-2 mb-1 block">Description</label>
                                        <textarea
                                            name="description"
                                            value={basicInfo.description}
                                            onChange={handleBasicInfoChange}
                                            className="w-full p-4 bg-[#FAF9F6] border border-[#EBC176]/20 rounded-xl text-sm font-medium text-[#402E11] focus:ring-2 focus:ring-[#EBC176] focus:border-transparent outline-none transition-all placeholder:text-[#402E11]/20 min-h-[120px] resize-none leading-relaxed"
                                            placeholder="Tell clients about your services..."
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-[0.1em] ml-2 mb-1 block">Website</label>
                                        <input
                                            name="website"
                                            value={basicInfo.website}
                                            onChange={handleBasicInfoChange}
                                            className="w-full pl-4 pr-4 py-3 bg-[#FAF9F6] border border-[#EBC176]/20 rounded-xl text-sm font-bold text-[#402E11] focus:ring-2 focus:ring-[#EBC176] focus:border-transparent outline-none transition-all placeholder:text-[#402E11]/20"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Contact & Location */}
                            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-[#402E11]/5 border border-[#EAE6E2]">
                                <div className="mb-6 flex items-center gap-3 pb-6 border-b border-[#FAF3E0]">
                                    <div className="p-3 bg-[#FAF3E0] rounded-xl">
                                        <Clock size={20} className="text-[#C48B28]" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-[#402E11]">Contact & Location</h3>
                                        <p className="text-[10px] font-bold text-[#402E11]/40 uppercase tracking-widest">How clients can reach you.</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-[0.1em] ml-2 mb-1 block">Phone</label>
                                        <input
                                            name="phone"
                                            value={basicInfo.phone}
                                            onChange={handleBasicInfoChange}
                                            className="w-full pl-4 pr-4 py-3 bg-[#FAF9F6] border border-[#EBC176]/20 rounded-xl text-sm font-bold text-[#402E11] focus:ring-2 focus:ring-[#EBC176] outline-none transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-3">
                                            <label className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-[0.1em] ml-2 mb-1 block">State / Region</label>
                                            <input
                                                name="state"
                                                value={basicInfo.state}
                                                onChange={handleBasicInfoChange}
                                                className="w-full pl-4 pr-4 py-3 bg-[#FAF9F6] border border-[#EBC176]/20 rounded-xl text-sm font-bold text-[#402E11] focus:ring-2 focus:ring-[#EBC176] outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-[0.1em] ml-2 mb-1 block">City</label>
                                            <input
                                                name="city"
                                                value={basicInfo.city}
                                                onChange={handleBasicInfoChange}
                                                className="w-full pl-4 pr-4 py-3 bg-[#FAF9F6] border border-[#EBC176]/20 rounded-xl text-sm font-bold text-[#402E11] focus:ring-2 focus:ring-[#EBC176] outline-none transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[9px] font-black text-[#402E11]/40 uppercase tracking-[0.1em] ml-2 mb-1 block">Zip Code</label>
                                            <input
                                                name="zip_code"
                                                value={basicInfo.zip_code}
                                                onChange={handleBasicInfoChange}
                                                className="w-full pl-4 pr-4 py-3 bg-[#FAF9F6] border border-[#EBC176]/20 rounded-xl text-sm font-bold text-[#402E11] focus:ring-2 focus:ring-[#EBC176] outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    onClick={handleSaveBasic}
                                    disabled={updateProfile.isPending}
                                    className="bg-[#402E11] text-white py-4 px-10 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'service' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <ServiceSpecificForm
                                provider={provider}
                                onSave={handleSaveServiceDetails}
                                isLoading={updateProfile.isPending}
                            />
                        </div>
                    )}

                    {activeTab === 'hours' && (
                        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <BusinessHoursEditor
                                initialHours={provider.hours}
                                onSave={handleSaveHours}
                                isLoading={updateHours.isPending}
                            />
                        </div>
                    )}

                    {activeTab === 'media' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <MediaGalleryEditor
                                customMedia={provider.media}
                                onSave={handleSaveMedia}
                                isLoading={updateMedia.isPending}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProviderProfileEditor;
