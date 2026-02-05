import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, List, Flag, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../AdminSidebar';

const AdminLayout = () => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F0F7FF] flex font-sans text-[#0C4A6E] 
            [--logo-primary:#0e7490] [--logo-secondary:#0891b2] [--logo-bg:#ecfeff] [--logo-text:#083344]
            [--color-border:#bae6fd] [--color-border-focus:#0891b2] [--color-bg-secondary:#f0f9ff]
            [--color-brand-primary:#0e7490] [--color-brand-secondary:#0891b2] [--color-brand-accent:#ecfeff]">
            {/* Sidebar */}
            <AdminSidebar
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 md:ml-72 relative overflow-hidden">
                {/* Decorative background blur */}
                <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-sky-400/10 rounded-full blur-[100px]" />
                </div>

                {/* Mobile Header Toggle */}
                <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-xl border-b border-cyan-100/20 relative z-30">
                    <Link to="/">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-cyan-700 flex items-center justify-center text-white text-[10px] font-black">A</div>
                            <span className="font-black text-sm tracking-tighter text-sky-900">Admin</span>
                        </div>
                    </Link>
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 text-cyan-700 hover:bg-cyan-700/10 rounded-xl transition-all"
                    >
                        <LayoutDashboard size={24} />
                    </button>
                </div>

                <main className="flex-1 overflow-y-auto relative z-10 w-full mb-20 md:mb-0 px-4 md:px-8 lg:px-12 py-8 md:py-12">
                    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Outlet />
                    </div>
                </main>
            </div>

            <nav className="md:hidden fixed bottom-1 left-4 right-4 bg-white/80 backdrop-blur-xl border border-cyan-100/20 flex justify-around py-3 z-50 rounded-2xl shadow-2xl shadow-sky-900/10">
                {[
                    { path: '/admin', label: 'Dash', icon: LayoutDashboard },
                    { path: '/admin/users', label: 'Users', icon: Users },
                    { path: '/admin/listings', label: 'Lists', icon: List },
                    { path: '/admin/reports', label: 'Reports', icon: Flag },
                    { path: '/admin/settings', label: 'Settings', icon: Settings },
                ].map((link) => {
                    const Icon = link.icon;
                    const isActive = window.location.pathname === link.path ||
                        (link.path !== '/admin' && window.location.pathname.startsWith(link.path));
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all duration-300 ${isActive ? 'text-cyan-700 scale-110' : 'text-sky-900/40'
                                }`}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default AdminLayout;
