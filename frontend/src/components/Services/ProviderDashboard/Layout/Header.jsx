import React from 'react';
import { Bell, Menu, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuth from '../../../../hooks/useAuth';

const Header = ({ onMenuClick, provider }) => {
    const { user } = useAuth();

    // Mock provider info if fields are missing for better visual
    const businessName = provider?.business_name || "City Paws Clinic";
    const businessType = provider?.service_type || "Veterinary";

    return (
        <header className="bg-white h-16 border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
            {/* Left: Menu Trigger (Mobile) */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-6">
                <Link to="/help" className="hidden sm:block text-sm font-medium text-gray-500 hover:text-brand-primary transition-colors">
                    Help Center
                </Link>

                <button className="relative p-2 text-gray-400 hover:text-brand-primary transition-colors">
                    <Bell size={20} />
                    {/* Notification dot */}
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-status-error rounded-full border border-white"></span>
                </button>

                <div className="h-8 w-px bg-gray-100 hidden sm:block"></div>

                {/* User Profile */}
                <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-900 leading-tight group-hover:text-brand-primary transition-colors">{businessName}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{businessType}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 group-hover:border-brand-primary transition-colors">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            // Use a placeholder that matches the 'City Paws' aesthetic if no image
                            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Profile" className="w-full h-full object-cover" />
                        )}
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-brand-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </header>
    );
};

export default Header;
