import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { getAnimalIcon, ANIMAL_THEMES } from '../../utils/animals'
import { ArrowRight, BookOpen, Sun, CloudRain, Snowflake, Calendar } from 'lucide-react'

export const GuidelineCard = ({ guideline }) => {
  const { language, t, tField } = useLanguage()

  const {
    id,
    animal_type_details,
    topic,
    season,
  } = guideline

  const title = tField(guideline, 'title')
  const content = tField(guideline, 'content')

  // Create clean short excerpt
  const getExcerpt = (text, maxLength = 120) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // Get season indicator icon & style
  const getSeasonDetails = () => {
    switch (season) {
      case 'summer':
        return {
          icon: <Sun className="w-3.5 h-3.5 text-orange-500" />,
          label: t('guidelines.seasons.summer'),
          color: 'bg-orange-50 text-orange-700 border-orange-100',
        }
      case 'monsoon':
        return {
          icon: <CloudRain className="w-3.5 h-3.5 text-blue-500" />,
          label: t('guidelines.seasons.monsoon'),
          color: 'bg-blue-50 text-blue-700 border-blue-100',
        }
      case 'winter':
        return {
          icon: <Snowflake className="w-3.5 h-3.5 text-sky-500" />,
          label: t('guidelines.seasons.winter'),
          color: 'bg-sky-50 text-sky-700 border-sky-100',
        }
      default:
        return {
          icon: <Calendar className="w-3.5 h-3.5 text-emerald-500" />,
          label: t('guidelines.seasons.all'),
          color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        }
    }
  }

  const seasonDetails = getSeasonDetails()
  const animalSlug = animal_type_details?.slug
  const animalTheme = ANIMAL_THEMES[animalSlug] || ANIMAL_THEMES.cat
  const AnimalIcon = getAnimalIcon(animalSlug)

  return (
    <div className="pcp-card p-6 flex flex-col justify-between h-full group hover:border-primary/25">
      <div className="space-y-4">
        {/* Badges Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Animal Type */}
          {animal_type_details && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${animalTheme.bg} ${animalTheme.border} ${animalTheme.text}`}>
              <AnimalIcon className="w-3.5 h-3.5" />
              <span>
                {language === 'bn' ? animal_type_details.name_bn : animal_type_details.name_en}
              </span>
            </div>
          )}

          {/* Season Badge */}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${seasonDetails.color}`}>
            {seasonDetails.icon}
            <span>{seasonDetails.label}</span>
          </div>
        </div>

        {/* Topic & Title */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-0.5 rounded-full">
            {t(`guidelines.topics.${topic}`)}
          </span>
          <h4 className="text-base md:text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
            {title}
          </h4>
        </div>

        {/* Excerpt */}
        <div>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            {getExcerpt(content)}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-5 mt-auto">
        <Link
          to={`/guidelines/${id}`}
          className="text-xs font-bold text-primary hover:text-primary/90 flex items-center gap-1 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>{t('guidelines.read_more')}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}

export default GuidelineCard
