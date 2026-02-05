import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, List, Heart, Flag, ArrowUp, ArrowDown, Activity, CheckCircle, Clock, Calendar } from 'lucide-react';
import useAPI from '../../hooks/useAPI';
import Card from '../../components/common/Layout/Card';
import { Link } from 'react-router-dom';
import {
    AreaChart,
    Area,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { format } from 'date-fns';

const AdminDashboard = () => {
    const api = useAPI();

    const { data: analytics, isLoading } = useQuery({
        queryKey: ['adminAnalytics'],
        queryFn: async () => {
            const response = await api.get('/admin-panel/analytics/');
            return response.data;
        }
    });

    if (isLoading || !analytics) return (
        <div className="flex items-center justify-center min-h-[60vh] text-sky-900/60 font-medium animate-pulse">
            Loading dashboard data...
        </div>
    );

    const { kpi, pending_counts, recent_activity, charts } = analytics;

    const stats = [
        {
            title: 'Total Users',
            value: kpi.total_users,
            change: `+${kpi.new_users_today} today`,
            isPositive: kpi.new_users_today > 0,
            icon: Users,
            color: 'text-cyan-700',
            bg: 'bg-cyan-700/10',
            link: '/admin/users'
        },
        {
            title: 'Active Listings',
            value: kpi.active_listings,
            change: 'Live',
            isPositive: true,
            icon: List,
            color: 'text-sky-600',
            bg: 'bg-sky-600/10',
            link: '/admin/listings'
        },
        {
            title: 'Adoption Apps',
            value: kpi.total_applications || 0,
            change: 'Inquiries',
            isPositive: true,
            icon: Heart,
            color: 'text-rose-600',
            bg: 'bg-rose-600/10',
            link: '/admin/listings'
        },
        {
            title: 'Total Revenue',
            value: `$${Math.round(kpi.total_revenue).toLocaleString()}`,
            change: 'Gross',
            isPositive: true,
            icon: Activity,
            color: 'text-emerald-600',
            bg: 'bg-emerald-600/10',
            link: '/admin/analytics'
        },
    ];

    const pendingActions = [
        {
            label: 'Role Requests',
            count: pending_counts?.role_requests || 0,
            link: '/admin/role-requests',
            color: 'info',
            icon: Users
        },
        {
            label: 'Provider Verifications',
            count: pending_counts?.providers || 0,
            link: '/admin/providers?status=pending',
            color: 'warning',
            icon: Flag
        },
        {
            label: 'Listings Review',
            count: pending_counts?.listings || 0,
            link: '/admin/listings?status=pending_review',
            color: 'error',
            icon: List
        },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-sky-900 tracking-tight">Admin <span className="text-cyan-700">Center</span></h1>
                    <p className="text-sky-900/60 font-medium mt-1">Platform overview and real-time moderation.</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Link key={index} to={stat.link} className="group">
                        <div className="bg-white border border-sky-100 p-6 rounded-[2rem] hover:border-cyan-200 transition-all duration-300 shadow-sm hover:shadow-md">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${stat.isPositive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 'bg-red-50 text-red-600 border border-red-100/50'}`}>
                                    {stat.isPositive ? <ArrowUp size={12} strokeWidth={3} /> : <ArrowDown size={12} strokeWidth={3} />}
                                    {stat.change}
                                </div>
                            </div>
                            <h3 className="text-sky-900/40 text-xs font-black uppercase tracking-widest">{stat.title}</h3>
                            <p className="text-3xl font-black text-sky-900 mt-1">{stat.value}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Charts Area */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white border border-sky-100 p-8 rounded-[2.5rem]">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black text-sky-900 tracking-tight">User Acquisition</h3>
                                <p className="text-xs text-sky-900/40 font-bold uppercase tracking-widest mt-0.5">Registration trends (Last 6 Months)</p>
                            </div>
                        </div>

                        <div className="h-64 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={charts.user_growth}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0e7490" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#0e7490" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid #e0f2fe' }}
                                        itemStyle={{ color: '#0c4a6e', fontWeight: 'bold' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="users"
                                        stroke="#0e7490"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorUsers)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-8">
                    {/* Pending Actions */}
                    <div className="bg-white border border-sky-100 p-7 rounded-[2.5rem]">
                        <h3 className="text-lg font-black text-sky-900 mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-cyan-700/10 text-cyan-700 flex items-center justify-center">
                                <Activity size={20} />
                            </div>
                            Action Center
                        </h3>
                        <div className="space-y-4">
                            {pendingActions.map((action, idx) => (
                                <Link key={idx} to={action.link} className="flex justify-between items-center p-4 rounded-3xl bg-sky-50/30 hover:bg-white transition-all border border-transparent hover:border-sky-100 group">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${action.count > 0 ? "bg-white text-cyan-700" : "bg-transparent text-sky-900/30"
                                            }`}>
                                            <action.icon size={16} />
                                        </div>
                                        <span className="text-sm font-bold text-sky-900/70 group-hover:text-cyan-700 transition-colors">{action.label}</span>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter text-white
                                            ${action.count > 0 ?
                                            (action.color === 'error' ? 'bg-red-500' :
                                                action.color === 'warning' ? 'bg-amber-500' :
                                                    'bg-cyan-600')
                                            : 'bg-gray-300'}`}>
                                        {action.count}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Recent Stream */}
                    <div className="bg-white border border-sky-100 p-7 rounded-[2.5rem] max-h-[600px] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-4 border-b border-sky-50">
                            <h3 className="text-lg font-black text-sky-900">Live Stream</h3>
                            <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-widest animate-pulse">● Live</span>
                        </div>
                        <div className="space-y-6">
                            {recent_activity && recent_activity.length > 0 ? (
                                recent_activity.map((activity) => (
                                    <div key={activity.id} className="flex gap-4 items-start group">
                                        <div className={`p-3 rounded-2xl transition-all shrink-0 ${activity.type === 'user' ? 'bg-blue-50 text-blue-600' :
                                                activity.type === 'booking' ? 'bg-purple-50 text-purple-600' :
                                                    activity.type === 'role' ? 'bg-amber-50 text-amber-600' :
                                                        'bg-emerald-50 text-emerald-600'
                                            }`}>
                                            {activity.type === 'user' && <Users size={14} />}
                                            {activity.type === 'booking' && <Calendar size={14} />}
                                            {activity.type === 'provider' && <Flag size={14} />}
                                            {activity.type === 'role' && <Activity size={14} />}
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <p className="text-xs text-sky-900/80 font-bold leading-tight group-hover:text-cyan-700 transition-colors break-words">
                                                {activity.message}
                                            </p>
                                            <p className="text-[10px] text-sky-900/40 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                <Clock size={10} /> {format(new Date(activity.time), 'MMM dd, HH:mm')}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-sky-900/40 text-xs font-bold">
                                    No recent activity
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
