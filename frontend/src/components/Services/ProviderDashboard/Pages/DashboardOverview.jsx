import React from 'react';
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
    FileText
} from 'lucide-react';
import Button from '../../../common/Buttons/Button';
import StatsCard from '../components/StatsCard';
import QuickActionCard from '../components/QuickActionCard';
import RecentBookingsTable from '../components/RecentBookingsTable';
import RecentReviewsList from '../components/RecentReviewsList';
import useServices from '../../../../hooks/useServices';
import useAPI from '../../../../hooks/useAPI';
import { toast } from 'react-hot-toast';

const DashboardOverview = ({ provider, onNavigate }) => {
    const api = useAPI();
    const { useGetDashboardStats } = useServices();
    const { data: stats, isLoading } = useGetDashboardStats();

    if (isLoading) {
        return <div className="min-h-[400px] flex items-center justify-center text-gray-400">Loading dashboard data...</div>;
    }

    // Stats structure from new ProviderDashboardViewSet
    // stats = { metrics: { ... }, recent_pending: [ ... ] }
    const metrics = stats?.metrics || {};
    const recentPending = stats?.recent_pending || [ // Fallback to stats?.recent_bookings if mixed
        ...(stats?.recent_bookings?.filter(b => b.status === 'pending') || [])
    ];

    // Safely fallback or use metrics
    const totalBookings = metrics.total_bookings ?? 0;
    const pendingRequests = metrics.pending_requests ?? 0;
    const monthEarnings = metrics.month_earnings ?? 0;
    // const rating = provider?.avg_rating || 0; // Provider object has rating
    const pendingReviews = stats?.pending_reviews_count ?? 0; // Not in metrics yet? Check backend.
    // Backward compatibility: backend 'dashboard_stats' in step 384 returned metrics + pending_reviews_count?
    // Wait, step 384 code:
    // return Response({ metrics: { ... }, recent_pending: ... }) 
    // It did NOT return 'pending_reviews_count' at top level. 
    // I should add it to metrics in backend or assume 0 for now.
    // Let's use 0 or provider.reviews_count logic if available.

    const todaysBookingsCount = metrics.todays_bookings ?? 0;

    const handleQuickAction = async (action) => {
        switch (action) {
            case 'new_booking':
                // Open new booking modal or navigate
                toast.success("Feature coming soon!");
                break;
            case 'availability':
                onNavigate('availability');
                break;
            case 'edit_profile':
                onNavigate('profile');
                break;
            case 'reports':
                try {
                    toast.loading('Generating report...', { id: 'reportGen' });
                    // Provide correct endpoint
                    const response = await api.get('/services/bookings/export_csv/', { responseType: 'blob' });
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `bookings_report_${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode.removeChild(link);
                    toast.success('Report downloaded', { id: 'reportGen' });
                } catch (error) {
                    console.error("Download failed", error);
                    toast.error('Failed to download report', { id: 'reportGen' });
                }
                break;
            default:
                break;
        }
    };

    const businessName = provider?.business_name || provider?.user?.first_name || 'Provider';

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* 1. Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back, {businessName}!</h1>
                    <p className="text-gray-500 text-sm mt-1">Here's what's happening with your business today.</p>
                </div>
                <Button variant="primary" className="bg-brand-primary hover:bg-brand-primary/90 text-white shadow-soft rounded-xl px-6">
                    New Booking
                </Button>
            </div>

            {/* 2. Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Verification Status"
                    badge={provider?.verification_status === 'verified' ? "Verified Business" : "Pending Verification"}
                    badgeColor={provider?.verification_status === 'verified' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}
                    subtext={provider?.verification_status === 'verified' ? "Your profile is fully visible" : "Complete steps to go live"}
                    subtextClass="text-gray-400"
                    icon={ShieldCheck}
                    iconColor={provider?.verification_status === 'verified' ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}
                />
                <StatsCard
                    title="Active Bookings"
                    value={totalBookings}
                    actionLabel="View all bookings"
                    onClick={() => onNavigate('bookings')}
                    icon={Calendar}
                    iconColor="bg-brand-primary/10 text-brand-primary"
                />
                <StatsCard
                    title="Pending Requests"
                    value={pendingRequests}
                    actionLabel="Manage requests"
                    onClick={() => onNavigate('bookings')}
                    icon={Clock}
                    iconColor="bg-orange-50 text-orange-600"
                    // Highlight if > 0
                    highlight={pendingRequests > 0}
                />
                <StatsCard
                    title="Revenue (Month)"
                    value={`$${monthEarnings.toLocaleString()}`}
                    subtext="Realized earnings"
                    subtextClass="text-green-600"
                    icon={DollarSign}
                    iconColor="bg-green-50 text-green-600"
                />
            </div>

            {/* 3. Today's Summary (Simplified for Phase 1) */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Today's Schedule</h3>
                    <p className="text-sm text-gray-500">
                        {todaysBookingsCount} bookings scheduled for today.
                        {/* Open • {provider?.hours?.[0]?.open_time || '08:00 AM'} - {provider?.hours?.[0]?.close_time || '08:00 PM'} */}
                    </p>
                </div>
                <div>
                    <Button
                        variant="outline"
                        onClick={() => onNavigate('calendar')}
                        className="border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                        View Calendar
                    </Button>
                </div>
            </div>

            {/* 4. Quick Actions */}
            <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <QuickActionCard icon={Plus} title="New Booking" onClick={() => handleQuickAction('new_booking')} />
                    <QuickActionCard icon={Clock} title="Availability" onClick={() => handleQuickAction('availability')} />
                    <QuickActionCard icon={UserPlus} title="Add Client" onClick={() => handleQuickAction('add_client')} />
                    <QuickActionCard icon={Image} title="Upload Photos" onClick={() => handleQuickAction('upload_photos')} />
                    <QuickActionCard icon={Edit} title="Edit Profile" onClick={() => handleQuickAction('edit_profile')} />
                    <QuickActionCard icon={FileText} title="Reports" onClick={() => handleQuickAction('reports')} />
                </div>
            </section>

            {/* 5. Bookings & Reviews Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RecentBookingsTable
                        bookings={recentPending}
                        // If no pending, maybe show recent bookings general?
                        title="Pending Requests"
                        onManage={(id) => onNavigate('bookings')}
                    />
                </div>
                <div className="lg:col-span-1">
                    <RecentReviewsList
                        // Pass dummy or real reviews if available in provider object
                        reviews={provider?.reviews?.slice(0, 5) || []}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
