import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAISession } from '../hooks/useAISession'
import { guidelinesApi } from '../api/guidelines'
import { useLanguage } from '../hooks/useLanguage'
import { getAnimalIcon, ANIMAL_THEMES } from '../utils/animals'
import PageLayout from '../components/layout/PageLayout'
import MessageBubble from '../components/ai/MessageBubble'
import ProviderSuggestionCard from '../components/ai/ProviderSuggestionCard'
import UrgencyIndicator from '../components/ai/UrgencyIndicator'
import Spinner from '../components/ui/Spinner'
import { Send, Sparkles, RefreshCw, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react'

export const AIAssistant = () => {
  const { language, t } = useLanguage()
  const chatEndRef = useRef(null)

  // Fetch animal types using react-query
  const { data: animalTypes, isLoading: isLoadingAnimals } = useQuery({
    queryKey: ['animalTypes'],
    queryFn: guidelinesApi.getAnimalTypes,
  })

  const {
    sessionId,
    messages,
    isPending,
    summary,
    suggestions,
    turnsRemaining,
    startSession,
    sendMessage,
    resetSession,
  } = useAISession()

  const [inputMessage, setInputMessage] = useState('')
  const [selectedAnimal, setSelectedAnimal] = useState(null)

  const handleAnimalSelect = async (animal) => {
    setSelectedAnimal(animal)
    try {
      await startSession(animal.id)
    } catch (err) {
      console.error('Failed to initialize AI Chat:', err)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || isPending) return
    const msg = inputMessage
    setInputMessage('')
    await sendMessage(msg)
  }

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isPending])

  return (
    <PageLayout>
      <div className="bg-pcp-surface/20 py-8 min-h-screen border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
          
          {/* Page Title */}
          <div className="text-center sm:text-left space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 fill-current text-accent" />
              <span>Gemini 2.5 Flash API</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              {language === 'bn' ? 'ভেটেরিনারি এআই রোগ নিরূপণ সহকারী' : 'Veterinary AI Diagnostic Assistant'}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              {language === 'bn'
                ? 'আপনার পশু অসুস্থ বা কোনো উপসর্গে ভুগছে? পশু চিকিৎসকের পরামর্শ পেতে প্রথমে সঠিক পশুটি নির্বাচন করে বিস্তারিত কথা বলুন।'
                : 'Diagnose symptoms with our smart Gemini-based model. Qualified home advice and ranked local service recommendations will be provided on conclusion.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Chat Container */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-card border border-border/80 rounded-2xl shadow-md overflow-hidden flex flex-col h-[550px]">
                {/* Header info */}
                <div className="bg-gradient-to-r from-pcp-green to-pcp-green-light px-5 py-4 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2 text-left">
                    <Sparkles className="w-5 h-5 fill-current text-accent" />
                    <div>
                      <h3 className="font-bold text-sm tracking-tight">
                        {language === 'bn' ? 'এআই ডায়াগনস্টিক চ্যাট' : 'AI Diagnostic Consultation'}
                      </h3>
                      <p className="text-[10px] text-white/80">
                        {selectedAnimal
                          ? `${language === 'bn' ? selectedAnimal.name_bn : selectedAnimal.name_en} • ${t('common.verified_badge')}`
                          : 'পশু নির্বাচন করুন'}
                      </p>
                    </div>
                  </div>
                  {selectedAnimal && (
                    <button
                      onClick={() => {
                        setSelectedAnimal(null)
                        resetSession()
                      }}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/80 hover:text-white"
                      title="Reset Chat"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Body Area */}
                <div className="flex-grow overflow-y-auto p-4 bg-pcp-surface/20 flex flex-col">
                  {!selectedAnimal ? (
                    // Animal selector
                    <div className="my-auto space-y-6 text-center py-6">
                      <div className="space-y-1">
                        <h4 className="text-sm sm:text-base font-bold text-foreground">
                          {t('ai.step_animal')}
                        </h4>
                        <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                          পরামর্শ পেতে সঠিক পশুর ধরণ নির্বাচন করুন।
                        </p>
                      </div>

                      {isLoadingAnimals ? (
                        <Spinner className="py-6" />
                      ) : (
                        <div className="grid grid-cols-4 gap-2.5 max-w-sm mx-auto">
                          {animalTypes?.map((animal) => {
                            const Icon = getAnimalIcon(animal.slug)
                            const theme = ANIMAL_THEMES[animal.slug] || ANIMAL_THEMES.cat
                            return (
                              <button
                                key={animal.id}
                                onClick={() => handleAnimalSelect(animal)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${theme.bg} ${theme.border} group`}
                              >
                                <Icon className={`w-5 sm:w-6 h-5 sm:h-6 mb-1.5 ${theme.text} group-hover:scale-110 transition-transform`} />
                                <span className="text-[10px] sm:text-xs font-bold text-foreground">
                                  {language === 'bn' ? animal.name_bn : animal.name_en}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Dialogue history list
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="flex-grow overflow-y-auto space-y-2 pr-1">
                        {messages.map((msg, index) => (
                          <MessageBubble key={index} role={msg.role} content={msg.content} />
                        ))}
                        {isPending && (
                          <div className="flex gap-3 my-3 max-w-[85%] mr-auto items-center">
                            <div className="w-8 h-8 rounded-full bg-accent/15 text-accent flex items-center justify-center flex-shrink-0 animate-pulse">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div className="px-4 py-3 rounded-2xl bg-card border border-border text-xs text-muted-foreground flex items-center gap-2 rounded-tl-none animate-pulse-subtle">
                              <span>এআই বিশ্লেষণ করছে...</span>
                            </div>
                          </div>
                        )}

                        {/* Limit turns block */}
                        {!isPending && turnsRemaining <= 0 && !summary && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 my-4 text-center space-y-3 dark:bg-amber-950/20 dark:border-amber-900/50 animate-fade-in-up">
                            <p className="text-xs font-bold text-amber-800 dark:text-amber-400">
                              {t('ai.turns_remaining', { count: 0 })}
                            </p>
                            <div className="flex items-center justify-center gap-3">
                              <Link
                                to="/login"
                                className="px-3.5 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/95 transition-colors"
                              >
                                {t('nav.login')}
                              </Link>
                              <Link
                                to="/register"
                                className="px-3.5 py-1.5 border border-border bg-card text-foreground text-xs font-semibold rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                {t('nav.register')}
                              </Link>
                            </div>
                          </div>
                        )}

                        <div ref={chatEndRef} />
                      </div>

                      {/* Chat text input form */}
                      {(!summary && turnsRemaining > 0) && (
                        <form onSubmit={handleSend} className="border-t border-border pt-3 flex gap-2">
                          <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            disabled={isPending}
                            placeholder={
                              messages.length <= 1 ? t('ai.placeholder_problem') : t('ai.placeholder_chat')
                            }
                            className="flex-grow px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary disabled:opacity-50"
                          />
                          <button
                            type="submit"
                            disabled={!inputMessage.trim() || isPending}
                            className="px-4 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-55"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Results Dashboard */}
            <div className="lg:col-span-6 space-y-6">
              {summary ? (
                <div className="space-y-6 animate-fade-in-up">
                  {/* Urgency Indicator */}
                  <UrgencyIndicator level={summary.urgencyLevel} />

                  {/* Summary Details */}
                  <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm text-left space-y-4">
                    <h3 className="text-base sm:text-lg font-bold text-foreground border-b border-border/60 pb-2">
                      📝 {language === 'bn' ? 'রোগের কারণ ও রিপোর্ট' : 'AI Diagnostic Summary'}
                    </h3>
                    <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {summary.diagnosis}
                    </p>
                  </div>

                  {/* Home Care advice */}
                  <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm text-left space-y-4">
                    <h3 className="text-base sm:text-lg font-bold text-primary border-b border-border/60 pb-2">
                      🏡 {t('ai.care_advice')}
                    </h3>
                    <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                      {summary.careAdvice}
                    </p>
                  </div>

                  {/* Recommendations suggestion cards */}
                  {suggestions && suggestions.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-base sm:text-lg font-extrabold text-foreground text-left pl-1">
                        🎯 {t('ai.suggested_providers')}
                      </h3>
                      <div className="space-y-4">
                        {suggestions.map((suggestion) => (
                          <ProviderSuggestionCard
                            key={suggestion.id}
                            rank={suggestion.rank}
                            score={suggestion.score}
                            reason={suggestion.reason}
                            provider_details={suggestion.provider_details}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Initial Placeholder dashboard
                <div className="bg-card border border-border border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center h-[550px] text-muted-foreground space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-foreground leading-tight">
                      {language === 'bn' ? 'রোগ বিশ্লেষণ রিপোর্ট প্যানেল' : 'Assessed Diagnostics Dashboard'}
                    </h4>
                    <p className="text-xs max-w-xs mx-auto leading-relaxed pt-1.5">
                      {language === 'bn'
                        ? 'আপনার পশুর লক্ষণ বিস্তারিত লিখে চ্যাট সম্পন্ন করুন। চ্যাট শেষ হলে এআই রিপোর্টের ও এলাকাভিত্তিক সাজেস্টেড ডাক্তারের তথ্য এখানে প্রদর্শিত হবে।'
                        : 'Consult with the AI assistant first. When completed, home care advices and top-ranked local providers suggestions will render here.'}
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
