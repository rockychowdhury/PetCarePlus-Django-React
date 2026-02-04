import React from 'react';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';
import Card from '../../../../components/common/Layout/Card';
import useServices from '../../../../hooks/useServices';

const AnalyticsPage = () => {
    const { useGetProviderAnalytics } = useServices();
    const { data: analytics, isLoading } = useGetProviderAnalytics();

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;
    }

    if (!analytics || analytics.length === 0) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
                    <TrendingUp size={48} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No sufficient data for analytics yet.</p>
                </div>
            </div>
        );
    }

    const maxEarnings = Math.max(...analytics.map(d => d.earnings), 100);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Earnings Chart */}
                <Card className="p-6 bg-white col-span-2">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Earnings History</h3>
                            <p className="text-sm text-gray-500">Last 6 months revenue</p>
                        </div>
                        <div className="bg-green-50 p-2 rounded-lg text-green-700 font-bold flex items-center gap-2">
                            <DollarSign size={18} />
                            ${analytics.reduce((acc, curr) => acc + (curr.earnings || 0), 0).toFixed(2)} Total
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-4 px-4 pb-2 border-b border-gray-200">
                        {analytics.map((monthData, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2 group relative">
                                {/* Tooltip */}
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-12 bg-gray-900 text-white text-xs py-1 px-2 rounded transition-opacity whitespace-nowrap z-10">
                                    ${monthData.earnings?.toFixed(2)} ({monthData.bookings} bookings)
                                </div>

                                {/* Bar */}
                                <div
                                    className="w-full bg-brand-primary/20 rounded-t-lg hover:bg-brand-primary/40 transition-all relative overflow-hidden group-hover:shadow-lg"
                                    style={{ height: `${(monthData.earnings / maxEarnings) * 100}%`, minHeight: '4px' }}
                                >
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-brand-primary"
                                        style={{ height: '4px' }}
                                    ></div>
                                </div>

                                {/* Label */}
                                <span className="text-xs text-gray-500 font-medium truncate w-full text-center">
                                    {monthData.month}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Booking Trends (Simple Stat Cards for now) */}
                <Card className="p-6 bg-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Total Bookings</h3>
                            <p className="text-sm text-gray-500">All time</p>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                        {analytics.reduce((acc, curr) => acc + curr.bookings, 0)}
                    </div>
                </Card>

                <Card className="p-6 bg-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Avg. Monthly Rev</h3>
                            <p className="text-sm text-gray-500">Based on recent activity</p>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                        ${(analytics.reduce((acc, curr) => acc + (curr.earnings || 0), 0) / (analytics.length || 1)).toFixed(2)}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AnalyticsPage;
