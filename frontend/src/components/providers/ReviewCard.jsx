import React from 'react'
import { Star, User } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

export const ReviewCard = ({ review }) => {
  const { tField } = useLanguage()

  const {
    rating,
    reviewer,
    comment_en,
    comment_bn,
    created_at,
  } = review

  const reviewerName = reviewer?.name || reviewer?.email || 'Anonymous Owner'
  const ratingValue = parseFloat(rating) || 5

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    } catch (e) {
      return dateStr
    }
  }

  // Fetch localized comment or fallback
  const comment = tField(review, 'comment')

  return (
    <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-3">
      {/* Reviewer Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs md:text-sm font-bold text-foreground">
              {reviewerName}
            </h5>
            <span className="text-[10px] text-muted-foreground">
              {formatDate(created_at)}
            </span>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="flex text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < Math.round(ratingValue) ? 'fill-current' : 'text-muted/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Review Comment */}
      {comment && (
        <div className="pl-1">
          <p className="text-xs md:text-sm text-foreground/80 leading-relaxed italic">
            "{comment}"
          </p>
        </div>
      )}
    </div>
  )
}

export default ReviewCard
