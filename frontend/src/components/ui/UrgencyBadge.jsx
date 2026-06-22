import React from 'react'
import { getUrgencyStyles } from '../../utils/urgency'
import { useLanguage } from '../../hooks/useLanguage'

export const UrgencyBadge = ({ level, className = '' }) => {
  const { language } = useLanguage()
  const styles = getUrgencyStyles(level)

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles.colorClass} ${className}`}
    >
      {language === 'bn' ? styles.labelBn : styles.labelEn}
    </span>
  )
}

export default UrgencyBadge
