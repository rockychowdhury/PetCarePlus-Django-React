import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { Sparkles, Stethoscope, PawPrint, Brain, Shield, Globe, ArrowRight } from 'lucide-react'

export const HeroSection = () => {
  const { language } = useLanguage()

  return (
    <section className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] border-b border-border/40 overflow-hidden bg-gradient-to-br from-blue-50/40 via-emerald-50/40 to-violet-50/40 dark:from-blue-950/20 dark:via-emerald-950/20 dark:to-violet-950/20 animate-gradient-x bg-[length:200%_auto]">
      {/* Background container with strict overflow clipping to prevent horizontal scrollbars on mobile/safari */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Clean, minimalist dot pattern background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Very subtle gradient blob to break the flatness without being overwhelming */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 py-10 md:py-14 lg:py-16">
        {/* Centered hero content */}
        <div className="text-center max-w-3xl mx-auto space-y-4 md:space-y-5 mb-8 md:mb-12">
          {/* Subtle Badge */}
          <div className="inline-flex flex-wrap justify-center items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-[10px] sm:text-xs font-bold border border-primary/20 shadow-sm max-w-full">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="tracking-wide text-center">
              {language === 'bn' ? 'বাংলাদেশের প্রথম ডিজিটাল পশু যত্ন প্ল্যাটফর্ম' : 'Bangladesh\'s First Digital Animal Care Platform'}
            </span>
          </div>

          {/* Clean, large single-statement headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold text-foreground leading-[1.15] md:leading-[1.1] tracking-tight break-words">
            {language === 'bn' ? (
              <>
                আপনার পশুর জন্য <span className="text-primary">সম্পূর্ণ ডিজিটাল কেয়ার</span>
              </>
            ) : (
              <>
                The Complete <span className="text-primary">Digital Care</span> for Your Animals
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto px-2">
            {language === 'bn'
              ? 'এআই রোগ নির্ণয়, নিকটস্থ ভেট খোঁজা, টিকার সময়সূচী, নিরাপদ দত্তক — পোষা প্রাণী থেকে খামারের গবাদিপশু পর্যন্ত সবার জন্য।'
              : 'AI diagnostics, local vet discovery, vaccination schedules, safe adoption — for companion pets and farm livestock alike.'}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 md:pt-6 w-full px-4 sm:px-0">
            <Link
              to="/ai-assistant"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full shadow-sm hover:shadow transition-all text-sm"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="truncate">{language === 'bn' ? 'এআই সহকারী ব্যবহার করুন' : 'Try AI Assistant'}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
            <Link
              to="/providers"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-card hover:bg-muted border border-border text-foreground font-semibold rounded-full shadow-sm transition-all text-sm"
            >
              <Stethoscope className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="truncate">{language === 'bn' ? 'ডাক্তার খুঁজুন' : 'Find Providers'}</span>
            </Link>
          </div>
        </div>

        {/* Bottom: Clean, Flat Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { icon: PawPrint, value_en: '10+', value_bn: '১০+', label_en: 'Animal Types', label_bn: 'সমর্থিত প্রাণী' },
            { icon: Brain, value_en: 'AI', value_bn: 'এআই', label_en: 'Diagnostics', label_bn: 'রোগ নির্ণয়' },
            { icon: Globe, value_en: 'EN / BN', value_bn: 'EN / BN', label_en: 'Bilingual', label_bn: 'দ্বিভাষিক' },
            { icon: Shield, value_en: '100%', value_bn: '১০০%', label_en: 'Free Forever', label_bn: 'সম্পূর্ণ বিনামূল্যে' },
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="bg-card border border-border/50 rounded-2xl p-4 md:p-5 text-center transition-all hover:border-border hover:shadow-sm flex flex-col items-center gap-2 md:gap-3"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground">
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div>
                  <div className="text-lg md:text-xl font-bold text-foreground mb-0.5 md:mb-1">
                    {language === 'bn' ? stat.value_bn : stat.value_en}
                  </div>
                  <div className="text-[10px] md:text-xs font-medium text-muted-foreground px-1 break-words">
                    {language === 'bn' ? stat.label_bn : stat.label_en}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HeroSection
