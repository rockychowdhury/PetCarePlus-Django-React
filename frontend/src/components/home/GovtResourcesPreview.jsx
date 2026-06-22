import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { resourcesApi } from '../../api/resources'
import { useAuthStore } from '../../store/authStore'
import { useLocationStore } from '../../store/locationStore'
import { useLanguage } from '../../hooks/useLanguage'
import Spinner from '../ui/Spinner'
import { ArrowRight, Phone, MapPin, Globe, Building2, HeartHandshake, Siren, Info, ShieldAlert, PhoneCall } from 'lucide-react'

export const GovtResourcesPreview = () => {
  const { language, t, tField } = useLanguage()
  const user = useAuthStore((state) => state.user)
  
  // Anonymous selected location
  const anonDistrict = useLocationStore((state) => state.district)
  const currentDistrict = user?.district || anonDistrict

  // Query latest 3 resources in district
  const { data: resourcesResponse, isLoading } = useQuery({
    queryKey: ['latestResources', currentDistrict],
    queryFn: () =>
      resourcesApi.getGovtResources({
        district: currentDistrict || undefined,
        page_size: 3,
      }),
  })

  const resources = resourcesResponse?.results || []

  // Map types to beautiful badges
  const getTypeDetails = (type) => {
    switch (type) {
      case 'govt':
        return {
          icon: <Building2 className="w-3.5 h-3.5 text-primary" />,
          label: t('govt.types.govt'),
          color: 'bg-primary/10 text-primary border-primary/20',
        }
      case 'ngo':
        return {
          icon: <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />,
          label: t('govt.types.ngo'),
          color: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
        }
      case 'emergency':
        return {
          icon: <Siren className="w-3.5 h-3.5 text-rose-600 animate-pulse" />,
          label: t('govt.types.emergency'),
          color: 'bg-rose-50 text-rose-700 border-rose-150 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30',
        }
      default:
        return {
          icon: <Building2 className="w-3.5 h-3.5 text-primary" />,
          label: t('govt.types.govt'),
          color: 'bg-muted text-pcp-text-secondary border-border/80',
        }
    }
  }

  return (
    <section className="py-16 bg-card border-b border-pcp-green-light/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="space-y-1.5 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 text-[10px] sm:text-xs font-bold border border-rose-500/20 animate-pulse-subtle">
              <Siren className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'জরুরি পশু চিকিৎসা হেল্পডেস্ক' : 'Emergency & Government Support'}</span>
            </div>
            
            <h2 className="text-xl md:text-3xl font-extrabold text-pcp-text-primary tracking-tight">
              {t('govt.title')}
            </h2>
            <p className="text-xs md:text-sm text-pcp-text-secondary font-semibold">
              {t('govt.subtitle')}
            </p>
          </div>

          <Link
            to="/resources"
            className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-extrabold text-primary hover:text-pcp-green-hover transition-colors border-b-2 border-transparent hover:border-primary pb-0.5"
          >
            <span>{language === 'bn' ? 'সকল সাহায্যকারী সম্পদ দেখুন' : 'Browse All Resources'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Feature Detailed Explainer Guide */}
        <div className="p-5 bg-pcp-green-bg/50 border border-pcp-green-light/35 rounded-2xl text-left grid grid-cols-1 md:grid-cols-3 gap-6 shadow-sm">
          
          <div className="space-y-1 flex items-start gap-2.5">
            <div className="p-1 rounded bg-primary/10 text-primary mt-0.5">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-pcp-text-primary">
                {language === 'bn' ? '১. সরকারি উপজেলা পশু হাসপাতাল' : '1. Government Upazila Networks'}
              </h4>
              <p className="text-[11px] sm:text-xs text-pcp-text-secondary leading-relaxed font-semibold">
                {language === 'bn'
                  ? 'উপজেলা ভিত্তিক সরকারি পশু হাসপাতাল ও কৃষি কর্মকর্তাদের তালিকা যা দ্রুত সাশ্রয়ী চিকিৎসায় সাহায্য করে।'
                  : 'Provides complete mapping to highly subsidized public animal clinics and Upazila livestock officers.'}
              </p>
            </div>
          </div>

          <div className="space-y-1 flex items-start gap-2.5">
            <div className="p-1 rounded bg-pcp-green-accent/15 text-primary mt-0.5">
              <PhoneCall className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-pcp-text-primary">
                {language === 'bn' ? '২. সরাসরি ডায়াল ও জরুরি সেবা' : '2. Instant Tap-to-Call'}
              </h4>
              <p className="text-[11px] sm:text-xs text-pcp-text-secondary leading-relaxed font-semibold">
                {language === 'bn'
                  ? 'জরুরি হটলাইন নম্বরে ক্লিক করে মুহূর্তের মধ্যে উপজেলা বা জেলা ভেটেরিনারি সার্জনকে কল করুন।'
                  : 'Allows direct phone dialing to duty medical officers or NGO rescue squads for immediate emergency support.'}
              </p>
            </div>
          </div>

          <div className="space-y-1 flex items-start gap-2.5">
            <div className="p-1 rounded bg-primary/10 text-primary mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-pcp-text-primary">
                {language === 'bn' ? '৩. এলাকা ভিত্তিক কাস্টম ফিল্টারিং' : '3. District-Level Scoping'}
              </h4>
              <p className="text-[11px] sm:text-xs text-pcp-text-secondary leading-relaxed font-semibold">
                {language === 'bn'
                  ? 'হোমপেজে আপনার এলাকা বাছাই করা থাকলে স্বয়ংক্রিয়ভাবে আপনার জেলার হাসপাতাল প্রদর্শিত হবে।'
                  : 'Configures results instantly according to your region to ensure you see local district units.'}
              </p>
            </div>
          </div>

        </div>

        {/* Resources Grid */}
        {isLoading ? (
          <Spinner className="py-8" />
        ) : resources.length === 0 ? (
          <div className="text-center py-12 px-4 bg-pcp-surface border border-dashed border-pcp-green-light/40 rounded-2xl text-left flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              {currentDistrict ? (
                <>
                  <p className="text-sm font-bold text-pcp-text-primary">
                    {language === 'bn' ? 'কোন সরকারি সম্পদ খুঁজে পাওয়া যায়নি' : 'No Government Resources Found'}
                  </p>
                  <p className="text-xs text-pcp-text-secondary mt-1">
                    {language === 'bn'
                      ? 'দুঃখিত, এই মুহূর্তে আপনার নির্বাচিত জেলায় কোনো হাসপাতালের খোঁজ মেলেনি। পুরো ডিরেক্টরি দেখতে উপরে ডানদিকের লিংকে যান।'
                      : 'Sorry, we do not have specific hospital listings registered for your district. Please browse the main directory above.'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-pcp-text-primary">
                    {language === 'bn' ? 'এলাকা নির্বাচন করুন' : 'Configure Scoped Region'}
                  </p>
                  <p className="text-xs text-pcp-text-secondary mt-1 font-semibold">
                    {language === 'bn'
                      ? 'আপনার উপজেলার নিকটস্থ সরকারি হাসপাতাল ও জরুরি নম্বরগুলো দেখতে হোমপেজে উপরে এলাকা নির্বাচন করুন।'
                      : 'Please scroll to the top of the Home page and select your active Division/District to view local emergency support.'}
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {resources.map((resource) => {
              const resourceName = tField(resource, 'name')
              const desc = tField(resource, 'description')
              const typeDetails = getTypeDetails(resource.resource_type)

              return (
                <div
                  key={resource.id}
                  className="bg-card border border-pcp-green-light/60 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full group hover:border-primary/30 animate-fade-in-up text-left"
                >
                  <div className="space-y-4">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${typeDetails.color}`}>
                        {typeDetails.icon}
                        <span>{typeDetails.label}</span>
                      </div>
                      <span className="text-[10px] font-extrabold text-pcp-text-muted capitalize">
                        {resource.district}
                      </span>
                    </div>

                    {/* Name & Desc */}
                    <div className="space-y-1.5">
                      <h4 className="text-sm sm:text-base font-extrabold text-pcp-text-primary group-hover:text-primary transition-colors leading-snug">
                        {resourceName}
                      </h4>
                      {desc && (
                        <p className="text-xs text-pcp-text-muted leading-relaxed line-clamp-2">
                          {desc}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact Info Footer */}
                  <div className="pt-4 mt-6 border-t border-pcp-green-light/20 space-y-2.5">
                    {resource.phone && (
                      <div className="flex items-center gap-2 text-xs font-bold text-pcp-text-primary">
                        <Phone className="w-3.5 h-3.5 text-primary" />
                        <a href={`tel:${resource.phone}`} className="hover:underline hover:text-primary transition-colors">{resource.phone}</a>
                      </div>
                    )}
                    {resource.address && (
                      <div className="flex items-center gap-2 text-[11px] text-pcp-text-secondary">
                        <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="truncate" title={resource.address}>{resource.address}</span>
                      </div>
                    )}
                    {resource.website && (
                      <div className="flex items-center gap-2 text-[11px] text-pcp-text-secondary">
                        <Globe className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <a
                          href={resource.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-primary truncate"
                        >
                          {resource.website.replace(/^https?:\/\//, '')}
                        </a>
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

export default GovtResourcesPreview
