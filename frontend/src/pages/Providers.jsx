import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLocalProviders } from '../hooks/useLocalProviders'
import { guidelinesApi } from '../api/guidelines'
import { useLanguage } from '../hooks/useLanguage'
import { useAuthStore } from '../store/authStore'
import { useLocationStore } from '../store/locationStore'
import { BANGLADESH_GEOGRAPHY } from '../utils/geo'
import PageLayout from '../components/layout/PageLayout'
import ProviderGrid from '../components/providers/ProviderGrid'
import ProviderMap from '../components/providers/ProviderMap'
import { Stethoscope, Scissors, UserCheck, LayoutGrid, MapPin, Dumbbell, Pill, Compass, List, Map as MapIcon } from 'lucide-react'

export const Providers = () => {
  const { language, t } = useLanguage()
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const { setUser } = useAuthStore()

  // Location store for anonymous
  const {
    division: anonDivision,
    district: anonDistrict,
    upazila: anonUpazila,
    setLocation,
  } = useLocationStore()

  // State selectors
  const [selectedDivision, setSelectedDivision] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [upazilaInput, setUpazilaInput] = useState('')
  const [activeType, setActiveType] = useState('all')
  const [selectedAnimalId, setSelectedAnimalId] = useState('all')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'map'

  // Sync state with location
  useEffect(() => {
    if (token && user) {
      setSelectedDivision(user.division || '')
      setSelectedDistrict(user.district || '')
      setUpazilaInput(user.upazila || '')
    } else {
      setSelectedDivision(anonDivision || '')
      setSelectedDistrict(anonDistrict || '')
      setUpazilaInput(anonUpazila || '')
    }
  }, [user, token, anonDivision, anonDistrict, anonUpazila])

  const handleDivisionChange = (e) => {
    const div = e.target.value
    setSelectedDivision(div)
    setSelectedDistrict('')
    updateLocationState(div, '', upazilaInput)
  }

  const handleDistrictChange = (e) => {
    const dist = e.target.value
    setSelectedDistrict(dist)
    updateLocationState(selectedDivision, dist, upazilaInput)
  }

  const handleUpazilaBlur = (e) => {
    const upazila = e.target.value
    setUpazilaInput(upazila)
    updateLocationState(selectedDivision, selectedDistrict, upazila)
  }

  const updateLocationState = async (division, district, upazila) => {
    if (token && user) {
      try {
        const updatedUser = await authApi.updateMe({ division, district, upazila })
        setUser(updatedUser)
      } catch (err) {
        console.error('Failed to sync location to profile:', err)
      }
    } else {
      setLocation({ division, district, upazila })
    }
  }

  // Fetch animal specialties
  const { data: animalTypes } = useQuery({
    queryKey: ['animalTypes'],
    queryFn: guidelinesApi.getAnimalTypes,
  })

  // Build active filters
  const apiFilters = {}
  if (activeType !== 'all') apiFilters.provider_type = activeType
  if (selectedAnimalId !== 'all') apiFilters.animal_type = selectedAnimalId

  // Scoped cascade search
  const { data: providersResponse, isLoading } = useLocalProviders(apiFilters)
  const providers = providersResponse?.results || []

  const typesList = [
    { id: 'all', label: t('providers.types.all'), icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'vet', label: t('providers.types.vet'), icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'groomer', label: t('providers.types.groomer'), icon: <Scissors className="w-4 h-4" /> },
    { id: 'sitter', label: t('providers.types.sitter'), icon: <UserCheck className="w-4 h-4" /> },
    { id: 'trainer', label: t('providers.types.trainer'), icon: <Dumbbell className="w-4 h-4" /> },
    { id: 'pharmacy', label: t('providers.types.pharmacy'), icon: <Pill className="w-4 h-4" /> },
  ]

  const activeDistricts = BANGLADESH_GEOGRAPHY.districts[selectedDivision] || []

  return (
    <PageLayout>
      <div className="bg-pcp-surface/20 py-8 min-h-screen border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
          
          {/* Header */}
          <div className="text-center sm:text-left space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              {t('providers.title')}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {t('providers.subtitle')}
            </p>
          </div>

          {/* Location Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card border border-border/80 p-5 rounded-2xl shadow-sm max-w-4xl">
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

            {/* Upazila */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-muted-foreground">
                {t('hero.select_upazila')}
              </label>
              <input
                type="text"
                value={upazilaInput}
                onChange={(e) => setUpazilaInput(e.target.value)}
                onBlur={handleUpazilaBlur}
                disabled={!selectedDistrict}
                placeholder={language === 'bn' ? 'যেমন: বোয়ালখালী' : 'e.g. Boalkhali'}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold disabled:opacity-50"
              />
            </div>
          </div>

          {/* Filtering Tabs & Animal Specialty Dropdown */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            {/* Service types tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 w-full md:w-auto no-scrollbar">
              {typesList.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveType(type.id)}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full border transition-all ${
                    activeType === type.id
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  {type.icon}
                  <span>{type.label}</span>
                </button>
              ))}
            </div>

            {/* Animal Specialty filter */}
            <div className="flex items-center gap-2 w-full md:w-auto max-w-xs">
              <Compass className="w-4.5 h-4.5 text-primary flex-shrink-0" />
              <select
                value={selectedAnimalId}
                onChange={(e) => setSelectedAnimalId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card focus:outline-none focus:border-primary font-semibold"
              >
                <option value="all">
                  {language === 'bn' ? '-- পশু বিশেষজ্ঞ --' : '-- Animal Specialty --'}
                </option>
                {animalTypes?.map((animal) => (
                  <option key={animal.id} value={animal.id}>
                    {language === 'bn' ? animal.name_bn : animal.name_en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* View Toggle Bar */}
          <div className="flex justify-end">
            <div className="bg-card border border-border/80 p-1 rounded-xl inline-flex shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <List className="w-4 h-4" />
                {language === 'bn' ? 'লিস্ট ভিউ' : 'List View'}
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === 'map'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <MapIcon className="w-4 h-4" />
                {language === 'bn' ? 'ম্যাপ ভিউ' : 'Map View'}
              </button>
            </div>
          </div>

          {/* Grid or Map Content */}
          {viewMode === 'list' ? (
            <ProviderGrid providers={providers} isLoading={isLoading} />
          ) : (
            <ProviderMap providers={providers} isLoading={isLoading} />
          )}

        </div>
      </div>
    </PageLayout>
  )
}

export default Providers
