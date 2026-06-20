import { useState, useCallback } from 'react'
import { aiApi } from '../api/ai'

/**
 * Hook for the one-shot AI diagnostic flow.
 * Manages form submission, loading state, and the structured AI response.
 */
export const useAIDiagnose = () => {
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const submitDiagnosis = useCallback(async (payload) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await aiApi.diagnose(payload)
      setResult(response)
      return response
    } catch (err) {
      console.error('AI Diagnosis failed:', err)
      const message =
        err.response?.data?.problem_description?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.animal_type_id?.[0] ||
        'AI diagnosis failed. Please try again.'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resetDiagnosis = useCallback(() => {
    setResult(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    result,
    isLoading,
    error,
    submitDiagnosis,
    resetDiagnosis,
  }
}
