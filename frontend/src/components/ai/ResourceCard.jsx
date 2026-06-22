import React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ExternalLink } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

const TYPE_STYLES = {
  govt: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  emergency: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  vaccination: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  medicine: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  diseases: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  information: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  shelter: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  food: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
}

const TYPE_LABELS = {
  govt: { en: 'Government', bn: 'সরকারি' },
  emergency: { en: 'Emergency', bn: 'জরুরি' },
  vaccination: { en: 'Vaccination', bn: 'টিকা' },
  medicine: { en: 'Medicine', bn: 'ওষুধ' },
  diseases: { en: 'Diseases', bn: 'রোগব্যাধি' },
  information: { en: 'Information', bn: 'তথ্য' },
  shelter: { en: 'Shelter', bn: 'আশ্রয়' },
  food: { en: 'Food', bn: 'খাদ্য' },
  other: { en: 'Other', bn: 'অন্যান্য' },
}

export const ResourceCard = ({ resource }) => {
  const { language } = useLanguage()

  if (!resource) return null

  const title = resource.title || (language === 'bn' ? resource.title_bn : resource.title_en) || resource.title_en
  const description = resource.description || (language === 'bn' ? resource.description_bn : resource.description_en) || resource.description_en
  const typeStyle = TYPE_STYLES[resource.resource_type] || TYPE_STYLES.other
  const typeLabel = TYPE_LABELS[resource.resource_type]?.[language] || resource.resource_type

  return (
    <div className="pcp-card p-4 group hover:border-primary/30 transition-all">
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs md:text-sm font-bold text-foreground leading-snug line-clamp-2">
                {title}
              </h4>
            </div>
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${typeStyle}`}>
            {typeLabel}
          </span>
        </div>

        {description && (
          <p className="text-[11px] md:text-xs text-muted-foreground leading-relaxed line-clamp-3 pl-10">
            {description}
          </p>
        )}

        <div className="pl-10">
          <Link
            to={`/govt-resources`}
            className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold text-primary hover:text-primary/80 transition-colors"
          >
            <span>{language === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'}</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResourceCard
