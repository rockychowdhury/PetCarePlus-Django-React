import React from 'react'
import { Star, User, Quote } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

export const ReviewCard = ({ review }) => {
  const { language } = useLanguage()

  const {
    rating,
    reviewer_name,
    reviewer_email,
    reviewer_photo,
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
    <div className="group relative bg-white dark:bg-card border border-border/50 dark:border-border/30 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-pcp-green/5 hover:-translate-y-1 overflow-hidden">
      {/* Decorative Background Quote Icon */}
      <div className="absolute top-4 right-4 opacity-[0.03] dark:opacity-5 group-hover:opacity-[0.06] transition-opacity duration-300 pointer-events-none">
        <Quote className="w-16 h-16 text-pcp-green" fill="currentColor" />
      </div>

      <div className="relative z-10 flex flex-col h-full gap-5">
        {/* Rating Stars */}
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < ratingValue ? 'fill-amber-400 text-amber-400' : 'fill-none text-muted-foreground/20'
              }`}
            />
          ))}
        </div>

        {/* Review Comment */}
        <div className="flex-grow">
          <p className="text-sm md:text-base text-foreground/80 dark:text-muted-foreground leading-relaxed italic font-medium">
            {comment ? `"${comment}"` : <span className="text-muted-foreground/40 not-italic">{language === 'bn' ? 'কোনো মন্তব্য নেই' : 'No comment provided'}</span>}
          </p>
        </div>

        {/* Reviewer Info Footer */}
        <div className="pt-4 border-t border-border/40 flex items-center gap-3 mt-auto">
          {reviewer_photo ? (
            <img 
              src={reviewer_photo} 
              alt={displayName} 
              className="w-10 h-10 rounded-full object-cover shadow-sm border border-pcp-green/10"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pcp-green/20 to-pcp-green/5 text-pcp-green flex items-center justify-center flex-shrink-0 text-xs font-extrabold shadow-sm border border-pcp-green/10">
              {initials || <User className="w-4 h-4" />}
            </div>
          )}
          <div>
            <h5 className="text-sm font-extrabold text-foreground">
              {displayName}
            </h5>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mt-0.5">
              {formatDate(created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewCard
