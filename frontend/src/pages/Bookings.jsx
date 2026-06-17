import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi } from '../api/bookings'
import { providersApi } from '../api/providers'
import { useAuthStore } from '../store/authStore'
import { useLanguage } from '../hooks/useLanguage'
import PageLayout from '../components/layout/PageLayout'
import Spinner from '../components/ui/Spinner'
import { Calendar, Clock, Check, X, Clipboard, Star, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react'

export const Bookings = () => {
  const { language, t } = useLanguage()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  // Review Modal State
  const [reviewBookingId, setReviewBookingId] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewCommentEn, setReviewCommentEn] = useState('')
  const [reviewCommentBn, setReviewCommentBn] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)

  // Query appointments
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['userBookings'],
    queryFn: () => bookingsApi.getBookings(),
  })

  const appointments = bookings || []

  // Mutation to update booking status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => bookingsApi.updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['userBookings'])
    },
    onError: (err) => {
      alert(err.response?.data?.detail || t('common.error'))
    },
  })

  // Mutation to submit a review
  const reviewMutation = useMutation({
    mutationFn: (data) => providersApi.createReview(data),
    onSuccess: () => {
      setReviewSuccess(true)
      setReviewRating(5)
      setReviewCommentEn('')
      setReviewCommentBn('')
      queryClient.invalidateQueries(['userBookings'])
      setTimeout(() => {
        setReviewSuccess(false)
        setReviewBookingId(null)
      }, 2000)
    },
    onError: (err) => {
      setReviewError(err.response?.data?.detail || err.response?.data?.message || t('common.error'))
    },
  })

  const handleStatusChange = (bookingId, nextStatus) => {
    if (window.confirm(language === 'bn' ? `আপনি কি অ্যাপয়েন্টমেন্টের স্ট্যাটাস পরিবর্তন করতে চান?` : `Are you sure you want to change this booking status?`)) {
      updateStatusMutation.mutate({ id: bookingId, status: nextStatus })
    }
  }

  const handleReviewSubmit = (e) => {
    e.preventDefault()
    setReviewError('')
    setReviewSuccess(false)

    reviewMutation.mutate({
      booking: reviewBookingId,
      rating: reviewRating,
      comment_en: reviewCommentEn,
      comment_bn: reviewCommentBn || reviewCommentEn, // fallback
    })
  }

  const isProvider = user?.role === 'provider'

  return (
    <PageLayout>
      <div className="bg-pcp-surface/20 py-8 min-h-screen border-b border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
          
          {/* Header */}
          <div className="text-center sm:text-left space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              {isProvider ? t('bookings.provider_bookings') : t('bookings.my_bookings')}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              আপনার পোষা প্রাণী এবং গবাদি পশুর ভেটেরিনারি চিকিৎসকের অ্যাপয়েন্টমেন্ট সমূহ পরিচালনা করুন।
            </p>
          </div>

          {/* Appointments list */}
          {isLoading ? (
            <Spinner className="py-24" />
          ) : appointments.length === 0 ? (
            <div className="text-center py-20 px-4 bg-card rounded-2xl border border-dashed border-border/80">
              <Calendar className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
              <p className="text-sm font-bold text-muted-foreground">
                {t('bookings.no_bookings')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((booking) => {
                const serviceName = language === 'bn' ? (booking.service_details?.name_bn || booking.service_details?.name) : booking.service_details?.name
                const providerName = booking.provider_details?.business_name || 'Service Provider'
                const clientName = booking.user_details?.name || booking.user_details?.email
                
                return (
                  <div
                    key={booking.id}
                    className="bg-card border border-border/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 animate-fade-in-up"
                  >
                    {/* Information */}
                    <div className="space-y-2.5 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            booking.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : booking.status === 'confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : booking.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {t(`bookings.status.${booking.status}`)}
                        </span>
                        
                        <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">
                          ৳{booking.service_details?.price || '0'}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base md:text-lg text-foreground leading-snug">
                        {serviceName}
                      </h3>

                      <div className="space-y-1 text-xs text-muted-foreground font-medium">
                        <p className="text-foreground/90 font-semibold">
                          {isProvider ? `${t('rehoming.applicant')}: ${clientName}` : `${t('nav.providers')}: ${providerName}`}
                        </p>
                        <div className="flex gap-4 pt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            <span>{booking.booking_date}</span>
                          </span>
                          {booking.booking_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-primary" />
                              <span>{booking.booking_time}</span>
                            </span>
                          )}
                        </div>
                        {booking.notes && (
                          <p className="pt-1.5 border-t border-border/40 text-foreground/80 italic font-normal">
                            "{booking.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex-shrink-0 flex gap-2 w-full sm:w-auto pt-3 sm:pt-0 justify-end border-t sm:border-t-0 border-border/40">
                      {isProvider ? (
                        // Provider controls: Confirm, Complete, Cancel
                        <>
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => handleStatusChange(booking.id, 'confirmed')}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-emerald-100 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              <span>{t('bookings.actions.confirm')}</span>
                            </button>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusChange(booking.id, 'completed')}
                              className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-blue-100 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              <span>{t('bookings.actions.complete')}</span>
                            </button>
                          )}
                          {['pending', 'confirmed'].includes(booking.status) && (
                            <button
                              onClick={() => handleStatusChange(booking.id, 'cancelled')}
                              className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-rose-100 transition-colors"
                            >
                              <X className="w-4 h-4" />
                              <span>{t('bookings.actions.cancel')}</span>
                            </button>
                          )}
                        </>
                      ) : (
                        // Customer controls: Cancel or Review
                        <>
                          {['pending', 'confirmed'].includes(booking.status) && (
                            <button
                              onClick={() => handleStatusChange(booking.id, 'cancelled')}
                              className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-rose-100 transition-colors"
                            >
                              <X className="w-4 h-4" />
                              <span>{t('bookings.actions.cancel')}</span>
                            </button>
                          )}
                          
                          {/* If completed, let them submit a review! */}
                          {booking.status === 'completed' && !booking.has_review && (
                            <button
                              onClick={() => setReviewBookingId(booking.id)}
                              className="px-3.5 py-2 bg-accent hover:bg-accent/95 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>রিভিউ লিখুন</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Write Review Dialog Overlay */}
          {reviewBookingId && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 animate-fade-in-up text-left">
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  গ্রাহক মতামত (রিভিউ) লিখুন
                </h3>

                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Rating selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">
                      রেটিং দিন (১ থেকে ৫ স্টার):
                    </label>
                    <div className="flex gap-2 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star className={`w-7 h-7 ${star <= reviewRating ? 'fill-current' : 'text-muted/65'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment Bangla */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">
                      মতামত (বাংলায় লিখুন):
                    </label>
                    <textarea
                      value={reviewCommentBn}
                      onChange={(e) => setReviewCommentBn(e.target.value)}
                      required
                      rows={2}
                      placeholder="যেমন: অসাধারণ যত্ন ও সময়োপযোগী চিকিৎসাসেবা..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>

                  {/* Comment English */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">
                      Comment (in English):
                    </label>
                    <textarea
                      value={reviewCommentEn}
                      onChange={(e) => setReviewCommentEn(e.target.value)}
                      required
                      rows={2}
                      placeholder="e.g. Caring doctor and professional service..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>

                  {/* Success banner */}
                  {reviewSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex gap-1.5 items-center dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
                      <CheckCircle className="w-4 h-4" />
                      <span>রিভিউ সফলভাবে পোস্ট করা হয়েছে!</span>
                    </div>
                  )}

                  {/* Error banner */}
                  {reviewError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex gap-1.5 items-center dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50">
                      <AlertCircle className="w-4 h-4" />
                      <span>{reviewError}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setReviewBookingId(null)}
                      className="px-4 py-2 border border-border bg-card text-foreground text-xs font-semibold rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={reviewMutation.isPending || !!reviewSuccess}
                      className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-55"
                    >
                      {reviewMutation.isPending && <Spinner size="sm" />}
                      <span>{t('common.submit')}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </PageLayout>
  )
}

export default Bookings
