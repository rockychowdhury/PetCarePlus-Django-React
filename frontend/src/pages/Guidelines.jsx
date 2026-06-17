import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { guidelinesApi } from '../api/guidelines'
import { useLanguage } from '../hooks/useLanguage'
import PageLayout from '../components/layout/PageLayout'
import AnimalFilter from '../components/guidelines/AnimalFilter'
import GuidelineCard from '../components/guidelines/GuidelineCard'
import Spinner from '../components/ui/Spinner'
import { Search, Info, LayoutGrid, Calendar } from 'lucide-react'

export const Guidelines = () => {
  const { language, t } = useLanguage()
  const [selectedAnimalId, setSelectedAnimalId] = useState(null)
  const [selectedTopic, setSelectedTopic] = useState('all')
  const [selectedSeason, setSelectedSeason] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Build API filters params
  const apiParams = {}
  if (selectedAnimalId) apiParams.animal_type = selectedAnimalId
  if (selectedTopic !== 'all') apiParams.topic = selectedTopic
  if (selectedSeason !== 'all') apiParams.season = selectedSeason
  if (searchQuery.trim()) apiParams.search = searchQuery

  // Query guidelines using TanStack react-query
  const { data: response, isLoading } = useQuery({
    queryKey: ['guidelinesList', selectedAnimalId, selectedTopic, selectedSeason, searchQuery],
    queryFn: () => guidelinesApi.getGuidelines(apiParams),
    keepPreviousData: true,
  })

  const guidelines = response?.results || []

  const topicsList = [
    { id: 'all', label: language === 'bn' ? 'সব বিষয়' : 'All Topics' },
    { id: 'general', label: t('guidelines.topics.general') },
    { id: 'nutrition', label: t('guidelines.topics.nutrition') },
    { id: 'housing', label: t('guidelines.topics.housing') },
    { id: 'health', label: t('guidelines.topics.health') },
    { id: 'breeding', label: t('guidelines.topics.breeding') },
  ]

  const seasonsList = [
    { id: 'all', label: language === 'bn' ? 'সব ঋতু' : 'All Seasons' },
    { id: 'summer', label: t('guidelines.seasons.summer') },
    { id: 'monsoon', label: t('guidelines.seasons.monsoon') },
    { id: 'winter', label: t('guidelines.seasons.winter') },
  ]

  return (
    <PageLayout>
      <div className="bg-pcp-surface/20 py-8 min-h-screen border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
          
          {/* Page Title */}
          <div className="text-center sm:text-left space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              {t('guidelines.title')}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xl">
              {t('guidelines.subtitle')}
            </p>
          </div>

          {/* Animal Selector Strip */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
              {t('guidelines.filter_animal')}
            </h3>
            <AnimalFilter
              activeAnimalId={selectedAnimalId}
              onSelectAnimal={setSelectedAnimalId}
            />
          </div>

          {/* Additional Filter Panels */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-card border border-border/80 p-5 rounded-2xl shadow-sm">
            {/* Search input */}
            <div className="md:col-span-4 relative">
              <Search className="absolute left-3.5 top-2.5 text-muted-foreground w-4.5 h-4.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('guidelines.search_placeholder')}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Topic Select */}
            <div className="md:col-span-4 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-primary flex-shrink-0" />
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
              >
                {topicsList.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Season Select */}
            <div className="md:col-span-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
              >
                {seasonsList.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid Content */}
          {isLoading ? (
            <Spinner className="py-24" />
          ) : guidelines.length === 0 ? (
            <div className="text-center py-20 px-4 bg-card rounded-2xl border border-dashed border-border/80">
              <Info className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
              <p className="text-sm font-bold text-muted-foreground">
                {t('guidelines.no_guidelines')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {guidelines.map((guideline) => (
                <div key={guideline.id} className="animate-fade-in-up">
                  <GuidelineCard guideline={guideline} />
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
