import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Save, Bell, Globe, Mail, MessageCircle, User,
    ClipboardList, Clock, Image as ImageIcon, ExternalLink,
    DollarSign, Settings as SettingsIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import useServices from '../../../../hooks/useServices';
import Card from '../../../../components/common/Layout/Card';
import Button from '../../../../components/common/Buttons/Button';
import ServiceSpecificForm from '../ServiceSpecificForm';
import BusinessHoursEditor from '../BusinessHoursEditor';
import MediaGalleryEditor from '../MediaGalleryEditor';
import AvailabilityManager from './AvailabilityManager';

const SettingsPage = () => {
    const { provider } = useOutletContext();
    const {
        useGetMyProviderProfile,
        useUpdateProviderSettings,
        useUpdateProviderProfile,
        useUpdateProviderHours,
        useUpdateProviderMedia,
        useGetCategories
    } = useServices();

    const { data: latestProvider, isLoading } = useGetMyProviderProfile();
    const currentProvider = latestProvider || provider;

    const [activeTab, setActiveTab] = useState('basic');

    // Mutations
    const updateSettingsMutation = useUpdateProviderSettings();
    const updateProfile = useUpdateProviderProfile();
    const updateHours = useUpdateProviderHours();
    const updateMedia = useUpdateProviderMedia();
    const { data: categories } = useGetCategories();

    // ----------------------------------------------------
    // STATE: Basic Info (Profile)
    // ----------------------------------------------------
    const [basicInfo, setBasicInfo] = useState({
        business_name: '',
        business_type: '',
        description: '',
        phone: '',
        website: '',
        city: '',
        state: '',
        zip_code: '',
        address_line1: '',
    });

    // ----------------------------------------------------
    // STATE: Account Settings (Preferences)
    // ----------------------------------------------------
    const [settings, setSettings] = useState({
        email_notifications: true,
        auto_reply: false,
        public_visibility: true,
        auto_accept_bookings: false
    });

    // Load initial data
    useEffect(() => {
        if (currentProvider) {
            // Load Basic Info
            setBasicInfo({
                business_name: currentProvider.business_name || '',
                business_type: currentProvider.category?.slug || '',
                description: currentProvider.description || '',
                phone: currentProvider.phone || '',
                website: currentProvider.website || '',
                city: currentProvider.address?.city || '',
                state: currentProvider.address?.state || '',
                zip_code: currentProvider.address?.zip || '',
                address_line1: currentProvider.address?.line1 || '',
            });

            // Load Settings
            if (currentProvider.settings) {
                setSettings(prev => ({ ...prev, ...currentProvider.settings }));
            }
        }
    }, [currentProvider]);

    // ----------------------------------------------------
    // HANDLERS: Basic Info
    // ----------------------------------------------------
    const handleBasicInfoChange = (e) => {
        const { name, value } = e.target;
        setBasicInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveBasic = () => {
        const payload = { ...basicInfo };
        updateProfile.mutate(
            { id: currentProvider.id, data: payload },
            {
                onSuccess: () => toast.success("Profile updated successfully!"),
                onError: (error) => toast.error("Failed to update profile.")
            }
        );
    };

    // ----------------------------------------------------
    // HANDLERS: Managers (Services, Hours, Media)
    // ----------------------------------------------------
    const handleSaveServiceDetails = (data) => {
        updateProfile.mutate({ id: currentProvider.id, data }, {
            onSuccess: () => toast.success("Service details updated!"),
            onError: () => toast.error("Failed to update service details.")
        });
    };

    const handleSaveHours = (hoursData) => {
        updateHours.mutate({ id: currentProvider.id, data: hoursData }, {
            onSuccess: () => toast.success("Business hours updated!"),
            onError: () => toast.error("Failed to update hours.")
        });
    };

    const handleSaveMedia = (mediaData) => {
        updateMedia.mutate({ id: currentProvider.id, data: mediaData }, {
            onSuccess: () => toast.success("Media gallery updated!"),
            onError: () => toast.error("Failed to update media.")
        });
    };

    // ----------------------------------------------------
    // HANDLERS: Account Settings
    // ----------------------------------------------------
    const handleToggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSaveSettings = async () => {
        try {
            await updateSettingsMutation.mutateAsync({
                id: currentProvider.id,
                data: settings
            });
            toast.success('Preferences saved successfully');
        } catch (error) {
            toast.error('Failed to save preferences');
        }
    };

    if (isLoading) return <div>Loading...</div>;

    // Tabs Configuration
    const tabs = [
        { id: 'basic', label: 'Profile', icon: User },
        { id: 'service', label: 'Services', icon: ClipboardList },
        { id: 'availability', label: 'Availability', icon: Clock },
        { id: 'media', label: 'Media', icon: ImageIcon },
        { id: 'account', label: 'Account', icon: SettingsIcon },
    ];

    const SettingToggle = ({ label, description, icon: Icon, value, onChange }) => (
        <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                    <Icon size={20} />
                </div>
                <div>
                    <h4 className="font-medium text-gray-900">{label}</h4>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </div>
            <button
                onClick={onChange}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${value ? 'bg-brand-primary' : 'bg-gray-200'}`}
            >
                <span className={`${value ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Provider Settings</h1>
                <Button variant="outline" className="flex items-center gap-2 text-gray-700 border-gray-200 hover:bg-gray-50 bg-white">
                    <ExternalLink size={16} />
                    View Public Page
                </Button>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-all
                                    ${activeTab === tab.id
                                        ? 'border-[#C48B28] text-[#C48B28]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                            >
                                <Icon size={16} className={activeTab === tab.id ? 'stroke-[2.5px]' : ''} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {/* 1. BASIC PROFILE */}
                {activeTab === 'basic' && (
                    <div className="animate-in fade-in duration-300 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Business Identity</h3>
                            <p className="text-sm text-gray-500 mb-6">General details visible to your clients.</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Name</label>
                                    <input
                                        name="business_name"
                                        value={basicInfo.business_name}
                                        onChange={handleBasicInfoChange}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#C48B28]/20 focus:border-[#C48B28] transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                                        <select
                                            name="business_type"
                                            value={basicInfo.business_type}
                                            onChange={handleBasicInfoChange}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#C48B28]/20 focus:border-[#C48B28] transition-all"
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
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#C48B28]/20 focus:border-[#C48B28] transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                                    <textarea
                                        name="description"
                                        value={basicInfo.description}
                                        onChange={handleBasicInfoChange}
                                        className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#C48B28]/20 focus:border-[#C48B28] transition-all min-h-[120px]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Contact & Location</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                                    <input
                                        name="phone"
                                        value={basicInfo.phone}
                                        onChange={handleBasicInfoChange}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-3">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
                                        <input
                                            name="address_line1"
                                            value={basicInfo.address_line1}
                                            onChange={handleBasicInfoChange}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <input name="city" value={basicInfo.city} onChange={handleBasicInfoChange} placeholder="City" className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg" />
                                    <input name="state" value={basicInfo.state} onChange={handleBasicInfoChange} placeholder="State" className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg" />
                                    <input name="zip_code" value={basicInfo.zip_code} onChange={handleBasicInfoChange} placeholder="ZIP" className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={handleSaveBasic}
                                disabled={updateProfile.isPending}
                                className="bg-[#C48B28] hover:bg-[#B37A1F] text-white"
                            >
                                {updateProfile.isPending ? 'Saving...' : 'Save Profile Changes'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* 2. SERVICES */}
                {activeTab === 'service' && (
                    <div className="animate-in fade-in duration-300">
                        <ServiceSpecificForm
                            provider={currentProvider}
                            onSave={handleSaveServiceDetails}
                            isLoading={updateProfile.isPending}
                        />
                    </div>
                )}

                {/* 3. AVAILABILITY (New Integration) */}
                {activeTab === 'availability' && (
                    <div className="animate-in fade-in duration-300">
                        <AvailabilityManager />
                    </div>
                )}

                {/* 4. MEDIA */}
                {activeTab === 'media' && (
                    <div className="animate-in fade-in duration-300">
                        <MediaGalleryEditor
                            customMedia={currentProvider.media}
                            onSave={handleSaveMedia}
                            isLoading={updateMedia.isPending}
                        />
                    </div>
                )}

                {/* 5. ACCOUNT (Preferences) */}
                {activeTab === 'account' && (
                    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Account Preferences</h3>
                                <p className="text-sm text-gray-500">Manage your notifications and privacy.</p>
                            </div>
                            <Button
                                onClick={handleSaveSettings}
                                disabled={updateSettingsMutation.isPending}
                                className="bg-[#402E11] text-white hover:bg-[#2A1E0B] shadow-lg shadow-[#402E11]/10"
                            >
                                <Save size={16} className="mr-2" />
                                {updateSettingsMutation.isPending ? 'Saving...' : 'Save Preferences'}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-6 bg-white border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-black text-[#402E11] uppercase tracking-wider mb-6 border-b border-gray-100 pb-2">Notifications</h3>
                                <div className="space-y-2">
                                    <SettingToggle
                                        label="Email Notifications"
                                        description="Receive email updates for new bookings and messages"
                                        icon={Mail}
                                        value={settings.email_notifications}
                                        onChange={() => handleToggleSetting('email_notifications')}
                                    />
                                    <SettingToggle
                                        label="Auto-Reply"
                                        description="Send an automatic response to new reviews"
                                        icon={MessageCircle}
                                        value={settings.auto_reply}
                                        onChange={() => handleToggleSetting('auto_reply')}
                                    />
                                </div>
                            </Card>

                            <Card className="p-6 bg-white border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-black text-[#402E11] uppercase tracking-wider mb-6 border-b border-gray-100 pb-2">Privacy & Visibility</h3>
                                <div className="space-y-2">
                                    <SettingToggle
                                        label="Public Visibility"
                                        description="Your profile is visible in search results"
                                        icon={Globe}
                                        value={settings.public_visibility}
                                        onChange={() => handleToggleSetting('public_visibility')}
                                    />
                                    <SettingToggle
                                        label="Auto-Accept Requests"
                                        description="Automatically confirm valid booking requests"
                                        icon={Bell}
                                        value={settings.auto_accept_bookings}
                                        onChange={() => handleToggleSetting('auto_accept_bookings')}
                                    />
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;
