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
import { Stethoscope, Scissors, UserCheck, LayoutGrid, MapPin, Dumbbell, Pill, Compass, List, AlertTriangle } from 'lucide-react'
import { LocationModal } from '../components/providers/LocationModal'
import { CustomSelect } from '../components/common/CustomSelect'
import { getAnimalIcon } from '../utils/animals'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination'

export const Providers = () => {
  const { language, t } = useLanguage()
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)

  // Location store
  const {
    division: storeDiv,
    district: storeDist,
    upazila: storeUpz,
    union: storeUnion,
  } = useLocationStore()

  // State selectors
  const [activeType, setActiveType] = useState('all')
  const [selectedAnimalId, setSelectedAnimalId] = useState('all')
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeType, selectedAnimalId])

  // Fetch animal specialties
  const { data: animalTypes } = useQuery({
    queryKey: ['animalTypes'],
    queryFn: guidelinesApi.getAnimalTypes,
  })

  // Build active filters
  const apiFilters = { page: currentPage }
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

  // Determine display location text
  let locationText = language === 'bn' ? 'বাংলাদেশ (সব)' : 'Bangladesh (All)'
  if (storeUnion || storeUpz || storeDist) {
    const parts = [storeUnion, storeUpz, storeDist].filter(Boolean)
    locationText = parts.join(', ')
  } else if (user?.district) {
    locationText = user.district
  }

  return (
    <PageLayout>
      <div className="bg-pcp-surface/20 py-8 min-h-screen border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
          
          {/* Header & Location Display */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left space-y-1.5">
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                {t('providers.title')}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                {t('providers.subtitle')}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white dark:bg-pcp-card border border-pcp-border shadow-sm px-3 py-1.5 rounded-full">
              <div className="flex items-center gap-1.5 text-sm font-bold text-pcp-green pl-1">
                <MapPin className="w-4 h-4 text-pcp-green shrink-0" />
                <span className="max-w-[200px] truncate">{locationText}</span>
              </div>
              <button 
                onClick={() => setIsLocationModalOpen(true)}
                className="text-xs font-bold text-pcp-green hover:bg-pcp-green-muted/50 transition-colors bg-pcp-green-bg px-3 py-1.5 rounded-full"
              >
                {language === 'bn' ? 'পরিবর্তন করুন' : 'Change'}
              </button>
            </div>
          </div>

          <LocationModal 
            isOpen={isLocationModalOpen} 
            onClose={() => setIsLocationModalOpen(false)} 
          />

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
            <div className="flex items-center gap-2 w-full md:w-auto min-w-[200px]">
              <CustomSelect
                value={selectedAnimalId}
                onChange={setSelectedAnimalId}
                icon={<Compass className="w-4.5 h-4.5" />}
                options={(animalTypes || []).map(a => {
                  const Icon = getAnimalIcon(a.slug)
                  return {
                    id: a.id,
                    label: language === 'bn' ? a.name_bn : a.name_en,
                    icon: <Icon className="w-4 h-4 text-pcp-green dark:text-pcp-green-light shrink-0" />
                  }
                })}
                placeholder={language === 'bn' ? '-- পশু বিশেষজ্ঞ --' : '-- Animal Specialty --'}
              />
            </div>
          </div>

          {/* Fallback Location Alert Banner */}
          {!isLoading && providersResponse && providersResponse.exact_match_found === false && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex gap-3 items-start animate-fade-in text-left">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs md:text-sm text-amber-800 dark:text-amber-300 space-y-1">
                <p className="font-extrabold text-sm">
                  {language === 'bn' ? 'আপনার নির্দিষ্ট এলাকায় কোনো সেবাদাতা পাওয়া যায়নি!' : 'No service providers found in your selected location!'}
                </p>
                <p className="font-medium opacity-90 leading-relaxed text-xs">
                  {language === 'bn' 
                    ? `"${locationText}"-এ কোনো ম্যাচ পাওয়া যায়নি। বিকল্প হিসেবে পার্শ্ববর্তী এলাকা বা দেশজুড়ে অন্যান্য সেবাদাতাদের তালিকা দেখানো হচ্ছে।` 
                    : `We couldn't find any service providers directly in "${locationText}". Showing results from surrounding regions or nationwide instead.`
                  }
                </p>
              </div>
            </div>
          )}

          <ProviderGrid providers={providers} isLoading={isLoading} />

          {/* Pagination controls */}
          {!isLoading && providersResponse && providersResponse.count > 16 && (
            <div className="border-t border-border/80 pt-6 mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => {
                        if (currentPage > 1) {
                          setCurrentPage(prev => Math.max(1, prev - 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className="cursor-pointer text-pcp-text-primary dark:text-muted-foreground"
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.ceil(providersResponse.count / 16) }).map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          isActive={currentPage === pageNum}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="cursor-pointer text-pcp-text-primary dark:text-muted-foreground"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => {
                        if (providersResponse.next) {
                          setCurrentPage(prev => prev + 1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className="cursor-pointer text-pcp-text-primary dark:text-muted-foreground"
                      disabled={!providersResponse.next}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

        </div>
      </div>
    </PageLayout>
  )
}

export default Providers
