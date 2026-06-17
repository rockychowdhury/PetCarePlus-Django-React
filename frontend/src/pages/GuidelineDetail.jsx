import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { guidelinesApi } from '../api/guidelines'
import { useLanguage } from '../hooks/useLanguage'
import PageLayout from '../components/layout/PageLayout'
import Spinner from '../components/ui/Spinner'
import { getAnimalIcon, ANIMAL_THEMES } from '../utils/animals'
import { ArrowLeft, Calendar, FileText, Bookmark } from 'lucide-react'

export const GuidelineDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language, t, tField } = useLanguage()

  // Query details for this specific guideline
  const { data: guideline, isLoading, error } = useQuery({
    queryKey: ['guidelineDetail', id],
    queryFn: () => guidelinesApi.getGuidelineDetail(id),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </PageLayout>
    )
  }

  if (error || !guideline) {
    return (
      <PageLayout>
        <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
          <h2 className="text-xl font-bold text-rose-600">{t('common.error')}</h2>
          <button
            onClick={() => navigate('/guidelines')}
            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg text-xs"
          >
            {t('common.back')}
          </button>
        </div>
      </PageLayout>
    )
  }

  const title = tField(guideline, 'title')
  const content = tField(guideline, 'content')
  const animalSlug = guideline.animal_type_details?.slug
  const AnimalIcon = getAnimalIcon(animalSlug)
  const animalTheme = ANIMAL_THEMES[animalSlug] || ANIMAL_THEMES.cat

  return (
    <PageLayout>
      <div className="bg-pcp-surface/20 py-10 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
          
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('common.back')}</span>
          </button>

          {/* Guideline Container */}
          <article className="bg-card border border-border/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            
            {/* Header Badges */}
            <div className="flex flex-wrap gap-2.5">
              {guideline.animal_type_details && (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${animalTheme.bg} ${animalTheme.border} ${animalTheme.text}`}>
                  <AnimalIcon className="w-4 h-4" />
                  <span>
                    {language === 'bn' ? guideline.animal_type_details.name_bn : guideline.animal_type_details.name_en}
                  </span>
                </div>
              )}
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold">
                <Bookmark className="w-3.5 h-3.5" />
                <span>{t(`guidelines.topics.${guideline.topic}`)}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-muted text-muted-foreground text-xs font-bold capitalize">
                <Calendar className="w-3.5 h-3.5" />
                <span>{t(`guidelines.seasons.${guideline.season}`)}</span>
              </div>
            </div>

            {/* Title */}
            <div className="border-b border-border/60 pb-4">
              <h1 className="text-xl md:text-3xl font-extrabold text-foreground leading-tight tracking-tight">
                {title}
              </h1>
            </div>

            {/* Content Body */}
            <div className="prose prose-sm max-w-none text-foreground/90 space-y-4 leading-relaxed whitespace-pre-wrap">
              {content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-xs sm:text-sm md:text-base leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

          </article>
        </div>
      </div>
    </PageLayout>
  )
}

export default GuidelineDetail
