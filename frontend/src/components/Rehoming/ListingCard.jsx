import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Calendar, Heart, BadgeCheck, AlertCircle } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

export const ListingCard = ({ listing }) => {
  const { language, t } = useLanguage()

  const {
    id,
    pet_details,
    reason,
    status,
  } = listing

  if (!pet_details) return null

  const {
    name,
    name_bn,
    animal_type_details,
    breed,
    age,
    gender,
    photo_url,
  } = pet_details

  const petName = language === 'bn' ? (name_bn || name) : name

  // Status badges
  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return (
          <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {t('rehoming.status.active')}
          </span>
        )
      case 'adopted':
        return (
          <span className="bg-blue-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {t('rehoming.status.adopted')}
          </span>
        )
      case 'withdrawn':
        return (
          <span className="bg-muted text-muted-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {t('rehoming.status.withdrawn')}
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="pcp-card overflow-hidden group flex flex-col h-full border-border/80 hover:border-primary/20">
      {/* Pet Photo Container */}
      <div className="relative aspect-square w-full bg-muted flex items-center justify-center overflow-hidden">
        {photo_url ? (
          <img
            src={photo_url}
            alt={petName}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
            <Heart className="w-10 h-10 stroke-1 fill-muted" />
            <span className="text-[10px] uppercase font-bold tracking-wider">No Photo</span>
          </div>
        )}

        {/* Free / Adoption Indicator Badge */}
        <div className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          {language === 'bn' ? 'ফ্রি দত্তক' : 'FREE ADOPTION'}
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3 shadow-sm">
          {getStatusBadge()}
        </div>
      </div>

      {/* Pet Details body */}
      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Header Name & Breed */}
          <div>
            <h4 className="text-base sm:text-lg font-bold text-foreground truncate">
              {petName}
            </h4>
            <p className="text-xs text-muted-foreground font-semibold">
              {breed || (language === 'bn' ? 'মিশ্র জাত' : 'Mixed Breed')}
            </p>
          </div>

          {/* Age & Gender Row */}
          <div className="flex gap-4 text-xs text-muted-foreground font-medium pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>
                {age} {language === 'bn' ? 'বছর' : `${age > 1 ? 'years' : 'year'}`}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5 text-primary" />
              <span className="capitalize">
                {language === 'bn'
                  ? gender === 'male'
                    ? 'পুরুষ'
                    : 'স্ত্রী'
                  : gender}
              </span>
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="truncate">
              {listing.owner_details?.upazila ? `${listing.owner_details.upazila}, ` : ''}
              {listing.owner_details?.district || 'Bangladesh'}
            </span>
          </div>

          {/* Reason excerpt */}
          {reason && (
            <div className="pt-2 border-t border-border/40">
              <p className="text-xs text-foreground/80 leading-relaxed italic line-clamp-2">
                "{reason}"
              </p>
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="pt-3">
          <Link
            to={`/rehoming/${id}`}
            className="w-full py-2 bg-muted hover:bg-primary hover:text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all"
          >
            <span>{t('providers.btn_details')}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ListingCard
