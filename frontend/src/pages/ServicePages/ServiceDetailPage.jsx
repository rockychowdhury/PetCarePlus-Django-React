import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import useServices from '../../hooks/useServices';
import useAuth from '../../hooks/useAuth';

// Components
import ServiceHero from '../../components/Services/ServiceDetail/ServiceHero';
import ServiceTabs from '../../components/Services/ServiceDetail/ServiceTabs';
import OverviewTab from '../../components/Services/ServiceDetail/Tabs/OverviewTab';
import ServicesTab from '../../components/Services/ServiceDetail/Tabs/ServicesTab';
import ReviewsTab from '../../components/Services/ServiceDetail/Tabs/ReviewsTab';
import AboutTab from '../../components/Services/ServiceDetail/Tabs/AboutTab';
import BookingModal from '../../components/Services/BookingModal';
import ServiceGalleryModal from '../../components/Services/ServiceDetail/ServiceGalleryModal';
import ContactModal from '../../components/Services/ServiceDetail/ContactModal';

const ServiceDetailPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { useGetProvider } = useServices();
    const { user } = useAuth();
    const { data: provider, isLoading } = useGetProvider(id);

    // State
    const [activeTab, setActiveTab] = useState('overview');
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [selectedServiceForBooking, setSelectedServiceForBooking] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false); // Mock state for now

    // Initial Tab from URL
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['overview', 'services', 'reviews', 'about'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Handlers
    const handleOpenBooking = (service = null) => {
        if (!user) {
            toast.error("Please login to book a service");
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        if (user.role === 'service_provider') {
            toast.error("Service Providers cannot book services");
            return;
        }

        if (user.role === 'admin') {
            toast.error("Admins cannot book services");
            return;
        }

        setSelectedServiceForBooking(service);
        setIsBookingModalOpen(true);
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        } catch (err) {
            console.error('Failed to copy link:', err);
            toast.error("Failed to copy link");
        }
    };

    const handleToggleFavorite = () => {
        setIsFavorite(!isFavorite);
        toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
    };

    const scrollToMap = () => {
        setActiveTab('about');
        setTimeout(() => {
            document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSwitchTab = (tabName) => {
        setActiveTab(tabName);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Render Loading
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
                <Loader className="animate-spin text-brand-primary" size={32} />
            </div>
        );
    }

    // Render Error
    if (!provider) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
                <h2 className="text-xl font-bold">Provider not found</h2>
            </div>
        );
    }

    const galleryImages = provider.media || [];

    return (
        <div className="min-h-screen bg-[#FEF9ED] pb-24">
            <ServiceHero
                provider={provider}
                onBook={() => handleOpenBooking()}
                onContact={() => setIsContactModalOpen(true)}
                onShare={handleShare}
                onFavorite={handleToggleFavorite}
                isFavorite={isFavorite}
            />

            <ServiceTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-12">
                {activeTab === 'overview' && (
                    <OverviewTab
                        provider={provider}
                        onViewMap={scrollToMap}
                        onReadReviews={() => handleSwitchTab('reviews')}
                    />
                )}

                {activeTab === 'services' && (
                    <ServicesTab provider={provider} onBook={handleOpenBooking} />
                )}

                {activeTab === 'reviews' && (
                    <ReviewsTab provider={provider} />
                )}

                {activeTab === 'about' && (
                    <AboutTab provider={provider} onContact={() => setIsContactModalOpen(true)} />
                )}
            </div>

            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                provider={provider}
                initialService={selectedServiceForBooking}
            />

            <ServiceGalleryModal
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                images={galleryImages}
            />

            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                provider={provider}
            />
            <Toaster position="bottom-center" />
        </div>
    );
};

export default ServiceDetailPage;
