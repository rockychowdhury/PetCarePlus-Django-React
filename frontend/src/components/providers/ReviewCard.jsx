import React from 'react'
import { Star, User } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

export const ReviewCard = ({ review }) => {
  const { language } = useLanguage()

  const {
    rating,
    reviewer_name,
    reviewer_email,
    comment,
    created_at,
  } = review

  const displayName = reviewer_name || reviewer_email || (language === 'bn' ? 'বেনামী ব্যবহারকারী' : 'Anonymous User')
  const ratingValue = parseInt(rating) || 5

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch (e) {
      return dateStr
    }
  }

  // Get initials for avatar
  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="bg-pcp-surface/30 dark:bg-muted/10 border border-border/60 dark:border-white/5 rounded-2xl p-5 space-y-3 hover:border-pcp-green/20 transition-colors">
      {/* Reviewer Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-pcp-green/10 text-pcp-green dark:text-pcp-green-light flex items-center justify-center flex-shrink-0 text-xs font-extrabold">
            {initials || <User className="w-4 h-4" />}
          </div>
          <div>
            <h5 className="text-xs md:text-sm font-bold text-foreground leading-tight">
              {displayName}
            </h5>
            <span className="text-[10px] text-muted-foreground font-medium">
              {formatDate(created_at)}
            </span>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="flex items-center gap-1">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < ratingValue ? 'fill-current' : 'fill-none text-muted/30 dark:text-white/10'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Review Comment */}
      {comment && (
        <div className="pl-12">
          <p className="text-xs md:text-sm text-foreground/80 dark:text-muted-foreground/90 leading-relaxed">
            "{comment}"
          </p>
        </div>
      )}
    </div>
  )
}

export default ReviewCard
