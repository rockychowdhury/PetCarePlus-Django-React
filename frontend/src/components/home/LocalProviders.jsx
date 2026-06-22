import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocalProviders } from '../../hooks/useLocalProviders'
import { useLanguage } from '../../hooks/useLanguage'
import { useAuthStore } from '../../store/authStore'
import { useLocationStore } from '../../store/locationStore'
import { BANGLADESH_GEOGRAPHY } from '../../utils/geo'
import ProviderCard from '../providers/ProviderCard'
import Spinner from '../ui/Spinner'
import { ArrowRight, Stethoscope, Scissors, UserCheck, LayoutGrid, Dumbbell, Pill, MapPin, Info, CalendarRange, Sparkles } from 'lucide-react'

export const LocalProviders = ({ activeAnimalId }) => {
  const { language, t } = useLanguage()
  const { user } = useAuthStore()
  const { division, district, upazila } = useLocationStore()
  const [activeTab, setActiveTab] = useState('all')

  const queryFilters = {
    page_size: 4,
  }

  if (activeTab !== 'all') {
    queryFilters.provider_type = activeTab
  }
  if (activeAnimalId) {
    queryFilters.animal_type = activeAnimalId
  }

  // Fetch scoped local providers using our custom hook!
  const { data, isLoading } = useLocalProviders(queryFilters)
  const providers = data?.results || []

  const tabs = [
    { id: 'all', label: t('providers.types.all'), icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'vet', label: t('providers.types.vet'), icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'groomer', label: t('providers.types.groomer'), icon: <Scissors className="w-4 h-4" /> },
    { id: 'sitter', label: t('providers.types.sitter'), icon: <UserCheck className="w-4 h-4" /> },
    { id: 'trainer', label: t('providers.types.trainer'), icon: <Dumbbell className="w-4 h-4" /> },
    { id: 'pharmacy', label: t('providers.types.pharmacy'), icon: <Pill className="w-4 h-4" /> },
  ]

  // Formulate active scoping string dynamically
  const activeDiv = user?.division || division
  const activeDist = user?.district || district
  const activeUp = user?.upazila || upazila

  const divisionName = BANGLADESH_GEOGRAPHY.divisions.find(d => d.id === activeDiv)
  const divisionText = divisionName ? (language === 'bn' ? divisionName.name_bn : divisionName.name_en) : ''
  const districtText = activeDist ? activeDist.charAt(0).toUpperCase() + activeDist.slice(1) : ''
  const upazilaText = activeUp ? activeUp : ''

  const scopingLabel = activeUp 
    ? `${upazilaText}, ${districtText}` 
    : (activeDist ? districtText : (activeDiv ? divisionText : (language === 'bn' ? 'সমগ্র বাংলাদেশ' : 'Nationwide Scoping')))

  return (
    <section className="py-16 bg-gradient-to-b from-pcp-green-bg/50 via-background to-background border-b border-pcp-green-light/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="space-y-1.5 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-bold border border-primary/20">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ভেটেরিনারি নেটওয়ার্ক ও ডিরেক্টরি' : 'Veterinary Care & Provider Network'}</span>
            </div>
            
            <h2 className="text-xl md:text-3xl font-extrabold text-pcp-text-primary tracking-tight">
              {t('providers.title')}
            </h2>
            
            <p className="text-xs md:text-sm text-pcp-text-secondary font-semibold">
              {t('providers.subtitle')}
            </p>
          </div>

          <Link
            to="/providers"
            className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-extrabold text-primary hover:text-pcp-green-hover transition-colors border-b-2 border-transparent hover:border-primary pb-0.5"
          >
            <span>{language === 'bn' ? 'সকল সেবাদাতা ডিরেক্টরি' : 'Browse All Providers'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Cascade Scoping Badge & Twin Feature Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Scoping Explanation Card */}
          <div className="lg:col-span-5 bg-card border border-pcp-green-light/45 rounded-2xl p-5 shadow-sm text-left flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full flex items-center gap-1 border border-primary/20">
                  <MapPin className="w-3 h-3 text-pcp-green-accent" />
                  {language === 'bn' ? 'স্মার্ট রাউটিং সক্রিয়' : 'Smart Routing Active'}
                </span>
                
                {/* Visual indicator of scoping tier */}
                <span className="text-[10px] font-extrabold text-pcp-text-secondary bg-pcp-green-muted/40 px-2 py-0.5 rounded border border-pcp-green-light/20">
                  {scopingLabel}
                </span>
              </div>

              <h4 className="text-sm font-extrabold text-pcp-text-primary">
                {language === 'bn' ? 'পণ্য ও ডাক্তার সন্ধান পদ্ধতি' : 'Automatic Cascade Scoping Rules'}
              </h4>

              <p className="text-[11px] sm:text-xs text-pcp-text-secondary leading-relaxed font-semibold">
                {language === 'bn'
                  ? 'আপনার নির্বাচিত এলাকার ওপর ভিত্তি করে ক্যাসকেড অ্যালগরিদম প্রথমে আপনার উপজেলায় ডাক্তার খোঁজে। না পাওয়া গেলে জেলায়, তারপর বিভাগে এবং সবশেষে দেশব্যাপী ডাক্তারদের তালিকা পর্যায়ক্রমে প্রসারিত করে।'
                  : 'Based on active filters, the search scopes Upazila first. If zero matches exist, it automatically extends scope to District, Division, & National levels dynamically.'}
              </p>
            </div>

            <div className="pt-3 border-t border-pcp-green-light/10 text-[10px] sm:text-xs text-pcp-text-muted space-y-1">
              <span className="font-bold block text-pcp-text-secondary">{language === 'bn' ? 'খুঁজুন ও বুক করুন:' : 'Locate & Appoint:'}</span>
              <p>{language === 'bn' ? '১. উপরে প্রাণীর ধরণ নির্বাচন করুন।' : '1. Filter services instantly by selecting an animal above.'}</p>
              <p>{language === 'bn' ? '২. নিচের ট্যাবে ভেট বা ফার্মেসি ফিল্টার বাছুন।' : '2. Narrow by doctor, groomer, or livestock pharmacy.'}</p>
            </div>
          </div>

          {/* Owner vs Provider Twin Card */}
          <div className="lg:col-span-7 bg-card border border-pcp-green-light/45 rounded-2xl p-5 shadow-sm text-left grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-2 border-b sm:border-b-0 sm:border-r border-pcp-green-light/20 pb-3 sm:pb-0 sm:pr-4 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider block w-max">
                  {language === 'bn' ? 'মালিকদের জন্য' : 'For Pet/Farm Owners'}
                </span>
                <h5 className="text-xs sm:text-sm font-extrabold text-pcp-text-primary">
                  {language === 'bn' ? 'সহজ ভেট বুকিং ও সেবা রিভিউ' : 'Easy Doctor Booking'}
                </h5>
                <p className="text-[11px] text-pcp-text-muted leading-relaxed">
                  {language === 'bn'
                    ? 'নিকটস্থ অভিজ্ঞ ডাক্তারের সিরিয়াল বুক করুন এবং তার দেওয়া সেবা কেমন ছিল তার রেটিং দিন।'
                    : 'Browse local vet cards, review pricing list, select schedule times, and post feedback after completion.'}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-primary font-bold">
                <CalendarRange className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'অনলাইন অ্যাপয়েন্টমেন্ট' : 'Digital scheduling enabled'}</span>
              </div>
            </div>

            <div className="space-y-2 flex flex-col justify-between pt-1 sm:pt-0">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-pcp-green-accent bg-pcp-green-accent/10 px-2 py-0.5 rounded-full uppercase tracking-wider block w-max border border-pcp-green-accent/20">
                  {language === 'bn' ? 'সেবাদাতাদের জন্য' : 'For Care Providers'}
                </span>
                <h5 className="text-xs sm:text-sm font-extrabold text-pcp-text-primary">
                  {language === 'bn' ? 'রেজিস্ট্রেশন করুন ও বুকিং পান' : 'Gain Verified Badge'}
                </h5>
                <p className="text-[11px] text-pcp-text-muted leading-relaxed">
                  {language === 'bn'
                    ? 'আপনার প্রফেশনাল লাইসেন্স বা সেবা তালিকা আপলোড করে ভেরিফায়েড ব্যাজ অর্জন করুন এবং এলাকা থেকে বুকিং নিন।'
                    : 'Register profile, publish custom services with pricing & duration, obtain verification status, and collect bookings.'}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-pcp-green-accent font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ভেরিফায়েড সেবাদাতা ব্যাজ' : 'Verification badge indicator'}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full border transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-card border-pcp-green-light/60 text-pcp-text-secondary hover:text-pcp-text-primary hover:bg-pcp-green-muted/20'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Loading Skeletons or Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="border border-pcp-green-light/40 bg-card rounded-2xl p-5 space-y-4 animate-pulse"
              >
                <div className="w-1/2 h-4 bg-pcp-green-muted rounded" />
                <div className="w-3/4 h-5 bg-pcp-green-muted rounded" />
                <div className="w-full h-8 bg-pcp-green-muted rounded-lg" />
              </div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-12 px-4 bg-card rounded-2xl border border-dashed border-pcp-green-light/60">
            <p className="text-sm font-bold text-pcp-text-secondary">
              {t('providers.no_providers')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {providers.map((provider) => (
              <div key={provider.id} className="animate-fade-in-up hover:-translate-y-1 transition-all duration-300">
                <ProviderCard provider={provider} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default LocalProviders
