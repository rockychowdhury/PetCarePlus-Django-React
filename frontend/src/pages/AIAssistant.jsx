import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAIDiagnose } from '../hooks/useAISession'
import { guidelinesApi } from '../api/guidelines'
import { useLanguage } from '../hooks/useLanguage'
import { useAuthStore } from '../store/authStore'
import { getAnimalIcon, ANIMAL_THEMES } from '../utils/animals'
import { getUrgencyStyles } from '../utils/urgency'
import { BANGLADESH_GEOGRAPHY } from '../utils/geo'
import PageLayout from '../components/layout/PageLayout'
import DiagnosisCard from '../components/ai/DiagnosisCard'
import WarningSignsCard from '../components/ai/WarningSignsCard'
import PositiveSignsCard from '../components/ai/PositiveSignsCard'
import ProviderSuggestionCard from '../components/ai/ProviderSuggestionCard'
import ResourceCard from '../components/ai/ResourceCard'
import GovtVetCard from '../components/ai/GovtVetCard'
import UrgencyIndicator from '../components/ai/UrgencyIndicator'
import Spinner from '../components/ui/Spinner'
import {
  Send,
  Sparkles,
  RefreshCw,
  Stethoscope,
  HandHeart,
  ShieldAlert,
  BookOpenCheck,
  MapPin,
  Info,
  ArrowRight,
  Brain,
  Lightbulb,
} from 'lucide-react'


// Example prompts for inspiration
const EXAMPLE_PROMPTS = {
  bn: [
    'আমার গরু ৩ দিন ধরে কিছু খাচ্ছে না, জ্বর আছে এবং নাক দিয়ে পানি পড়ছে',
    'আমার বিড়াল বমি করছে এবং অলস হয়ে গেছে, খাবার খেতে চাইছে না',
    'কুকুরের পায়ে ক্ষত হয়েছে, ফুলে গেছে এবং পুঁজ বের হচ্ছে',
    'ছাগলের পেট ফুলে গেছে, হাঁটতে পারছে না, কী করা উচিত?',
    'মুরগির ডিম দেওয়া কমে গেছে, পালক ঝরে পড়ছে',
    'গরুকে কৃমিনাশক ওষুধ কখন ও কিভাবে দিতে হয়?',
  ],
  en: [
    'My cow has not eaten for 3 days, has fever and nasal discharge',
    'My cat is vomiting and lethargic, refuses to eat',
    'Dog has a swollen wound on its paw with pus coming out',
    'Goat has a bloated stomach and cannot walk, what should I do?',
    'Chicken egg production has decreased, feathers are falling out',
    'When and how should I deworm my cattle?',
  ],
}

