import React, { useRef, useState } from 'react'
import PageLayout from '../components/layout/PageLayout'
import HeroSection from '../components/home/HeroSection'
import AIPreviewSection from '../components/home/AIPreviewSection'
import AnimalQuickFilter from '../components/home/AnimalQuickFilter'
import GuidelinesPreview from '../components/home/GuidelinesPreview'
import LocalProviders from '../components/home/LocalProviders'
import VaccinationLookup from '../components/home/VaccinationLookup'
import RehomingPreview from '../components/home/RehomingPreview'
import GovtResourcesPreview from '../components/home/GovtResourcesPreview'

export const Home = () => {
  const [activeAnimalId, setActiveAnimalId] = useState(null)
  
  const providersRef = useRef(null)
  const aiRef = useRef(null)

  const handleScrollToProviders = () => {
    providersRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleScrollToAI = () => {
    aiRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <PageLayout>
      <div className="flex flex-col w-full min-h-screen">
        {/* Section 1: Hero */}
        <HeroSection
          onScrollToProviders={handleScrollToProviders}
          onScrollToAI={handleScrollToAI}
        />

        {/* Section 2: AI Assistant Preview */}
        <div ref={aiRef}>
          <AIPreviewSection />
        </div>

        {/* Section 3: Animal Quick Filter */}
        <AnimalQuickFilter
          activeAnimalId={activeAnimalId}
          onSelectAnimal={setActiveAnimalId}
        />

        {/* Section 4: Guidelines Preview */}
        <GuidelinesPreview activeAnimalId={activeAnimalId} />

        {/* Section 5: Local Providers */}
        <div ref={providersRef}>
          <LocalProviders activeAnimalId={activeAnimalId} />
        </div>

        {/* Section 6: Vaccination Quick Lookup */}
        <VaccinationLookup activeAnimalId={activeAnimalId} />

        {/* Section 7: Rehoming Listings Preview */}
        <RehomingPreview />

        {/* Section 8: Government Resources Preview */}
        <GovtResourcesPreview />
      </div>
    </PageLayout>
  )
}

export default Home
