import React from 'react';
import HeroSection from '../../components/LandingPage/HeroSection';
import ScrollingBanner from '../../components/common/ScrollingBanner';
import TrustSection from '../../components/LandingPage/TrustSection';
import FeaturesSection from '../../components/LandingPage/FeaturesSection';
import RehomingSection from '../../components/LandingPage/RehomingSection';
import AdoptionSection from '../../components/LandingPage/AdoptionSection';
import FAQSection from '../../components/LandingPage/FAQSection';
import CTASection from '../../components/LandingPage/CTASection';
import { Outlet } from 'react-router';

const HomePage = () => {
    return (
        <div className="flex flex-grow flex-col">
            <Outlet />
            {window.location.pathname === '/' && (
                <>
                    <HeroSection />
                    <ScrollingBanner />
                    <FeaturesSection />
                    <RehomingSection />
                    <AdoptionSection />
                    <TrustSection />
                    <CTASection />
                    <FAQSection />
                </>
            )}
        </div>
    );
};

export default HomePage;