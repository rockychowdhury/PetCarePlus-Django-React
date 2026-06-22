import React from 'react'
import { getUrgencyStyles } from '../../utils/urgency'
import { useLanguage } from '../../hooks/useLanguage'
import { AlertTriangle, Info, BellRing, Flame } from 'lucide-react'

export const UrgencyIndicator = ({ level }) => {
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
        return <Flame className="w-5 h-5 animate-bounce" />
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
    <div className={`p-4 rounded-xl border flex gap-3.5 items-start shadow-sm transition-all duration-300 ${styles.colorClass}`}>
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="space-y-1">
        <h4 className="font-bold text-sm md:text-base leading-tight">
          {language === 'bn' ? 'নির্ধারিত অবস্থা:' : 'Assessed Level:'}{' '}
          <span className="underline decoration-wavy decoration-2 pl-1">
            {language === 'bn' ? styles.labelBn : styles.labelEn}
          </span>
        </h4>
        <p className="text-xs md:text-sm opacity-90 leading-relaxed">
          {getGuidanceText()}
        </p>
      </div>
    </div>
  )
}

export default UrgencyIndicator
