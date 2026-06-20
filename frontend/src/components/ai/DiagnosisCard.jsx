import React from 'react'

export const DiagnosisCard = ({ icon, iconBg, title, content, borderColor = 'border-border/80' }) => {
  if (!content) return null

  return (
    <div className={`bg-card border ${borderColor} rounded-2xl p-5 md:p-6 shadow-sm space-y-3 animate-fade-in-up`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <h3 className="text-sm md:text-base font-extrabold text-foreground tracking-tight leading-snug">
          {title}
        </h3>
      </div>
      <div className="text-xs md:text-sm text-foreground/85 leading-relaxed whitespace-pre-line pl-[46px]">
        {content}
      </div>
    </div>
  )
}

export default DiagnosisCard
