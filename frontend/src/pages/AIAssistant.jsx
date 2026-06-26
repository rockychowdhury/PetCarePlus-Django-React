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
  Send, Sparkles, RefreshCw, Stethoscope, HandHeart, ShieldAlert, BookOpenCheck, MapPin, Info, ArrowRight, Brain, Lightbulb, Lock, MessageSquare, ClipboardList, X, ChevronDown
} from 'lucide-react'

const EXAMPLE_PROMPTS = {
  bn: [
    'আমার গরু ৩ দিন ধরে কিছু খাচ্ছে না, জ্বর আছে',
    'বিড়াল বমি করছে এবং অলস হয়ে গেছে',
    'কুকুরের পায়ে ক্ষত, ফুলে গেছে',
  ],
  en: [
    'My cow has not eaten for 3 days, has fever',
    'Cat is vomiting and lethargic',
    'Dog has a swollen wound on paw',
  ],
}

export const AIAssistant = () => {
  const { language, t } = useLanguage()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)
  
  const [showReportMobile, setShowReportMobile] = useState(false)
  const [showLocationSettings, setShowLocationSettings] = useState(false)

  const {
    messages, session, isLoading, error, startChat, sendMessage, resetChat, setSession,
  } = useAIChat()

  const [selectedAnimal, setSelectedAnimal] = useState(null)
  const [problemText, setProblemText] = useState('')
  const [division, setDivision] = useState('')
  const [district, setDistrict] = useState('')
  const [geoStatus, setGeoStatus] = useState('idle')
  const [geoCoords, setGeoCoords] = useState(null)

  const [searchParams, setSearchParams] = useSearchParams()
  const sessionIdParam = searchParams.get('session')

  const { data: sessionData, isLoading: isLoadingSession } = useQuery({
    queryKey: ['session', sessionIdParam],
    queryFn: () => aiApi.getSessionDetail(sessionIdParam),
    enabled: !!sessionIdParam && !!user,
  })

  useEffect(() => {
    if (sessionData) {
      setSession(sessionData)
    }
  }, [sessionData, setSession])

  useEffect(() => {
    if (chatEndRef.current && session) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 100)
    }
  }, [messages, isLoading, session])

  const { data: animalTypes, isLoading: isLoadingAnimals } = useQuery({
    queryKey: ['animalTypes'],
    queryFn: guidelinesApi.getAnimalTypes,
    enabled: !!user,
  })

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
          setGeoCoords({ lat: position.coords.latitude, lng: position.coords.longitude })
          setGeoStatus('success')
        },
        () => { setGeoStatus('denied') },
        { timeout: 8000, enableHighAccuracy: false }
      )
    } else {
      setGeoStatus('denied')
    }
  }, [user])

  const availableDistricts = division ? BANGLADESH_GEOGRAPHY.districts[division] || [] : []

  const handleStartConversation = async (e) => {
    if (e) e.preventDefault()
    if (!selectedAnimal || isLoading || !problemText.trim()) return

    const payload = {
      animal_type_id: selectedAnimal.id,
      message: problemText.trim(),
      preferred_language: language,
    }

    if (geoCoords) {
      payload.user_latitude = geoCoords.lat
      payload.user_longitude = geoCoords.lng
    }
    if (division) payload.user_division = division
    if (district) payload.user_district = district

    try {
      await startChat(payload)
      setProblemText('')
    } catch (err) {}
  }

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault()
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
    } catch (err) {}
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!session) {
        handleStartConversation()
      } else {
        handleSendMessage()
      }
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
    } catch (err) {}
  }

  const handleReset = () => {
    resetChat()
    setSelectedAnimal(null)
    setProblemText('')
    setShowReportMobile(false)
    if (sessionIdParam) {
      setSearchParams({})
    }
  }

  const handleExampleClick = (prompt) => {
    setProblemText(prompt)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const renderMessageContent = (content) => {
    if (content.trim().startsWith('{')) {
      return language === 'bn'
        ? 'বিশ্লেষণ সম্পন্ন হয়েছে! ডানদিকের রিপোর্ট প্যানেলে রোগ নির্ণয় এবং প্রয়োজনীয় পরামর্শ দেখুন।'
        : 'Symptom analysis is complete! Please check the diagnostic report panel for results.'
    }
    return content
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
    }
  }, [problemText])

  if (!user) {
    return (
      <PageLayout hideFooter={true}>
        <div className="bg-pcp-surface/20 flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full bg-card/90 backdrop-blur-xl border border-border/80 rounded-3xl p-8 shadow-2xl shadow-primary/5 text-center space-y-6 animate-fade-in-up">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-primary hover:bg-primary/95 text-white text-sm font-extrabold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.99]"
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

  const isSessionComplete = session?.is_complete
  const activeResult = session?.diagnostic_result
  const aiResponse = activeResult?.ai_response
  
  const diagnosis = aiResponse?.diagnosis
  const urgencyObj = aiResponse?.urgency
  const warningData = aiResponse?.warning_signs
  const positiveData = aiResponse?.positive_signs
  const guidedResponse = aiResponse?.guided_response
  
  const urgencyLevel = urgencyObj?.level || aiResponse?.urgency_level
  const diagnosisSummary = diagnosis?.possible_problems || aiResponse?.diagnosis_summary
  const careAdvice = diagnosis?.what_owner_can_do || aiResponse?.care_advice
  const thingsToCareAbout = diagnosis?.things_to_care_about

  const providers = activeResult?.providers || []
  const resources = activeResult?.resources || []
  const govtVets = activeResult?.govt_vets || []
  const suggestLivestockOfficer = aiResponse?.suggest_livestock_officer

  const showReportOnDesktop = isSessionComplete

  return (
    <PageLayout hideFooter={true}>
      <div className="flex-1 flex flex-col bg-background/50 overflow-hidden">
        <div className="flex flex-col lg:flex-row flex-1 w-full max-w-[1500px] mx-auto relative lg:px-6">
          <div className="flex flex-col flex-1 lg:w-1/2 relative transition-all duration-300 ease-in-out lg:border-r lg:border-border/40 lg:pr-4">
          
          <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-10 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />



          <main className="flex-1 overflow-y-auto scrollbar-thin relative z-0">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 w-full py-6 md:py-10 flex flex-col min-h-full">
              
              {!session ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 animate-fade-in-up py-10">
                  
                  <div className="space-y-3 max-w-xl">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                      {language === 'bn' ? 'আমি কিভাবে সাহায্য করতে পারি?' : 'How can I help your pet today?'}
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground/80 leading-relaxed font-medium">
                      {language === 'bn' 
                        ? 'লক্ষণ, সমস্যা বা সাধারণ স্বাস্থ্য সম্পর্কিত যে কোনো প্রশ্ন করতে পশুর ধরন নির্বাচন করুন।' 
                        : 'Select an animal type below and describe the symptoms to begin an interactive diagnostic session.'}
                    </p>
                  </div>

                  <div className="w-full max-w-2xl space-y-3">
                    <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-muted-foreground mb-4">
                      <span className="w-8 h-[1px] bg-border"></span>
                      <span>{language === 'bn' ? '১. পশুর ধরন নির্বাচন করুন' : '1. Select Animal Type'}</span>
                      <span className="w-8 h-[1px] bg-border"></span>
                    </div>

                    {isLoadingAnimals ? (
                      <Spinner />
                    ) : (
                      <div className="flex flex-wrap justify-center gap-3">
                        {animalTypes?.map(animal => {
                          const Icon = getAnimalIcon(animal.slug)
                          const isSelected = selectedAnimal?.id === animal.id
                          return (
                            <button
                              key={animal.id}
                              onClick={() => setSelectedAnimal(animal)}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all duration-200 active:scale-95 ${
                                isSelected 
                                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105' 
                                  : 'bg-card/60 backdrop-blur-sm border-border/80 hover:bg-primary/5 hover:border-primary/40 text-foreground'
                              }`}
                            >
                              <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-primary'}`} />
                              {language === 'bn' ? animal.name_bn : animal.name_en}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Step 2: Symptoms Form */}
                  <div className="w-full max-w-2xl text-left space-y-4 mt-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm md:text-base font-extrabold text-foreground tracking-tight">
                          {language === 'bn' ? '২. লক্ষণসমূহ বর্ণনা করুন' : '2. Describe the Symptoms'}
                        </h2>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          {language === 'bn' ? 'লক্ষণ, খাওয়ার রুচি এবং সময়কাল বিস্তারিত টাইপ করুন।' : "Detail the animal's current issues, appetite status, and duration."}
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleStartConversation} className="space-y-4">
                      <div className="relative">
                        <textarea
                          ref={inputRef}
                          value={problemText}
                          onChange={(e) => setProblemText(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={
                            language === 'bn'
                              ? 'উদাহরণ: আমার ছাগল আজ সকাল থেকে কিছু খাচ্ছে না এবং ঝিমুচ্ছে...'
                              : 'Example: My goat is lethargic and refusing feed since this morning...'
                          }
                          rows={4}
                          disabled={isLoading}
                          className="w-full px-4 py-3 rounded-xl border border-border border-l-4 border-l-primary/70 bg-card text-sm focus:outline-none focus:border-primary focus:border-l-primary focus:ring-1 focus:ring-primary/20 resize-none placeholder:text-muted-foreground/60 transition-all font-medium shadow-sm"
                        />
                      </div>
                      
                      <div className="space-y-2 pt-1">
                        <p className="text-[10px] md:text-xs font-extrabold text-muted-foreground flex items-center gap-1">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                          {language === 'bn' ? 'উদাহরণ বিবরণী (ক্লিক করুন):' : 'Symptom templates (click to select):'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(EXAMPLE_PROMPTS[language] || EXAMPLE_PROMPTS.bn).map((prompt, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleExampleClick(prompt)}
                              className="px-3 py-2 bg-muted/40 hover:bg-primary/10 text-xs text-muted-foreground hover:text-primary font-bold rounded-lg border border-border/40 hover:border-primary/20 transition-all text-left"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4">
                        <button 
                          type="submit" 
                          disabled={!selectedAnimal || !problemText.trim() || isLoading}
                          className="w-full py-4 bg-primary hover:bg-primary/95 text-white text-sm font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
                        >
                          <Brain className="w-5 h-5" />
                          <span>{language === 'bn' ? 'সহকারীর সাথে কথা বলুন' : 'Start AI Conversation'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pb-4">
                  <div className="flex justify-center mb-8">
                    <div className="px-4 py-1.5 bg-muted/40 backdrop-blur-sm border border-border/50 rounded-full text-xs font-bold text-muted-foreground flex items-center gap-2">
                      <span className="text-sm">🐾</span>
                      <span>
                        {language === 'bn' ? 'আলোচিত পশু:' : 'Discussing:'}{' '}
                        <span className="text-foreground">{language === 'bn' ? session.animal_type_details?.name_bn : session.animal_type_details?.name_en}</span>
                      </span>
                    </div>
                  </div>

                  {messages?.map((msg, idx) => {
                    const isUser = msg.role === 'user'
                    return (
                      <div
                        key={idx}
                        className={`flex items-end gap-3 max-w-[90%] md:max-w-[80%] animate-fade-in-up ${
                          isUser ? 'self-end flex-row-reverse ml-auto' : 'self-start mr-auto'
                        }`}
                        style={{ animationDelay: `${Math.min(idx * 50, 300)}ms` }}
                      >
                        {!isUser && (
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20 mb-1 shadow-sm">
                            <Brain className="w-4 h-4 md:w-5 md:h-5" />
                          </div>
                        )}
                        {isUser && (
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0 border border-border/50 mb-1 shadow-sm">
                            <span className="text-[10px] md:text-xs font-bold uppercase">{user?.first_name?.[0] || 'U'}</span>
                          </div>
                        )}

                        <div className={`px-5 py-4 rounded-[1.5rem] text-sm md:text-base shadow-sm select-text whitespace-pre-wrap leading-relaxed ${
                          isUser
                            ? 'bg-gradient-to-br from-primary to-emerald-600 text-white rounded-br-sm shadow-primary/20'
                            : 'bg-card/90 backdrop-blur-sm border border-border/60 text-foreground rounded-bl-sm shadow-sm'
                        }`}>
                          {renderMessageContent(msg.content)}
                        </div>
                      </div>
                    )
                  })}

                  {isLoading && (
                    <div className="flex items-end gap-3 max-w-[85%] self-start animate-fade-in-up mr-auto">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20 mb-1 shadow-sm">
                        <Brain className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
                      </div>
                      <div className="bg-card/90 backdrop-blur-sm border border-border/60 text-foreground px-6 py-5 rounded-[1.5rem] rounded-bl-sm shadow-sm flex items-center h-full">
                        <div className="flex gap-1.5 items-center justify-center h-2">
                          <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              )}
            </div>
          </main>

          {session && (
            <div className="flex-shrink-0 bg-transparent p-4 pb-6 md:pb-8 relative z-20">
              <div className="max-w-4xl mx-auto w-full relative">
              {geoStatus === 'denied' && !session && (
                <div className="absolute bottom-full mb-3 left-0 right-0 animate-fade-in">
                  <button 
                    onClick={() => setShowLocationSettings(!showLocationSettings)}
                    className="mx-auto flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50 transition-colors"
                  >
                    <MapPin className="w-3 h-3" />
                    {language === 'bn' ? 'অবস্থান নির্ধারণ করুন' : 'Set Location Preferences'}
                    <ChevronDown className={`w-3 h-3 transition-transform ${showLocationSettings ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showLocationSettings && (
                    <div className="mt-2 p-3 bg-card/90 backdrop-blur-md border border-border rounded-xl shadow-lg flex gap-2 max-w-sm mx-auto">
                      <select
                        value={division}
                        onChange={(e) => {
                          setDivision(e.target.value)
                          setDistrict('')
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-border bg-pcp-surface/20 text-xs focus:outline-none focus:border-primary font-bold text-foreground"
                      >
                        <option value="">{language === 'bn' ? 'বিভাগ' : 'Division'}</option>
                        {BANGLADESH_GEOGRAPHY.divisions.map((div) => (
                          <option key={div.id} value={div.id}>{language === 'bn' ? div.name_bn : div.name_en}</option>
                        ))}
                      </select>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        disabled={!division}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-border bg-pcp-surface/20 text-xs focus:outline-none focus:border-primary font-bold text-foreground disabled:opacity-50"
                      >
                        <option value="">{language === 'bn' ? 'জেলা' : 'District'}</option>
                        {availableDistricts.map((dist) => (
                          <option key={dist.id} value={dist.id}>{language === 'bn' ? dist.name_bn : dist.name_en}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mb-3 absolute bottom-full w-full bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-xs text-destructive font-bold animate-fade-in shadow-sm">
                  {error}
                </div>
              )}

              {!isSessionComplete ? (
                <div className="flex flex-col gap-3">
                  <form 
                    onSubmit={handleSendMessage} 
                    className="relative flex items-end gap-3"
                  >
                    <textarea 
                      ref={inputRef}
                      value={problemText}
                      onChange={(e) => setProblemText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        language === 'bn' 
                          ? 'আরো কিছু লক্ষণ যোগ করুন বা উত্তর দিন...' 
                          : 'Reply to the assistant...'
                      }
                      disabled={isLoading}
                      className="flex-1 max-h-40 min-h-[52px] bg-card border border-border border-l-4 border-l-primary/70 focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none outline-none text-sm md:text-base py-3.5 px-4 rounded-xl placeholder:text-muted-foreground/50 font-medium scrollbar-thin shadow-sm transition-all"
                      rows={1}
                    />
                    <button 
                      type="submit" 
                      disabled={!problemText.trim() || isLoading}
                      className="w-[52px] h-[52px] flex-shrink-0 bg-primary hover:bg-primary/95 text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.99]"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                  
                  <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-2">
                      {isSessionComplete && (
                        <button
                          onClick={() => setShowReportMobile(true)}
                          className="lg:hidden px-4 py-2 text-xs font-extrabold bg-primary text-white rounded-xl shadow-sm hover:bg-primary/90 transition-all flex items-center gap-1.5"
                        >
                          <ClipboardList className="w-4 h-4" />
                          <span className="hidden sm:inline">{language === 'bn' ? 'রিপোর্ট দেখুন' : 'View Report'}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 hover:border-border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                        title="Start New Consultation"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{language === 'bn' ? 'নতুন চ্যাট' : 'New Chat'}</span>
                      </button>
                    </div>
                    <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleCompleteDiagnosis}
                          disabled={isLoading || messages.length < 2}
                          className="px-4 py-2 bg-accent/10 text-accent hover:bg-accent hover:text-white font-extrabold border border-accent/20 hover:border-accent rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 text-xs shadow-sm"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'রোগ নির্ণয় সম্পন্ন করুন' : 'Complete Diagnosis'}</span>
                        </button>
                      </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 bg-muted/40 border border-border/60 rounded-2xl text-center backdrop-blur-sm gap-4">
                  <p className="text-sm text-foreground font-bold flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    {language === 'bn'
                      ? 'এই পরামর্শটি সম্পন্ন হয়েছে। নতুন সমস্যার জন্য নিচের বাটনে ক্লিক করুন।'
                      : 'This session has been completed. Click below to start a new diagnosis.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-extrabold transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>{language === 'bn' ? 'নতুন চ্যাট শুরু করুন' : 'Start New Chat'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          )}
        </div>

        <div className={`fixed inset-y-0 right-0 w-full lg:static lg:w-1/2 bg-card border-l border-border lg:border-l-0 lg:shadow-none shadow-2xl z-50 transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col lg:pl-4 ${
          showReportMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}>
          
          <div className="h-16 flex items-center justify-between px-6 border-b border-border/60 flex-shrink-0 bg-card/80 backdrop-blur-xl">
            <h2 className="font-extrabold text-foreground flex items-center gap-2 text-lg">
              <ClipboardList className="w-5 h-5 text-primary" />
              {language === 'bn' ? 'রোগ নির্ণয় রিপোর্ট' : 'Diagnostic Report'}
            </h2>
            <button 
              onClick={() => setShowReportMobile(false)} 
              className="lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 scrollbar-thin bg-background/30">
            {activeResult ? (
              <>
                {urgencyLevel && <UrgencyIndicator level={urgencyLevel} />}
                {diagnosisSummary && (
                  <DiagnosisCard
                    icon={<Stethoscope className="w-5 h-5 text-primary" />}
                    iconBg="bg-primary/10"
                    title={language === 'bn' ? 'সম্ভাব্য সমস্যা' : 'Possible Diagnosis'}
                    content={diagnosisSummary}
                  />
                )}
                {guidedResponse && (
                  <DiagnosisCard
                    icon={<Lightbulb className="w-5 h-5 text-amber-500 dark:text-amber-400" />}
                    iconBg="bg-amber-100 dark:bg-amber-900/30"
                    title={language === 'bn' ? 'পরামর্শ ও নির্দেশিকা' : 'Advice & Guidelines'}
                    content={guidedResponse}
                    borderColor="border-amber-200 dark:border-amber-900/50"
                  />
                )}
                {careAdvice && (
                  <DiagnosisCard
                    icon={<HandHeart className="w-5 h-5 text-accent" />}
                    iconBg="bg-accent/15"
                    title={language === 'bn' ? 'প্রাথমিক চিকিৎসা' : 'First Aid & Care'}
                    content={careAdvice}
                    borderColor="border-accent/30"
                  />
                )}
                {thingsToCareAbout && (
                  <DiagnosisCard
                    icon={<ShieldAlert className="w-5 h-5 text-rose-500 dark:text-rose-400" />}
                    iconBg="bg-rose-100 dark:bg-rose-900/30"
                    title={language === 'bn' ? 'সতর্কতা' : 'Precautions'}
                    content={thingsToCareAbout}
                    borderColor="border-rose-200 dark:border-rose-900/50"
                  />
                )}
                {warningData && <WarningSignsCard warningData={warningData} />}
                {positiveData && <PositiveSignsCard positiveData={positiveData} />}

                {providers.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-extrabold text-foreground">
                        {language === 'bn' ? 'রেকমেন্ডেড ডাক্তার' : 'Recommended Vets'}
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
                {suggestLivestockOfficer && (
                  <GovtVetCard vets={govtVets} showFallbackMessage={true} />
                )}
                {resources.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center border border-violet-200 dark:border-violet-900/50">
                        <BookOpenCheck className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-extrabold text-foreground">
                        {language === 'bn' ? 'নির্দেশিকা' : 'Guidelines'}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {resources.map((resource) => (
                        <ResourceCard key={resource.id} resource={resource} />
                      ))}
                    </div>
                  </div>
                )}
                <div className="bg-muted/30 border border-border/50 rounded-xl p-4 flex gap-3 items-start mt-6">
                  <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    {language === 'bn'
                      ? 'সতর্কতা: এই এআই রোগ নির্ণয় সহকারী শুধুমাত্র সাধারণ তথ্যের জন্য পরামর্শ দিয়ে থাকে। গুরুতর পশুর উপসর্গ বা জরুরি প্রয়োজনে সর্বদা একজন ভেরিফাইড চিকিৎসকের সাথে সরাসরি যোগাযোগ করুন।'
                      : 'Disclaimer: This AI analysis provides basic guidance and is not a replacement for live veterinary services. In case of serious symptoms, contact a professional immediately.'}
                  </p>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-4 opacity-60 px-4 min-h-[400px]">
                <div className="w-20 h-20 bg-muted/60 rounded-full flex items-center justify-center mb-2 shadow-inner">
                  <ClipboardList className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {language === 'bn' ? 'রিপোর্ট জেনারেট হয়নি' : 'Report Not Generated'}
                  </h3>
                  <p className="text-sm max-w-[280px] mx-auto mt-2 leading-relaxed">
                    {language === 'bn'
                      ? 'সহকারীর সাথে লক্ষণ বিশ্লেষণ সম্পন্ন করুন অথবা "রোগ নির্ণয় সম্পন্ন করুন" বাটনে চাপুন।'
                      : 'Complete the symptom analysis or click "Complete Diagnosis" to compile your results here.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </PageLayout>
  )
}

export default AIAssistant
