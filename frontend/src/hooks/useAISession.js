import { useState } from 'react'
import { aiApi } from '../api/ai'
import { useLanguage } from './useLanguage'

export const useAISession = () => {
  const { language } = useLanguage()
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [isPending, setIsPending] = useState(false)
  const [summary, setSummary] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [turnsRemaining, setTurnsRemaining] = useState(3)

  const startSession = async (animalTypeId) => {
    setIsPending(true)
    try {
      const session = await aiApi.createSession(animalTypeId)
      setSessionId(session.id)
      setMessages([
        {
          role: 'assistant',
          content:
            language === 'bn'
              ? 'ধন্যবাদ! অনুগ্রহ করে আপনার প্রাণীর কী কী লক্ষণ বা সমস্যা হচ্ছে তা বিস্তারিত লিখুন।'
              : 'Thank you! Please describe the symptoms or issues your animal is facing in detail.',
        },
      ])
      setSummary(null)
      setSuggestions([])
      setTurnsRemaining(session.turns_remaining ?? 3)
      return session
    } catch (error) {
      console.error('Failed to start AI session:', error)
      throw error
    } finally {
      setIsPending(false)
    }
  }

  const sendMessage = async (messageText) => {
    if (!sessionId) return

    // Immediately push user message to UI
    const userMessage = { role: 'user', content: messageText }
    setMessages((prev) => [...prev, userMessage])
    setIsPending(true)

    try {
      const response = await aiApi.sendChatMessage(sessionId, messageText, language)

      // Push assistant response to UI
      const assistantMessage = { role: 'assistant', content: response.text }
      setMessages((prev) => [...prev, assistantMessage])

      if (response.session_complete) {
        // Fetch session summary and ranked provider suggestions
        const summaryData = await aiApi.getSessionSummary(sessionId)
        setSummary({
          urgencyLevel: summaryData.urgency_level,
          diagnosis: summaryData.ai_diagnosis_summary,
          careAdvice: summaryData.ai_care_advice,
        })
        setSuggestions(summaryData.suggestions || [])
      }

      if (response.turns_remaining !== undefined) {
        setTurnsRemaining(response.turns_remaining)
      }
    } catch (error) {
      console.error('Failed to send AI message:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            language === 'bn'
              ? 'দুঃখিত, এআই সহকারীর সাথে সংযোগ বিচ্ছিন্ন হয়েছে। আবার চেষ্টা করুন।'
              : 'Sorry, connection to the AI assistant failed. Please try again.',
        },
      ])
    } finally {
      setIsPending(false)
    }
  }

  return {
    sessionId,
    messages,
    isPending,
    summary,
    suggestions,
    turnsRemaining,
    startSession,
    sendMessage,
    resetSession: () => {
      setSessionId(null)
      setMessages([])
      setSummary(null)
      setSuggestions([])
      setTurnsRemaining(3)
    },
  }
}
