import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi } from '../../api/bookings'
import { providersApi } from '../../api/providers'
import { useAuthStore } from '../../store/authStore'
import { useLanguage } from '../../hooks/useLanguage'
import Spinner from '../../components/ui/Spinner'
import { Calendar, Clock, Check, X, Star, AlertCircle, CheckCircle, ChevronRight, User, Briefcase, ChevronDown, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

const DashboardBookings = () => {
  const { language, t } = useLanguage()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const isProvider = user?.role === 'provider'

  const [activeTab, setActiveTab] = useState('upcoming') // 'today', 'upcoming', 'history'

  // Review Modal State
  const [reviewBookingId, setReviewBookingId] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)

  // Query appointments
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['userBookings'],
    queryFn: () => bookingsApi.getBookings(),
  })

  const appointments = Array.isArray(bookings) 
    ? bookings 
    : (bookings?.results || [])

  // Categorize Bookings
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayBookings = []
  const upcomingBookings = []
  const historyBookings = []

  // Sort appointments so newest are first
  const sortedAppointments = [...appointments].sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date))

  sortedAppointments.forEach(booking => {
    if (!booking.booking_date) return
    const bDate = new Date(booking.booking_date)
    bDate.setHours(0, 0, 0, 0)
    
    // Status 'completed' or 'cancelled' usually means history regardless of date
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      historyBookings.push(booking)
    } else if (bDate.getTime() === today.getTime()) {
      todayBookings.push(booking)
    } else if (bDate.getTime() > today.getTime()) {
      upcomingBookings.push(booking)
    } else {
      historyBookings.push(booking)
    }
  })

  // Auto-switch to today if there are today bookings and it's the first load
  useEffect(() => {
    if (todayBookings.length > 0 && activeTab !== 'today' && !sessionStorage.getItem('bookingTabSet')) {
      setActiveTab('today')
      sessionStorage.setItem('bookingTabSet', 'true')
    }
  }, [todayBookings.length, activeTab])

  // Mutation to update booking status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => bookingsApi.updateBookingStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['userBookings'])
      if (variables.status === 'confirmed') toast.success('Booking confirmed!')
      if (variables.status === 'completed') toast.success('Booking marked as completed!')
      if (variables.status === 'cancelled') toast.success('Booking cancelled.')
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || t('common.error'))
    },
  })

  // Mutation to submit a review
  const reviewMutation = useMutation({
    mutationFn: (data) => providersApi.createReview(data),
    onSuccess: () => {
      setReviewSuccess(true)
      queryClient.invalidateQueries(['userBookings'])
      toast.success('Review submitted successfully!')
      setTimeout(() => {
        setReviewSuccess(false)
        setReviewBookingId(null)
        setReviewRating(5)
        setReviewComment('')
      }, 2000)
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || err.response?.data?.message || t('common.error'))
    },
  })

  const handleStatusChange = (bookingId, nextStatus) => {
    if (window.confirm(language === 'bn' ? `আপনি কি অ্যাপয়েন্টমেন্টের স্ট্যাটাস পরিবর্তন করতে চান?` : `Are you sure you want to change this booking status?`)) {
      updateStatusMutation.mutate({ id: bookingId, status: nextStatus })
    }
  }

  const handleReviewSubmit = (e) => {
    e.preventDefault()
    reviewMutation.mutate({
      booking: reviewBookingId,
      rating: reviewRating,
      comment_en: reviewComment,
      comment_bn: reviewComment, // For simplicity we pass the same to both fields 
    })
  }

  const getActiveBookings = () => {
    if (activeTab === 'today') return todayBookings
    if (activeTab === 'upcoming') return upcomingBookings
    return historyBookings
  }

  const currentBookings = getActiveBookings()

  const TabButton = ({ id, label, count, colorClass }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative px-5 py-3 text-sm font-extrabold transition-all duration-300 rounded-t-2xl flex items-center gap-2 ${
        activeTab === id 
          ? 'text-foreground bg-card shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)] border-t border-x border-border/80' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 border-t border-x border-transparent'
      }`}
    >
      {label}
      <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === id ? colorClass : 'bg-muted text-muted-foreground'}`}>
        {count}
      </span>
      {activeTab === id && (
        <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-card"></div>
      )}
    </button>
  )

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300',
      confirmed: 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300',
      completed: 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300',
      cancelled: 'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-300',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-sm ${styles[status] || styles.pending}`}>
        {t(`bookings.status.${status}`)}
      </span>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            {isProvider ? t('bookings.provider_bookings') : t('bookings.my_bookings')}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            {language === 'bn' 
              ? 'আপনার সমস্ত অ্যাপয়েন্টমেন্ট পরিচালনা করুন। আজকের, আগামী দিনের এবং অতীতের বুকিংগুলো সহজেই ট্র্যাক করুন।'
              : 'Manage all your appointments. Easily track today’s, upcoming, and past bookings in one place.'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border/80 px-2 overflow-x-auto no-scrollbar">
        <TabButton id="today" label={language === 'bn' ? 'আজকের' : 'Today'} count={todayBookings.length} colorClass="bg-rose-100 text-rose-700" />
        <TabButton id="upcoming" label={language === 'bn' ? 'আসন্ন' : 'Upcoming'} count={upcomingBookings.length} colorClass="bg-blue-100 text-blue-700" />
        <TabButton id="history" label={language === 'bn' ? 'অতীতের' : 'History'} count={historyBookings.length} colorClass="bg-emerald-100 text-emerald-700" />
      </div>

      {/* Content */}
      <div className="pt-2">
        {isLoading ? (
          <Spinner className="py-24" />
        ) : currentBookings.length === 0 ? (
          <div className="text-center py-24 px-4 bg-card rounded-3xl border border-dashed border-border/80 shadow-sm flex flex-col items-center justify-center animate-fade-in">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-extrabold text-foreground mb-1">
              {language === 'bn' ? 'কোনো বুকিং পাওয়া যায়নি' : 'No bookings found'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'bn' 
                ? 'এই বিভাগে আপনার কোনো অ্যাপয়েন্টমেন্ট নেই।' 
                : 'You have no appointments in this category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 animate-fade-in">
            {currentBookings.map((booking) => {
              const serviceName = language === 'bn' ? (booking.service_details?.name_bn || booking.service_details?.name) : booking.service_details?.name
              const providerName = booking.provider_details?.business_name || 'Service Provider'
              const clientName = booking.user_details?.name || booking.user_details?.email
              
              return (
                <div key={booking.id} className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
                  <div className="space-y-5">
                    {/* Top Row: Date & Status */}
                    <div className="flex justify-between items-center border-b border-border/50 pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-2xl flex items-center justify-center ${activeTab === 'today' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                          {activeTab === 'history' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-foreground">{booking.booking_date}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{booking.booking_time || 'TBD'}</p>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    {/* Middle Row: Service & Person Details */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                      <div className="space-y-1 flex-1 min-w-0">
                        <h3 className="font-extrabold text-lg text-foreground truncate">{serviceName}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
                          {isProvider ? (
                            <><User className="w-4 h-4 text-indigo-500" /> <span className="truncate">{clientName}</span></>
                          ) : (
                            <><Briefcase className="w-4 h-4 text-emerald-500" /> <span className="truncate">{providerName}</span></>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 bg-muted/30 p-3 rounded-2xl border border-border/50">
                        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
                          {language === 'bn' ? 'ফি' : 'Fee'}
                        </span>
                        <span className="font-extrabold text-lg text-pcp-green">
                          ৳{booking.service_details?.price || '0'}
                        </span>
                      </div>
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                      <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 p-3 rounded-xl text-sm italic font-medium border border-amber-100 dark:border-amber-900/50">
                        "{booking.notes}"
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="mt-6 pt-4 border-t border-border/50 flex flex-wrap gap-2 justify-end">
                    {isProvider ? (
                      // Provider Actions
                      <>
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {t('bookings.actions.confirm')}
                          </button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'completed')}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {t('bookings.actions.complete')}
                          </button>
                        )}
                        {['pending', 'confirmed'].includes(booking.status) && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            {t('bookings.actions.cancel')}
                          </button>
                        )}
                      </>
                    ) : (
                      // Customer Actions
                      <>
                        {['pending', 'confirmed'].includes(booking.status) && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            {t('bookings.actions.cancel')}
                          </button>
                        )}
                        {booking.status === 'completed' && !booking.has_review && (
                          <button
                            onClick={() => setReviewBookingId(booking.id)}
                            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-xl text-xs font-extrabold transition-all shadow-sm flex items-center gap-1.5 group"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-950 group-hover:scale-110 transition-transform" />
                            {language === 'bn' ? 'রিভিউ লিখুন' : 'Write Review'}
                          </button>
                        )}
                        {booking.status === 'completed' && booking.has_review && (
                          <div className="px-4 py-2 bg-muted/50 text-muted-foreground rounded-xl text-xs font-extrabold flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 fill-muted-foreground/30" />
                            {language === 'bn' ? 'রিভিউ দেওয়া হয়েছে' : 'Reviewed'}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewBookingId && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-3xl shadow-xl border border-border/60 flex flex-col relative animate-scale-in overflow-hidden">
            <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-6 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-amber-950 flex items-center gap-2">
                <Star className="w-6 h-6 fill-amber-950" />
                {language === 'bn' ? 'মতামত দিন' : 'Leave a Review'}
              </h3>
              <button 
                onClick={() => setReviewBookingId(null)} 
                className="p-1.5 rounded-full hover:bg-black/10 text-amber-950 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-6">
              {/* Rating */}
              <div className="space-y-3 flex flex-col items-center">
                <label className="text-sm font-extrabold text-foreground">
                  {language === 'bn' ? 'সেবাটি কেমন লেগেছে?' : 'How was the service?'}
                </label>
                <div className="flex gap-2 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star className={`w-10 h-10 transition-colors ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {language === 'bn' ? 'আপনার অভিজ্ঞতা শেয়ার করুন' : 'Share your experience'}
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                  rows={4}
                  placeholder={language === 'bn' ? 'যেমন: চমৎকার সেবা...' : 'e.g. Excellent service...'}
                  className="w-full px-4 py-3 text-sm rounded-2xl border border-border bg-pcp-surface focus:outline-none focus:border-amber-400 font-semibold resize-none transition-colors"
                />
              </div>

              {/* Success */}
              {reviewSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-sm font-bold flex gap-2 items-center border border-emerald-200 animate-fade-in-up">
                  <CheckCircle2 className="w-5 h-5" />
                  {language === 'bn' ? 'রিভিউ সফলভাবে পোস্ট করা হয়েছে!' : 'Review posted successfully!'}
                </div>
              )}

              {/* Actions */}
              <button
                type="submit"
                disabled={reviewMutation.isPending || reviewSuccess}
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-extrabold rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:hover:bg-amber-400 flex items-center justify-center gap-2"
              >
                {reviewMutation.isPending ? <Spinner size="sm" /> : (reviewSuccess ? <CheckCircle2 className="w-5 h-5" /> : null)}
                {reviewSuccess ? (language === 'bn' ? 'ধন্যবাদ!' : 'Thank you!') : (language === 'bn' ? 'সাবমিট করুন' : 'Submit Review')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardBookings
