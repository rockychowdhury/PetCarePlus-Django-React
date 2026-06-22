import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { resourcesApi } from '../api/resources'
import { useLanguage } from '../hooks/useLanguage'
import { useDebounce } from '../hooks/useDebounce'
import PageLayout from '../components/layout/PageLayout'
import AnimalFilter from '../components/guidelines/AnimalFilter'
import GuidelineCard from '../components/guidelines/GuidelineCard'
import Spinner from '../components/ui/Spinner'
import { Search, Info, LayoutGrid, ArrowUpDown } from 'lucide-react'

// Import custom Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'

export const Guidelines = () => {
  const { language, t } = useLanguage()
  const [selectedAnimalId, setSelectedAnimalId] = useState(null)
  const [selectedResourceType, setSelectedResourceType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [ordering, setOrdering] = useState('-created_at')

  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Build API filters params
  const apiParams = {}
  if (selectedAnimalId) apiParams.animal_types = selectedAnimalId
  if (selectedResourceType !== 'all') apiParams.resource_type = selectedResourceType
  if (debouncedSearchQuery.trim()) apiParams.search = debouncedSearchQuery
  if (ordering) apiParams.ordering = ordering

  // Query resources instead of guidelines
  const { data: response, isLoading } = useQuery({
    queryKey: ['resourcesList', selectedAnimalId, selectedResourceType, debouncedSearchQuery, ordering],
    queryFn: () => resourcesApi.getResources(apiParams),
    keepPreviousData: true,
  })

  const resources = response?.results || []
  const count = response?.count || 0

  const resourceTypesList = [
    { id: 'all', label: language === 'bn' ? 'সব ধরন' : 'All Types' },
    { id: 'govt', label: language === 'bn' ? 'সরকারি অফিস' : 'Government Office' },
    { id: 'emergency', label: language === 'bn' ? 'জরুরি যোগাযোগ' : 'Emergency Contact' },
    { id: 'vaccination', label: language === 'bn' ? 'টিকাদান' : 'Vaccination' },
    { id: 'medicine', label: language === 'bn' ? 'ওষুধ' : 'Medicine' },
    { id: 'diseases', label: language === 'bn' ? 'রোগ' : 'Diseases' },
    { id: 'information', label: language === 'bn' ? 'তথ্য' : 'Information' },
    { id: 'shelter', label: language === 'bn' ? 'আশ্রয়' : 'Shelter' },
    { id: 'food', label: language === 'bn' ? 'খাবার' : 'Food' },
    { id: 'other', label: language === 'bn' ? 'অন্যান্য' : 'Other' },
  ]

  const orderingList = [
    { id: '-created_at', label: language === 'bn' ? 'সবচেয়ে নতুন' : 'Newest First' },
    { id: 'created_at', label: language === 'bn' ? 'সবচেয়ে পুরনো' : 'Oldest First' },
    { id: 'title_en', label: language === 'bn' ? 'ক-খ (A-Z)' : 'A-Z' },
    { id: '-title_en', label: language === 'bn' ? 'খ-ক (Z-A)' : 'Z-A' },
  ]

  return (
    <PageLayout>
      <div className="bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
          
          {/* Header & Search Section */}
          <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                {language === 'bn' ? 'রিসোর্স এবং গাইডলাইন' : 'Resources & Guidelines'}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {language === 'bn' ? 'আপনার পোষা প্রাণীর যত্নের জন্য প্রয়োজনীয় সমস্ত তথ্য এবং রিসোর্স খুঁজুন।' : 'Find all the information and resources you need to care for your pet.'}
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full relative shadow-sm rounded-2xl group">
              <Search className="absolute left-4 top-3.5 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'bn' ? 'রিসোর্স বা গাইডলাইন খুঁজুন...' : 'Search resources or guidelines...'}
                className="w-full pl-12 pr-4 py-3 text-sm md:text-base rounded-2xl border border-border/80 bg-card focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Filters Toolbar */}
          <div className="bg-pcp-surface/30 p-4 rounded-2xl border border-border/50 space-y-4">
            {/* Animal Chips */}
            <AnimalFilter
              activeAnimalId={selectedAnimalId}
              onSelectAnimal={setSelectedAnimalId}
            />

            <div className="h-px bg-border/40 w-full" />

            {/* Dropdowns Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-sm font-semibold text-muted-foreground">
                {isLoading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  <span>
                    {language === 'bn' ? `${count} টি ফলাফল পাওয়া গেছে` : `${count} Results Found`}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                
                {/* Resource Type Custom Select */}
                <div className="w-full sm:w-48 relative">
                  <LayoutGrid className="w-4 h-4 text-muted-foreground absolute left-3 top-3 z-10 pointer-events-none" />
                  <Select value={selectedResourceType} onValueChange={setSelectedResourceType}>
                    <SelectTrigger className="w-full pl-9 rounded-xl border-border/80 font-semibold bg-card">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypesList.map((type) => (
                        <SelectItem key={type.id} value={type.id} className="font-semibold cursor-pointer">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ordering Custom Select */}
                <div className="w-full sm:w-48 relative">
                  <ArrowUpDown className="w-4 h-4 text-muted-foreground absolute left-3 top-3 z-10 pointer-events-none" />
                  <Select value={ordering} onValueChange={setOrdering}>
                    <SelectTrigger className="w-full pl-9 rounded-xl border-border/80 font-semibold bg-card">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      {orderingList.map((ord) => (
                        <SelectItem key={ord.id} value={ord.id} className="font-semibold cursor-pointer">
                          {ord.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </div>
          </div>

          {/* Grid Content */}
          {isLoading ? (
            <Spinner className="py-24" />
          ) : resources.length === 0 ? (
            <div className="text-center py-20 px-4 bg-card rounded-2xl border border-dashed border-border/80">
              <Info className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
              <p className="text-sm font-bold text-muted-foreground">
                {language === 'bn' ? 'কোনো রিসোর্স পাওয়া যায়নি।' : 'No resources found.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <div key={resource.id} className="animate-fade-in-up">
                  {/* Reuse GuidelineCard but we need to update GuidelineCard to support Resource object */}
                  <GuidelineCard guideline={resource} />
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </PageLayout>
  )
}

export default Guidelines
