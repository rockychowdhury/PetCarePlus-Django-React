import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAIChat } from '../hooks/useAIChat'
import { guidelinesApi } from '../api/guidelines'
import { aiApi } from '../api/ai'
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
  Lock,
  MessageSquare,
  ClipboardList,
} from 'lucide-react'

// Example prompts for inspiration
const EXAMPLE_PROMPTS = {
  bn: [
    'আমার গরু ৩ দিন ধরে কিছু খাচ্ছে না, জ্বর আছে এবং নাক দিয়ে পানি পড়ছে',
    'আমার বিড়াল বমি করছে এবং অলস হয়ে গেছে, খাবার খেতে চাইছে না',
    'কুকুরের পায়ে ক্ষত হয়েছে, ফুলে গেছে এবং পুঁজ বের হচ্ছে',
    'ছাগলের পেট ফুলে গেছে, হাঁটতে পারছে না, কী করা উচিত?',
  ],
  en: [
    'My cow has not eaten for 3 days, has fever and nasal discharge',
    'My cat is vomiting and lethargic, refuses to eat',
    'Dog has a swollen wound on its paw with pus coming out',
    'Goat has a bloated stomach and cannot walk, what should I do?',
  ],
}

export const AIAssistant = () => {
  const { language, t } = useLanguage()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  
  const chatEndRef = useRef(null)
  const [activeTab, setActiveTab] = useState('report') // 'chat' | 'report' (for mobile split view)

  // AI Conversational Hook
  const {
    messages,
    session,
    isLoading,
    error,
    startChat,
    sendMessage,
    resetChat,
    setSession,
  } = useAIChat()

  // Form states
  const [selectedAnimal, setSelectedAnimal] = useState(null)
  const [problemText, setProblemText] = useState('')
  const [division, setDivision] = useState('')
  const [district, setDistrict] = useState('')
  const [geoStatus, setGeoStatus] = useState('idle')
  const [geoCoords, setGeoCoords] = useState(null)

  // URL Params for loading previous sessions
  const [searchParams, setSearchParams] = useSearchParams()
  const sessionIdParam = searchParams.get('session')

  // Fetch session if session ID is in URL
  const { data: sessionData, isLoading: isLoadingSession } = useQuery({
    queryKey: ['session', sessionIdParam],
    queryFn: () => aiApi.getSessionDetail(sessionIdParam),
    enabled: !!sessionIdParam && !!user,
  })

  // Sync loaded session
  useEffect(() => {
    if (sessionData) {
      setSession(sessionData)
    }
  }, [sessionData, setSession])

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Fetch animal types
  const { data: animalTypes, isLoading: isLoadingAnimals } = useQuery({
    queryKey: ['animalTypes'],
    queryFn: guidelinesApi.getAnimalTypes,
    enabled: !!user,
  })

  // Try browser geolocation on mount
  useEffect(() => {
    if (!user) return

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

  const availableDistricts = division ? BANGLADESH_GEOGRAPHY.districts[division] || [] : []

  const handleStartConversation = async (e) => {
    e.preventDefault()
    if (!selectedAnimal || isLoading) return

    const payload = {
      animal_type_id: selectedAnimal.id,
      message: problemText.trim() || (language === 'bn' ? 'হ্যালো, আমার পশুর স্বাস্থ্য সমস্যা নিয়ে সাহায্য চাই।' : 'Hello, I need help with my animal\'s health.'),
      preferred_language: language,
    }

    // Attach location coordinates or admin hierarchy
    if (geoCoords) {
      payload.user_latitude = geoCoords.lat
      payload.user_longitude = geoCoords.lng
    }
    if (division) payload.user_division = division
    if (district) payload.user_district = district

    try {
      await startChat(payload)
      setProblemText('')
    } catch (err) {
      // Handled by hook
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!problemText.trim() || isLoading || !session) return

    const text = problemText.trim()
    setProblemText('')

    const locationPayload = {}
    if (geoCoords) {
      locationPayload.user_latitude = geoCoords.lat
      locationPayload.user_longitude = geoCoords.lng
    }
    if (division) locationPayload.user_division = division
    if (district) locationPayload.user_district = district

    try {
      await sendMessage(text, locationPayload)
    } catch (err) {
      // Handled by hook
    }
  }

  const handleCompleteDiagnosis = async () => {
    if (isLoading || !session) return
    const text = language === 'bn' ? 'বিশ্লেষণ সম্পন্ন করুন।' : 'Please complete the diagnosis.'
    
    const locationPayload = {}
    if (geoCoords) {
      locationPayload.user_latitude = geoCoords.lat
      locationPayload.user_longitude = geoCoords.lng
    }
    if (division) locationPayload.user_division = division
    if (district) locationPayload.user_district = district

    try {
      await sendMessage(text, locationPayload)
    } catch (err) {
      // Handled by hook
    }
  }

  const handleReset = () => {
    resetChat()
    setSelectedAnimal(null)
    setProblemText('')
    if (sessionIdParam) {
      setSearchParams({})
    }
  }

  const handleExampleClick = (prompt) => {
    setProblemText(prompt)
  }

  // Format assistant messages to hide raw JSON
  const renderMessageContent = (content) => {
    if (content.trim().startsWith('{')) {
      return language === 'bn'
        ? 'বিশ্লেষণ সম্পন্ন হয়েছে! ডানদিকের রিপোর্ট প্যানেলে রোগ নির্ণয় এবং প্রয়োজনীয় পরামর্শ দেখুন।'
        : 'Symptom analysis is complete! Please check the diagnostic report panel on the right for results.'
    }
    return content
  }

  // ═══════════════════ RENDER 1: LOCKED STATE (UNAUTHENTICATED) ═══════════════════
  if (!user) {
    return (
      <PageLayout>
        <div className="bg-pcp-surface/20 min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full bg-card border border-border/80 rounded-3xl p-8 shadow-xl text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary border border-primary/20 shadow-inner">
              <Lock className="w-8 h-8 animate-pulse text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
                {language === 'bn' ? 'এআই রোগ নির্ণয় সহকারী লক করা' : 'AI Diagnostic Assistant is Locked'}
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                {language === 'bn'
                  ? 'আপনার পশুর লক্ষণগুলোর এআই ভিত্তিক বিশ্লেষণ, ঔষধের গাইডলাইন, এবং আপনার এলাকার ভেরিফাইড ডাক্তারের তালিকা পেতে অনুগ্রহ করে অ্যাকাউন্ট লগইন করুন।'
                  : 'Log in to unlock interactive symptom analysis, customized home care advice, local veterinarian directories, and instant government livestock contact information.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-primary hover:bg-primary/95 text-white text-sm font-extrabold rounded-xl transition-all shadow-md active:scale-[0.99]"
              >
                {language === 'bn' ? 'লগইন করুন' : 'Log In'}
              </button>
              <button
                onClick={() => navigate('/register')}
                className="w-full py-3 bg-muted hover:bg-muted/80 text-foreground text-sm font-extrabold rounded-xl border border-border transition-all active:scale-[0.99]"
              >
                {language === 'bn' ? 'নিবন্ধন করুন' : 'Register'}
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  // Extract variables
  const isSessionComplete = session?.is_complete
  const activeResult = session?.diagnostic_result
  const aiResponse = activeResult?.ai_response
  const queryType = activeResult?.query_type
  const diagnosis = aiResponse?.diagnosis
  const urgency = aiResponse?.urgency
  const warningData = aiResponse?.warning_signs
  const positiveData = aiResponse?.positive_signs
  const guidedResponse = aiResponse?.guided_response
  const providers = activeResult?.providers || []
  const resources = activeResult?.resources || []
  const govtVets = activeResult?.govt_vets || []
  const suggestLivestockOfficer = aiResponse?.suggest_livestock_officer

  // ═══════════════════ RENDER 2: AUTHENTICATED CHAT DASHBOARD ═══════════════════
  return (
    <PageLayout>
      <div className="bg-pcp-surface/20 min-h-[90vh] border-b border-border/40">
        
        {/* Header Title */}
        <div className="bg-gradient-to-br from-primary/5 via-pcp-surface/30 to-accent/5 py-6 border-b border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm flex-shrink-0">
                <Sparkles className="w-5 h-5 text-accent animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-extrabold text-foreground leading-tight">
                  {language === 'bn' ? 'এআই ইন্টারেক্টিভ পশু চিকিৎসা সহকারী' : 'AI Conversational Care Assistant'}
                </h1>
                <p className="text-[10px] md:text-xs text-muted-foreground">
                  {language === 'bn' ? 'রিয়েল-টাইম লক্ষণ বিশ্লেষণ এবং পরামর্শ পোর্টাল' : 'Real-time symptom investigation and advice portal'}
                </p>
              </div>
            </div>

            {session && (
              <button
                onClick={handleReset}
                className="px-3 py-1.5 bg-card border border-border hover:border-primary/30 rounded-xl text-xs font-bold text-foreground hover:text-primary flex items-center gap-1.5 transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'নতুন পরামর্শ' : 'New Consultation'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* ── STATE A: INITIAL QUESTIONNAIRE SETUP ── */}
          {!session && (
            <form onSubmit={handleStartConversation} className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
              
              {/* Animal Type selection */}
              <div className="bg-card border border-border/85 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🐾</span>
                  <div>
                    <h2 className="text-sm md:text-base font-extrabold text-foreground">
                      {language === 'bn' ? 'পশুর ধরন নির্বাচন করুন' : 'Select Animal Type'}
                    </h2>
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      {language === 'bn' ? 'কোন প্রাণীর লক্ষণ আলোচনা করতে চান?' : 'Which animal are you seeking care for?'}
                    </p>
                  </div>
                </div>

                {isLoadingAnimals ? (
                  <Spinner className="py-4" />
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {animalTypes?.map((animal) => {
                      const Icon = getAnimalIcon(animal.slug)
                      const theme = ANIMAL_THEMES[animal.slug] || ANIMAL_THEMES.cat
                      const isSelected = selectedAnimal?.id === animal.id
                      return (
                        <button
                          key={animal.id}
                          type="button"
                          onClick={() => setSelectedAnimal(animal)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all group ${
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

              {/* Initial message description */}
              <div className="bg-card border border-border/85 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm md:text-base font-extrabold text-foreground">
                      {language === 'bn' ? 'প্রাথমিক সমস্যা বর্ণনা করুন' : 'Describe the Symptoms'}
                    </h2>
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      {language === 'bn' ? 'পশুর প্রধান লক্ষণ এবং আপনার কোনো জিজ্ঞাসা প্রথমবার লিখুন।' : 'Write down the main symptoms or behavioral changes you observe.'}
                    </p>
                  </div>
                </div>

                <textarea
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  placeholder={
                    language === 'bn'
                      ? 'উদাহরণ: আমার ছাগল আজ সকাল থেকে কিছু খাচ্ছে না এবং ঝিমুচ্ছে...'
                      : 'Example: My goat is lethargic and refusing feed since this morning...'
                  }
                  rows={4}
                  maxLength={1000}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-pcp-surface/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none placeholder:text-muted-foreground/60 transition-all"
                />
                
                {/* Example prompts */}
                <div className="space-y-2">
                  <p className="text-[10px] md:text-xs font-bold text-muted-foreground flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-amber-500" />
                    {language === 'bn' ? 'উদাহরণ লক্ষণসমূহ (ক্লিক করুন):' : 'Sample symptom templates (click):'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(EXAMPLE_PROMPTS[language] || EXAMPLE_PROMPTS.bn).map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleExampleClick(prompt)}
                        className="px-2.5 py-1 bg-muted/50 hover:bg-primary/10 text-[10px] md:text-xs text-muted-foreground hover:text-primary font-medium rounded-lg border border-border/50 hover:border-primary/30 transition-all text-left line-clamp-1 max-w-[280px]"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location Override selection if browser location is denied */}
              {geoStatus === 'denied' && (
                <div className="bg-card border border-border/85 rounded-2xl p-5 md:p-6 shadow-sm space-y-4 animate-fade-in-up">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sky-600 flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm md:text-base font-extrabold text-foreground">
                        {language === 'bn' ? 'আপনার বর্তমান অবস্থান (ঐচ্ছিক)' : 'Select Your Location (Optional)'}
                      </h2>
                      <p className="text-[10px] md:text-xs text-muted-foreground">
                        {language === 'bn' ? 'জরুরি সেবাদাতা এবং সরকারি ডাক্তারের তালিকা আপনার অবস্থানের কাছাকাছি ফিল্টার হবে' : 'This allows the AI to fetch and suggest veterinarians located near you'}
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

              {error && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-xs md:text-sm text-destructive font-medium animate-fade-in">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedAnimal || isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary/85 text-white text-sm md:text-base font-extrabold rounded-2xl shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <Brain className="w-5 h-5 animate-pulse" />
                    <span>{language === 'bn' ? 'এআই সংযোগ স্থাপন করছে...' : 'Starting Chat with AI...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>{language === 'bn' ? 'সহকারীর সাথে কথা বলুন' : 'Start AI Conversation'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── STATE B: CHAT PORTAL ACTIVE ── */}
          {session && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Mobile tab switching controls */}
              {isSessionComplete && (
                <div className="lg:hidden flex border-b border-border/40 pb-2 mb-2 gap-2">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === 'chat'
                        ? 'bg-primary text-white'
                        : 'bg-card border border-border/80 text-muted-foreground'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{language === 'bn' ? 'চ্যাট হিস্ট্রি' : 'Chat History'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('report')}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === 'report'
                        ? 'bg-primary text-white'
                        : 'bg-card border border-border/80 text-muted-foreground'
                    }`}
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span>{language === 'bn' ? 'রোগ নির্ণয় রিপোর্ট' : 'Diagnostic Report'}</span>
                  </button>
                </div>
              )}

              {/* Chat Column (Visible always on desktop, and on mobile active tab chat) */}
              <div className={`col-span-1 lg:col-span-6 bg-card border border-border/60 rounded-3xl p-4 md:p-6 shadow-sm flex flex-col h-[70vh] relative min-w-0 ${
                isSessionComplete && activeTab !== 'chat' ? 'hidden lg:flex' : 'flex'
              }`}>
                
                {/* Animal context label */}
                <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🐾</span>
                    <span className="text-xs font-extrabold text-foreground">
                      {language === 'bn' ? 'পশু:' : 'Animal:'}{' '}
                      <span className="text-primary">
                        {language === 'bn' ? session.animal_type_details?.name_bn : session.animal_type_details?.name_en}
                      </span>
                    </span>
                  </div>
                  {isSessionComplete ? (
                    <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                      {language === 'bn' ? 'বিশ্লেষণ সম্পন্ন' : 'Session Complete'}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold rounded-lg border border-blue-100 dark:border-blue-900/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <span>{language === 'bn' ? 'লক্ষণ অনুসন্ধান' : 'Investigating symptoms'}</span>
                    </span>
                  )}
                </div>

                {/* Messages scroll box */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 flex flex-col min-w-0 scrollbar-thin">
                  {messages?.map((msg, idx) => {
                    const isUser = msg.role === 'user'
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-2.5 max-w-[85%] animate-fade-in ${
                          isUser ? 'self-end flex-row-reverse' : 'self-start'
                        }`}
                      >
                        {/* Avatar */}
                        {!isUser && (
                          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
                            <Sparkles className="w-4 h-4 text-accent" />
                          </div>
                        )}
                        {isUser && (
                          <div className="w-8 h-8 rounded-xl bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0 border border-border/80">
                            <span className="text-[10px] font-bold">You</span>
                          </div>
                        )}

                        <div className={`p-3.5 rounded-2xl text-sm shadow-sm select-text whitespace-pre-wrap leading-relaxed ${
                          isUser
                            ? 'bg-primary text-white rounded-tr-none'
                            : 'bg-pcp-surface/40 border border-border/60 text-foreground rounded-tl-none'
                        }`}>
                          {renderMessageContent(msg.content)}
                        </div>
                      </div>
                    )
                  })}

                  {/* Typing Indicator */}
                  {isLoading && (
                    <div className="flex items-start gap-2.5 max-w-[85%] self-start animate-fade-in">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
                        <Brain className="w-4 h-4 text-primary animate-pulse" />
                      </div>
                      <div className="bg-pcp-surface/40 border border-border/60 text-foreground p-3.5 rounded-2xl shadow-sm">
                        <div className="flex gap-1 py-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Chat actions & Input form */}
                <div className="border-t border-border/50 pt-4">
                  {error && (
                    <div className="mb-3 bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-xs text-destructive font-medium animate-fade-in">
                      {error}
                    </div>
                  )}

                  {!isSessionComplete ? (
                    <form onSubmit={handleSendMessage} className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={problemText}
                          onChange={(e) => setProblemText(e.target.value)}
                          placeholder={
                            language === 'bn'
                              ? 'পরবর্তী লক্ষণ লিখুন (যেমন: ওর তাপমাত্রা কত?)'
                              : 'Describe additional symptoms or answer the AI...'
                          }
                          disabled={isLoading}
                          className="flex-1 px-4 py-3 rounded-xl border border-border bg-pcp-surface/30 text-sm focus:outline-none focus:border-primary disabled:opacity-50"
                        />
                        <button
                          type="submit"
                          disabled={!problemText.trim() || isLoading}
                          className="px-4 bg-primary hover:bg-primary/95 text-white rounded-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Complete early CTA */}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground/70">
                          {language === 'bn' ? '*লক্ষণগুলো ভালোভাবে বর্ণনা করার পর রিপোর্ট বাটনে চাপুন।' : '*Click Complete once all symptoms are described.'}
                        </span>
                        <button
                          type="button"
                          onClick={handleCompleteDiagnosis}
                          disabled={isLoading || messages.length < 2}
                          className="px-3 py-1.5 text-accent hover:text-accent/90 hover:bg-accent/5 font-extrabold border border-accent/20 rounded-lg flex items-center gap-1 transition-all disabled:opacity-50"
                        >
                          <Brain className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'রোগ নির্ণয় সম্পন্ন করুন' : 'Complete Diagnosis'}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-center p-3 bg-muted/30 border border-border/50 rounded-xl text-center">
                      <p className="text-xs text-muted-foreground font-bold flex items-center gap-1.5">
                        <Info className="w-4 h-4" />
                        {language === 'bn'
                          ? 'এই পরামর্শটি সম্পন্ন হয়েছে। নতুন সমস্যার জন্য উপরে "নতুন পরামর্শ" বাটনে ক্লিক করুন।'
                          : 'This AI session has been completed. Start a new session for a different symptom.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Diagnostic Report Dashboard Column (Visible always on desktop, and on mobile active tab report) */}
              <div className={`col-span-1 lg:col-span-6 space-y-6 h-[70vh] overflow-y-auto pr-1 select-text scrollbar-thin ${
                isSessionComplete && activeTab !== 'report' ? 'hidden lg:block' : 'block'
              }`}>
                {isSessionComplete && activeResult ? (
                  <>
                    {/* Urgency indicator */}
                    {urgency && <UrgencyIndicator level={urgency.level} />}

                    {/* Possible problems */}
                    {diagnosis?.possible_problems && (
                      <DiagnosisCard
                        icon={<Stethoscope className="w-5 h-5 text-primary" />}
                        iconBg="bg-primary/10"
                        title={language === 'bn' ? 'সম্ভাব্য সমস্যা ও রোগ নির্ণয়' : 'Possible Problems & Diagnosis'}
                        content={diagnosis.possible_problems}
                      />
                    )}

                    {/* What owner can do */}
                    {diagnosis?.what_owner_can_do && (
                      <DiagnosisCard
                        icon={<HandHeart className="w-5 h-5 text-accent" />}
                        iconBg="bg-accent/15"
                        title={language === 'bn' ? 'এখন কী করবেন — যত্ন ও প্রাথমিক চিকিৎসা' : 'What You Can Do Now — Care & First Aid'}
                        content={diagnosis.what_owner_can_do}
                        borderColor="border-accent/30"
                      />
                    )}

                    {/* Things to care about */}
                    {diagnosis?.things_to_care_about && (
                      <DiagnosisCard
                        icon={<ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                        iconBg="bg-amber-100 dark:bg-amber-900/30"
                        title={language === 'bn' ? 'যা যা খেয়াল রাখতে হবে' : 'Things to Care About'}
                        content={diagnosis.things_to_care_about}
                        borderColor="border-amber-200 dark:border-amber-900/50"
                      />
                    )}

                    {/* Warning signs */}
                    <WarningSignsCard warningData={warningData} />

                    {/* Positive recovery signs */}
                    <PositiveSignsCard positiveData={positiveData} />

                    {/* Suggested Providers matching details */}
                    {providers.length > 0 && (
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2 pl-1">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <h3 className="text-sm md:text-base font-extrabold text-foreground">
                            {language === 'bn' ? 'আপনার নিকটবর্তী রেকমেন্ডেড সেবাদাতা' : 'Nearest Recommended Providers'}
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

                    {/* Government Upazila Vet Cards */}
                    {suggestLivestockOfficer && (
                      <GovtVetCard vets={govtVets} showFallbackMessage={true} />
                    )}

                    {/* Related guideline resources matching keywords */}
                    {resources.length > 0 && (
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2 pl-1">
                          <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center border border-violet-200 dark:border-violet-900/50">
                            <BookOpenCheck className="w-4 h-4" />
                          </div>
                          <h3 className="text-sm md:text-base font-extrabold text-foreground">
                            {language === 'bn' ? 'প্রাসঙ্গিক নির্দেশিকা ও রিসোর্স' : 'Related Resources & Guidelines'}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {resources.map((resource) => (
                            <ResourceCard key={resource.id} resource={resource} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Medical Disclaimer */}
                    <div className="bg-muted/30 border border-border/50 rounded-xl p-4 flex gap-2.5 items-start">
                      <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
                        {language === 'bn'
                          ? 'সতর্কতা: এই এআই রোগ নির্ণয় সহকারী শুধুমাত্র সাধারণ তথ্যের জন্য পরামর্শ দিয়ে থাকে। গুরুতর পশুর উপসর্গ বা জরুরি প্রয়োজনে সর্বদা একজন ভেরিফাইড চিকিৎসকের সাথে সরাসরি যোগাযোগ করুন।'
                          : 'Disclaimer: This AI analysis provides basic guidance and is not a replacement for live veterinary services. In case of serious symptoms or outbreaks, contact a professional immediately.'}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="h-full bg-muted/20 border border-dashed border-border rounded-3xl flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-3">
                    <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
                      <ClipboardList className="w-6 h-6 text-muted-foreground/60" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        {language === 'bn' ? 'রিপোর্ট এখনো জেনারেট হয়নি' : 'Report is Not Generated'}
                      </h3>
                      <p className="text-xs leading-relaxed max-w-xs mx-auto">
                        {language === 'bn'
                          ? 'সহকারীর সাথে আলাপ সম্পন্ন করুন অথবা লক্ষণগুলো টাইপ করে নিচে "রোগ নির্ণয় সম্পন্ন করুন" বাটনে চাপুন।'
                          : 'Continue chatting with the AI, or click "Complete Diagnosis" to compile the results.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </PageLayout>
  )
}

export default AIAssistant
