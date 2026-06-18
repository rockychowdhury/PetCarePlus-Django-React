import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rehomingApi } from '../../api/rehoming'
import { aiApi } from '../../api/ai'
import { useLanguage } from '../../hooks/useLanguage'
import Spinner from '../ui/Spinner'
import { Send, AlertCircle, CheckCircle, Sparkles, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export const ApplicationForm = ({ listingId, ownerName, adopterName, adopterContact, onCancel, onSuccess }) => {
  const { language, t } = useLanguage()
  const queryClient = useQueryClient()
  
  const defaultClosing = `${language === 'bn' ? 'বিনীত,' : 'Sincerely,'}\n${adopterName}\n${adopterContact}`
  
  const [message, setMessage] = useState('')
  const [closing, setClosing] = useState(defaultClosing)
  const [errorText, setErrorText] = useState('')
  const [successText, setSuccessText] = useState('')

  const isDirty = message.trim().length > 0 || closing !== defaultClosing

  const handleReset = () => {
    setMessage('')
    setClosing(defaultClosing)
    setErrorText('')
    setSuccessText('')
  }

  // Mutation to submit the adoption application
  const applyMutation = useMutation({
    mutationFn: (data) => rehomingApi.createApplication(data),
    onSuccess: (data) => {
      setSuccessText(t('rehoming.success_apply'))
      queryClient.invalidateQueries(['applications'])
      setTimeout(() => {
        if (onSuccess) onSuccess(data)
      }, 2000)
    },
    onError: (err) => {
      setErrorText(err.response?.data?.detail || err.response?.data?.message || t('common.error'))
    },
  })

  // Mutation to polish text using AI
  const polishMutation = useMutation({
    mutationFn: (text) => aiApi.polishText(text, language),
    onSuccess: (data) => {
      setMessage(data.polished_text)
      toast.success(language === 'bn' ? 'টেক্সট পলিশ করা হয়েছে!' : 'Text polished successfully!', { icon: '✨' })
    },
    onError: () => {
      toast.error(language === 'bn' ? 'পলিশ করতে সমস্যা হয়েছে।' : 'Failed to polish text.')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorText('')
    setSuccessText('')
    if (!message.trim()) return
    
    // Combine the email parts before sending
    const fullMessage = `Hello ${ownerName},\n\n${message}\n\n${closing}`
    applyMutation.mutate({ listing: listingId, message: fullMessage })
  }

  const handleAiPolish = () => {
    if (!message.trim()) return
    polishMutation.mutate(message)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-4">
        <h4 className="font-bold text-sm uppercase text-pcp-text-primary tracking-wider">
          {language === 'bn' ? 'দত্তক নিতে আবেদন করুন' : 'Apply to Adopt'}
        </h4>
        
        {isDirty && !applyMutation.isPending && !successText && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md"
          >
            <X className="w-3 h-3" />
            {t('common.cancel')}
          </button>
        )}
      </div>

      <div className="bg-card dark:bg-pcp-card rounded-2xl border border-pcp-border/60 overflow-hidden text-sm shadow-sm focus-within:ring-1 focus-within:border-pcp-green/50 focus-within:ring-pcp-green/20 transition-all">
        {/* Email Header / Greeting */}
        <div className="px-5 pt-5 pb-1">
          <p className="font-medium text-foreground">
            {language === 'bn' ? 'হ্যালো' : 'Hello'} <span className="font-bold">{ownerName}</span>,
          </p>
        </div>

        {/* Email Body */}
        <div className="px-5 py-2 relative">
          {polishMutation.isPending && (
            <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-lg">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mb-2" />
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full animate-pulse">
                {language === 'bn' ? 'AI দিয়ে সাজানো হচ্ছে...' : 'Polishing with AI...'}
              </span>
            </div>
          )}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            disabled={applyMutation.isPending || polishMutation.isPending || !!successText}
            placeholder={language === 'bn' 
              ? 'শর্তসমূহ পড়ে আপনার পোষা প্রাণী পালনের অভিজ্ঞতা এবং কেন আপনি এটি দত্তক নিতে চান তা লিখুন...' 
              : 'Read the requirements and write your pet care experience and why you want to adopt this pet...'}
            className={`w-full resize-none bg-transparent border-none focus:ring-0 p-0 text-foreground placeholder:text-muted-foreground/50 leading-relaxed transition-opacity ${polishMutation.isPending ? 'opacity-30' : 'opacity-100'}`}
          />
        </div>

        {/* Email Closing */}
        <div className="px-5 pb-5 pt-1">
          <textarea
            value={closing}
            onChange={(e) => {
              setClosing(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = e.target.scrollHeight + 'px'
            }}
            rows={4}
            disabled={applyMutation.isPending || !!successText}
            className="w-full resize-none bg-transparent border-none focus:ring-0 p-0 text-muted-foreground font-medium overflow-hidden"
          />
        </div>
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
          onClick={handleAiPolish}
          disabled={applyMutation.isPending || polishMutation.isPending || !!successText || !message.trim()}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
        >
          {polishMutation.isPending ? (
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>{language === 'bn' ? 'এআই দিয়ে পলিশ করুন' : 'Polish with AI'}</span>
        </button>

        <button
          type="submit"
          disabled={applyMutation.isPending || !message.trim() || !!successText}
          className="px-5 py-2 bg-pcp-green hover:bg-pcp-green-hover text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
        >
          {applyMutation.isPending ? <Spinner size="sm" /> : <Send className="w-3.5 h-3.5" />}
          <span>{t('rehoming.btn_apply')}</span>
        </button>
      </div>
    </form>
  )
}

export default ApplicationForm
