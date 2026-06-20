import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useLocationStore } from '../../store/locationStore'
import { useLanguage } from '../../hooks/useLanguage'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { providersApi } from '../../api/providers'
import toast from 'react-hot-toast'
import { Star, MapPin, Heart, Phone, Sparkles } from 'lucide-react'
import { getAnimalIcon } from '../../utils/animals'

export const ProviderCard = ({ provider }) => {
  const { language, t } = useLanguage()
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  
  // Anonymous selected location
  const anonDivision = useLocationStore((state) => state.division)
  const anonDistrict = useLocationStore((state) => state.district)

  const {
    id,
    business_name,
    provider_type,
    is_government_vet,
    profile_image_url,
    division,
    district,
    upazila,
    avg_rating,
    total_reviews,
    supported_animal_types = [],
    phone,
    email,
    is_favorite,
  } = provider

  const ratingValue = parseFloat(avg_rating) || 0.0

  // Mutation to toggle favorite status
  const toggleFavoriteMutation = useMutation({
    mutationFn: () => providersApi.toggleFavorite(id),
    onSuccess: (data) => {
      // Invalidate queries to refresh favorite states globally
      queryClient.invalidateQueries(['providers'])
      queryClient.invalidateQueries(['favoriteProviders'])
      queryClient.invalidateQueries(['provider', id])
      
      const isAdded = data.status === 'added'
      toast.success(
        isAdded 
          ? (language === 'bn' ? 'ফেভারিটে যোগ করা হয়েছে!' : 'Added to favorites!')
          : (language === 'bn' ? 'ফেভারিট থেকে রিমুভ করা হয়েছে।' : 'Removed from favorites.')
      )
    },
    onError: () => {
      toast.error(language === 'bn' ? 'অনুগ্রহ করে লগইন করুন।' : 'Please log in to save favorites.')
    }
  })

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

  // Type translation
  const typeLabel = t(`providers.types.${provider_type}`)

  // Specific Gov Vet logic
  let govVetLabel = null
  if (provider_type === 'vet' && is_government_vet) {
    govVetLabel = language === 'bn' ? 'সরকারি চিকিৎসক' : 'Gov Vet'
  }

  return (
    <div className="group relative flex flex-col justify-between h-full bg-pcp-card dark:bg-card rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-pcp-border/60 dark:border-white/5 p-4 overflow-hidden">
      
      {/* Top Banner Cover Area */}
      <div className="relative h-[150px] w-full shrink-0 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-pcp-green-muted/30 to-pcp-green-muted dark:from-muted/40 dark:to-muted/20">
        {profile_image_url ? (
          <img 
            src={profile_image_url} 
            alt={business_name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl font-black text-pcp-text-primary/10 dark:text-white/10 uppercase tracking-tighter">
              {business_name.charAt(0)}
            </span>
          </div>
        )}

        {/* Badges Floating Over Image */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          <span className="inline-flex items-center justify-center px-3 py-1 bg-white/90 dark:bg-zinc-900/90 text-pcp-text-secondary dark:text-pcp-green-light backdrop-blur-md rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-pcp-border/30 shadow-sm">
            {typeLabel}
          </span>
          {govVetLabel && (
            <span className="inline-flex items-center justify-center px-3 py-1 bg-[#E76F51] text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm border border-[#E76F51]">
              {govVetLabel}
            </span>
          )}
        </div>
        
        {/* Floating Heart / Save Icon */}
        <button 
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleFavoriteMutation.mutate()
          }}
          disabled={toggleFavoriteMutation.isPending}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all border shadow-sm ${
            is_favorite 
              ? 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/50' 
              : 'bg-white/30 hover:bg-white/50 border-white/40'
          }`}
        >
          <Heart 
            className={`w-3.5 h-3.5 drop-shadow-sm transition-colors ${
              is_favorite ? 'fill-rose-500 text-rose-500' : 'text-white'
            }`} 
          />
        </button>

        {/* Rating or New Badge Floating Over Image (Bottom Right) */}
        <div className="absolute bottom-2.5 right-2.5">
          {total_reviews > 0 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/60 dark:bg-zinc-950/70 text-white backdrop-blur-sm rounded-lg text-[11px] font-bold shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{ratingValue.toFixed(1)}</span>
              <span className="opacity-70 font-medium">({total_reviews})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-pcp-green/90 dark:bg-pcp-green/80 text-white backdrop-blur-sm rounded-lg text-[11px] font-bold shadow-sm uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>{language === 'bn' ? 'নতুন' : 'New'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-grow px-1">
        {/* Business Name */}
        <h4 className="text-[19px] leading-snug font-extrabold text-pcp-text-primary dark:text-foreground mb-1.5 line-clamp-1 group-hover:text-pcp-green transition-colors">
          {business_name}
        </h4>

        {/* Location Row */}
        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-pcp-text-muted dark:text-muted-foreground shrink-0" />
            <span className="text-xs font-semibold text-pcp-text-secondary dark:text-muted-foreground/80 line-clamp-1">
              {upazila ? `${upazila}, ` : ''}{district}
            </span>
          </div>
          {distanceLabel && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
              {distanceLabel}
            </span>
          )}
        </div>

        <div className="h-px bg-pcp-border/30 dark:bg-border/30 my-2.5"></div>

        {/* Animal Types Specialties */}
        {supported_animal_types && supported_animal_types.length > 0 && (
          <div className="mb-2.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-pcp-text-muted dark:text-muted-foreground block mb-1.5">
              {language === 'bn' ? 'সেবা গ্রহণকারী প্রাণী:' : 'Animals Serviced:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {supported_animal_types.map((at) => {
                const Icon = getAnimalIcon(at.slug)
                return (
                  <span 
                    key={at.id}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-pcp-green-bg dark:bg-pcp-green/10 text-pcp-text-secondary dark:text-pcp-green-light border border-pcp-border dark:border-pcp-green/20"
                  >
                    <Icon className="w-3.5 h-3.5 text-pcp-green dark:text-pcp-green-light shrink-0" />
                    <span>{language === 'bn' ? at.name_bn : at.name_en}</span>
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Contact Action Area */}
      <div className="mt-4 pt-3 border-t border-pcp-border/40 dark:border-border/40 flex items-center gap-2">
        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center p-2.5 bg-pcp-green-bg hover:bg-pcp-green-muted text-pcp-green rounded-xl transition-all border border-pcp-border/50 shrink-0"
            title={language === 'bn' ? 'কল করুন' : 'Call Provider'}
          >
            <Phone className="w-4 h-4" />
          </a>
        )}
        
        <Link
          to={`/providers/${id}`}
          className="flex-grow flex items-center justify-center py-2.5 bg-pcp-green hover:bg-pcp-green-hover text-white font-extrabold text-xs rounded-xl transition-colors shadow-sm"
        >
          {t('providers.btn_details')}
        </Link>
      </div>

    </div>
  )
}

export default ProviderCard


