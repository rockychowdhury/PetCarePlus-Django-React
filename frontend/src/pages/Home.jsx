import React from 'react'
import PageLayout from '../components/layout/PageLayout'
import HeroSection from '../components/home/HeroSection'
import FeaturesGrid from '../components/home/FeaturesGrid'
import HowItWorks from '../components/home/HowItWorks'
import FeatureShowcase from '../components/home/FeatureShowcase'
import FAQ from '../components/home/FAQ'
import CTAFooter from '../components/home/CTAFooter'

export const Home = () => {
  return (
    <PageLayout>
      <div className="flex flex-col w-full min-h-screen">
        {/* Section 1: Hero — Bold centered headline + bento stat cards */}
        <HeroSection />

        {/* Section 2: How It Works — 3-step visual flow */}
        <HowItWorks />

        {/* Section 3: FeaturesGrid — Bento grid of all features */}
        <FeaturesGrid />

        {/* Section 4: Detailed Feature Showcase (Rehoming, AI, Providers, Resources) */}
        <FeatureShowcase />

        {/* Section 5: Frequently Asked Questions */}
        <FAQ />

        {/* Section 6: Call-to-Action Footer — Green gradient banner */}
        <CTAFooter />
      </div>
    </PageLayout>
  )
}

export default Home
