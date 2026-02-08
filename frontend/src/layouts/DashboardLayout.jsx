import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    PawPrint,
    FileText,
    Settings as SettingsIcon,
    LogOut,
    User,
    MessageSquare,
    Star,
    FolderOpen,
    Home,
    CalendarDays,
    Menu,
    X,
    MoreHorizontal
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Logo from '../components/common/Logo';

import useAPI from '../hooks/useAPI';
import { useQuery } from '@tanstack/react-query';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }; // Fallback if useAPI doesn't handle it, but useAPI usually does. 
    // Actually relying on useAPI is safer.
    const api = useAPI();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    // Fetch Dashboard Stats for Sidebar Counts
    const { data: stats } = useQuery({
        queryKey: ['dashboard-overview-stats'],
        queryFn: async () => {
            try {
                const res = await api.get('/analytics/user-overview/');
                return res.data;
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
                return null;
            }
        },
        enabled: !!user // Only fetch if user extends
    });

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => {
        if (path === '/dashboard' && location.pathname === '/dashboard') return true;
        if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
        return false;
    };

    // Sidebar navigation based on user role
    const getDashboardLinks = () => {
        const isProvider = user?.role === 'service_provider';

        if (isProvider) {
            return [
                { name: 'Dashboard', path: '/provider/dashboard', icon: LayoutDashboard },
                { name: 'My Pets', path: '/dashboard/my-pets', icon: PawPrint },
                { name: 'Settings', path: '/dashboard/profile/settings', icon: SettingsIcon },
            ];
        }

        // Services Data
        const upcomingBookings = stats?.services?.stats?.upcoming_bookings_count || 0;
        const pendingReviews = stats?.services?.stats?.pending_reviews || 0;

        // Rehoming Data
        const activePets = stats?.rehoming?.stats?.my_pets_count || 0;
        const activeListings = stats?.rehoming?.stats?.active_listings_count || 0;
        const appsReceived = stats?.rehoming?.stats?.apps_received_count || 0;
        const appsSent = stats?.rehoming?.stats?.apps_submitted_count || 0;

        return [
            { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            {
                name: 'Service Bookings',
                path: '/dashboard/bookings',
                icon: CalendarDays,
                count: upcomingBookings > 0 ? upcomingBookings : null,
                countLabel: 'Upcoming'
            },
            {
                name: 'My Pets',
                path: '/dashboard/my-pets',
                icon: PawPrint,
                count: activePets > 0 ? activePets : null,
                countLabel: 'Active'
            },
            {
                name: 'My Listings',
                path: '/dashboard/rehoming',
                icon: FileText,
                count: activeListings > 0 ? activeListings : null,
                countLabel: 'Active'
            },
            {
                name: 'Applications',
                path: '/dashboard/applications',
                icon: FolderOpen,
                count: `${appsReceived} / ${appsSent}`,
                countLabel: 'R / S',
                isDual: true
            },
            {
                name: 'Reviews',
                path: '/dashboard/reviews',
                icon: Star,
                count: pendingReviews > 0 ? pendingReviews : null,
                countLabel: 'Pending'
            },
            { name: 'Settings', path: '/dashboard/profile/settings', icon: SettingsIcon },
        ];
    };

    const dashboardLinks = getDashboardLinks();

    return (
        <div className="min-h-screen bg-[#FEF9ED] flex font-sans text-[#5A3C0B]">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-[#EBC176]/20 hidden md:flex flex-col fixed h-full z-20 shadow-[4px_0_24px_-12px_rgba(196,139,40,0.1)]">
                {/* Project Header */}
                <div className="px-6 pt-8 pb-6">
                    <Link to="/" className="block">
                        <Logo className="scale-90 origin-left" />
                    </Link>
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar py-4">
                    {dashboardLinks.map((link) => {
                        const active = isActive(link.path);
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-[1.1rem] text-[13px] font-bold transition-all duration-300 relative group ${active
                                    ? 'bg-[#C48B28] text-white shadow-sm shadow-[#C48B28]/20 translate-x-1'
                                    : 'text-[#5A3C0B]/70 hover:bg-[#FEF9ED] hover:text-[#C48B28]'
                                    }`}
                            >
                                <link.icon
                                    size={18}
                                    strokeWidth={active ? 2.5 : 2}
                                    className={`transition-colors duration-300 ${active ? 'text-white' : 'text-[#C48B28]/70 group-hover:text-[#C48B28]'}`}
                                />
                                {link.name}

                                {/* Badge/Count */}
                                {link.count && (
                                    <div className={`ml-auto flex items-center justify-center px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider ${active
                                        ? 'bg-white/20 text-white'
                                        : 'bg-[#C48B28]/10 text-[#C48B28]'
                                        }`}>
                                        {link.count}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-[1.1rem] text-[#5A3C0B]/50 font-bold text-[13px] hover:bg-red-50 hover:text-red-500 transition-all duration-300 group border border-transparent hover:border-red-100"
                    >
                        <LogOut size={18} strokeWidth={2} className="group-hover:stroke-red-500 transition-colors" />
                        <span className="tracking-wide">Log Out</span>
                    </button>

                    <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-[#FAF3E0]/60 rounded-xl border border-[#EBC176]/20">
                        <div className="w-8 h-8 rounded-full bg-[#C48B28] flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                            {user?.first_name?.[0] || 'U'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-[#5A3C0B]/40 uppercase tracking-wider">Logged in as</span>
                            <span className="text-xs font-black text-[#5A3C0B]">{user?.first_name}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.aside
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="md:hidden fixed inset-y-0 left-0 w-[280px] bg-white z-[50] flex flex-col shadow-2xl border-r border-[#EBC176]/10"
                    >
                        <div className="px-6 pt-8 pb-6 flex justify-between items-center">
                            <Logo className="scale-75 origin-left" />
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#C48B28]">
                                <X size={20} />
                            </button>
                        </div>
                        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-4 shadow-inner bg-[#FEF9ED]/10">
                            {dashboardLinks.map((link) => {
                                const active = isActive(link.path);
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[13px] font-black transition-all group ${active
                                            ? 'bg-[#C48B28] text-white shadow-lg shadow-[#C48B28]/20'
                                            : 'text-[#5A3C0B]/60 hover:bg-[#FEF9ED] hover:text-[#C48B28]'
                                            }`}
                                    >
                                        <link.icon size={18} strokeWidth={active ? 2.5 : 2} />
                                        {link.name}
                                        {link.count && (
                                            <div className={`ml-auto flex items-center justify-center px-2 py-0.5 rounded-full text-[9px] font-black ${active ? 'bg-white/20 text-white' : 'bg-[#C48B28]/10 text-[#C48B28]'}`}>
                                                {link.count}
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="p-6 border-t border-[#EBC176]/10 space-y-4">
                            <button
                                onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-red-500/60 font-black text-[13px] hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                            >
                                <LogOut size={18} strokeWidth={2} />
                                Logout
                            </button>
                            <div className="flex items-center gap-3 px-4 py-3 bg-[#FEF9ED]/50 rounded-2xl border border-[#EBC176]/10">
                                <div className="w-8 h-8 rounded-full bg-[#C48B28] flex items-center justify-center text-white text-[10px] font-black">
                                    {user?.first_name?.[0]}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-[#5A3C0B]/30 uppercase tracking-widest">Logged in</span>
                                    <span className="text-xs font-black text-[#5A3C0B]">{user?.first_name}</span>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-72 lg:ml-80 bg-[#FEF9ED] min-h-screen relative pt-0">
                {/* Decorative background blur */}
                <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-[-10%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#C48B28]/5 rounded-full blur-[80px] md:blur-[120px]" />
                    <div className="absolute bottom-[-5%] left-[10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#EBC176]/10 rounded-full blur-[60px] md:blur-[100px]" />
                </div>
                <div className="relative z-10 w-full max-w-[1600px] mx-auto overflow-x-hidden pb-24 md:pb-0">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Navigation - Sticky & Premium Feel */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-[#EBC176]/10 flex justify-around py-3 pb-safe z-30 shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.08)]">
                {dashboardLinks.slice(0, 4).map((link) => {
                    const active = isActive(link.path);
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${active ? 'text-[#C48B28] scale-110' : 'text-[#5A3C0B]/40'}`}
                        >
                            <link.icon size={20} strokeWidth={active ? 2.5 : 2} className={active ? 'drop-shadow-[0_0_8px_rgba(196,139,40,0.3)]' : ''} />
                            <span className="text-[9px] font-black uppercase tracking-widest">{link.name.split(' ')[0]}</span>
                        </Link>
                    );
                })}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isMobileMenuOpen ? 'text-[#C48B28] scale-110' : 'text-[#5A3C0B]/40'}`}
                >
                    <MoreHorizontal size={20} strokeWidth={isMobileMenuOpen ? 2.5 : 2} />
                    <span className="text-[9px] font-black uppercase tracking-widest">More</span>
                </button>
            </nav>
        </div>
    );
};

export default DashboardLayout;
