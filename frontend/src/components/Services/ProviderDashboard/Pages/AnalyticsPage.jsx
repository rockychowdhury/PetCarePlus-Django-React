import React, { useState, useMemo } from 'react';
import {
    TrendingUp, DollarSign, Calendar, Users,
    ArrowUpRight, ArrowDownRight, Filter, Download,
    Clock, Sparkles, ChevronRight, Activity, Target
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar,
    Cell, PieChart, Pie
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useServices from '../../../../hooks/useServices';
import Button from '../../../../components/common/Buttons/Button';

const AnalyticsPage = () => {
    const navigate = useNavigate();
    const { useGetProviderAnalytics, useGetMyProviderProfile } = useServices();
    const { data: analyticsData, isLoading } = useGetProviderAnalytics();
    const { data: profile } = useGetMyProviderProfile();
    const [period, setPeriod] = useState('6m');

    // Filtered data based on period
    const timeline = useMemo(() => {
        if (!analyticsData?.timeline) return [];
        const sliceMap = { '1m': 1, '3m': 3, '6m': 6, '1y': 12 };
        return analyticsData.timeline.slice(-(sliceMap[period] || 6));
    }, [analyticsData, period]);

    const distribution = useMemo(() => analyticsData?.distribution || [], [analyticsData]);
    const weeklyIntensity = useMemo(() => analyticsData?.weekly_intensity || [], [analyticsData]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <div className="w-10 h-10 border-4 border-[#C48B28]/20 border-t-[#C48B28] rounded-full animate-spin" />
                <p className="text-[#402E11]/40 text-[10px] font-black uppercase tracking-widest">Compiling Analytics Data...</p>
            </div>
        );
    }

    if (!analyticsData?.timeline || analyticsData.timeline.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 bg-white rounded-[2.5rem] border border-[#EAE6E2] shadow-xl shadow-[#402E11]/5">
                <div className="w-20 h-20 bg-[#FAF9F6] rounded-full flex items-center justify-center border border-[#EAE6E2]">
                    <Activity size={32} className="text-[#402E11]/20" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-lg font-black text-[#402E11]">No Data Stream Found</h2>
                    <p className="text-[#402E11]/40 text-[11px] max-w-xs mx-auto">Complete more bookings to unlock predictive insights and performance tracking.</p>
                </div>
                <Button
                    onClick={() => navigate('/provider/bookings')}
                    className="bg-[#C48B28] hover:bg-[#B37A1F] text-white rounded-xl px-6 py-2 text-[9px] font-black uppercase tracking-widest"
                >
                    Back to Bookings
                </Button>
            </div>
        );
    }

    const totalEarnings = timeline.reduce((acc, curr) => acc + (curr.earnings || 0), 0);
    const totalBookings = timeline.reduce((acc, curr) => acc + curr.bookings, 0);
    const avgBookingValue = totalBookings > 0 ? totalEarnings / totalBookings : 0;

    // Calculate Trend based on full timeline available to see previous months if sliced
    // Note: To be accurate we might need full timeline here, but using sliced for now for visual consistency
    const calculateTrend = () => {
        if (timeline.length < 2) return { val: '0%', up: true };
        const current = timeline[timeline.length - 1].earnings;
        const previous = timeline[timeline.length - 2].earnings;
        if (previous === 0) return { val: '100%', up: true };
        const diff = ((current - previous) / previous) * 100;
        return { val: `${Math.abs(diff).toFixed(1)}%`, up: diff >= 0 };
    };
    const mainTrend = calculateTrend();

    const stats = [
        { label: 'Gross Revenue', value: `$${totalEarnings.toLocaleString()}`, icon: DollarSign, trend: mainTrend.val, isUp: mainTrend.up },
        { label: 'Total Volume', value: totalBookings, icon: Target, trend: '+4.2%', isUp: true },
        { label: 'Avg Ticket', value: `$${avgBookingValue.toFixed(2)}`, icon: Activity, trend: '-2.1%', isUp: false },
        { label: 'Customer Retention', value: '94%', icon: Users, trend: '+0.8%', isUp: true },
    ];

    const handleDownload = () => {
        try {
            const headers = ['Month', 'Earnings', 'Bookings'];
            const rows = timeline.map(item => [item.month, item.earnings, item.bookings]);
            const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `analytics_${profile?.business_name || 'provider'}_${period}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Analytics report exported successfully');
        } catch (err) {
            toast.error('Failed to export report');
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#402E11] text-white p-3 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">{label}</p>
                    <p className="text-sm font-black text-[#C48B28]">${payload[0].value.toFixed(2)}</p>
                    <p className="text-[9px] text-white/40 font-bold mt-1">Total revenue generated</p>
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-themev2-primary/10 flex items-center justify-center text-themev2-primary border border-themev2-primary/20">
                            <TrendingUp size={16} />
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-themev2-text uppercase tracking-tight">
                                {profile?.business_name ? `${profile.business_name} Analytics` : 'Management Insights'}
                            </h1>
                            <p className="text-themev2-text/30 text-[9px] font-medium uppercase tracking-widest">
                                {profile?.category_name ? `${profile.category_name} Sector Analysis` : 'Performance Engine'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-white/50 p-1 rounded-full border border-border-light shadow-sm">
                        {['1m', '3m', '6m', '1y'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-white text-themev2-text shadow-md border border-themev2-primary/20 ring-[0.5px] ring-themev2-primary/10' : 'text-themev2-text/30 hover:text-themev2-text/60'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleDownload}
                        className="p-2.5 rounded-full bg-white border border-border-light text-themev2-text/40 hover:text-themev2-primary hover:border-themev2-primary/50 transition-all shadow-sm"
                    >
                        <Download size={14} />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white p-5 rounded-[2rem] border border-border-light shadow-md shadow-themev2-text/5 relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-themev2-bg rounded-xl text-themev2-text/30 group-hover:text-themev2-primary transition-colors">
                                    <Icon size={16} />
                                </div>
                                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${stat.isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {stat.isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                    {stat.trend}
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-themev2-text/40 text-[8px] font-black uppercase tracking-[0.15em]">{stat.label}</p>
                                <p className="text-xl font-black text-themev2-text font-mono tracking-tighter">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Stream Chart */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-border-light shadow-xl shadow-themev2-text/5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-black text-themev2-text tracking-tight">Revenue Trajectory</h3>
                            <p className="text-[9px] text-themev2-text/30 font-bold uppercase tracking-widest mt-1">Financial performance over time</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-themev2-bg rounded-full border border-border-light">
                            <div className="w-1.5 h-1.5 bg-themev2-primary rounded-full animate-pulse" />
                            <span className="text-[8px] font-black text-themev2-text/50 uppercase tracking-widest">Live Flow</span>
                        </div>
                    </div>

                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#C48B28" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#C48B28" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBC176" strokeOpacity={0.2} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 8, fontWeight: 700, fill: '#8A725B', opacity: 0.7 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 8, fontWeight: 700, fill: '#8A725B', opacity: 0.7 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="earnings"
                                    stroke="#C48B28"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorEarnings)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Booking Volume List */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-border-light shadow-xl shadow-themev2-text/5">
                    <div className="mb-8">
                        <h3 className="text-sm font-black text-themev2-text tracking-tight">Booking Volume</h3>
                        <p className="text-[9px] text-themev2-text/30 font-bold uppercase tracking-widest mt-1">Monthly throughput data</p>
                    </div>

                    <div className="space-y-4">
                        {timeline.slice(-5).reverse().map((month, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-themev2-bg/50 border border-transparent hover:border-border-light hover:bg-white transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white border border-border-light flex items-center justify-center text-[9px] font-black text-themev2-text shadow-sm group-hover:bg-themev2-text group-hover:text-white transition-all">
                                        {month.month.substring(0, 3)}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-black text-themev2-text">{month.month}</p>
                                        <p className="text-[8px] text-themev2-text/30 font-bold uppercase tracking-widest">{month.bookings} Service Events</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-themev2-primary">${month.earnings.toLocaleString()}</p>
                                    <div className="flex items-center justify-end gap-1 mt-0.5">
                                        <div className="w-8 h-1 bg-border-light rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-themev2-primary transition-all duration-1000"
                                                style={{ width: `${(month.bookings / Math.max(...timeline.map(m => m.bookings), 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => navigate('/provider/bookings')}
                        className="mt-8 w-full py-2.5 rounded-xl border border-border-light text-[9px] font-black uppercase tracking-widest text-themev2-text/40 hover:text-themev2-primary hover:bg-themev2-bg transition-all flex items-center justify-center gap-2"
                    >
                        View Full History
                        <ChevronRight size={12} />
                    </button>
                </div>
            </div>

            {/* Bottom Row Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                {/* Weekly Intensity */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-border-light shadow-xl shadow-themev2-text/5">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-black text-themev2-text tracking-tight">Weekly Intensity</h3>
                            <p className="text-[9px] text-themev2-text/30 font-bold uppercase tracking-widest mt-1">Peak operational days</p>
                        </div>
                        <div className={`p-1.5 rounded-lg ${period === '1m' ? 'bg-themev2-primary/10 text-themev2-primary' : 'bg-themev2-bg text-themev2-text/20'}`}>
                            <Activity size={12} />
                        </div>
                    </div>

                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyIntensity}>
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 700, fill: '#8A725B', opacity: 0.7 }} />
                                <Tooltip cursor={{ fill: '#FEF9ED' }} content={({ active, payload }) => {
                                    if (active && payload && payload[0]) return (
                                        <div className="bg-themev2-text text-white p-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                                            {payload[0].value} Bookings
                                        </div>
                                    );
                                    return null;
                                }} />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                    {weeklyIntensity.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.count > 35 ? '#C48B28' : '#EBC176'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Service Distribution */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-border-light shadow-xl shadow-themev2-text/5">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-black text-themev2-text tracking-tight">Service Distribution</h3>
                            <p className="text-[9px] text-themev2-text/30 font-bold uppercase tracking-widest mt-1">Revenue by category</p>
                        </div>
                    </div>

                    {distribution.length > 0 ? (
                        <div className="flex items-center gap-8 h-[200px]">
                            <div className="w-1/2 h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={distribution}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            <Cell fill="#C48B28" />
                                            <Cell fill="#402E11" fillOpacity={0.8} />
                                            <Cell fill="#402E11" fillOpacity={0.4} />
                                            <Cell fill="#EAE6E2" />
                                            {distribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={['#C48B28', '#8A725B', '#EBC176', '#FAF3E0'][index % 4]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-1/2 space-y-3">
                                {distribution.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ backgroundColor: ['#C48B28', '#8A725B', '#EBC176', '#FAF3E0'][idx % 4] }}
                                            />
                                            <span className="text-[9px] font-bold text-themev2-text/60 uppercase tracking-widest truncate max-w-[80px]">{item.name}</span>
                                        </div>
                                        <span className="text-[9px] font-black text-themev2-text">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[200px] text-themev2-text/40 text-xs font-bold">
                            No distribution data available
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default AnalyticsPage;
