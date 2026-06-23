import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { Sparkles, Stethoscope, PawPrint, Brain, Shield, Globe, ArrowRight, Syringe, Heart, BookOpen } from 'lucide-react'

export const HeroSection = () => {
  const { language } = useLanguage()

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Gorgeous Background Layout */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Core radial gradient for deep lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        {/* Animated floating glowing orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse-subtle" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px]" />
        
        {/* Premium dot pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_40%,#000_60%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 py-16 md:py-24">
        {/* Centered hero content */}
        <div className="text-center max-w-3xl mx-auto space-y-8 mb-20 md:mb-24">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span className="tracking-wide">
              {language === 'bn' ? 'বাংলাদেশের প্রথম ডিজিটাল পশু যত্ন প্ল্যাটফর্ম' : 'Bangladesh\'s First Digital Animal Care Platform'}
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.3] md:leading-[1.2] tracking-normal">
            {language === 'bn' ? (
              <>
                এআই, ভেরিফাইড ডাক্তার এবং সঠিক নির্দেশিকায় <br className="hidden lg:block" />
                আপনার পশুর <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent drop-shadow-sm">সম্পূর্ণ ডিজিটাল কেয়ার</span>
              </>
            ) : (
              <>
                AI, Verified Vets & Expert Guidelines: <br className="hidden lg:block" />
                <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent drop-shadow-sm">Complete Digital Care</span> for Your Animals
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
            {language === 'bn'
              ? 'এআই রোগ নির্ণয়, নিকটস্থ ভেট খোঁজা, টিকার সময়সূচী, নিরাপদ দত্তক — পোষা প্রাণী থেকে খামারের গবাদিপশু পর্যন্ত সবার জন্য।'
              : 'AI diagnostics, local vet discovery, vaccination schedules, safe adoption — for companion pets and farm livestock alike.'}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/ai-assistant"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-primary hover:bg-primary/90 text-white font-extrabold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.97] text-sm group"
            >
              <Sparkles className="w-4.5 h-4.5 fill-current group-hover:scale-110 transition-transform" />
              <span>{language === 'bn' ? 'এআই সহকারী ব্যবহার করুন' : 'Try AI Assistant'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/providers"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-background/80 backdrop-blur-md border border-border/80 text-foreground hover:bg-muted/50 hover:border-primary/30 font-extrabold rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.97] text-sm"
            >
              <Stethoscope className="w-4 h-4 text-primary" />
              <span>{language === 'bn' ? 'ডাক্তার খুঁজুন' : 'Find Providers'}</span>
            </Link>
          </div>
        </div>

        {/* Bottom: Modern Glassmorphic Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
          {[
            { icon: PawPrint, value_en: '10+', value_bn: '১০+', label_en: 'Animal Types Supported', label_bn: 'সমর্থিত প্রাণীর ধরন', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { icon: Brain, value_en: 'AI', value_bn: 'এআই', label_en: 'Powered Diagnostics', label_bn: 'চালিত রোগ নির্ণয়', color: 'text-violet-500', bg: 'bg-violet-500/10' },
            { icon: Globe, value_en: 'EN / BN', value_bn: 'EN / BN', label_en: 'Bilingual Platform', label_bn: 'দ্বিভাষিক প্ল্যাটফর্ম', color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { icon: Shield, value_en: '100%', value_bn: '১০০%', label_en: 'Free Forever', label_bn: 'চিরকাল বিনামূল্যে', color: 'text-amber-500', bg: 'bg-amber-500/10' },
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="relative group bg-card/40 dark:bg-card/20 backdrop-blur-xl border border-border/50 hover:border-primary/30 rounded-[2rem] p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 overflow-hidden"
              >
                {/* Subtle inner top glow on hover */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm border border-white/10 dark:border-white/5`}>
                    <Icon className={`w-7 h-7 ${stat.color}`} />
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-foreground leading-none mb-2">
                    {language === 'bn' ? stat.value_bn : stat.value_en}
                  </div>
                  <div className="text-xs md:text-sm font-bold text-muted-foreground/80 leading-snug max-w-[120px]">
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
