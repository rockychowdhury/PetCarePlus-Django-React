import React from 'react';
import {
    LayoutDashboard,
    Calendar,
    CalendarDays,
    CalendarOff,
    User,
    Star,
    TrendingUp,
    LogOut
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../../../hooks/useAuth';
import Logo from '../../../common/Logo';

const Sidebar = ({ isMobileOpen, setIsMobileOpen, provider }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/provider/calendar', label: 'Calendar', icon: CalendarDays },
        { path: '/provider/availability', label: 'Availability', icon: CalendarOff },
        { path: '/provider/bookings', label: 'Bookings', icon: Calendar, badge: 3 }, // TODO: Dynamic badge
        { path: '/provider/profile', label: 'My Profile', icon: User },
        { path: '/provider/reviews', label: 'Reviews', icon: Star },
        { path: '/provider/analytics', label: 'Analytics', icon: TrendingUp },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const businessName = provider?.business_name || user?.first_name || 'User';
    const firstInitial = businessName.charAt(0).toUpperCase();

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 bottom-0 z-40 w-72 bg-white border-r border-gray-100
                transform transition-transform duration-300 ease-in-out lg:transform-none lg:relative
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col
            `}>
                {/* Logo Area */}
                <div className="px-8 py-8 lg:py-10">
                    <Logo />
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 1024 && setIsMobileOpen(false)}
                                className={({ isActive }) => `
                                    w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-as font-medium transition-all duration-200
                                    ${isActive
                                        ? 'bg-brand-primary/10 text-brand-primary'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3.5">
                                    <Icon size={22} className="opacity-80" />
                                    {item.label}
                                </div>
                                {item.badge && (
                                    <span className="bg-gray-800 text-white text-[10px] font-bold min-w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer Section */}
                <div className="p-6 mt-auto space-y-6">
                    {/* Log Out Link */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-brand-primary font-bold text-base hover:opacity-80 transition-opacity"
                    >
                        <LogOut size={20} />
                        Log Out
                    </button>

                    {/* User Profile Card */}
                    <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
                            {firstInitial}
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-[10px] font-black text-brand-primary/60 uppercase tracking-wider mb-0.5">LOGGED IN AS</div>
                            <div className="font-bold text-gray-900 text-base truncate">
                                {businessName}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
