import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import useAPI from '../../hooks/useAPI';
import useAuth from '../../hooks/useAuth';
import {
    LayoutDashboard,
    Plus,
    PawPrint,
    Search,
    MapPin,
    Users,
    Mail,
    ChevronRight,
    Eye,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    Calendar,
    AlertCircle,
    Briefcase,
    ArrowRight,
    CheckCircle,
    BarChart3,
    Sparkles,
    CalendarDays,
    MessageSquare,
    Star,
    ShieldCheck,
    ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const UserDashboardOverview = () => {
    const api = useAPI();
    const { user } = useAuth();
    const [inquiryTab, setInquiryTab] = useState('received'); // 'received' | 'sent'

    // Fetch Unified Overview Data
    const { data: overview, isLoading } = useQuery({
        queryKey: ['user-overview'],
        queryFn: async () => {
            const res = await api.get('/analytics/user-overview/');
            return res.data;
        }
    });

    const services = overview?.services || {};
    const rehoming = overview?.rehoming || {};
    const nextVisit = services.next_visit;

    const stats = [
        { label: 'Upcoming Visit', value: nextVisit ? format(new Date(nextVisit.start_datetime), 'MMM dd') : 'None', icon: CalendarDays, color: 'text-[#C48B28]', bg: 'bg-[#C48B28]/10' },
        { label: 'Total Services', value: services.stats?.total_bookings || 0, icon: Clock, color: 'text-[#C48B28]', bg: 'bg-[#C48B28]/10' },
        { label: 'Pet Profiles', value: rehoming.stats?.my_pets_count || 0, icon: PawPrint, color: 'text-[#C48B28]', bg: 'bg-[#C48B28]/10' },
        { label: 'Active Listings', value: rehoming.stats?.active_listings_count || 0, icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    const providerStatus = overview?.user?.provider_status;
    const isProvider = overview?.user?.is_service_provider;

    const getProviderAction = () => {
        if (isProvider) return { label: 'Provider Portal', icon: LayoutDashboard, to: '/provider/dashboard', desc: 'Manage business' };

        switch (providerStatus) {
            case 'submitted':
                return { label: 'Pending App', icon: Clock, to: '/become-provider', desc: 'Under review', isHighlighted: true };
            case 'rejected':
                return { label: 'Apply Again', icon: AlertTriangle, to: '/service-provider/register', desc: 'Application rejected', isHighlighted: true, variant: 'error' };
            case 'draft':
                return { label: 'Resume App', icon: FileText, to: '/service-provider/register', desc: 'Finish application', isHighlighted: true };
            default:
                return { label: 'Become Provider', icon: Briefcase, to: '/become-provider', desc: 'Join community' };
        }
    };

    const quickActions = [
        { label: 'Find Service', icon: Search, to: '/services', desc: 'Vets, Trainers...' },
        { label: 'New Booking', icon: Plus, to: '/services', desc: 'Schedule visit' },
        { label: 'Manage Pets', icon: PawPrint, to: '/dashboard/my-pets', desc: 'Health & Info' },
        { label: 'Reviews', icon: Star, to: '/dashboard/reviews', desc: 'Rate experience' },
        { label: 'Rehoming', icon: Eye, to: '/rehoming', desc: 'Create listing' },
        getProviderAction(),
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] bg-[#FEF9ED]/30">
                <div className="w-12 h-12 rounded-full border-4 border-[#C48B28]/10 border-t-[#C48B28] animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full pt-32 p-6 md:p-12 lg:p-20 space-y-12 bg-[#FEF9ED]/30 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.4em] mb-4 block">Dashboard Center</span>
                    <h1 className="text-5xl font-black text-[#402E11] tracking-tighter mb-4">
                        Hi, {overview?.user?.first_name || 'Friend'}!
                    </h1>
                    <div className="flex items-center gap-4">
                        <p className="text-[#402E11]/60 font-bold text-sm">Your pet's care journey at a glance.</p>
                        <div className="flex items-center gap-2.5 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-[#EBC176]/20 shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black text-[#402E11]/40 uppercase tracking-widest leading-none">{format(new Date(), 'EEEE, MMMM dd')}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Link to="/services">
                        <button className="flex items-center gap-3 bg-[#C48B28] text-white px-8 py-[18px] rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-[#C48B28]/25 hover:scale-105 active:scale-95 transition-all">
                            <Plus size={18} strokeWidth={3} />
                            Book Service
                        </button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -6, scale: 1.02 }}
                        className="bg-white/80 backdrop-blur-md p-7 rounded-[2.5rem] border border-[#EBC176]/20 shadow-xl shadow-[#402E11]/5 flex items-center gap-6 group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#FAF3E0]/40 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-transform group-hover:scale-110" />
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform shadow-sm relative z-10`}>
                            <stat.icon size={26} strokeWidth={2.5} />
                        </div>
                        <div className="relative z-10">
                            <div className="text-3xl font-black text-[#402E11] tracking-tighter leading-none mb-1.5">{stat.value}</div>
                            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#402E11]/40 group-hover:text-[#402E11]/60 transition-colors">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Primary Services - 8 cols */}
                <div className="lg:col-span-8 space-y-10">

                    {/* Next Visit Prominent Card */}
                    <div className="relative group overflow-hidden bg-[#FAF3E0] rounded-[3rem] border border-[#EBC176]/30 shadow-2xl shadow-[#C48B28]/5 mt-2">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-[45deg] -translate-x-full group-hover:translate-x-[250%] transition-transform duration-[2000ms] ease-in-out pointer-events-none opacity-60 z-20" />

                        <div className="p-12 relative z-10">
                            <div className="flex flex-col md:flex-row justify-between gap-10">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="px-5 py-2 bg-[#C48B28] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2.5 shadow-lg shadow-[#C48B28]/20 animate-bounce">
                                            <CalendarDays size={14} strokeWidth={3} />
                                            Upcoming Visit
                                        </div>
                                        {nextVisit && (
                                            <span className="text-[10px] font-black text-[#C48B28]/50 uppercase tracking-[0.2em]">
                                                Next scheduled {format(new Date(nextVisit.start_datetime), 'HH:mm aaa')}
                                            </span>
                                        )}
                                    </div>

                                    {nextVisit ? (
                                        <div className="space-y-8">
                                            <div>
                                                <h2 className="text-5xl font-black text-[#402E11] tracking-tight mb-3 group-hover:text-[#C48B28] transition-colors leading-tight truncate">
                                                    {nextVisit.provider?.business_name}
                                                </h2>
                                                <div className="flex items-center gap-3">
                                                    <span className="px-3.5 py-1.5 bg-white/80 backdrop-blur-sm text-[#C48B28] rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border border-[#EBC176]/20 shadow-sm">
                                                        {nextVisit.provider?.category?.name}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-[#402E11]/50 bg-white/40 px-3 py-1.5 rounded-xl border border-white/50">
                                                        <MapPin size={12} strokeWidth={2.5} />
                                                        <span className="text-[10px] font-black tracking-tight uppercase leading-none">{nextVisit.provider?.address?.city || 'Location TBD'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-5">
                                                <div className="flex -space-x-4">
                                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white border-2 border-[#FAF3E0] p-1.5 shadow-lg relative z-20 overflow-hidden">
                                                        {nextVisit.pet?.main_photo ? (
                                                            <img src={nextVisit.pet.main_photo} alt="" className="w-full h-full object-cover rounded-2xl" />
                                                        ) : <PawPrint className="w-full h-full text-[#C48B28]/20" />}
                                                    </div>
                                                    <div className="w-16 h-16 rounded-[1.5rem] bg-[#C48B28] text-white flex items-center justify-center font-black text-lg border-2 border-[#FAF3E0] shadow-lg relative z-10 translate-x-2">
                                                        {nextVisit.pet?.name?.[0]}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-[#402E11]/30 uppercase tracking-[0.2em] mb-1">Patient Profile</p>
                                                    <p className="text-xl font-black text-[#402E11] tracking-tight">{nextVisit.pet?.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-10">
                                            <h2 className="text-4xl font-black text-[#402E11] tracking-tight mb-4">No upcoming visits</h2>
                                            <p className="text-[#402E11]/50 font-bold text-base mb-10 max-w-sm leading-relaxed">Your professional pet care calendar is currently clear. Time to schedule a checkup?</p>
                                            <Link to="/services">
                                                <button className="flex items-center gap-3 bg-[#402E11] text-white px-10 py-[18px] rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-[#402E11]/20 hover:scale-105 active:scale-95 transition-all">
                                                    Find New Services <ArrowRight size={16} strokeWidth={3} />
                                                </button>
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {nextVisit && (
                                    <div className="w-full md:w-72 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white p-8 flex flex-col justify-between group-hover:shadow-3xl transition-all shadow-xl shadow-[#402E11]/5">
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center bg-[#FAF3E0]/40 p-4 rounded-2xl border border-[#EBC176]/10">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#402E11]/40">Booking Status</span>
                                                <span className="text-[10px] font-black text-green-600 px-3 py-1 bg-green-50 rounded-lg border border-green-100 uppercase tracking-widest">{nextVisit.status}</span>
                                            </div>
                                            <div className="flex justify-between items-center px-4">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#402E11]/40">Agreed Price</span>
                                                <span className="text-2xl font-black text-[#402E11] tracking-tighter">${nextVisit.agreed_price}</span>
                                            </div>
                                        </div>
                                        <Link to="/dashboard/bookings" className="mt-12">
                                            <button className="w-full py-4 bg-[#402E11] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#402E11]/20 hover:bg-[#C48B28] transition-all group-hover:scale-[1.02]">
                                                Go to details
                                            </button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Service History */}
                    <div className="space-y-8">
                        <div className="flex justify-between items-end px-4">
                            <div>
                                <span className="text-[10px] font-black text-[#C48B28]/50 uppercase tracking-[0.3em] mb-2 block">Service Log</span>
                                <h3 className="text-2xl font-black text-[#402E11] flex items-center gap-2.5">
                                    <Clock size={22} className="text-[#C48B28]" />
                                    Recent Activity
                                </h3>
                            </div>
                            <Link to="/dashboard/bookings" className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.2em] hover:translate-x-1.5 transition-transform inline-flex items-center gap-2.5 leading-none">
                                View Archive <ArrowRight size={14} />
                            </Link>
                        </div>

                        <div className="grid gap-5">
                            {services.recent_bookings?.length > 0 ? (
                                services.recent_bookings.map((booking) => (
                                    <div key={booking.id} className="bg-white p-6 rounded-[2.5rem] border border-[#EBC176]/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 hover:shadow-2xl transition-all group shadow-xl shadow-[#402E11]/5">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#FEF9ED] rounded-2xl flex items-center justify-center text-[#C48B28] shadow-inner shrink-0 leading-none">
                                                    <span className="font-logo font-black text-xl">{booking.provider?.business_name?.[0]}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-black text-[#402E11] truncate">{booking.provider?.business_name}</h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <MapPin size={10} className="text-[#402E11]/30" />
                                                        <span className="text-[9px] font-bold text-[#402E11]/40 uppercase tracking-widest truncate">{booking.booking_type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right shrink-0">
                                                    <p className="text-[10px] font-black text-[#402E11] leading-none mb-1">{format(new Date(booking.start_datetime), 'MMM dd')}</p>
                                                    <p className="text-[8px] font-black text-[#C48B28] uppercase tracking-widest">{booking.status}</p>
                                                </div>
                                                <Link to="/dashboard/bookings" className="w-8 h-8 rounded-full bg-[#FAF3E0] flex items-center justify-center text-[#C48B28] hover:bg-[#C48B28] hover:text-white transition-all">
                                                    <ChevronRight size={14} strokeWidth={3} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center bg-white/40 rounded-[3rem] border-2 border-dashed border-[#EBC176]/20">
                                    <p className="text-[11px] font-black text-[#402E11]/30 uppercase tracking-[0.3em]">No activity logs found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Rehoming & Stats Sidebar - 4 cols */}
                <div className="lg:col-span-4 space-y-10">

                    {/* Rehoming Overview Card (Shiny Metallic Background) */}
                    <div className="bg-gradient-to-br from-[#FDFBF7] via-white to-[#FAF3E0]/40 rounded-[3rem] p-10 border border-[#EBC176]/30 shadow-2xl shadow-[#402E11]/5 relative overflow-hidden group">
                        {/* Dynamic Shine Sweep */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -skew-x-[35deg] -translate-x-full group-hover:translate-x-[250%] transition-transform duration-[2000ms] ease-in-out pointer-events-none opacity-60 z-20" />

                        <div className="relative z-10">
                            <h3 className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.4em] mb-10 flex items-center gap-2.5">
                                <Sparkles size={16} className="animate-pulse" />
                                Rehoming Activity
                            </h3>

                            <div className="space-y-5">
                                <div className="flex items-center justify-between p-6 bg-white/60 backdrop-blur-sm rounded-[2rem] border border-white hover:bg-white transition-all shadow-sm">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-[#C48B28]/10 rounded-2xl flex items-center justify-center text-[#C48B28] shadow-sm">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-[#402E11]/30 uppercase tracking-[0.2em] mb-0.5">Inbound</p>
                                            <p className="text-2xl font-black text-[#402E11] tracking-tighter">{rehoming.stats?.apps_received_count}</p>
                                        </div>
                                    </div>
                                    <Link to="/dashboard/applications?tab=received">
                                        <button className="w-10 h-10 bg-[#C48B28]/10 rounded-full text-[#C48B28] hover:bg-[#C48B28] hover:text-white transition-all flex items-center justify-center">
                                            <ArrowUpRight size={18} />
                                        </button>
                                    </Link>
                                </div>

                                <div className="flex items-center justify-between p-6 bg-white/60 backdrop-blur-sm rounded-[2rem] border border-white hover:bg-white transition-all shadow-sm">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-[#402E11]/10 rounded-2xl flex items-center justify-center text-[#402E11] shadow-sm">
                                            <Mail size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-[#402E11]/30 uppercase tracking-[0.2em] mb-0.5">Outbound</p>
                                            <p className="text-2xl font-black text-[#402E11] tracking-tighter">{rehoming.stats?.apps_submitted_count}</p>
                                        </div>
                                    </div>
                                    <Link to="/dashboard/applications?tab=submitted">
                                        <button className="w-10 h-10 bg-[#402E11]/10 rounded-full text-[#402E11] hover:bg-[#402E11] hover:text-white transition-all flex items-center justify-center">
                                            <ArrowUpRight size={18} />
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            <Link to="/rehoming/start">
                                <button className="w-full mt-10 py-[18px] bg-[#C48B28] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-[#C48B28]/25 hover:scale-105 active:scale-95 transition-all">
                                    Create Listing
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Quick Actions List */}
                    <div className="bg-white rounded-[3rem] p-8 border border-[#EBC176]/10 shadow-2xl shadow-[#402E11]/5">
                        <h3 className="text-[10px] font-black text-[#402E11]/30 uppercase tracking-[0.3em] mb-6">Navigation</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {quickActions.map((action, i) => (
                                <Link to={action.to} key={i}>
                                    <div className={`flex items-center gap-4 p-4 rounded-3xl transition-all border group ${action.isHighlighted
                                        ? action.variant === 'error'
                                            ? 'bg-status-error/5 border-status-error/20 shadow-sm ring-1 ring-status-error/10'
                                            : 'bg-[#C48B28]/5 border-[#C48B28]/20 shadow-sm ring-1 ring-[#C48B28]/10'
                                        : 'hover:bg-[#FAF3E0]/50 border-transparent hover:border-[#EBC176]/10'
                                        }`}>
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shrink-0 ${action.isHighlighted
                                            ? action.variant === 'error'
                                                ? 'bg-status-error text-white shadow-lg'
                                                : 'bg-[#C48B28] text-white shadow-lg'
                                            : 'bg-[#FAF3E0]/60 text-[#402E11]/30 group-hover:bg-white group-hover:text-[#C48B28] group-hover:shadow-lg'
                                            }`}>
                                            <action.icon size={18} strokeWidth={2.5} className={action.isHighlighted ? 'animate-pulse' : ''} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`text-[13px] font-black leading-tight mb-0.5 truncate ${action.isHighlighted
                                                ? action.variant === 'error'
                                                    ? 'text-status-error'
                                                    : 'text-[#C48B28]'
                                                : 'text-[#402E11]'
                                                }`}>{action.label}</p>
                                            <p className={`text-[8px] font-black uppercase tracking-[0.1em] truncate ${action.isHighlighted
                                                ? action.variant === 'error'
                                                    ? 'text-status-error/60'
                                                    : 'text-[#C48B28]/60'
                                                : 'text-[#402E11]/30'
                                                }`}>{action.desc}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Become a Provider / Professional Tier */}
                    <div className="p-10 bg-[#402E11] rounded-[3rem] text-white relative overflow-hidden group shadow-2xl shadow-[#402E11]/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[4rem] group-hover:scale-110 transition-transform" />
                        <h4 className="text-xl font-black tracking-tight mb-3">
                            {isProvider ? 'Provider Standards' : 'Professional Tier'}
                        </h4>
                        <p className="text-xs text-white/50 font-bold leading-relaxed mb-8">
                            {isProvider
                                ? 'Maintain high service standards to keep your verified badge and attract more clients.'
                                : 'Experience priority support and verified trust badges for your professional profile.'}
                        </p>
                        <Link to="/become-provider">
                            <button className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C48B28] hover:text-white transition-colors flex items-center gap-3">
                                {isProvider ? 'Service Protocol' : 'Learn More'} <ArrowRight size={16} strokeWidth={3} />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboardOverview;
