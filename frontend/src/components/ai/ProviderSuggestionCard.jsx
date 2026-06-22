import React from 'react'
import { Star, Phone, MapPin, Award, CheckCircle } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

export const ProviderSuggestionCard = ({ rank, score, reason, provider_details }) => {
  const { language, t } = useLanguage()

  if (!provider_details) return null

  const {
    business_name,
    provider_type,
    division,
    district,
    upazila,
    phone,
    avg_rating,
    total_reviews,
    is_verified,
  } = provider_details

  const ratingValue = parseFloat(avg_rating) || 0.0

  return (
    <div className="pcp-card p-5 relative overflow-hidden group hover:border-primary/20">
      {/* Rank Badge */}
      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-sm">
        <Award className="w-3.5 h-3.5" />
        <span>#{rank}</span>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-bold text-foreground leading-snug">
              {business_name}
            </h4>
            {is_verified && (
              <span
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50"
                title={t('common.verified_badge')}
              >
                <CheckCircle className="w-3 h-3 fill-current" />
                <span>{t('providers.verified')}</span>
              </span>
            )}
            <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground uppercase tracking-wider">
              {t(`providers.types.${provider_type}`)}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.round(ratingValue) ? 'fill-current' : 'text-muted/60'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-foreground pl-0.5">
              {ratingValue > 0 ? ratingValue.toFixed(1) : ''}
            </span>
            <span className="text-xs text-muted-foreground">
              {total_reviews > 0
                ? `(${total_reviews} ${t('providers.reviews')})`
                : `(${t('providers.no_reviews')})`}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
            <span>
              {upazila ? `${upazila}, ` : ''}
              {district}, {division}
            </span>
          </div>

          {/* Suggestion Reason */}
          <div className="bg-primary/5 rounded-lg p-3 text-xs md:text-sm text-foreground/90 border-l-2 border-primary mt-2">
            <p className="font-semibold text-primary/95 text-[11px] uppercase tracking-wider mb-0.5">
              {t('ai.suggested_reason')}
            </p>
            <p className="italic leading-relaxed">{reason}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full md:w-auto flex-shrink-0 pt-3 md:pt-0">
          <a
            href={`tel:${phone}`}
            className="w-full md:w-auto px-4 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs md:text-sm font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Phone className="w-4 h-4" />
            <span>{t('ai.btn_contact')}</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default ProviderSuggestionCard
