import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { getAnimalIcon, ANIMAL_THEMES } from '../../utils/animals'
import { ArrowRight, BookOpen, Building2, ShieldPlus, HeartPulse, Pill, Siren, Info, Home, Utensils, Bookmark } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { savedApi } from '../../api/saved'
import toast from 'react-hot-toast'

export const GuidelineCard = ({ guideline: resource }) => {
  const { language, t } = useLanguage()
  const queryClient = useQueryClient()

  const {
    id,
    animal_types = [],
    resource_type,
    title,
    description,
    created_at,
    is_saved
  } = resource

  // Mutation to toggle saved status
  const toggleSaveMutation = useMutation({
    mutationFn: () => savedApi.toggleSavedItem('resource', id),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['guidelines'])
      queryClient.invalidateQueries(['guidelineDetail', id])
      queryClient.invalidateQueries(['savedItems'])
      
      const isAdded = data?.status === 'added'
      toast.success(
        isAdded 
          ? (language === 'bn' ? 'সংরক্ষিত হয়েছে!' : 'Saved successfully!')
          : (language === 'bn' ? 'সংরক্ষণ বাতিল হয়েছে।' : 'Removed from saved items.')
      )
    },
    onError: () => {
      toast.error(language === 'bn' ? 'অনুগ্রহ করে লগইন করুন।' : 'Please log in to save items.')
    }
  })

  // Create clean short excerpt
  const getExcerpt = (text, maxLength = 120) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // Get resource type icon & style
  const getResourceTypeDetails = () => {
    switch (resource_type) {
      case 'govt':
        return {
          icon: <Building2 className="w-3.5 h-3.5 text-emerald-500" />,
          label: language === 'bn' ? 'সরকারি অফিস' : 'Government Office',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        }
      case 'emergency':
        return {
          icon: <Siren className="w-3.5 h-3.5 text-rose-500 animate-pulse" />,
          label: language === 'bn' ? 'জরুরি যোগাযোগ' : 'Emergency Contact',
          color: 'bg-rose-50 text-rose-700 border-rose-100',
        }
      case 'vaccination':
        return {
          icon: <ShieldPlus className="w-3.5 h-3.5 text-indigo-500" />,
          label: language === 'bn' ? 'টিকাদান' : 'Vaccination',
          color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        }
      case 'medicine':
        return {
          icon: <Pill className="w-3.5 h-3.5 text-purple-500" />,
          label: language === 'bn' ? 'ওষুধ' : 'Medicine',
          color: 'bg-purple-50 text-purple-700 border-purple-100',
        }
      case 'diseases':
        return {
          icon: <HeartPulse className="w-3.5 h-3.5 text-red-500" />,
          label: language === 'bn' ? 'রোগ' : 'Diseases',
          color: 'bg-red-50 text-red-700 border-red-100',
        }
      case 'shelter':
        return {
          icon: <Home className="w-3.5 h-3.5 text-amber-500" />,
          label: language === 'bn' ? 'আশ্রয়' : 'Shelter',
          color: 'bg-amber-50 text-amber-700 border-amber-100',
        }
      case 'food':
        return {
          icon: <Utensils className="w-3.5 h-3.5 text-orange-500" />,
          label: language === 'bn' ? 'খাবার' : 'Food',
          color: 'bg-orange-50 text-orange-700 border-orange-100',
        }
      case 'information':
        return {
          icon: <Info className="w-3.5 h-3.5 text-sky-500" />,
          label: language === 'bn' ? 'তথ্য' : 'Information',
          color: 'bg-sky-50 text-sky-700 border-sky-100',
        }
      default:
        return {
          icon: <Info className="w-3.5 h-3.5 text-slate-500" />,
          label: language === 'bn' ? 'অন্যান্য' : 'Other',
          color: 'bg-slate-50 text-slate-700 border-slate-100',
        }
    }
  }

  const typeDetails = getResourceTypeDetails()

  return (
    <div className="pcp-card p-6 flex flex-col justify-between h-full group hover:border-primary/25">
      <div className="space-y-4">
        {/* Badges Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Animal Types */}
          <div className="flex flex-wrap gap-1.5">
            {animal_types.map((animal) => {
              const animalTheme = ANIMAL_THEMES[animal.slug] || ANIMAL_THEMES.cat
              const AnimalIcon = getAnimalIcon(animal.slug)
              return (
                <div key={animal.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${animalTheme.bg} ${animalTheme.border} ${animalTheme.text}`}>
                  <AnimalIcon className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? animal.name_bn : animal.name_en}</span>
                </div>
              )
            })}
          </div>

          {/* Resource Type Badge */}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${typeDetails.color}`}>
            {typeDetails.icon}
            <span>{typeDetails.label}</span>
          </div>
        </div>

        {/* Topic & Title */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {new Date(created_at).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
          </span>
          <h4 className="text-base md:text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
            {title}
          </h4>
        </div>

        {/* Excerpt */}
        <div>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            {getExcerpt(description)}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-5 mt-auto flex items-center justify-between">
        <Link
          to={`/guidelines/${id}`}
          className="text-xs font-bold text-primary hover:text-primary/90 flex items-center gap-1 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>{language === 'bn' ? 'বিস্তারিত পড়ুন' : 'Read More'}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleSaveMutation.mutate()
          }}
          disabled={toggleSaveMutation.isPending}
          className={`p-2 rounded-full transition-colors border shadow-sm ${
            is_saved
              ? 'bg-primary/20 hover:bg-primary/30 border-primary/50 text-primary'
              : 'bg-muted/50 hover:bg-muted border-border/60 text-muted-foreground hover:text-foreground'
          }`}
          title={language === 'bn' ? 'সংরক্ষণ করুন' : 'Save for later'}
        >
          <Bookmark className={`w-4 h-4 ${is_saved ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  )
}

export default GuidelineCard
