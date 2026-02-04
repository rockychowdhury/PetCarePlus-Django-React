import React from 'react';
import {
    LayoutDashboard,
    Calendar,
    CalendarDays,
    CalendarOff,
    User,
    Star,
    TrendingUp,
    LogOut,
    Home,
    Settings as SettingsIcon,
    DollarSign
} from 'lucide-react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import useAuth from '../../../../hooks/useAuth';
import Logo from '../../../common/Logo';

const Sidebar = ({ isMobileOpen, setIsMobileOpen, provider }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Updated Order: Dashboard, Bookings, Calendar, Availability -> Settings, Reviews, Analytics, Settings
    const menuItems = [
        { path: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/provider/bookings', label: 'Bookings', icon: Calendar },
        { path: '/provider/calendar', label: 'Calendar', icon: CalendarDays },
        { path: '/provider/reviews', label: 'Reviews', icon: Star },
        { path: '/provider/analytics', label: 'Analytics', icon: TrendingUp },
        { path: '/provider/settings', label: 'Settings', icon: SettingsIcon },
    ];

    const isActive = (path) => {
        if (path === '/provider/dashboard' && location.pathname === '/provider/dashboard') return true;
        if (path !== '/provider/dashboard' && location.pathname.startsWith(path)) return true;
        return false;
    };

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
                fixed top-0 left-0 bottom-0 z-40 w-72 bg-white border-r border-[#EBC176]/20
                transform transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col h-screen shadow-[4px_0_24px_-12px_rgba(196,139,40,0.1)]
            `}>
                {/* Logo Area */}
                <div className="px-6 pt-8 pb-6 text-center">
                    <Link to="/" className="block">
                        <Logo className="scale-90 origin-left" />
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar py-4">
                    {/* Back to Home Link REMOVED */}

                    {menuItems.map((item) => {
                        const active = isActive(item.path);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 1024 && setIsMobileOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-[1.1rem] text-[13px] font-bold transition-all duration-300 relative group ${active
                                    ? 'bg-[#C48B28] text-white shadow-sm shadow-[#C48B28]/20 translate-x-1'
                                    : 'text-[#5A3C0B]/70 hover:bg-[#FEF9ED] hover:text-[#C48B28]'
                                    }`}
                            >
                                <Icon
                                    size={18}
                                    strokeWidth={active ? 2.5 : 2}
                                    className={`transition-colors duration-300 ${active ? 'text-white' : 'text-[#C48B28]/70 group-hover:text-[#C48B28]'}`}
                                />
                                {item.label}

                                {item.badge && (
                                    <div className={`ml-auto flex items-center justify-center px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider ${active
                                        ? 'bg-white/20 text-white'
                                        : 'bg-[#C48B28]/10 text-[#C48B28]'
                                        }`}>
                                        {item.badge}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Section */}
                <div className="p-4 mt-auto">
                    {/* Log Out Link */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-[1.1rem] text-[#5A3C0B]/50 font-bold text-[13px] hover:bg-red-50 hover:text-red-500 transition-all duration-300 group border border-transparent hover:border-red-100"
                    >
                        <LogOut size={18} strokeWidth={2} className="group-hover:stroke-red-500 transition-colors" />
                        <span className="tracking-wide">Log Out</span>
                    </button>

                    {/* User Profile Card */}
                    <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-[#FAF3E0]/60 rounded-xl border border-[#EBC176]/20">
                        <div className="w-8 h-8 rounded-full bg-[#C48B28] flex items-center justify-center text-white text-[10px] font-black shadow-sm shrink-0">
                            {firstInitial}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-bold text-[#5A3C0B]/40 uppercase tracking-wider">Business Portal</span>
                            <span className="text-xs font-black text-[#5A3C0B] truncate">{businessName}</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
