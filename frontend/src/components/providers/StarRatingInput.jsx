import React, { useState } from 'react'
import { Star } from 'lucide-react'

/**
 * Interactive star rating input.
 * Hover to preview, click to set. 1-5 stars.
 */
export const StarRatingInput = ({ value = 0, onChange, size = 'md' }) => {
  const [hoverValue, setHoverValue] = useState(0)

  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  }

  const starSize = sizes[size] || sizes.md
  const activeValue = hoverValue || value

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          className="p-0.5 transition-transform hover:scale-110 active:scale-95 focus:outline-none"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            className={`${starSize} transition-colors duration-150 ${
              star <= activeValue
                ? 'fill-amber-400 text-amber-400'
                : 'fill-none text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm font-bold text-foreground">
          {value}.0
        </span>
      )}
    </div>
  )
}

export default StarRatingInput
