
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { Menu, X, LayoutDashboard, User, Settings as SettingsIcon, LogOut, Calendar, ClipboardList, PawPrint, Grid3x3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import useServices from '../../hooks/useServices';
import Button from './Buttons/Button';
import IconButton from './Buttons/IconButton';
import Avatar from './Display/Avatar';
import AuthModal from '../Auth/AuthModal';
import NavLink from './Navigation/NavLink';
import MobileNavLink from './Navigation/MobileNavLink';
import DropdownLink from './Navigation/DropdownLink';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const dropdownRef = useRef(null);

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        if (isProfileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileOpen]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Auth Modal State
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');

    const { user, logout } = useAuth();
    const { useGetMyProviderProfile } = useServices();
    // Only fetch if user logged in and not already a provider (optimization)
    const { data: providerProfile } = useGetMyProviderProfile({
        enabled: !!user && (user.role === 'service_provider' || user.has_service_profile)
    });

    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const openAuth = (mode = 'login') => {
        setAuthMode(mode);
        setIsAuthModalOpen(true);
        setIsMenuOpen(false);
    };

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        if (path === '/pets' || path === '/services') return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <>
            <div className={`fixed left-1/2 -translate-x-1/2 w-full max-w-[1600px] z-[100] transition-all duration-500 pointer-events-none ${isScrolled ? 'top-0 px-0' : 'top-6 px-4 md:px-10'}`}>
                <nav className={`w-full relative border border-[#C48B28]/10 h-16 flex items-center px-8 rounded-full transition-all duration-500 pointer-events-auto ${isScrolled ? 'bg-white/95 shadow-lg shadow-[#402E11]/5' : 'bg-white/80'}`}>
                    <div className="flex justify-between items-center w-full">

                        {/* Logo (Left) */}
                        <div className="flex items-center pl-4 md:pl-6">
                            <Link to="/" className="shrink-0 flex items-center">
                                <Logo />
                            </Link>
                        </div>

                        {/* Nav Links (Centered - Desktop) */}
                        <div className="hidden md:flex items-center gap-1 bg-[#FEF9ED]/50 p-1.5 rounded-full border border-[#C48B28]/5 mx-4">
                            <NavLink to="/services" label="Services" active={isActive('/services')} />

                            {/* Show 'Find a Pet' only for Guests or Pet Owners (Not Providers/Admins) */}
                            {(!user || (user.role !== 'service_provider' && user.role !== 'admin')) && (
                                <NavLink to="/pets" label="Find a Pet" active={isActive('/pets')} />
                            )}

                            {/* Show 'Rehome' only for Pet Owners */}
                            {user && user.role !== 'service_provider' && user.role !== 'admin' && (
                                <NavLink to="/rehoming" label="Rehome" active={isActive('/rehoming')} />
                            )}

                            <NavLink to="/about" label="About" active={isActive('/about')} />
                        </div>

                        {/* Desktop Actions - Right */}
                        <div className="hidden md:flex items-center gap-2 pr-2">
                            {user ? (
                                /* Profile Dropdown */
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="relative flex items-center group focus:outline-none"
                                        aria-label="User Menu"
                                    >
                                        <div className="relative">
                                            <Avatar
                                                initials={user.first_name ? user.first_name[0] : 'U'}
                                                src={user.photoURL || user.profile_image}
                                                size="sm"
                                                className="border-2 border-[#C48B28] transition-all hover:scale-105"
                                            />
                                        </div>
                                    </button>

                                    {isProfileOpen && (
                                        <div className="absolute left-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-[#C48B28]/20 py-2 origin-top-left z-50 overflow-hidden animate-scale-up">
                                            {/* User Info Header */}
                                            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-[#FEF9ED]/30">
                                                <Avatar
                                                    initials={user.first_name ? user.first_name[0] : 'U'}
                                                    src={user.photoURL || user.profile_image}
                                                    size="md"
                                                    className="shrink-0 border-2 border-white"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold text-gray-900 tracking-tight truncate">{user.first_name} {user.last_name}</p>
                                                    <p className="text-[10px] font-medium text-gray-500 truncate">{user.email}</p>
                                                </div>
                                            </div>

                                            {/* Scrollable Content Area */}
                                            <div className="max-h-[60vh] overflow-y-auto py-1 custom-scrollbar">

                                                {/* Dashboard Quick Links */}
                                                <div className="mb-1">
                                                    <p className="px-4 py-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Dashboard</p>
                                                    {user.role === 'service_provider' ? (
                                                        <DropdownLink to="/provider/dashboard" icon={<Grid3x3 />} label="Overview" />
                                                    ) : (
                                                        <>
                                                            <DropdownLink to="/dashboard" icon={<Grid3x3 />} label="Overview" />
                                                            <DropdownLink to="/dashboard/bookings" icon={<Calendar />} label="My Bookings" />
                                                            <DropdownLink to="/dashboard/applications" icon={<ClipboardList />} label="Applications" />
                                                            <DropdownLink to="/dashboard/my-pets" icon={<PawPrint />} label="My Pets" />
                                                        </>
                                                    )}
                                                </div>

                                                <div className="h-px bg-gray-100 my-1 mx-4" />

                                                {/* Account Settings */}
                                                <div className="mb-1">
                                                    <p className="px-4 py-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Account</p>
                                                    <DropdownLink to={user.role === 'service_provider' ? "/provider/settings" : "/dashboard/profile/settings"} icon={<SettingsIcon />} label="Settings" />
                                                    {user.role === 'admin' && (
                                                        <DropdownLink to="/admin" icon={<SettingsIcon />} label="Admin Panel" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Footer Actions */}
                                            <div className="border-t border-gray-100 p-1.5 bg-gray-50">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-bold text-white bg-[#C48B28] hover:bg-[#A9761F] uppercase tracking-widest transition-all rounded-xl"
                                                >
                                                    <LogOut size={14} />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openAuth('login')}
                                        className="text-[10px] font-black text-themev2-text/60 hover:text-[#C48B28] uppercase tracking-[0.2em] px-5 py-2.5 transition-all hover:bg-white rounded-full"
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => openAuth('register')}
                                        className="px-6 py-3 bg-[#C48B28] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#C48B28]/20 hover:bg-[#B37A1D] hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center gap-2 pr-4">
                            <IconButton
                                icon={isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                                variant="ghost"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                label="Menu"
                                className="text-[#C48B28]"
                            />
                        </div>
                    </div>
                </nav>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="md:hidden fixed top-[88px] left-4 right-4 bg-white/95 backdrop-blur-xl border border-[#C48B28]/20 shadow-2xl z-[90] max-h-[calc(100vh-120px)] overflow-y-auto rounded-[2.5rem]"
                    >
                        <div className="p-6 flex flex-col gap-2">
                            {/* Main Navigation */}
                            <div className="space-y-1">
                                <MobileNavLink to="/services" label="Services" onClick={() => setIsMenuOpen(false)} active={isActive('/services')} />

                                {(!user || (user.role !== 'service_provider' && user.role !== 'admin')) && (
                                    <MobileNavLink to="/pets" label="Find a Pet" onClick={() => setIsMenuOpen(false)} active={isActive('/pets')} />
                                )}

                                {user && user.role !== 'service_provider' && user.role !== 'admin' && (
                                    <MobileNavLink to="/rehoming" label="Rehome" onClick={() => setIsMenuOpen(false)} active={isActive('/rehoming')} />
                                )}

                                <MobileNavLink to="/about" label="About" onClick={() => setIsMenuOpen(false)} active={isActive('/about')} />
                            </div>

                            {/* Mobile Menu Actions for Logged In Users */}
                            {user ? (
                                <div className="mt-4 pt-6 border-t border-gray-100 flex flex-col gap-6">
                                    {/* User Profil Card */}
                                    <div className="flex items-center gap-4 px-3 py-4 bg-[#FEF9ED]/50 rounded-[1.5rem] border border-[#C48B28]/5">
                                        <Avatar
                                            initials={user.first_name ? user.first_name[0] : 'U'}
                                            src={user.photoURL || user.profile_image}
                                            size="md"
                                            className="border-2 border-white shadow-sm"
                                        />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-base font-black text-gray-900 truncate tracking-tight">{user.first_name} {user.last_name}</span>
                                            <span className="text-xs font-bold text-gray-500 truncate lowercase">{user.email}</span>
                                        </div>
                                    </div>

                                    {/* Dashboard Links */}
                                    <div className="space-y-1">
                                        <p className="px-4 py-2 text-[10px] font-black text-[#C48B28] uppercase tracking-[0.2em]">Dashboard</p>
                                        {user.role === 'service_provider' ? (
                                            <MobileNavLink to="/provider/dashboard" icon={<Grid3x3 size={18} />} label="Overview" onClick={() => setIsMenuOpen(false)} active={isActive('/provider/dashboard')} />
                                        ) : (
                                            <>
                                                <MobileNavLink to="/dashboard" icon={<Grid3x3 size={18} />} label="Overview" onClick={() => setIsMenuOpen(false)} active={isActive('/dashboard')} />
                                                <MobileNavLink to="/dashboard/bookings" icon={<Calendar size={18} />} label="My Bookings" onClick={() => setIsMenuOpen(false)} active={isActive('/dashboard/bookings')} />
                                                <MobileNavLink to="/dashboard/applications" icon={<ClipboardList size={18} />} label="Applications" onClick={() => setIsMenuOpen(false)} active={isActive('/dashboard/applications')} />
                                                <MobileNavLink to="/dashboard/my-pets" icon={<PawPrint size={18} />} label="My Pets" onClick={() => setIsMenuOpen(false)} active={isActive('/dashboard/my-pets')} />
                                            </>
                                        )}
                                    </div>

                                    {/* Account Links */}
                                    <div className="space-y-1">
                                        <p className="px-4 py-2 text-[10px] font-black text-[#C48B28] uppercase tracking-[0.2em]">Account</p>
                                        <MobileNavLink to={user.role === 'service_provider' ? "/provider/settings" : "/dashboard/profile/settings"} icon={<SettingsIcon size={18} />} label="Settings" onClick={() => setIsMenuOpen(false)} active={isActive('/settings')} />
                                        {user.role === 'admin' && (
                                            <MobileNavLink to="/admin" icon={<SettingsIcon size={18} />} label="Admin Panel" onClick={() => setIsMenuOpen(false)} active={isActive('/admin')} />
                                        )}
                                    </div>

                                    {/* Sign Out Action */}
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-3 px-6 py-4 text-[10px] font-black text-white bg-[#C48B28] hover:bg-[#A9761F] uppercase tracking-[0.3em] transition-all rounded-2xl shadow-xl shadow-[#C48B28]/20"
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-4 pt-6 border-t border-gray-100 flex flex-col gap-3">
                                    <button
                                        onClick={() => openAuth('login')}
                                        className="w-full py-4 text-sm font-black text-themev2-text/60 hover:text-[#C48B28] uppercase tracking-widest border border-gray-100 rounded-2xl transition-all"
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => openAuth('register')}
                                        className="w-full py-4 bg-[#C48B28] text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-[#C48B28]/20 transition-all active:scale-95"
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authMode}
            />
        </>
    );
};

export default Navbar;
