import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { LayoutDashboard, CalendarDays, CalendarOff, Calendar, Star, TrendingUp, Settings as SettingsIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const DashboardLayout = ({ children, provider }) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();

    const menuItems = [
        { path: '/provider/dashboard', label: 'Dash', icon: LayoutDashboard },
        { path: '/provider/calendar', label: 'Cal', icon: CalendarDays },
        { path: '/provider/availability', label: 'Free', icon: CalendarOff },
        { path: '/provider/bookings', label: 'Book', icon: Calendar },
        { path: '/provider/reviews', label: 'Star', icon: Star },
        { path: '/provider/analytics', label: 'Grow', icon: TrendingUp },
    ];

    const isActive = (path) => {
        if (path === '/provider/dashboard' && location.pathname === '/provider/dashboard') return true;
        if (path !== '/provider/dashboard' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="min-h-screen bg-[#FEF9ED] flex font-sans text-[#5A3C0B]">
            {/* Sidebar */}
            <Sidebar
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
                provider={provider}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 md:ml-72 relative overflow-hidden">
                {/* Decorative background blur */}
                <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#C48B28]/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-[#EBC176]/10 rounded-full blur-[100px]" />
                </div>

                {/* Mobile Header Toggle */}
                <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-xl border-b border-[#EBC176]/20 relative z-30">
                    <Link to="/">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#C48B28] flex items-center justify-center text-white text-[10px] font-black">P</div>
                            <span className="font-black text-sm tracking-tighter text-[#402E11]">Business</span>
                        </div>
                    </Link>
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 text-[#C48B28] hover:bg-[#C48B28]/10 rounded-xl transition-all"
                    >
                        <LayoutDashboard size={24} />
                    </button>
                </div>

                <main className="flex-1 overflow-y-auto relative z-10 w-full mb-20 md:mb-0 px-4 md:px-8 lg:px-12 py-8 md:py-12">
                    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-1 left-4 right-4 bg-white/80 backdrop-blur-xl border border-[#EBC176]/20 flex justify-around py-3 z-50 rounded-2xl shadow-2xl shadow-[#402E11]/10">
                {menuItems.slice(0, 5).map((link) => {
                    const active = isActive(link.path);
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all duration-300 ${active ? 'text-[#C48B28] scale-110' : 'text-[#5A3C0B]/40'
                                }`}
                        >
                            <link.icon size={20} strokeWidth={active ? 2.5 : 2} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default DashboardLayout;
