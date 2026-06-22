import React from 'react'
import { Landmark, Phone, MapPin, CheckCircle } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

export const GovtVetCard = ({ vets = [], showFallbackMessage = false }) => {
  const { language } = useLanguage()

  return (
    <div className="bg-sky-50/80 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/50 rounded-2xl p-5 md:p-6 shadow-sm space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
          <Landmark className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm md:text-base font-extrabold text-sky-800 dark:text-sky-300 tracking-tight">
            {language === 'bn' ? '🏛️ সরকারি পশু সম্পদ কর্মকর্তা' : '🏛️ Government Livestock Officer'}
          </h3>
          <p className="text-[10px] md:text-xs text-sky-600/80 dark:text-sky-400/80">
            {language === 'bn'
              ? 'আপনার নিকটস্থ সরকারি পশু চিকিৎসা কর্মকর্তা'
              : 'Nearest government veterinary officer to contact'}
          </p>
        </div>
      </div>

      {vets.length > 0 ? (
        <div className="space-y-3 pl-[46px]">
          {vets.map((vet, idx) => (
            <div
              key={vet.id || idx}
              className="bg-white/60 dark:bg-sky-900/20 border border-sky-200/50 dark:border-sky-800/30 rounded-xl p-3.5 space-y-2"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs md:text-sm font-bold text-sky-900 dark:text-sky-200">
                  {vet.business_name}
                </h4>
                {vet.is_verified && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50">
                    <CheckCircle className="w-2.5 h-2.5 fill-current" />
                    <span>{language === 'bn' ? 'যাচাইকৃত' : 'Verified'}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-sky-700 dark:text-sky-300/80">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span>
                  {vet.upazila ? `${vet.upazila}, ` : ''}
                  {vet.district}, {vet.division}
                </span>
              </div>

              {vet.phone && (
                <a
                  href={`tel:${vet.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold rounded-lg transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>{vet.phone}</span>
                </a>
              )}
            </div>
          ))}
        </div>
      ) : showFallbackMessage ? (
        <div className="pl-[46px]">
          <p className="text-xs md:text-sm text-sky-800/80 dark:text-sky-300/80 leading-relaxed">
            {language === 'bn'
              ? 'আপনার নিকটতম উপজেলা পশুসম্পদ কার্যালয়ে যোগাযোগ করুন। প্রতিটি উপজেলায় সরকারি পশু চিকিৎসা কর্মকর্তা রয়েছেন যারা বিনামূল্যে বা স্বল্পমূল্যে পরামর্শ ও চিকিৎসা সেবা প্রদান করেন।'
              : 'Please contact your nearest Upazila Livestock Office. Every upazila has a government veterinary officer who provides free or low-cost consultation and treatment services.'}
          </p>
        </div>
      ) : null}
    </div>
  )
}

export default GovtVetCard
