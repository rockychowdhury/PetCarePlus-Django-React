import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { resourcesApi } from '../api/resources'
import { useAuthStore } from '../store/authStore'
import { useLocationStore } from '../store/locationStore'
import { useLanguage } from '../hooks/useLanguage'
import { BANGLADESH_GEOGRAPHY } from '../utils/geo'
import PageLayout from '../components/layout/PageLayout'
import Spinner from '../components/ui/Spinner'
import { Phone, MapPin, Globe, Building2, HeartHandshake, Siren, Info } from 'lucide-react'

export const GovtResources = () => {
  const { language, t, tField } = useLanguage()
  const user = useAuthStore((state) => state.user)
  const user = useAuthStore((state) => state.user)

  // Location store for anonymous
  const { division: anonDivision, district: anonDistrict, setLocation } = useLocationStore()

  // State selectors
  const [selectedDivision, setSelectedDivision] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')

  // Sync state with location
  useEffect(() => {
    if (user) {
      setSelectedDivision(user.division || '')
      setSelectedDistrict(user.district || '')
    } else {
      setSelectedDivision(anonDivision || '')
      setSelectedDistrict(anonDistrict || '')
    }
  }, [user, anonDivision, anonDistrict])

  const handleDivisionChange = (e) => {
    const div = e.target.value
    setSelectedDivision(div)
    setSelectedDistrict('')
    if (!user) setLocation({ division: div, district: '', upazila: '' })
  }

  const handleDistrictChange = (e) => {
    const dist = e.target.value
    setSelectedDistrict(dist)
    if (!user) setLocation({ division: selectedDivision, district: dist, upazila: '' })
  }

  // Query resources based on active location selections
  const { data: response, isLoading } = useQuery({
    queryKey: ['resourcesList', selectedDistrict],
    queryFn: () =>
      resourcesApi.getResources({
        district: selectedDistrict || undefined,
      }),
  })

  const resources = response?.results || []

  // Map type cards
  const getTypeDetails = (type) => {
    switch (type) {
      case 'govt':
        return {
          icon: <Building2 className="w-4 h-4 text-emerald-600" />,
          label: t('govt.types.govt'),
          color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        }
      case 'ngo':
        return {
          icon: <HeartHandshake className="w-4 h-4 text-blue-600" />,
          label: t('govt.types.ngo'),
          color: 'bg-blue-50 text-blue-700 border-blue-100',
        }
      case 'emergency':
        return {
          icon: <Siren className="w-4 h-4 text-rose-600 animate-pulse" />,
          label: t('govt.types.emergency'),
          color: 'bg-rose-50 text-rose-700 border-rose-100',
        }
      default:
        return {
          icon: <Building2 className="w-4 h-4 text-primary" />,
          label: t('govt.types.govt'),
          color: 'bg-muted text-muted-foreground border-border',
        }
    }
  }

  const activeDistricts = BANGLADESH_GEOGRAPHY.districts[selectedDivision] || []

  return (
    <PageLayout>
      <div className="bg-pcp-surface/20 py-8 min-h-screen border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
          
          {/* Section title */}
          <div className="text-center sm:text-left space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              {t('govt.title')}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xl">
              {t('govt.subtitle')}
            </p>
          </div>

          {/* Scoped location selectors bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-card border border-border/80 p-5 rounded-2xl shadow-sm max-w-2xl">
            {/* Division */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-muted-foreground">
                {t('hero.select_division')}
              </label>
              <select
                value={selectedDivision}
                onChange={handleDivisionChange}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
              >
                <option value="">-- {t('hero.select_division')} --</option>
                {BANGLADESH_GEOGRAPHY.divisions.map((div) => (
                  <option key={div.id} value={div.id}>
                    {language === 'bn' ? div.name_bn : div.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-muted-foreground">
                {t('hero.select_district')}
              </label>
              <select
                value={selectedDistrict}
                onChange={handleDistrictChange}
                disabled={!selectedDivision}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold disabled:opacity-50"
              >
                <option value="">-- {t('hero.select_district')} --</option>
                {activeDistricts.map((dist) => (
                  <option key={dist.id} value={dist.id}>
                    {language === 'bn' ? dist.name_bn : dist.name_en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid display */}
          {isLoading ? (
            <Spinner className="py-24" />
          ) : resources.length === 0 ? (
            <div className="text-center py-20 px-4 bg-card rounded-2xl border border-dashed border-border/80">
              <Info className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
              <p className="text-sm font-bold text-muted-foreground">
                {selectedDistrict ? t('govt.no_resources') : 'নিকটস্থ পশু হাসপাতালের খোঁজ পেতে আপনার জেলা নির্বাচন করুন।'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => {
                const name = tField(resource, 'name')
                const desc = tField(resource, 'description')
                const typeDetails = getTypeDetails(resource.resource_type)

                return (
                  <div
                    key={resource.id}
                    className="bg-card border border-border/80 rounded-xl p-5 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group hover:border-primary/20 animate-fade-in-up"
                  >
                    <div className="space-y-4 text-left">
                      {/* Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${typeDetails.color}`}>
                          {typeDetails.icon}
                          <span>{typeDetails.label}</span>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground capitalize">
                          {resource.district}
                        </span>
                      </div>

                      {/* Info details */}
                      <div className="space-y-1.5">
                        <h4 className="text-sm sm:text-base font-extrabold text-foreground group-hover:text-primary transition-colors">
                          {name}
                        </h4>
                        {desc && (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {desc}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Contact details */}
                    <div className="pt-4 mt-auto border-t border-border/40 space-y-2 text-left">
                      {resource.phone && (
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                          <Phone className="w-3.5 h-3.5 text-primary" />
                          <a href={`tel:${resource.phone}`} className="hover:underline">{resource.phone}</a>
                        </div>
                      )}
                      {resource.address && (
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="truncate" title={resource.address}>{resource.address}</span>
                        </div>
                      )}
                      {resource.website && (
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
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
      </div>
    </PageLayout>
  )
}

export default GovtResources
