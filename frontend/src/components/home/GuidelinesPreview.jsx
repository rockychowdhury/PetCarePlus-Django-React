import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { guidelinesApi } from '../../api/guidelines'
import { useLanguage } from '../../hooks/useLanguage'
import GuidelineCard from '../guidelines/GuidelineCard'
import Spinner from '../ui/Spinner'
import { ArrowRight, BookOpen, Calendar, HelpCircle, ShieldCheck } from 'lucide-react'

export const GuidelinesPreview = ({ activeAnimalId }) => {
  const { language, t } = useLanguage()

  // Query latest 3 guidelines
  const { data, isLoading } = useQuery({
    queryKey: ['latestGuidelines', activeAnimalId],
    queryFn: () =>
      guidelinesApi.getGuidelines({
        animal_type: activeAnimalId || undefined,
        page_size: 3,
      }),
  })

  const guidelines = data?.results || []

  return (
    <section className="py-16 bg-card border-b border-pcp-green-light/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="space-y-1.5 text-left">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pcp-green-accent/10 text-primary text-[10px] sm:text-xs font-bold border border-pcp-green-accent/20">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'বিশেষজ্ঞ কেয়ার নির্দেশিকা' : 'Expert Care Guidelines'}</span>
            </div>
            
            <h2 className="text-xl md:text-3xl font-extrabold text-pcp-text-primary tracking-tight">
              {t('guidelines.title')}
            </h2>
            <p className="text-xs md:text-sm text-pcp-text-secondary font-semibold">
              {t('guidelines.subtitle')}
            </p>
          </div>

          <Link
            to="/guidelines"
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-extrabold text-primary hover:text-pcp-green-hover transition-colors border-b-2 border-transparent hover:border-primary pb-0.5"
          >
            <span>{language === 'bn' ? 'সকল নির্দেশিকা দেখুন' : 'Browse All Guidelines'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Feature Showcase Explanation Box */}
        <div className="p-5 bg-pcp-green-bg/50 border-2 border-primary/5 rounded-2xl text-left grid grid-cols-1 md:grid-cols-3 gap-6 shadow-sm">
          
          <div className="space-y-1 md:border-r border-pcp-green-light/20 md:pr-4">
            <h4 className="text-xs sm:text-sm font-extrabold text-pcp-text-primary flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-pcp-green-accent" />
              {language === 'bn' ? '১. শতভাগ প্রফেশনাল কিউরেশন' : '1. 100% Curation'}
            </h4>
            <p className="text-[11px] sm:text-xs text-pcp-text-secondary leading-relaxed font-medium">
              {language === 'bn'
                ? 'পশু চিকিৎসকদের দ্বারা প্রমাণিত খাবার, বাসস্থান ও সাধারণ রোগ প্রতিরোধের সঠিক নিয়মাবলী।'
                : 'Veterinarian-approved recommendations ensuring absolute safety for nutrition, grooming, & housing.'}
            </p>
          </div>

          <div className="space-y-1 md:border-r border-pcp-green-light/20 md:pr-4">
            <h4 className="text-xs sm:text-sm font-extrabold text-pcp-text-primary flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              {language === 'bn' ? '২. ঋতুভিত্তিক রোগ প্রতিরোধ' : '2. Seasonal Guidance'}
            </h4>
            <p className="text-[11px] sm:text-xs text-pcp-text-secondary leading-relaxed font-medium">
              {language === 'bn'
                ? 'গ্রীষ্মের দাবদাহ কিংবা বর্ষার মহামারী থেকে পশুকে বাঁচাতে উপযুক্ত করণীয় টিপস।'
                : 'Monsoon epidemics or winter temperature drops - dynamic guides load based on active local season parameters.'}
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-extrabold text-pcp-text-primary flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-pcp-green-accent" />
              {language === 'bn' ? '৩. কিভাবে ব্যবহার করবেন?' : '3. How to Use Guidelines'}
            </h4>
            <p className="text-[11px] sm:text-xs text-pcp-text-secondary leading-relaxed font-medium">
              {language === 'bn'
                ? 'উপরের কুইক ফিল্টারে একটি নির্দিষ্ট প্রাণী নির্বাচন করুন, সাথে সাথে তার সমস্ত নির্দেশিকা লোড হবে।'
                : 'Select an animal in the quick filter above. The preview grid will immediately render custom articles.'}
            </p>
          </div>
        </div>

        {/* Loading Spinner or Grid */}
        {isLoading ? (
          <Spinner className="py-12" />
        ) : guidelines.length === 0 ? (
          <div className="text-center py-12 px-4 bg-pcp-surface border border-dashed border-pcp-green-light/40 rounded-2xl">
            <p className="text-sm font-bold text-pcp-text-secondary">
              {t('guidelines.no_guidelines')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guidelines.map((guideline) => (
              <div key={guideline.id} className="animate-fade-in-up hover:-translate-y-1 transition-all duration-300">
                <GuidelineCard guideline={guideline} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default GuidelinesPreview
