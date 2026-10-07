import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { resourcesApi } from '../api/resources'
import { useLanguage } from '../hooks/useLanguage'
import { useDebounce } from '../hooks/useDebounce'
import PageLayout from '../components/layout/PageLayout'
import AnimalFilter from '../components/guidelines/AnimalFilter'
import Spinner from '../components/ui/Spinner'
import { Search, Syringe, Info } from 'lucide-react'

export const Vaccination = () => {
  const { language, t } = useLanguage()
  const [selectedAnimalId, setSelectedAnimalId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Vaccination reference lives in the shared resources API
  const { data: response, isLoading } = useQuery({
    queryKey: ['vaccinationResources', selectedAnimalId, debouncedSearchQuery],
    queryFn: () =>
      resourcesApi.getResources({
        resource_type: 'vaccination',
        search: debouncedSearchQuery || undefined,
        animal_types: selectedAnimalId || undefined,
      }),
    keepPreviousData: true,
  })

  const vaccines = response?.results || []

  return (
    <PageLayout>
      <div className="bg-pcp-surface/20 py-8 min-h-screen border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">

          {/* Section Header */}
          <div className="text-center sm:text-left space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              {t('vaccination.title')}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {t('vaccination.subtitle')}
            </p>
          </div>

          {/* Animal Filter */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
              {t('guidelines.filter_animal')}
            </h3>
            <AnimalFilter
              activeAnimalId={selectedAnimalId}
              onSelectAnimal={setSelectedAnimalId}
            />
          </div>

          {/* Search Bar Input */}
          <div className="max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-3 text-muted-foreground w-4.5 h-4.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('vaccination.search_placeholder')}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Results Display */}
          {isLoading ? (
            <Spinner className="py-24" />
          ) : vaccines.length === 0 ? (
            <div className="text-center py-20 px-4 bg-card rounded-2xl border border-dashed border-border/80">
              <Info className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
              <p className="text-sm font-bold text-muted-foreground">
                {t('vaccination.no_records')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vaccines.map((record) => (
                <div
                  key={record.id}
                  className="bg-card border border-border/85 rounded-2xl p-5 hover:shadow-md transition-all duration-300 relative overflow-hidden group hover:border-primary/20 animate-fade-in-up"
                >
                  <div className="absolute top-0 right-0 bg-primary/10 text-primary p-2.5 rounded-bl-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <Syringe className="w-4.5 h-4.5" />
                  </div>

                  <div className="space-y-4 pr-6 text-left">
                    {/* Animal Types */}
                    {record.animal_types?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {record.animal_types.map((animal) => (
                          <span
                            key={animal.id}
                            className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                          >
                            {language === 'bn' ? animal.name_bn : animal.name_en}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Name */}
                    <h4 className="text-sm sm:text-base font-extrabold text-foreground leading-snug">
                      {record.title}
                    </h4>

                    {/* Details */}
                    {record.description && (
                      <div className="space-y-0.5 text-xs text-muted-foreground">
                        <span className="font-bold text-foreground text-[10px] uppercase tracking-wider block">
                          {t('vaccination.details')}:
                        </span>
                        <p className="leading-relaxed font-semibold text-foreground/85 whitespace-pre-wrap">
                          {record.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </PageLayout>
  )
}

export default Vaccination
