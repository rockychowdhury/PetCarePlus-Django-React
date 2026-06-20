import React from 'react'
import { AlertTriangle, Siren, ThermometerSun, Clock } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

export const WarningSignsCard = ({ warningData }) => {
  const { language } = useLanguage()

  if (!warningData) return null

  const sections = [
    {
      icon: <Siren className="w-4 h-4" />,
      label: language === 'bn' ? 'জরুরি পরিস্থিতি' : 'Emergency Situations',
      content: warningData.emergency_situations,
    },
    {
      icon: <ThermometerSun className="w-4 h-4" />,
      label: language === 'bn' ? 'নেতিবাচক লক্ষণসমূহ' : 'Negative Symptoms',
      content: warningData.negative_symptoms,
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: language === 'bn' ? 'কখন চিন্তিত হবেন' : 'When to Worry',
      content: warningData.when_to_worry,
    },
  ].filter((s) => s.content)

  if (sections.length === 0) return null

  return (
    <div className="bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-5 md:p-6 shadow-sm space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-sm md:text-base font-extrabold text-rose-800 dark:text-rose-300 tracking-tight">
          {language === 'bn' ? '⚠️ সতর্কতা ও বিপদ সংকেত' : '⚠️ Warning Signs & Danger Signals'}
        </h3>
      </div>

      <div className="space-y-3 pl-[46px]">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
              {section.icon}
              <span className="text-xs font-bold uppercase tracking-wider">
                {section.label}
              </span>
            </div>
            <p className="text-xs md:text-sm text-rose-900/80 dark:text-rose-200/80 leading-relaxed whitespace-pre-line">
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WarningSignsCard
