import React, { useState, useEffect } from 'react';
import { Save, Bell, Globe, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useServices from '../../../../hooks/useServices';
import Card from '../../../../components/common/Layout/Card';

const SettingsPage = () => {
    const { useGetMyProviderProfile, useUpdateProviderSettings } = useServices();
    const { data: provider, isLoading } = useGetMyProviderProfile();
    const updateSettingsMutation = useUpdateProviderSettings();

    const [settings, setSettings] = useState({
        email_notifications: true,
        auto_reply: false,
        public_visibility: true,
        auto_accept_bookings: false
    });

    useEffect(() => {
        if (provider?.settings) {
            setSettings(prev => ({ ...prev, ...provider.settings }));
        }
    }, [provider]);

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        if (!provider) return;

        try {
            await updateSettingsMutation.mutateAsync({
                id: provider.id,
                data: settings
            });
            toast.success('Settings saved successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save settings');
        }
    };

    if (isLoading) return <div>Loading...</div>;

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
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${value ? 'bg-brand-primary' : 'bg-gray-200'
                    }`}
            >
                <span
                    className={`${value ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <button
                    onClick={handleSave}
                    disabled={updateSettingsMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50"
                >
                    <Save size={18} />
                    {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <Card className="p-6 bg-white">
                <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Notifications & Communication</h3>
                <div className="space-y-2">
                    <SettingToggle
                        label="Email Notifications"
                        description="Receive email updates for new bookings and messages"
                        icon={Mail}
                        value={settings.email_notifications}
                        onChange={() => handleToggle('email_notifications')}
                    />
                    <SettingToggle
                        label="Auto-Reply"
                        description="Send an automatic response to new reviews"
                        icon={MessageCircle} // Wait, I need to import MessageCircle or define it
                        value={settings.auto_reply}
                        onChange={() => handleToggle('auto_reply')}
                    />
                </div>
            </Card>

            <Card className="p-6 bg-white">
                <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Privacy & Booking</h3>
                <div className="space-y-2">
                    <SettingToggle
                        label="Public Profile Visibility"
                        description="Your profile is visible in search results"
                        icon={Globe}
                        value={settings.public_visibility}
                        onChange={() => handleToggle('public_visibility')}
                    />
                    <SettingToggle
                        label="Auto-Accept Requests"
                        description="Automatically confirm booking requests (Risk of double booking)"
                        icon={Bell}
                        value={settings.auto_accept_bookings}
                        onChange={() => handleToggle('auto_accept_bookings')}
                    />
                </div>
            </Card>
        </div>
    );
};

// Forgot to import MessageCircle
import { MessageCircle } from 'lucide-react';

export default SettingsPage;
