import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useLocationStore } from '../../store/locationStore'
import { useLanguage } from '../../hooks/useLanguage'
import { Star, MapPin, CheckCircle, ArrowRight, Stethoscope, Scissors, UserCheck, Dumbbell, Pill } from 'lucide-react'

export const ProviderCard = ({ provider }) => {
  const { language, t } = useLanguage()
  const user = useAuthStore((state) => state.user)
  
  // Anonymous selected location
  const anonDivision = useLocationStore((state) => state.division)
  const anonDistrict = useLocationStore((state) => state.district)

  const {
    id,
    business_name,
    provider_type,
    is_government_vet,
    division,
    district,
    upazila,
    avg_rating,
    total_reviews,
    is_verified,
  } = provider

  const ratingValue = parseFloat(avg_rating) || 0.0

  // Calculate distance cascade labelling
  const currentDistrict = user?.district || anonDistrict
  const currentDivision = user?.division || anonDivision

  let distanceLabel = ''
  if (currentDistrict && district.toLowerCase() === currentDistrict.toLowerCase()) {
    distanceLabel = t('providers.distance_local')
  } else if (currentDivision && division.toLowerCase() === currentDivision.toLowerCase()) {
    distanceLabel = t('providers.distance_regional')
  } else if (currentDistrict || currentDivision) {
    distanceLabel = t('providers.distance_national')
  }

  // Map provider types to corresponding premium icons
  const getProviderIcon = () => {
    switch (provider_type) {
      case 'vet':
        return <Stethoscope className="w-5 h-5 text-emerald-600" />
      case 'groomer':
        return <Scissors className="w-5 h-5 text-indigo-600" />
      case 'sitter':
        return <UserCheck className="w-5 h-5 text-blue-600" />
      case 'trainer':
        return <Dumbbell className="w-5 h-5 text-orange-600" />
      case 'pharmacy':
        return <Pill className="w-5 h-5 text-red-600" />
      default:
        return <Stethoscope className="w-5 h-5 text-primary" />
    }
  }

  return (
    <div className="pcp-card p-5 hover:border-primary/20 flex flex-col justify-between h-full group">
      <div className="space-y-3">
        {/* Type & Verification Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="p-1.5 rounded-lg bg-muted flex items-center justify-center">
              {getProviderIcon()}
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {t(`providers.types.${provider_type}`)}
            </span>
            {provider_type === 'vet' && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ml-1 ${is_government_vet ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-orange-100 text-orange-700 border border-orange-200'}`}>
                {is_government_vet ? (language === 'bn' ? 'সরকারি চিকিৎসক' : 'Gov Vet') : (language === 'bn' ? 'স্থানীয় চিকিৎসক' : 'Local Vet')}
              </span>
            )}
          </div>

          {is_verified && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
              <CheckCircle className="w-3 h-3 fill-current" />
              <span>{t('providers.verified')}</span>
            </span>
          )}
        </div>

        {/* Business Name */}
        <div>
          <h4 className="text-base md:text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
            {business_name}
          </h4>
        </div>

        {/* Rating Section */}
        <div className="flex items-center gap-1">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.round(ratingValue) ? 'fill-current' : 'text-muted/50'
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

        {/* Location Markers */}
        <div className="space-y-1 pt-1 border-t border-border/40">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
            <span className="truncate">
              {upazila ? `${upazila}, ` : ''}
              {district}, {division}
            </span>
          </div>
          {distanceLabel && (
            <div className="pl-5">
              <span className="inline-block text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {distanceLabel}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Button CTA Link */}
      <div className="pt-4 mt-auto">
        <Link
          to={`/providers/${id}`}
          className="w-full py-2 bg-muted hover:bg-primary hover:text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all group-hover:shadow-sm"
        >
          <span>{t('providers.btn_details')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}

export default ProviderCard
