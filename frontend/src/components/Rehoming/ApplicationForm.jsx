import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rehomingApi } from '../../api/rehoming'
import { useLanguage } from '../../hooks/useLanguage'
import Spinner from '../ui/Spinner'
import { Send, AlertCircle, CheckCircle } from 'lucide-react'

export const ApplicationForm = ({ listingId, onCancel, onSuccess }) => {
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const [errorText, setErrorText] = useState('')
  const [successText, setSuccessText] = useState('')

  // Mutation to submit the adoption application
  const applyMutation = useMutation({
    mutationFn: (data) => rehomingApi.createApplication(data),
    onSuccess: (data) => {
      setSuccessText(t('rehoming.success_apply'))
      setMessage('')
      queryClient.invalidateQueries(['applications'])
      setTimeout(() => {
        if (onSuccess) onSuccess(data)
      }, 2000)
    },
    onError: (err) => {
      setErrorText(err.response?.data?.detail || err.response?.data?.message || t('common.error'))
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorText('')
    setSuccessText('')
    if (!message.trim()) return
    applyMutation.mutate({ listing: listingId, message })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-up">
      <div className="space-y-2">
        <label className="block text-sm font-bold text-foreground">
          {t('rehoming.apply_message')}
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          disabled={applyMutation.isPending || !!successText}
          placeholder={t('rehoming.apply_placeholder')}
          className="w-full px-4 py-3 rounded-xl border border-border bg-pcp-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
        />
      </div>

      {/* Success banner */}
      {successText && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm flex gap-2 items-center dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{successText}</span>
        </div>
      )}

      {/* Error banner */}
      {errorText && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm flex gap-2 items-center dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorText}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={applyMutation.isPending || !!successText}
          className="px-4 py-2 border border-border bg-card text-foreground text-xs font-semibold rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={applyMutation.isPending || !message.trim() || !!successText}
          className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
        >
          {applyMutation.isPending ? <Spinner size="sm" /> : <Send className="w-3.5 h-3.5" />}
          <span>{t('rehoming.btn_apply')}</span>
        </button>
      </div>
    </form>
  )
}

export default ApplicationForm
