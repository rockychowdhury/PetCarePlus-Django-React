import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Calendar, Heart, BadgeCheck, AlertCircle } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

export const ListingCard = ({ listing }) => {
  const { language, t } = useLanguage()

  const {
    id,
    pet_name,
    animal_type_details,
    breed,
    age,
    gender,
    photo_url,
    reason,
    status,
  } = listing

  const petNameDisplay = pet_name

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
    <div className="group relative flex flex-col justify-between h-full bg-pcp-card dark:bg-card rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-pcp-border/60 dark:border-white/5 p-4 overflow-hidden">
      
      {/* Top Banner Cover Area */}
      <div className="relative h-[150px] w-full shrink-0 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-pcp-green-muted/30 to-pcp-green-muted dark:from-muted/40 dark:to-muted/20">
        {photo_url ? (
          <img
            src={photo_url}
            alt={petNameDisplay}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-pcp-text-primary/20 dark:text-white/20">
            <Heart className="w-10 h-10 stroke-1" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 items-end">
          {getStatusBadge()}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-grow px-1">
        {/* Pet Name */}
        <h4 className="text-[19px] leading-snug font-extrabold text-pcp-text-primary dark:text-foreground mb-1.5 line-clamp-1 group-hover:text-pcp-green transition-colors">
          {petNameDisplay}
        </h4>
        <p className="text-xs text-pcp-text-secondary dark:text-muted-foreground font-semibold mb-2.5">
          {breed || (language === 'bn' ? 'মিশ্র জাত' : 'Mixed Breed')}
        </p>

        {/* Info Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-pcp-green dark:text-pcp-green-light shrink-0" />
            <span className="text-xs font-semibold text-pcp-text-secondary dark:text-muted-foreground/80">
              {age ? `${age} ${language === 'bn' ? 'বছর' : (age > 1 ? 'years' : 'year')}` : (language === 'bn' ? 'অজানা' : 'Unknown')}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <BadgeCheck className="w-3.5 h-3.5 text-pcp-green dark:text-pcp-green-light shrink-0" />
            <span className="text-xs font-semibold text-pcp-text-secondary dark:text-muted-foreground/80 capitalize">
              {language === 'bn' ? (gender === 'male' ? 'পুরুষ' : 'স্ত্রী') : gender}
            </span>
          </div>
        </div>

        {/* Location Row */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <MapPin className="w-3.5 h-3.5 text-pcp-text-muted dark:text-muted-foreground shrink-0" />
          <span className="text-xs font-semibold text-pcp-text-secondary dark:text-muted-foreground/80 line-clamp-1">
            {listing.district || listing.owner_details?.district || 'Bangladesh'}
          </span>
        </div>

        <div className="h-px bg-pcp-border/30 dark:bg-border/30 my-2.5"></div>

        {/* Reason excerpt */}
        {reason && (
          <div className="mb-2.5">
            <p className="text-xs text-pcp-text-secondary dark:text-muted-foreground leading-relaxed italic line-clamp-2">
              "{reason}"
            </p>
          </div>
        )}
      </div>

      {/* Footer / Action Area */}
      <div className="mt-4 pt-3 border-t border-pcp-border/40 dark:border-border/40 flex items-center gap-2">
        <Link
          to={`/rehoming/${id}`}
          className="flex-grow flex items-center justify-center py-2.5 bg-pcp-green hover:bg-pcp-green-hover text-white font-extrabold text-xs rounded-xl transition-colors shadow-sm"
        >
          {t('providers.btn_details')}
        </Link>
      </div>
    </div>
  )
}

export default ListingCard
