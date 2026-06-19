import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { providersApi } from '../../api/providers'
import { useLanguage } from '../../hooks/useLanguage'
import Spinner from '../../components/ui/Spinner'
import ProviderCard from '../../components/providers/ProviderCard'
import { Heart, SearchX } from 'lucide-react'

const DashboardFavorites = () => {
  const { language, t } = useLanguage()

  // Fetch Favorite Providers
  const { data: favoritesData, isLoading } = useQuery({
    queryKey: ['favoriteProviders'],
    queryFn: () => providersApi.getFavorites(),
  })

  const favorites = favoritesData?.results || []

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground flex items-center gap-3">
            <div className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-xl">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            {language === 'bn' ? 'ফেভারিট সেবাদাতা' : 'Favorite Providers'}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            {language === 'bn' 
              ? 'আপনার সংরক্ষিত এবং পছন্দের পশু চিকিৎসক ও সেবাদাতাদের তালিকা।'
              : 'Your saved and favorite veterinarians and service providers.'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="pt-2">
        {isLoading ? (
          <Spinner className="py-24" />
        ) : favorites.length === 0 ? (
          <div className="text-center py-24 px-4 bg-card rounded-3xl border border-dashed border-border/80 shadow-sm flex flex-col items-center justify-center animate-fade-in">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <SearchX className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-extrabold text-foreground mb-1">
              {language === 'bn' ? 'কোনো সেবাদাতা সংরক্ষিত নেই' : 'No saved providers yet'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {language === 'bn' 
                ? 'ডাক্তার বা সেবাদাতাদের প্রোফাইলে হার্ট আইকনে ক্লিক করে তাদের এখানে সংরক্ষণ করুন।' 
                : 'Save doctors and service providers by clicking the heart icon on their profiles.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
            {favorites.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardFavorites
