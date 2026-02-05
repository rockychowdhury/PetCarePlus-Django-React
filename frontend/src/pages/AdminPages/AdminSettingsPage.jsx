import React, { useState } from 'react';
import { Save, Bell, Shield, Lock, Globe, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import Card from '../../components/common/Layout/Card';
import Button from '../../components/common/Buttons/Button';


// Mock Toggle if not exists
const Switch = ({ checked, onChange }) => (
    <div
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${checked ? 'bg-cyan-600' : 'bg-gray-200'}`}
    >
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
);

const AdminSettingsPage = () => {
    const [settings, setSettings] = useState({
        registrationsEnabled: true,
        maintenanceMode: false,
        emailNotifications: true,
        autoApproveListings: false,
        requireProviderVerification: true,
        platformFeePercentage: 10
    });

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        // Mock save
        setTimeout(() => toast.success("Settings updated successfully"), 500);
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-sky-900 tracking-tight">Platform <span className="text-cyan-700">Settings</span></h1>
                    <p className="text-sky-900/60 font-medium mt-1">Configure global platform behavior.</p>
                </div>
                <Button onClick={handleSave} className="shadow-lg shadow-cyan-900/20">
                    <Save size={18} className="mr-2" /> Save Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* General Settings */}
                <Card className="p-6 rounded-[2rem] border border-sky-100/50">
                    <h2 className="text-lg font-black text-sky-900 mb-6 flex items-center gap-2">
                        <Globe size={20} className="text-cyan-700" />
                        General
                    </h2>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-sky-50 last:border-0 last:pb-0">
                            <div>
                                <h3 className="text-sm font-bold text-sky-900">Allow New Registrations</h3>
                                <p className="text-xs text-sky-900/50">Temporarily disable new user signups.</p>
                            </div>
                            <Switch checked={settings.registrationsEnabled} onChange={v => handleChange('registrationsEnabled', v)} />
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-sky-50 last:border-0 last:pb-0">
                            <div>
                                <h3 className="text-sm font-bold text-sky-900">Maintenance Mode</h3>
                                <p className="text-xs text-sky-900/50">Show maintenance page to all non-admin users.</p>
                            </div>
                            <Switch checked={settings.maintenanceMode} onChange={v => handleChange('maintenanceMode', v)} />
                        </div>
                    </div>
                </Card>

                {/* Security & Verification */}
                <Card className="p-6 rounded-[2rem] border border-sky-100/50">
                    <h2 className="text-lg font-black text-sky-900 mb-6 flex items-center gap-2">
                        <Shield size={20} className="text-cyan-700" />
                        Security & Moderation
                    </h2>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-sky-50 last:border-0 last:pb-0">
                            <div>
                                <h3 className="text-sm font-bold text-sky-900">Require Provider Verification</h3>
                                <p className="text-xs text-sky-900/50">Providers must be verified before listing services.</p>
                            </div>
                            <Switch checked={settings.requireProviderVerification} onChange={v => handleChange('requireProviderVerification', v)} />
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-sky-50 last:border-0 last:pb-0">
                            <div>
                                <h3 className="text-sm font-bold text-sky-900">Auto-Approve Listings</h3>
                                <p className="text-xs text-sky-900/50">Skip manual review for trusted users (Not recommended).</p>
                            </div>
                            <Switch checked={settings.autoApproveListings} onChange={v => handleChange('autoApproveListings', v)} />
                        </div>
                    </div>
                </Card>

                {/* Notifications */}
                <Card className="p-6 rounded-[2rem] border border-sky-100/50">
                    <h2 className="text-lg font-black text-sky-900 mb-6 flex items-center gap-2">
                        <Mail size={20} className="text-cyan-700" />
                        Notifications
                    </h2>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-sky-50 last:border-0 last:pb-0">
                            <div>
                                <h3 className="text-sm font-bold text-sky-900">System Emails</h3>
                                <p className="text-xs text-sky-900/50">Send automated transactional emails.</p>
                            </div>
                            <Switch checked={settings.emailNotifications} onChange={v => handleChange('emailNotifications', v)} />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
