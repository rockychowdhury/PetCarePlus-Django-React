import React from 'react'
import { motion } from 'framer-motion'
import PageLayout from '../components/layout/PageLayout'
import HeroSection from '../components/home/HeroSection'
import FeaturesGrid from '../components/home/FeaturesGrid'
import HowItWorks from '../components/home/HowItWorks'
import FeatureShowcase from '../components/home/FeatureShowcase'
import FAQ from '../components/home/FAQ'
import CTAFooter from '../components/home/CTAFooter'

const FadeInUp = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 60 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }}
  >
    {children}
  </motion.div>
)

export const Home = () => {
  return (
    <PageLayout>
      <div className="flex flex-col w-full min-h-screen overflow-x-hidden">
        {/* Section 1: Hero — Immediate fade in without scroll */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
        >
          <HeroSection />
        </motion.div>

        {/* Section 2: How It Works */}
        <FadeInUp delay={0.1}>
          <HowItWorks />
        </FadeInUp>

        {/* Section 3: FeaturesGrid */}
        <FadeInUp delay={0.1}>
          <FeaturesGrid />
        </FadeInUp>

        {/* Section 4: Detailed Feature Showcase */}
        <FadeInUp delay={0.1}>
          <FeatureShowcase />
        </FadeInUp>

        {/* Section 5: Frequently Asked Questions */}
        <FadeInUp delay={0.1}>
          <FAQ />
        </FadeInUp>

        {/* Section 6: Call-to-Action Footer */}
        <FadeInUp delay={0.1}>
          <CTAFooter />
        </FadeInUp>
      </div>
    </PageLayout>
  )
}

export default Home