export const AIAssistant = () => {
  const { language, t } = useLanguage()
  const user = useAuthStore((s) => s.user)
  const resultsRef = useRef(null)

  // AI Hook
  const { result, isLoading, error, submitDiagnosis, resetDiagnosis } = useAIDiagnose()

  // Form state
  const [selectedAnimal, setSelectedAnimal] = useState(null)
  const [problemText, setProblemText] = useState('')
  const [division, setDivision] = useState('')
  const [district, setDistrict] = useState('')
  const [geoStatus, setGeoStatus] = useState('idle') // idle | loading | success | denied
  const [geoCoords, setGeoCoords] = useState(null)

  // Fetch animal types
  const { data: animalTypes, isLoading: isLoadingAnimals } = useQuery({
    queryKey: ['animalTypes'],
    queryFn: guidelinesApi.getAnimalTypes,
  })

  // Try browser geolocation on mount (for anonymous users)
  useEffect(() => {
    if (user?.latitude && user?.longitude) {
      setGeoCoords({ lat: user.latitude, lng: user.longitude })
      setGeoStatus('success')
      setDivision(user.division || '')
      setDistrict(user.district || '')
      return
    }

    if (navigator.geolocation) {
      setGeoStatus('loading')
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeoCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setGeoStatus('success')
        },
        () => {
          setGeoStatus('denied')
        },
        { timeout: 8000, enableHighAccuracy: false }
      )
    } else {
      setGeoStatus('denied')
    }
  }, [user])

  // Scroll to results when loaded
  useEffect(() => {
    if (result) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)
    }
  }, [result])

  // Districts for selected division
  const availableDistricts = division ? BANGLADESH_GEOGRAPHY.districts[division] || [] : []

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedAnimal || !problemText.trim() || isLoading) return

    const payload = {
      animal_type_id: selectedAnimal.id,
      problem_description: problemText.trim(),
      preferred_language: language,
    }

    // Add location
    if (geoCoords) {
      payload.user_latitude = geoCoords.lat
      payload.user_longitude = geoCoords.lng
    }
    if (division) payload.user_division = division
    if (district) payload.user_district = district

    try {
      await submitDiagnosis(payload)
    } catch (err) {
      // error state handled by hook
    }
  }

  const handleReset = () => {
    resetDiagnosis()
    setSelectedAnimal(null)
    setProblemText('')
  }

  const handleExampleClick = (prompt) => {
    setProblemText(prompt)
  }

  // Extract data from result
  const aiResponse = result?.ai_response
  const queryType = result?.query_type
  const diagnosis = aiResponse?.diagnosis
  const urgency = aiResponse?.urgency
  const warningData = aiResponse?.warning_signs
  const positiveData = aiResponse?.positive_signs
  const guidedResponse = aiResponse?.guided_response
  const providers = result?.providers || []
  const resources = result?.resources || []
  const govtVets = result?.govt_vets || []
  const suggestLivestockOfficer = aiResponse?.suggest_livestock_officer

  return (
    <PageLayout>
      <div className="bg-pcp-surface/20 min-h-screen border-b border-border/40">
        
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-primary/5 via-pcp-surface/30 to-accent/5 py-8 md:py-12 border-b border-border/40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 max-w-2xl mx-auto animate-fade-in">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                <Sparkles className="w-3.5 h-3.5 fill-current text-accent animate-pulse" />
                <span>Gemini 2.5 Flash AI</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-foreground tracking-tight leading-snug">
                {language === 'bn' ? 'এআই পশু চিকিৎসা সহকারী' : 'AI Veterinary Diagnostic Assistant'}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
                {language === 'bn'
                  ? 'আপনার পশুর সমস্যা বিস্তারিত লিখুন। এআই রোগ নির্ণয়, চিকিৎসা পরামর্শ, সতর্কতা সংকেত, নিকটতম ডাক্তার ও প্রাসঙ্গিক তথ্য একসাথে প্রদান করবে।'
                  : 'Describe your animal\'s problem in detail. AI will provide diagnosis, care advice, warning signs, local providers, and related resources — all in one go.'}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* ═══════════════════ INPUT FORM ═══════════════════ */}
          {!result && (
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">

              {/* Step 1: Animal Selection */}
              <div className="bg-card border border-border/80 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <span className="text-base">🐾</span>
                  </div>
                  <div>
                    <h2 className="text-sm md:text-base font-extrabold text-foreground">
                      {language === 'bn' ? 'পশুর ধরন নির্বাচন করুন' : 'Select Animal Type'}
                    </h2>
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      {language === 'bn' ? 'কোন প্রাণীর সমস্যা?' : 'Which animal has the issue?'}
                    </p>
                  </div>
                </div>

                {isLoadingAnimals ? (
                  <Spinner className="py-4" />
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {animalTypes?.map((animal) => {
                      const Icon = getAnimalIcon(animal.slug)
                      const theme = ANIMAL_THEMES[animal.slug] || ANIMAL_THEMES.cat
                      const isSelected = selectedAnimal?.id === animal.id
                      return (
                        <button
                          key={animal.id}
                          type="button"
                          onClick={() => setSelectedAnimal(animal)}
                          className={`flex flex-col items-center justify-center p-2.5 md:p-3 rounded-xl border text-center transition-all group ${
                            isSelected
                              ? 'ring-2 ring-primary border-primary bg-primary/10 shadow-md scale-[1.02]'
                              : `${theme.bg} ${theme.border} hover:shadow-sm`
                          }`}
                        >
                          <Icon
                            className={`w-5 sm:w-6 h-5 sm:h-6 mb-1 ${
                              isSelected ? 'text-primary' : theme.text
                            } group-hover:scale-110 transition-transform`}
                          />
                          <span className={`text-[9px] sm:text-[10px] font-bold leading-tight ${
                            isSelected ? 'text-primary' : 'text-foreground'
                          }`}>
                            {language === 'bn' ? animal.name_bn : animal.name_en}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Step 2: Problem Description */}
              <div className="bg-card border border-border/80 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm md:text-base font-extrabold text-foreground">
                      {language === 'bn' ? 'সমস্যা বিস্তারিত লিখুন' : 'Describe the Problem'}
                    </h2>
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      {language === 'bn'
                        ? 'লক্ষণ, সময়কাল, খাওয়ার অবস্থা ইত্যাদি যত বিস্তারিত লিখবেন, তত ভালো পরামর্শ পাবেন'
                        : 'The more details you provide about symptoms, duration, and eating habits, the better advice you\'ll receive'}
                    </p>
                  </div>
                </div>

                <textarea
                  id="ai-problem-input"
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  placeholder={
                    language === 'bn'
                      ? 'উদাহরণ: আমার গরু ৩ দিন ধরে কিছু খাচ্ছে না, জ্বর আছে, নাক দিয়ে পানি পড়ছে...'
                      : 'Example: My cow has not eaten for 3 days, has fever and nasal discharge...'
                  }
                  rows={4}
                  maxLength={3000}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-pcp-surface/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none transition-all placeholder:text-muted-foreground/60"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {problemText.length}/3000
                  </span>
                </div>

                {/* Example prompts */}
                <div className="space-y-2">
                  <p className="text-[10px] md:text-xs font-bold text-muted-foreground flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    {language === 'bn' ? 'উদাহরণ (ক্লিক করুন):' : 'Example prompts (click):'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(EXAMPLE_PROMPTS[language] || EXAMPLE_PROMPTS.bn).slice(0, 4).map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleExampleClick(prompt)}
                        className="px-2.5 py-1 bg-muted/50 hover:bg-primary/10 text-[10px] md:text-xs text-muted-foreground hover:text-primary font-medium rounded-lg border border-border/50 hover:border-primary/30 transition-all line-clamp-1 max-w-[280px]"
                      >
                        {prompt.length > 50 ? prompt.slice(0, 50) + '...' : prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 3: Location (shown when geolocation denied and user not logged in) */}
              {geoStatus === 'denied' && !user && (
                <div className="bg-card border border-border/80 rounded-2xl p-5 md:p-6 shadow-sm space-y-4 animate-fade-in-up">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm md:text-base font-extrabold text-foreground">
                        {language === 'bn' ? 'আপনার অবস্থান (ঐচ্ছিক)' : 'Your Location (Optional)'}
                      </h2>
                      <p className="text-[10px] md:text-xs text-muted-foreground">
                        {language === 'bn'
                          ? 'নিকটতম ডাক্তার খুঁজে পেতে আপনার এলাকা নির্বাচন করুন'
                          : 'Select your area to find the nearest service providers'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={division}
                      onChange={(e) => {
                        setDivision(e.target.value)
                        setDistrict('')
                      }}
                      className="px-3 py-2.5 rounded-xl border border-border bg-pcp-surface/30 text-sm focus:outline-none focus:border-primary"
                    >
                      <option value="">{language === 'bn' ? 'বিভাগ নির্বাচন করুন' : 'Select Division'}</option>
                      {BANGLADESH_GEOGRAPHY.divisions.map((div) => (
                        <option key={div.id} value={div.id}>
                          {language === 'bn' ? div.name_bn : div.name_en}
                        </option>
                      ))}
                    </select>

                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      disabled={!division}
                      className="px-3 py-2.5 rounded-xl border border-border bg-pcp-surface/30 text-sm focus:outline-none focus:border-primary disabled:opacity-50"
                    >
                      <option value="">{language === 'bn' ? 'জেলা নির্বাচন করুন' : 'Select District'}</option>
                      {availableDistricts.map((dist) => (
                        <option key={dist.id} value={dist.id}>
                          {language === 'bn' ? dist.name_bn : dist.name_en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Geolocation status */}
              {geoStatus === 'success' && (
                <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-emerald-600 dark:text-emerald-400 font-medium px-1">
                  <MapPin className="w-3 h-3" />
                  <span>{language === 'bn' ? 'অবস্থান সনাক্ত করা হয়েছে' : 'Location detected'}</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-xs md:text-sm text-destructive font-medium animate-fade-in">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedAnimal || problemText.trim().length < 10 || isLoading}
                className="w-full py-3.5 md:py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary/85 text-white text-sm md:text-base font-extrabold rounded-2xl shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <Brain className="w-5 h-5 animate-pulse" />
                    <span>{language === 'bn' ? 'এআই বিশ্লেষণ করছে...' : 'AI is analyzing...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>{language === 'bn' ? 'এআই দিয়ে বিশ্লেষণ করুন' : 'Analyze with AI'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ═══════════════════ LOADING SKELETON ═══════════════════ */}
          {isLoading && (
            <div className="space-y-5 animate-fade-in py-8">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Brain className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base md:text-lg font-extrabold text-foreground">
                    {language === 'bn' ? 'এআই আপনার তথ্য বিশ্লেষণ করছে...' : 'AI is analyzing your case...'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {language === 'bn' ? 'অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন' : 'Please wait a moment'}
                  </p>
                </div>
              </div>
              {/* Skeleton cards */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-card border border-border/60 rounded-2xl p-6 animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-muted" />
                    <div className="h-4 w-40 bg-muted rounded-lg" />
                  </div>
                  <div className="space-y-2 pl-12">
                    <div className="h-3 w-full bg-muted rounded" />
                    <div className="h-3 w-4/5 bg-muted rounded" />
                    <div className="h-3 w-3/5 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══════════════════ RESULTS DASHBOARD ═══════════════════ */}
          {result && !isLoading && (
            <div ref={resultsRef} className="space-y-6 animate-fade-in-up">

              {/* New Consultation Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Sparkles className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <h2 className="text-sm md:text-base font-extrabold text-foreground">
                      {language === 'bn' ? 'এআই বিশ্লেষণ ফলাফল' : 'AI Analysis Results'}
                    </h2>
                    <p className="text-[10px] text-muted-foreground">
                      {result.animal_type &&
                        (language === 'bn' ? result.animal_type.name_bn : result.animal_type.name_en)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="px-3.5 py-2 bg-card border border-border hover:border-primary/30 rounded-xl text-xs font-bold text-foreground hover:text-primary flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'নতুন পরামর্শ' : 'New Consultation'}</span>
                </button>
              </div>

              {/* ── Disease Query Results ── */}
              {queryType === 'disease' && (
                <>
                  {/* Urgency Banner */}
                  {urgency && <UrgencyIndicator level={urgency.level} />}

                  {/* Diagnosis: Possible Problems */}
                  {diagnosis?.possible_problems && (
                    <DiagnosisCard
                      icon={<Stethoscope className="w-5 h-5 text-primary" />}
                      iconBg="bg-primary/10"
                      title={language === 'bn' ? 'সম্ভাব্য সমস্যা ও রোগ নির্ণয়' : 'Possible Problems & Diagnosis'}
                      content={diagnosis.possible_problems}
                    />
                  )}

                  {/* What Owner Can Do */}
                  {diagnosis?.what_owner_can_do && (
                    <DiagnosisCard
                      icon={<HandHeart className="w-5 h-5 text-accent" />}
                      iconBg="bg-accent/15"
                      title={language === 'bn' ? 'এখন কী করবেন — যত্ন ও প্রাথমিক চিকিৎসা' : 'What You Can Do Now — Care & First Aid'}
                      content={diagnosis.what_owner_can_do}
                      borderColor="border-accent/30"
                    />
                  )}

                  {/* Things to Care About */}
                  {diagnosis?.things_to_care_about && (
                    <DiagnosisCard
                      icon={<ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                      iconBg="bg-amber-100 dark:bg-amber-900/30"
                      title={language === 'bn' ? 'যা যা খেয়াল রাখতে হবে' : 'Things to Care About'}
                      content={diagnosis.things_to_care_about}
                      borderColor="border-amber-200 dark:border-amber-900/50"
                    />
                  )}

                  {/* Warning Signs */}
                  <WarningSignsCard warningData={warningData} />

                  {/* Positive Signs */}
                  <PositiveSignsCard positiveData={positiveData} />
                </>
              )}

              {/* ── Information Query Results ── */}
              {queryType === 'information' && guidedResponse && (
                <DiagnosisCard
                  icon={<BookOpenCheck className="w-5 h-5 text-primary" />}
                  iconBg="bg-primary/10"
                  title={language === 'bn' ? 'বিস্তারিত গাইড ও তথ্য' : 'Detailed Guide & Information'}
                  content={guidedResponse}
                />
              )}

              {/* ── Suggested Providers ── */}
              {providers.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pl-1">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm md:text-base font-extrabold text-foreground">
                      {language === 'bn' ? 'নিকটতম সেবাদাতা' : 'Nearest Service Providers'}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {providers.map((suggestion, idx) => (
                      <ProviderSuggestionCard
                        key={suggestion.provider_details?.id || idx}
                        rank={suggestion.rank}
                        score={suggestion.score}
                        reason={language === 'bn' ? suggestion.reason_bn : suggestion.reason_en}
                        provider_details={suggestion.provider_details}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Government Livestock Officer ── */}
              {suggestLivestockOfficer && (
                <GovtVetCard vets={govtVets} showFallbackMessage={true} />
              )}

              {/* ── Related Resources ── */}
              {resources.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pl-1">
                    <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                      <BookOpenCheck className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm md:text-base font-extrabold text-foreground">
                      {language === 'bn' ? 'প্রাসঙ্গিক তথ্য ও রিসোর্স' : 'Related Resources & Information'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {resources.map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Disclaimer ── */}
              <div className="bg-muted/30 border border-border/50 rounded-xl p-4 flex gap-2.5 items-start">
                <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
                  {language === 'bn'
                    ? 'দ্রষ্টব্য: এই পরামর্শটি শুধুমাত্র প্রাথমিক দিকনির্দেশনার জন্য। এটি পেশাদার পশু চিকিৎসকের পরামর্শের বিকল্প নয়। গুরুতর সমস্যায় অবশ্যই একজন যোগ্য পশু চিকিৎসকের সাথে যোগাযোগ করুন।'
                    : 'Disclaimer: This advice is for initial guidance only and is not a substitute for professional veterinary consultation. For serious issues, always consult a qualified veterinarian.'}
                </p>
              </div>

            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}

export default AIAssistant
