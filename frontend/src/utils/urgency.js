export const URGENCY_LEVELS = {
  monitor_at_home: {
    slug: 'monitor_at_home',
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
    labelEn: 'Monitor at Home',
    labelBn: 'বাড়িতে পর্যবেক্ষণ করুন',
  },
  see_vet_this_week: {
    slug: 'see_vet_this_week',
    colorClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50',
    labelEn: 'See a Vet This Week',
    labelBn: 'এই সপ্তাহে পশু চিকিৎসক দেখান',
  },
  call_vet_now: {
    slug: 'call_vet_now',
    colorClass: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50',
    labelEn: 'Call a Vet Now',
    labelBn: 'এখনই পশু চিকিৎসক ডাকুন',
  },
  emergency: {
    slug: 'emergency',
    colorClass: 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50',
    labelEn: 'Emergency — Act Immediately',
    labelBn: 'জরুরি অবস্থা — দ্রুত পদক্ষেপ নিন',
  },
}

export const getUrgencyStyles = (level) => {
  return URGENCY_LEVELS[level] || URGENCY_LEVELS.monitor_at_home
}
