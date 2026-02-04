import React from 'react';
import { Loader } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import useServices from '../../hooks/useServices';
import useAuth from '../../hooks/useAuth';

// Components
import DashboardLayout from '../../components/Services/ProviderDashboard/Layout/DashboardLayout';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Buttons/Button';
import { User } from 'lucide-react';

const ProviderDashboardPage = () => {
    const { user } = useAuth();
    const { useGetMyProviderProfile } = useServices();

    // Data Fetching
    const { data: provider, isLoading: profileLoading } = useGetMyProviderProfile();

    // Loading State
    if (profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader className="animate-spin text-brand-primary" size={32} />
            </div>
        );
    }

    // Unregistered State
    if (!provider) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-3xl mx-auto px-4 py-24 text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User size={40} className="text-gray-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Become a Service Provider</h2>
                    <p className="text-gray-600 mb-8 text-lg max-w-lg mx-auto">
                        Complete your profile to start offering services like Pet Sitting, Grooming, Training, and Veterinary care.
                    </p>
                    <Link to="/service-provider/register">
                        <Button variant="primary" size="lg">Create Provider Profile</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout provider={provider}>
            <Outlet context={{ provider }} />
        </DashboardLayout>
    );
};

export default ProviderDashboardPage;
