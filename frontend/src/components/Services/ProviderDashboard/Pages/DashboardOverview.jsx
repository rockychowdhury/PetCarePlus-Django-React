import React from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import {
    Calendar,
    Clock,
    DollarSign,
    Star,
    ShieldCheck,
    Plus,
    UserPlus,
    Image,
    Edit,
    FileText,
    TrendingUp,
    Sparkles,
    CalendarDays,
    ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Button from '../../../common/Buttons/Button';
import useServices from '../../../../hooks/useServices';
import useAPI from '../../../../hooks/useAPI';
import { toast } from 'react-hot-toast';

const DashboardOverview = () => {
    const { provider } = useOutletContext();
    const navigate = useNavigate();
    const api = useAPI();
    const { useGetDashboardStats } = useServices();
    const { data: stats, isLoading } = useGetDashboardStats();

    const onNavigate = (path) => navigate(`/provider/${path}`);

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-[#C48B28]/20 border-t-[#C48B28] animate-spin" />
            </div>
        );
    }

    const metrics = stats?.metrics || {};
    const businessName = provider?.business_name || provider?.user?.first_name || 'Provider';

    const statCards = [
        { label: 'Active Bookings', value: metrics.total_bookings ?? 0, icon: Calendar, color: 'text-[#C48B28]', bg: 'bg-[#C48B28]/10' },
        { label: 'Pending Requests', value: metrics.pending_requests ?? 0, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Today\'s Jobs', value: metrics.todays_bookings ?? 0, icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Month Revenue', value: `$${(metrics.month_earnings ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    const quickActions = [
        { label: 'Calendar', icon: CalendarDays, to: '/provider/calendar', desc: 'Schedule view' },
        { label: 'Availability', icon: Clock, to: '/provider/availability', desc: 'Manage time' },
        { label: 'Reviews', icon: Star, to: '/provider/reviews', desc: 'Check feedback' },
        { label: 'Profile', icon: Edit, to: '/provider/profile', desc: 'Edit business' },
        { label: 'Reports', icon: FileText, to: '/provider/analytics', desc: 'Export stats' },
        { label: 'Settings', icon: TrendingUp, to: '/provider/settings', desc: 'Portal configs' },
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <span className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.4em] mb-4 block">Provider Business Center</span>
                    <h1 className="text-4xl md:text-5xl font-black text-[#402E11] tracking-tighter mb-4">
                        Hi, {provider?.user?.first_name || 'Partner'}!
                    </h1>
                    <div className="flex items-center gap-4">
                        <p className="text-[#402E11]/60 font-bold text-sm">Grow your business and manage your bookings effortlessly.</p>
                        <div className="flex items-center gap-2.5 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-[#EBC176]/20 shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black text-[#402E11]/40 uppercase tracking-widest leading-none">
                                {format(new Date(), 'EEEE, MMMM dd')}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="primary"
                        onClick={() => navigate('/provider/calendar')}
                        className="!bg-[#402E11] hover:!bg-[#5A421B] text-white px-8 py-[18px] !rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-[#402E11]/25 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={18} strokeWidth={3} className="mr-2" />
                        Manage Schedule
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
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

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Quick Actions (Left) */}
                <div className="xl:col-span-8 space-y-8">
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 border border-[#EBC176]/20 shadow-2xl shadow-[#402E11]/5">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-[#402E11] leading-none mb-2">Grow Your Business</h3>
                                <p className="text-xs text-[#402E11]/50 font-bold uppercase tracking-widest">Business Management shortcuts</p>
                            </div>
                            <Sparkles className="text-[#C48B28]" size={24} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {quickActions.map((action, i) => (
                                <Link
                                    key={i}
                                    to={action.to}
                                    className="group p-6 rounded-3xl bg-[#FEF9ED]/50 border border-transparent hover:border-[#EBC176]/30 hover:bg-white hover:shadow-xl hover:shadow-[#402E11]/5 transition-all duration-500"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#EBC176]/20 flex items-center justify-center text-[#C48B28] mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                        <action.icon size={22} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-black text-[#402E11] text-sm mb-1">{action.label}</h4>
                                            <p className="text-[10px] text-[#402E11]/40 font-bold uppercase tracking-wider">{action.desc}</p>
                                        </div>
                                        <ArrowUpRight size={14} className="text-[#C48B28] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-500" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Info Card (Right) */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="bg-[#402E11] rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-[#402E11]/10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[4rem] group-hover:scale-110 transition-transform" />

                        <div className="mb-8">
                            <ShieldCheck className="text-[#C48B28] mb-4" size={32} />
                            <h3 className="text-2xl font-black leading-tight mb-2">Verification Status</h3>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C48B28]/20 border border-[#C48B28]/30 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#C48B28] animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C48B28]">
                                    {provider?.verification_status === 'verified' ? "Verified Account" : "Action Required"}
                                </span>
                            </div>
                        </div>

                        <p className="text-sm text-white/60 font-bold mb-8 leading-relaxed">
                            {provider?.verification_status === 'verified'
                                ? "Your business is fully visible to clients. Keep up the great work!"
                                : "Complete your profile to unlock full business visibility and start accepting bookings."}
                        </p>

                        <button
                            onClick={() => onNavigate('profile')}
                            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02]"
                        >
                            Review Profile
                        </button>
                    </div>

                    <div className="bg-[#FAF3E0] rounded-[2.5rem] p-10 border border-[#EBC176]/20 shadow-xl shadow-[#402E11]/5">
                        <TrendingUp className="text-[#C48B28] mb-4" size={32} />
                        <h3 className="text-xl font-black text-[#402E11] mb-2 leading-tight">Insight of the Week</h3>
                        <p className="text-xs text-[#402E11]/60 font-bold leading-relaxed mb-6 italic">
                            "Clients are 40% more likely to book providers with at least 5 photos in their profile."
                        </p>
                        <Link to="/provider/profile" className="text-[10px] font-black text-[#C48B28] uppercase tracking-[0.2em] hover:text-[#402E11] transition-colors flex items-center gap-2">
                            Update Gallery <ArrowUpRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
