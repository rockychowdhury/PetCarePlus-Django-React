import React from 'react';
import HeroSection from '../../components/LandingPage/HeroSection';
import ScrollingBanner from '../../components/common/ScrollingBanner';
import TrustSection from '../../components/LandingPage/TrustSection';
import FeaturesSection from '../../components/LandingPage/FeaturesSection';
import RehomingSection from '../../components/LandingPage/RehomingSection';
import AdoptionSection from '../../components/LandingPage/AdoptionSection';
import FAQSection from '../../components/LandingPage/FAQSection';
import CTASection from '../../components/LandingPage/CTASection';
import Footer from '../../components/LandingPage/Footer';
import Navbar from '../../components/common/Navbar';
import { Outlet } from 'react-router';

const HomePage = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow ">
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
                        <CTASection />
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;