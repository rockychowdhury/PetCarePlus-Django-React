import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi } from '../../api/bookings'
import { providersApi } from '../../api/providers'
import { useLanguage } from '../../hooks/useLanguage'
import { useAuthStore } from '../../store/authStore'
import StarRatingInput from './StarRatingInput'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import { Star, Send, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * Dialog for submitting a review for a provider.
 * Only shows completed bookings that haven't been reviewed yet.
 */
export const WriteReviewDialog = ({ isOpen, onClose, providerId, providerName, existingReviewBookingIds = [] }) => {
  const { language } = useLanguage()
  const { token } = useAuthStore()
  const queryClient = useQueryClient()

  const [selectedBookingId, setSelectedBookingId] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  // Fetch completed bookings for this provider
  const { data: completedBookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['completedBookings', providerId],
    queryFn: () => bookingsApi.getCompletedBookingsForProvider(providerId),
    enabled: isOpen && !!token && !!providerId,
    select: (data) => {
      const results = Array.isArray(data) ? data : data?.results ?? []
      // Filter out bookings that already have reviews
      return results.filter(b => !existingReviewBookingIds.includes(b.id))
    },
  })

  const reviewMutation = useMutation({
    mutationFn: (reviewData) => providersApi.createReview(reviewData),
    onSuccess: () => {
      toast.success(
        language === 'bn' ? 'আপনার রিভিউ সফলভাবে জমা দেওয়া হয়েছে!' : 'Review submitted successfully!',
        { icon: '⭐' }
      )
      queryClient.invalidateQueries(['providerReviews', String(providerId)])
      queryClient.invalidateQueries(['providerDetail', String(providerId)])
      queryClient.invalidateQueries(['completedBookings', providerId])
      handleReset()
      onClose()
    },
    onError: (err) => {
      const detail = err.response?.data?.booking?.[0] || err.response?.data?.detail || err.response?.data?.message
      setError(detail || (language === 'bn' ? 'কিছু একটা ভুল হয়েছে।' : 'Something went wrong.'))
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!selectedBookingId) {
      setError(language === 'bn' ? 'একটি বুকিং নির্বাচন করুন।' : 'Please select a booking.')
      return
    }
    if (rating === 0) {
      setError(language === 'bn' ? 'রেটিং দিন।' : 'Please select a rating.')
      return
    }

    reviewMutation.mutate({
      booking: parseInt(selectedBookingId),
      rating,
      comment,
    })
  }

  const handleReset = () => {
    setSelectedBookingId('')
    setRating(0)
    setComment('')
    setError('')
  }

  const handleOpenChange = (open) => {
    if (!open) {
      handleReset()
      onClose()
    }
  }

  const hasReviewableBookings = completedBookings && completedBookings.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl border-border/60">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold text-foreground flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            {language === 'bn' ? 'রিভিউ লিখুন' : 'Write a Review'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {language === 'bn'
              ? `${providerName}-এর জন্য আপনার অভিজ্ঞতা শেয়ার করুন`
              : `Share your experience with ${providerName}`}
          </DialogDescription>
        </DialogHeader>

        {isLoadingBookings ? (
          <div className="py-8 text-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground mt-3">
              {language === 'bn' ? 'বুকিং খুঁজছে...' : 'Finding your bookings...'}
            </p>
          </div>
        ) : !hasReviewableBookings ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6 text-amber-500" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {language === 'bn' ? 'রিভিউ দেওয়ার কোনো বুকিং নেই' : 'No bookings to review'}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
              {language === 'bn'
                ? 'রিভিউ দিতে হলে প্রথমে একটি সেবা বুক করুন এবং সেবাদাতা সেটি সম্পন্ন করবেন।'
                : 'You need a completed booking with this provider before you can leave a review.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            {/* Booking Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">
                {language === 'bn' ? 'বুকিং নির্বাচন করুন' : 'Select Booking'}
              </label>
              <select
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-border bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-semibold transition-colors"
              >
                <option value="">
                  -- {language === 'bn' ? 'বুকিং নির্বাচন করুন' : 'Select a booking'} --
                </option>
                {completedBookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    {booking.service_details?.name_en || 'Service'} — {booking.booking_date}
                  </option>
                ))}
              </select>
            </div>

            {/* Star Rating */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">
                {language === 'bn' ? 'রেটিং দিন' : 'Your Rating'}
              </label>
              <StarRatingInput value={rating} onChange={setRating} size="md" />
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">
                {language === 'bn' ? 'মন্তব্য (ঐচ্ছিক)' : 'Comment (Optional)'}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder={language === 'bn' ? 'আপনার অভিজ্ঞতা শেয়ার করুন...' : 'Share your experience...'}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-border bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-semibold transition-colors resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 rounded-xl text-xs flex gap-2 items-center animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={reviewMutation.isPending || rating === 0}
              className="w-full py-3 bg-pcp-green hover:bg-pcp-green-hover text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] disabled:opacity-55"
            >
              {reviewMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{language === 'bn' ? 'রিভিউ জমা দিন' : 'Submit Review'}</span>
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default WriteReviewDialog
