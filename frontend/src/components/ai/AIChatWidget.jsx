import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAISession } from '../../hooks/useAISession'
import { guidelinesApi } from '../../api/guidelines'
import { useLanguage } from '../../hooks/useLanguage'
import { getAnimalIcon, ANIMAL_THEMES } from '../../utils/animals'
import MessageBubble from './MessageBubble'
import Spinner from '../ui/Spinner'
import { Send, ArrowRight, Sparkles, MessageSquare, RefreshCw } from 'lucide-react'

export const AIChatWidget = ({ isMini = true }) => {
  const { language, t } = useLanguage()
  const navigate = useNavigate()
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
      console.error('Failed to initialize AI Chat Widget:', err)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || isPending) return
    const msg = inputMessage
    setInputMessage('')
    await sendMessage(msg)
  }

  // Scroll to bottom whenever messages list grows
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isPending])

  return (
    <div className="w-full bg-card rounded-2xl border border-border/80 shadow-md overflow-hidden flex flex-col h-[500px]">
      {/* Widget Header */}
      <div className="bg-gradient-to-r from-pcp-green to-pcp-green-light px-5 py-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 fill-current text-accent" />
          <div>
            <h3 className="font-bold text-sm md:text-base tracking-tight">
              {t('nav.ai_assistant')}
            </h3>
            <p className="text-[10px] text-white/80">
              Gemini 2.5 Flash • {t('common.verified_badge')}
            </p>
          </div>
        </div>
        {sessionId && (
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

      {/* Widget Body */}
      <div className="flex-grow overflow-y-auto p-4 bg-pcp-surface/20 flex flex-col">
        {!selectedAnimal ? (
          // Animal selection step
          <div className="my-auto space-y-6 text-center py-6 px-4">
            <div className="space-y-2">
              <h4 className="text-base font-bold text-foreground">
                {t('ai.step_animal')}
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                পশু চিকিৎসকের পরামর্শ পেতে প্রথমে আপনার প্রাণীর ধরণ নির্বাচন করুন।
              </p>
            </div>

            {isLoadingAnimals ? (
              <Spinner className="py-6" />
            ) : (
              <div className="grid grid-cols-4 gap-2.5 max-w-md mx-auto">
                {animalTypes?.map((animal) => {
                  const Icon = getAnimalIcon(animal.slug)
                  const theme = ANIMAL_THEMES[animal.slug] || ANIMAL_THEMES.cat
                  return (
                    <button
                      key={animal.id}
                      onClick={() => handleAnimalSelect(animal)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${theme.bg} ${theme.border} group`}
                    >
                      <Icon className={`w-6 h-6 mb-1.5 ${theme.text} group-hover:scale-110 transition-transform`} />
                      <span className="text-[11px] font-bold text-foreground">
                        {language === 'bn' ? animal.name_bn : animal.name_en}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          // Chat interface
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
                    <span>খুঁজছি...</span>
                  </div>
                </div>
              )}

              {/* Turn Limit Reached CTA */}
              {!isPending && turnsRemaining <= 0 && !summary && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 my-4 text-center space-y-3 dark:bg-amber-950/20 dark:border-amber-900/50 animate-fade-in-up">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">
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

              {/* Concluded diagnosis summary block in chat */}
              {summary && (
                <div className="space-y-4 my-4 animate-fade-in-up">
                  {/* Diagnosis */}
                  <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                    <h4 className="font-bold text-xs md:text-sm text-foreground uppercase tracking-wider">
                      📝 {t('ai.urgency')}
                    </h4>
                    <p className="text-xs md:text-sm leading-relaxed text-foreground/90">
                      {summary.diagnosis}
                    </p>
                  </div>

                  {/* Home Care */}
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
                    <h4 className="font-bold text-xs md:text-sm text-primary uppercase tracking-wider">
                      🏡 {t('ai.care_advice')}
                    </h4>
                    <p className="text-xs md:text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                      {summary.careAdvice}
                    </p>
                  </div>

                  {/* Suggestion CTA button if in preview mode */}
                  {isMini && (
                    <button
                      onClick={() => navigate('/ai-assistant')}
                      className="w-full py-2.5 bg-accent hover:bg-accent/95 text-accent-foreground rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>নিকটস্থ সেবাদাতাদের তথ্য দেখুন</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input form */}
            {(!summary && turnsRemaining > 0) && (
              <form onSubmit={handleSend} className="border-t border-border/80 pt-3 flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isPending}
                  placeholder={
                    messages.length <= 1 ? t('ai.placeholder_problem') : t('ai.placeholder_chat')
                  }
                  className="flex-grow px-4 py-2.5 rounded-xl border border-border bg-pcp-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isPending}
                  className="px-4 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AIChatWidget
