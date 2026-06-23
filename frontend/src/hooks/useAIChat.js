import { useState, useCallback } from 'react'
import { aiApi } from '../api/ai'

/**
 * Hook for managing the multi-turn AI diagnostic chat flow.
 */
export const useAIChat = () => {
  const [messages, setMessages] = useState([])
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const startChat = useCallback(async (payload) => {
    setIsLoading(true)
    setError(null)
    setMessages([])
    setSession(null)

    try {
      const response = await aiApi.chat(payload)
      const newSession = response.session
      setSession(newSession)
      
      // Sync conversation history
      if (newSession && newSession.conversation_history) {
        setMessages(newSession.conversation_history)
      } else {
        setMessages([
          { role: 'user', content: payload.message },
          { role: 'assistant', content: response.reply }
        ])
      }
      return response
    } catch (err) {
      console.error('Failed to start AI chat:', err)
      const msg =
        err.response?.data?.message?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Failed to start AI chat. Please try again.'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendMessage = useCallback(async (text, locationPayload = {}) => {
    if (!session) return
    
    setIsLoading(true)
    setError(null)

    // Optimistically add user message to list
    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])

    try {
      const payload = {
        session_id: session.id,
        message: text,
        preferred_language: session.preferred_language || 'bn',
        ...locationPayload
      }
      const response = await aiApi.chat(payload)
      setSession(response.session)
      
      if (response.session && response.session.conversation_history) {
        setMessages(response.session.conversation_history)
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response.reply }])
      }
      return response
    } catch (err) {
      console.error('Failed to send AI chat message:', err)
      // Rollback the user message on request failure
      setMessages(prev => prev.slice(0, -1))
      const msg =
        err.response?.data?.message?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Failed to send message. Please try again.'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [session])

  const resetChat = useCallback(() => {
    setMessages([])
    setSession(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    messages,
    session,
    isLoading,
    error,
    startChat,
    sendMessage,
    resetChat,
    setSession,
  }
}
