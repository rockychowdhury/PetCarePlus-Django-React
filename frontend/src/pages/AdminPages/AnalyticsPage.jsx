import React from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Users, DollarSign, Calendar, Activity, TrendingUp } from 'lucide-react';
import useAdmin from '../../hooks/useAdmin';

const KPICard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-sky-100 flex items-center gap-4 hover:shadow-lg hover:shadow-sky-900/5 transition-all group">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${color}`}>
            <Icon size={24} className="text-white" />
        </div>
        <div>
            <p className="text-sky-900/60 text-sm font-bold uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-black text-sky-900 group-hover:scale-105 transition-transform origin-left">
                {value}
            </p>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-sky-100 text-sm">
                <p className="font-bold text-sky-900 mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sky-900/70 font-medium capitalize">
                            {entry.name}:
                        </span>
                        <span className="font-bold text-sky-900">
                            {entry.name === 'revenue'
                                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(entry.value)
                                : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const AnalyticsPage = () => {
    const { useGetAnalytics } = useAdmin();
    const { data, isLoading, isError } = useGetAnalytics();

    if (isLoading) return (
        <div className="p-20 text-center text-sky-900/30 font-bold uppercase tracking-widest animate-pulse">
            Loading analytics...
        </div>
    );

    if (isError || !data) return (
        <div className="p-20 text-center text-red-500 font-bold">
            Failed to load analytics data.
        </div>
    );

    const { kpi, charts } = data;
    const COLORS = ['#0891b2', '#16a34a', '#ca8a04', '#dc2626']; // Cyan, Green, Amber, Red

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-sky-900 tracking-tight">Platform Analytics</h1>
                <p className="text-sky-900/60 font-medium">Overview of user growth, revenue, and booking performance.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Users"
                    value={kpi.total_users}
                    icon={Users}
                    color="bg-gradient-to-br from-cyan-500 to-cyan-700"
                />
                <KPICard
                    title="Total Revenue"
                    value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(kpi.total_revenue)}
                    icon={DollarSign}
                    color="bg-gradient-to-br from-emerald-500 to-emerald-700"
                />
                <KPICard
                    title="Total Bookings"
                    value={kpi.total_bookings}
                    icon={Calendar}
                    color="bg-gradient-to-br from-violet-500 to-violet-700"
                />
                <KPICard
                    title="Active Listings"
                    value={kpi.active_listings}
                    icon={Activity}
                    color="bg-gradient-to-br from-amber-500 to-amber-700"
                />
            </div>

            {/* User Growth & Revenue Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Growth */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-sky-100 shadow-sm relative overflow-hidden">
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-sky-900 flex items-center gap-2">
                            <TrendingUp size={20} className="text-cyan-600" /> User Growth
                        </h3>
                        <p className="text-xs text-sky-900/40 font-bold uppercase tracking-wider">Last 6 Months</p>
                    </div>

                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={charts.user_growth}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0891b2" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0f2fe" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: '#0c4a6e', fontSize: 11, fontWeight: 600 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#0c4a6e', fontSize: 11, fontWeight: 600 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="users"
                                    stroke="#0891b2"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorUsers)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Trends */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-sky-100 shadow-sm relative overflow-hidden">
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-sky-900 flex items-center gap-2">
                            <DollarSign size={20} className="text-emerald-600" /> Revenue & Bookings
                        </h3>
                        <p className="text-xs text-sky-900/40 font-bold uppercase tracking-wider">Monthly Performance</p>
                    </div>

                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.revenue_trends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0f2fe" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: '#0c4a6e', fontSize: 11, fontWeight: 600 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    yAxisId="left"
                                    orientation="left"
                                    tick={{ fill: '#0c4a6e', fontSize: 11, fontWeight: 600 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fill: '#16a34a', fontSize: 11, fontWeight: 600 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="bookings" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Bookings" barSize={20} />
                                <Bar yAxisId="right" dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue" barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Booking Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-6 rounded-[2.5rem] border border-sky-100 shadow-sm relative overflow-hidden">
                    <div className="mb-4">
                        <h3 className="text-lg font-black text-sky-900">Booking Status</h3>
                        <p className="text-xs text-sky-900/40 font-bold uppercase tracking-wider">Distribution</p>
                    </div>

                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={charts.status_distribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {charts.status_distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Placeholder for future detailed breakdowns or recent activity log */}
                <div className="lg:col-span-2 bg-gradient-to-br from-sky-900 to-cyan-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <h2 className="text-2xl font-black mb-4 relative z-10">Insight Summary</h2>
                    <p className="text-cyan-100 mb-6 font-medium relative z-10 max-w-lg">
                        The platform has seen a <strong>{((kpi.new_users_today / (kpi.total_users || 1)) * 100).toFixed(1)}%</strong> increase in new users today.
                        Revenue tracks positively with booking volume. Monitor the "Pending" bookings to ensure provider responsiveness.
                    </p>

                    <div className="flex gap-4 relative z-10">
                        <button className="px-6 py-3 bg-white text-sky-900 font-bold rounded-full hover:bg-cyan-50 transition-colors">
                            Download Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
