import React from 'react'
import { getUrgencyStyles } from '../../utils/urgency'
import { useLanguage } from '../../hooks/useLanguage'
import { AlertTriangle, Info, BellRing, Flame } from 'lucide-react'

export const UrgencyIndicator = ({ level, explanation }) => {
  const { language } = useLanguage()
  const styles = getUrgencyStyles(level)

  const getIcon = () => {
    switch (level) {
      case 'monitor_at_home':
        return <Info className="w-5 h-5" />
      case 'see_vet_this_week':
        return <BellRing className="w-5 h-5" />
      case 'call_vet_now':
        return <AlertTriangle className="w-5 h-5" />
      case 'emergency':
        return <Flame className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getGuidanceText = () => {
    if (language === 'bn') {
      switch (level) {
        case 'monitor_at_home':
          return 'বর্তমানে কোনো বড় বিপদের লক্ষণ নেই। বাড়িতে বিশ্রামে রাখুন এবং পর্যাপ্ত তরল খাবার দিন।'
        case 'see_vet_this_week':
          return 'উপসর্গগুলো ধীরে ধীরে বাড়তে পারে। সাধারণ চেকআপের জন্য এই সপ্তাহের মধ্যে পশু চিকিৎসকের শরণাপন্ন হন।'
        case 'call_vet_now':
          return 'লক্ষণগুলো আশঙ্কাজনক। দেরি না করে অবিলম্বে একজন দক্ষ ভেটেরিনারি সার্জনের সাথে যোগাযোগ করুন।'
        case 'emergency':
          return 'জরুরি অবস্থা! প্রতিটি মুহূর্ত গুরুত্বপূর্ণ। অবিলম্বে নিকটস্থ ভেটেরিনারি হাসপাতালে নিয়ে যান।'
        default:
          return ''
      }
    } else {
      switch (level) {
        case 'monitor_at_home':
          return 'No immediate danger detected. Monitor comfort, behavior, and ensure hydration.'
        case 'see_vet_this_week':
          return 'Symptoms might worsen. Schedule a checkup with a veterinary professional this week.'
        case 'call_vet_now':
          return 'Worrying symptoms observed. Reach out to a certified veterinarian immediately.'
        case 'emergency':
          return 'Critical emergency! Every second counts. Get to the nearest animal clinic right away.'
        default:
          return ''
      }
    }
  }

  return (
    <div className={`p-4 md:p-5 rounded-2xl border flex flex-col md:flex-row gap-4 items-start shadow-sm transition-all duration-300 ${styles.colorClass}`}>
      <div className="flex-shrink-0 bg-background/50 p-2.5 rounded-xl border border-current/10 shadow-inner">
        {getIcon()}
      </div>
      <div className="space-y-2.5 flex-1 w-full">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-bold text-sm md:text-base leading-tight opacity-90">
            {language === 'bn' ? 'নির্ধারিত অবস্থা:' : 'Assessed Level:'}
          </h4>
          <span className={`px-2.5 py-0.5 rounded-md text-xs md:text-sm font-extrabold tracking-wide uppercase border border-current/20 bg-current/10`}>
            {language === 'bn' ? styles.labelBn : styles.labelEn}
          </span>
        </div>
        <p className="text-sm md:text-base opacity-95 leading-relaxed font-medium">
          {getGuidanceText()}
        </p>
        {explanation && (
          <div className="pt-2 border-t border-current/15 mt-2">
            <p className="text-xs md:text-sm opacity-80 leading-relaxed italic flex gap-1.5 items-start">
              <span className="mt-0.5 text-current/60">ℹ</span>
              <span>{explanation}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UrgencyIndicator
