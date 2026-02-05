import React from 'react';
import {
    LayoutDashboard,
    Users,
    Shield,
    List,
    Calendar,
    Flag,
    AlertTriangle,
    BarChart2,
    Settings as SettingsIcon,
    LogOut,
    UserCog
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Logo from '../common/Logo';

const AdminSidebar = ({ isMobileOpen, setIsMobileOpen }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/role-requests', label: 'Role Requests', icon: UserCog },
        { path: '/admin/listings', label: 'Rehoming Listings', icon: List },
        { path: '/admin/providers', label: 'Providers', icon: Shield },
        { path: '/admin/bookings', label: 'Bookings', icon: Calendar },
        { path: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
        { path: '/admin/reports', label: 'Reports', icon: Flag },
        { path: '/admin/moderation', label: 'Moderation', icon: AlertTriangle },
        { path: '/admin/settings', label: 'Settings', icon: SettingsIcon },
    ];

    const isActive = (path, end) => {
        if (end) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const userName = user?.first_name || user?.username || 'Admin';
    const firstInitial = userName.charAt(0).toUpperCase();

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
                fixed top-0 left-0 bottom-0 z-40 w-72 bg-white border-r border-cyan-100/40
                transform transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col h-screen shadow-[4px_0_24px_-12px_rgba(13,116,144,0.1)]
            `}>
                {/* Logo Area */}
                <div className="px-6 pt-8 pb-6 text-center">
                    <Link to="/" className="block">
                        <Logo className="scale-90 origin-left" />
                    </Link>

                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar py-4">
                    {menuItems.map((item) => {
                        const active = isActive(item.path, item.end);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 1024 && setIsMobileOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-[1.1rem] text-[13px] font-bold transition-all duration-300 relative group ${active
                                    ? 'bg-cyan-700 text-white shadow-sm shadow-cyan-700/20 translate-x-1'
                                    : 'text-sky-900/70 hover:bg-sky-50 hover:text-cyan-700'
                                    }`}
                            >
                                <Icon
                                    size={18}
                                    strokeWidth={active ? 2.5 : 2}
                                    className={`transition-colors duration-300 ${active ? 'text-white' : 'text-cyan-600/70 group-hover:text-cyan-700'
                                        }`}
                                />
                                {item.label}

                                {item.badge && (
                                    <div className={`ml-auto flex items-center justify-center px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider ${active
                                        ? 'bg-white/20 text-white'
                                        : 'bg-cyan-700/10 text-cyan-700'
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
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-[1.1rem] text-sky-900/50 font-bold text-[13px] hover:bg-red-50 hover:text-red-500 transition-all duration-300 group border border-transparent hover:border-red-100"
                    >
                        <LogOut size={18} strokeWidth={2} className="group-hover:stroke-red-500 transition-colors" />
                        <span className="tracking-wide">Log Out</span>
                    </button>

                    {/* User Profile Card */}
                    <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-sky-50/80 rounded-xl border border-cyan-100/40">
                        <div className="w-8 h-8 rounded-full bg-cyan-700 flex items-center justify-center text-white text-[10px] font-black shadow-sm shrink-0">
                            {firstInitial}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-bold text-sky-900/40 uppercase tracking-wider">Admin Portal</span>
                            <span className="text-xs font-black text-sky-900 truncate">{userName}</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
