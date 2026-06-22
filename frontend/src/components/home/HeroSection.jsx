import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useLocationStore } from '../../store/locationStore'
import { useLanguage } from '../../hooks/useLanguage'
import { BANGLADESH_GEOGRAPHY } from '../../utils/geo'
import { authApi } from '../../api/auth'
import { MapPin, Sparkles, Stethoscope, CheckCircle2, ChevronRight, Compass } from 'lucide-react'

export const HeroSection = ({ onScrollToProviders, onScrollToAI }) => {
  const { language, t } = useLanguage()
  const { user, setUser } = useAuthStore()
  
  // Location store
  const {
    division: anonDivision,
    district: anonDistrict,
    upazila: anonUpazila,
    setLocation,
  } = useLocationStore()

  // State for selectors
  const [selectedDivision, setSelectedDivision] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [upazilaInput, setUpazilaInput] = useState('')

  // Sync state with active location values
  useEffect(() => {
    if (user) {
      setSelectedDivision(user.division || '')
      setSelectedDistrict(user.district || '')
      setUpazilaInput(user.upazila || '')
    } else {
      setSelectedDivision(anonDivision || '')
      setSelectedDistrict(anonDistrict || '')
      setUpazilaInput(anonUpazila || '')
    }
  }, [user, anonDivision, anonDistrict, anonUpazila])

  const handleDivisionChange = (e) => {
    const div = e.target.value
    setSelectedDivision(div)
    setSelectedDistrict('')
    updateLocationState(div, '', upazilaInput)
  }

  const handleDistrictChange = (e) => {
    const dist = e.target.value
    setSelectedDistrict(dist)
    updateLocationState(selectedDivision, dist, upazilaInput)
  }

  const handleUpazilaBlur = (e) => {
    const upazila = e.target.value
    setUpazilaInput(upazila)
    updateLocationState(selectedDivision, selectedDistrict, upazila)
  }

  const updateLocationState = async (division, district, upazila) => {
    if (user) {
      try {
        const updatedUser = await authApi.updateMe({ division, district, upazila })
        setUser(updatedUser)
      } catch (err) {
        console.error('Failed to sync location to profile:', err)
      }
    } else {
      setLocation({ division, district, upazila })
    }
  }

  const activeDistricts = BANGLADESH_GEOGRAPHY.districts[selectedDivision] || []

  return (
    <div className="relative bg-gradient-to-b from-pcp-green-muted/30 via-pcp-green-bg/60 to-background py-16 md:py-24 overflow-hidden border-b border-pcp-green-light/20">
      {/* Background Micro-Decoration (Premium Green Glow) */}
      <div className="absolute inset-0 z-0 opacity-60">
        <div className="absolute -top-10 left-10 w-72 h-72 bg-pcp-green-light/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pcp-green-accent/5 rounded-full blur-3xl" />
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Headline & Premium Scoping Showcase */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold animate-pulse-subtle border border-primary/20">
              <Sparkles className="w-3.5 h-3.5 fill-current text-pcp-green-accent" />
              <span className="tracking-wide">
                {language === 'bn' ? 'বাংলাদেশি পশু ও খামার ডিজিটাল সেবা' : 'Bangladesh Digital Pet & Farm Network'}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-pcp-text-primary leading-[1.15] tracking-tight">
              {t('hero.title')}
            </h1>

            <p className="text-sm md:text-base text-pcp-text-secondary max-w-xl mx-auto lg:mx-0 leading-relaxed font-semibold">
              {t('hero.subtitle')}
            </p>

            {/* Smart Scoping Feature Showcase Board */}
            <div className="bg-card/70 backdrop-blur-sm border border-pcp-green-light/35 rounded-2xl p-5 text-left max-w-2xl mx-auto lg:mx-0 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-primary/10 text-primary">
                  <Compass className="w-4 h-4" />
                </div>
                <h4 className="text-xs sm:text-sm font-extrabold text-pcp-text-primary">
                  {language === 'bn' ? 'স্মার্ট লোকাল রাউটিং ফিচার গাইড' : 'Smart Local Scoping Feature Guide'}
                </h4>
              </div>
              
              <p className="text-[11px] sm:text-xs text-pcp-text-secondary leading-relaxed">
                {language === 'bn' 
                  ? 'আপনার সঠিক এলাকা নির্বাচন করা থাকলে পুরো প্ল্যাটফর্ম স্বয়ংক্রিয়ভাবে চট্টগ্রামের পাহাড়তলী থেকে শুরু করে কক্সবাজারের রামু পর্যন্ত আপনার সবচেয়ে কাছের সুযোগ-সুবিধাগুলো সামনে তুলে ধরে।'
                  : 'By configuring your exact geographic parameters, PetCarePlus filters local government healthcare assets, emergency networks, and local clinics specific to your village.'}
              </p>

              {/* Step-by-Step Flow Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1.5">
                <div className="p-2.5 rounded-xl bg-pcp-green-muted/30 border border-pcp-green-light/20 flex gap-2">
                  <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <div className="text-[10px] text-pcp-text-primary">
                    <span className="font-bold block">{language === 'bn' ? 'বিভাগ বাছুন' : 'Select Division'}</span>
                    <span className="text-pcp-text-muted">{language === 'bn' ? 'সংশ্লিষ্ট জেলার তালিকা আনে' : 'Loads target districts'}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-pcp-green-muted/30 border border-pcp-green-light/20 flex gap-2">
                  <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <div className="text-[10px] text-pcp-text-primary">
                    <span className="font-bold block">{language === 'bn' ? 'জেলা বাছুন' : 'Select District'}</span>
                    <span className="text-pcp-text-muted">{language === 'bn' ? 'টিকা ও হাসপাতালের তালিকা ফিল্টার করে' : 'Filters vaccines & government labs'}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-pcp-green-muted/30 border border-pcp-green-light/20 flex gap-2">
                  <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <div className="text-[10px] text-pcp-text-primary">
                    <span className="font-bold block">{language === 'bn' ? 'উপজেলা লিখুন' : 'Write Upazila'}</span>
                    <span className="text-pcp-text-muted">{language === 'bn' ? 'নিকটবর্তী ডাক্তারদের দূরত্ব মাপে' : 'Calculates closest provider bookings'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onScrollToAI}
                className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-pcp-green-hover text-white font-bold rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] border border-transparent"
              >
                <Sparkles className="w-4 h-4 fill-current text-pcp-green-accent animate-bounce" />
                <span>{t('hero.cta_ai')}</span>
              </button>
              <button
                onClick={onScrollToProviders}
                className="w-full sm:w-auto px-6 py-3 border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Stethoscope className="w-4 h-4" />
                <span>{t('hero.cta_providers')}</span>
              </button>
            </div>
          </div>

          {/* Right: Premium Location Card */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="w-full max-w-sm bg-card border-2 border-primary/10 rounded-3xl p-6 shadow-xl space-y-5 animate-fade-in-up relative overflow-hidden group hover:border-primary/25 transition-all">
              {/* Glowing card outline on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/0 pointer-events-none" />
              
              <div className="flex items-center gap-3 pb-3 border-b border-pcp-green-light/20 relative z-10">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <MapPin className="w-6 h-6 flex-shrink-0 animate-bounce" />
                </div>
                <div className="text-left">
                  <h3 className="font-extrabold text-sm sm:text-base text-pcp-text-primary">
                    {t('hero.location_title')}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-pcp-text-secondary leading-normal">
                    {language === 'bn' ? 'নিকটস্থ সেবা এবং তথ্য মেলাতে এটি ব্যবহার করা হয়' : 'Used to filter resources within your district circle'}
                  </p>
                </div>
              </div>

              {/* Division Select */}
              <div className="space-y-1.5 text-left relative z-10">
                <label className="text-xs font-bold text-pcp-text-secondary block">
                  {t('hero.select_division')}
                </label>
                <select
                  value={selectedDivision}
                  onChange={handleDivisionChange}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-pcp-green-light/60 bg-pcp-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-semibold text-pcp-text-primary transition-all"
                >
                  <option value="">-- {t('hero.select_division')} --</option>
                  {BANGLADESH_GEOGRAPHY.divisions.map((div) => (
                    <option key={div.id} value={div.id}>
                      {language === 'bn' ? div.name_bn : div.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Select */}
              <div className="space-y-1.5 text-left relative z-10">
                <label className="text-xs font-bold text-pcp-text-secondary block">
                  {t('hero.select_district')}
                </label>
                <select
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  disabled={!selectedDivision}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-pcp-green-light/60 bg-pcp-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-semibold text-pcp-text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">-- {t('hero.select_district')} --</option>
                  {activeDistricts.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {language === 'bn' ? dist.name_bn : dist.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upazila Input */}
              <div className="space-y-1.5 text-left relative z-10">
                <label className="text-xs font-bold text-pcp-text-secondary block">
                  {t('hero.select_upazila')}
                </label>
                <input
                  type="text"
                  value={upazilaInput}
                  onChange={(e) => setUpazilaInput(e.target.value)}
                  onBlur={handleUpazilaBlur}
                  disabled={!selectedDistrict}
                  placeholder={language === 'bn' ? 'যেমন: বোয়ালখালী' : 'e.g. Boalkhali'}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-pcp-green-light/60 bg-pcp-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-semibold text-pcp-text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection
