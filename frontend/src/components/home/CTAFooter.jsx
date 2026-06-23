import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { useAuthStore } from '../../store/authStore'
import { ArrowRight, Sparkles, Globe, ShieldCheck, Zap } from 'lucide-react'

export const CTAFooter = () => {
  const { language } = useLanguage()
  const user = useAuthStore((state) => state.user)

  const badges = [
    { icon: Zap, label_en: '100% Free', label_bn: 'সম্পূর্ণ বিনামূল্যে' },
    { icon: Globe, label_en: 'Bilingual (EN/BN)', label_bn: 'দ্বিভাষিক (EN/BN)' },
    { icon: Sparkles, label_en: 'AI Powered', label_bn: 'এআই চালিত' },
    { icon: ShieldCheck, label_en: 'Verified Providers', label_bn: 'ভেরিফায়েড সেবাদাতা' },
  ]

  return (
    <section className="py-24 relative overflow-hidden bg-background">
      {/* Background glow behind the floating card */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[400px] bg-primary/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Floating Glassmorphic CTA Card */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-primary to-emerald-900 border border-primary/20 shadow-2xl shadow-primary/20 p-10 md:p-16 text-center">
          
          {/* Internal card pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:32px_32px]" />
          </div>

          {/* Glowing orbs inside the card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

          <div className="relative z-10 space-y-10">
            {/* Headline */}
            <div className="space-y-5 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                {language === 'bn'
                  ? 'আপনার পশুর সেরা যত্ন শুরু করুন'
                  : 'Start Giving Your Animals the Best Care'}
              </h2>
              <p className="text-base md:text-lg text-white/80 leading-relaxed max-w-2xl mx-auto font-medium">
                {language === 'bn'
                  ? 'বাংলাদেশের প্রথম ডিজিটাল পশু যত্ন প্ল্যাটফর্মে যোগ দিন। সবকিছু বিনামূল্যে, চিরকাল।'
                  : 'Join Bangladesh\'s first digital animal care platform. Everything is free, forever.'}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white text-emerald-900 font-extrabold rounded-2xl shadow-lg hover:shadow-xl hover:bg-white/95 transition-all active:scale-[0.98] text-sm group"
                  >
                    <span>{language === 'bn' ? 'ফ্রি একাউন্ট তৈরি করুন' : 'Create Free Account'}</span>
                    <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white/10 text-white border border-white/20 font-extrabold rounded-2xl hover:bg-white/20 transition-all active:scale-[0.98] text-sm backdrop-blur-sm"
                  >
                    <span>{language === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
                  </Link>
                </>
              ) : (
                <Link
                  to="/ai-assistant"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white text-emerald-900 font-extrabold rounded-2xl shadow-lg hover:shadow-xl hover:bg-white/95 transition-all active:scale-[0.98] text-sm group"
                >
                  <Sparkles className="w-4.5 h-4.5 fill-emerald-900" />
                  <span>{language === 'bn' ? 'এআই সহকারী ব্যবহার করুন' : 'Try AI Assistant'}</span>
                  <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>

            {/* Trust Badges */}
            <div className="pt-8 border-t border-white/10">
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                {badges.map((badge, index) => {
                  const Icon = badge.icon
                  return (
                    <div key={index} className="flex items-center gap-2 text-white/80 text-xs font-bold">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span>{language === 'bn' ? badge.label_bn : badge.label_en}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default CTAFooter
