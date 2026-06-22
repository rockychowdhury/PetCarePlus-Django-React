import React from 'react'
import { ShieldCheck, HeartPulse, TrendingUp, Smile } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

export const PositiveSignsCard = ({ positiveData }) => {
  const { language } = useLanguage()

  if (!positiveData) return null

  const sections = [
    {
      icon: <HeartPulse className="w-4 h-4" />,
      label: language === 'bn' ? 'নিরাপদ সংকেত' : 'Safe Indicators',
      content: positiveData.safe_indicators,
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: language === 'bn' ? 'সুস্থতার লক্ষণ' : 'Recovery Signals',
      content: positiveData.recovery_signals,
    },
    {
      icon: <Smile className="w-4 h-4" />,
      label: language === 'bn' ? 'পরিস্থিতি নিয়ন্ত্রণে' : 'Situation Controlled',
      content: positiveData.when_situation_is_controlled,
    },
  ].filter((s) => s.content)

  if (sections.length === 0) return null

  return (
    <div className="bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-5 md:p-6 shadow-sm space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h3 className="text-sm md:text-base font-extrabold text-emerald-800 dark:text-emerald-300 tracking-tight">
          {language === 'bn' ? '✅ ইতিবাচক লক্ষণ ও আশার সংকেত' : '✅ Positive Signs & Hope Signals'}
        </h3>
      </div>

      <div className="space-y-3 pl-[46px]">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              {section.icon}
              <span className="text-xs font-bold uppercase tracking-wider">
                {section.label}
              </span>
            </div>
            <p className="text-xs md:text-sm text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed whitespace-pre-line">
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PositiveSignsCard
