import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { savedApi } from '../../api/saved'
import { useLanguage } from '../../hooks/useLanguage'
import Spinner from '../../components/ui/Spinner'
import ProviderCard from '../../components/providers/ProviderCard'
import GuidelineCard from '../../components/guidelines/GuidelineCard'
import { Heart, SearchX, Bookmark } from 'lucide-react'

const DashboardFavorites = () => {
  const { language, t } = useLanguage()
  const [activeTab, setActiveTab] = useState('serviceprovider')

  // Fetch Saved Items based on active tab
  const { data: savedData, isLoading } = useQuery({
    queryKey: ['savedItems', activeTab],
    queryFn: () => savedApi.getSavedItems(activeTab),
  })

  const items = savedData?.results || []

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground flex items-center gap-3">
            <div className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-xl">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            {language === 'bn' ? 'সংরক্ষিত আইটেম' : 'Saved Items'}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            {language === 'bn' 
              ? 'আপনার সংরক্ষিত সেবাদাতা এবং প্রয়োজনীয় রিসোর্সগুলোর তালিকা।'
              : 'Your saved service providers and essential resources.'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-border/40 pb-2">
        <button
          onClick={() => setActiveTab('serviceprovider')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-t-xl transition-all ${
            activeTab === 'serviceprovider'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Heart className="w-4 h-4" />
          {language === 'bn' ? 'সেবাদাতা' : 'Providers'}
        </button>
        <button
          onClick={() => setActiveTab('resource')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-t-xl transition-all ${
            activeTab === 'resource'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          {language === 'bn' ? 'রিসোর্স' : 'Resources'}
        </button>
      </div>

      {/* Content */}
      <div className="pt-2">
        {isLoading ? (
          <Spinner className="py-24" />
        ) : items.length === 0 ? (
          <div className="text-center py-24 px-4 bg-card rounded-3xl border border-dashed border-border/80 shadow-sm flex flex-col items-center justify-center animate-fade-in">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <SearchX className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-extrabold text-foreground mb-1">
              {language === 'bn' ? 'কোনো আইটেম সংরক্ষিত নেই' : 'No items saved yet'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {language === 'bn' 
                ? 'প্রোফাইল বা রিসোর্স কার্ডে হার্ট অথবা বুকমার্ক আইকনে ক্লিক করে সংরক্ষণ করুন।' 
                : 'Save items by clicking the heart or bookmark icons on their cards.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {items.map((item) => (
              activeTab === 'serviceprovider' 
                ? <ProviderCard key={item.id} provider={item} />
                : <GuidelineCard key={item.id} guideline={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardFavorites
