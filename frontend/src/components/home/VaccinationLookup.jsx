import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { guidelinesApi } from '../../api/guidelines'
import { useLanguage } from '../../hooks/useLanguage'
import Spinner from '../ui/Spinner'
import { Search, Syringe, Clipboard, Award, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react'

export const VaccinationLookup = ({ activeAnimalId }) => {
  const { language, t, tField } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')

  // Query vaccines based on search input and active quick animal filter
  const { data: vaccinations, isLoading } = useQuery({
    queryKey: ['vaccinations', searchQuery, activeAnimalId],
    queryFn: () =>
      guidelinesApi.getVaccinations({
        search: searchQuery || undefined,
        animal_type: activeAnimalId || undefined,
      }),
    keepPreviousData: true,
  })

  const records = vaccinations?.results || []

  return (
    <section className="py-16 bg-card border-b border-pcp-green-light/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="space-y-1.5 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pcp-green-accent/10 text-primary text-[10px] sm:text-xs font-bold border border-pcp-green-accent/20">
              <Syringe className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'টিকা নির্দেশিকা অনুসন্ধান ডেস্ক' : 'Immunization & Vaccination Reference'}</span>
            </div>
            
            <h2 className="text-xl md:text-3xl font-extrabold text-pcp-text-primary tracking-tight">
              {t('vaccination.title')}
            </h2>
            <p className="text-xs md:text-sm text-pcp-text-secondary font-semibold">
              {t('vaccination.subtitle')}
            </p>
          </div>

          <Link
            to="/vaccination"
            className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-extrabold text-primary hover:text-pcp-green-hover transition-colors border-b-2 border-transparent hover:border-primary pb-0.5"
          >
            <span>{language === 'bn' ? 'টিকার পুরো বিবরণ দেখুন' : 'Browse All Vaccines'}</span>
          </Link>
        </div>

        {/* Feature Detailed Explainer Guide */}
        <div className="p-5 bg-gradient-to-r from-pcp-green-bg to-card border border-pcp-green-light/35 rounded-2xl text-left grid grid-cols-1 md:grid-cols-3 gap-6 shadow-sm">
          
          <div className="space-y-1 flex items-start gap-2.5">
            <div className="p-1 rounded bg-primary/10 text-primary mt-0.5">
              <Clipboard className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-pcp-text-primary">
                {language === 'bn' ? '১. টিকা সময়সূচী ও নিয়ম' : '1. Vaccination Timelines'}
              </h4>
              <p className="text-[11px] sm:text-xs text-pcp-text-secondary leading-relaxed">
                {language === 'bn'
                  ? 'রোগ প্রতিরোধে প্রতিটি টিকার সঠিক প্রথম ডোজের বয়স ও বুস্টার ডোজের মধ্যবর্তী ব্যবধান জানুন।'
                  : 'Displays prime age requirements for primary dose and recurring booster frequencies to maintain immune protection.'}
              </p>
            </div>
          </div>

          <div className="space-y-1 flex items-start gap-2.5">
            <div className="p-1 rounded bg-pcp-green-accent/15 text-primary mt-0.5">
              <Award className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-pcp-text-primary">
                {language === 'bn' ? '২. সঠিক ডোজ এবং মাত্রা নির্ধারণ' : '2. Exact Dosages'}
              </h4>
              <p className="text-[11px] sm:text-xs text-pcp-text-secondary leading-relaxed">
                {language === 'bn'
                  ? 'প্রাণীর শরীরের ওজন বা বয়স ভেদে ভ্যাকসিনের মিলিগ্রাম (ml) ডোজের নিরাপদ মাত্রা।'
                  : 'Confirms safe vaccine volume limits (ml/dosage) and recommended injection paths (subcutaneous or muscle).'}
              </p>
            </div>
          </div>

          <div className="space-y-1 flex items-start gap-2.5">
            <div className="p-1 rounded bg-primary/10 text-primary mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-pcp-text-primary">
                {language === 'bn' ? '৩. লক্ষ্য রোগ প্রতিরোধ' : '3. Targeted Fatal Diseases'}
              </h4>
              <p className="text-[11px] sm:text-xs text-pcp-text-secondary leading-relaxed">
                {language === 'bn'
                  ? ' জলাতঙ্ক (Rabies) বা অ্যানথ্রাক্স (Tarkata) এর মতো মরণব্যাধি রোগ প্রতিরোধ নিশ্চিত করা।'
                  : 'Aims to prevent highly infectious and fatal epidemics like Anthrax (Tarkata) or Rabies.'}
              </p>
            </div>
          </div>

        </div>

        {/* Search Bar Input */}
        <div className="max-w-xl text-left relative z-10">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-pcp-text-secondary w-4.5 h-4.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('vaccination.search_placeholder')}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-pcp-green-light bg-pcp-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-pcp-text-primary font-semibold"
            />
          </div>
        </div>

        {/* Inline Results Grid */}
        {isLoading ? (
          <Spinner className="py-8" />
        ) : records.length === 0 ? (
          <div className="text-center py-10 px-4 bg-pcp-surface border border-dashed border-pcp-green-light/40 rounded-2xl">
            <p className="text-sm font-bold text-pcp-text-secondary">
              {t('vaccination.no_records')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {records.slice(0, 6).map((record) => {
              const vaccineName = tField(record, 'vaccine_name')
              const disease = tField(record, 'disease')
              const schedule = tField(record, 'schedule')
              const ageRange = record.age_range || ''

              return (
                <div
                  key={record.id}
                  className="bg-card border border-pcp-green-light/60 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 relative overflow-hidden group hover:border-primary/40 animate-fade-in-up text-left"
                >
                  <div className="absolute top-0 right-0 bg-primary/10 text-primary p-2.5 rounded-bl-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <Syringe className="w-4.5 h-4.5" />
                  </div>

                  <div className="space-y-4 pr-6">
                    {/* Vaccine & Animal Badge */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-extrabold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-primary/20 block w-max">
                        {language === 'bn'
                          ? record.animal_type_details?.name_bn
                          : record.animal_type_details?.name_en}
                      </span>
                      <h4 className="text-sm sm:text-base font-extrabold text-pcp-text-primary leading-snug group-hover:text-primary transition-colors">
                        {vaccineName}
                      </h4>
                    </div>

                    {/* Prevents Disease */}
                    <div className="space-y-0.5 text-xs text-pcp-text-secondary">
                      <span className="font-extrabold text-pcp-text-primary text-[10px] uppercase tracking-wider block">
                        {t('vaccination.disease')}:
                      </span>
                      <p className="leading-relaxed font-semibold text-pcp-text-primary/95">{disease}</p>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-0.5 text-xs text-pcp-text-secondary">
                      <span className="font-extrabold text-pcp-text-primary text-[10px] uppercase tracking-wider block">
                        {t('vaccination.schedule')}:
                      </span>
                      <p className="leading-relaxed font-semibold text-pcp-text-primary/95">{schedule}</p>
                    </div>

                    {/* Age Range */}
                    {ageRange && (
                      <div className="space-y-0.5 text-xs text-pcp-text-secondary">
                        <span className="font-extrabold text-pcp-text-primary text-[10px] uppercase tracking-wider block">
                          {t('vaccination.age_range')}:
                        </span>
                        <p className="leading-relaxed font-semibold text-pcp-text-primary/95">{ageRange}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default VaccinationLookup
