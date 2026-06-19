import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { providersApi } from '../../api/providers'
import { useLanguage } from '../../hooks/useLanguage'
import Spinner from '../ui/Spinner'
import ProviderCard from '../providers/ProviderCard'
import { HeartCrack, Heart } from 'lucide-react'
import toast from 'react-hot-toast'

const DashboardFavorites = () => {
  const { language } = useLanguage()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['favorite-providers'],
    queryFn: () => providersApi.getFavorites(),
  })

  const toggleMutation = useMutation({
    mutationFn: (id) => providersApi.toggleFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['favorite-providers'])
    },
    onError: () => {
      toast.error(language === 'bn' ? 'ব্যর্থ হয়েছে!' : 'Failed!')
    }
  })

  const handleToggle = (id) => {
    toggleMutation.mutate(id)
  }

  const favorites = data?.results || data || []

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground flex items-center gap-2">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
          {language === 'bn' ? 'প্রিয় সেবাদাতা' : 'Favorite Providers'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {language === 'bn' 
            ? 'আপনার সংরক্ষিত পশু চিকিৎসক এবং অন্যান্য সেবাদাতাদের তালিকা।' 
            : 'Your saved veterinarians and other service providers.'}
        </p>
      </div>

      <div className="bg-card dark:bg-pcp-card rounded-2xl p-6 sm:p-8 shadow-sm border border-pcp-border/60">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-300 dark:text-rose-700 rounded-full flex items-center justify-center mb-2">
              <HeartCrack className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {language === 'bn' ? 'কোনো প্রিয় সেবাদাতা নেই' : 'No Favorite Providers Yet'}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {language === 'bn'
                ? 'আপনি এখনও কোনো সেবাদাতাকে প্রিয় তালিকায় যোগ করেননি। প্রোভাইডার ডিরেক্টরি থেকে হার্ট আইকনে ক্লিক করে সংরক্ষণ করুন।'
                : "You haven't added any providers to your favorites yet. Browse the provider directory and click the heart icon to save them here."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((provider) => (
              <div key={provider.id} className="relative group">
                <ProviderCard provider={provider} />
                <button
                  onClick={() => handleToggle(provider.id)}
                  disabled={toggleMutation.isPending}
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                  title="Remove from favorites"
                >
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardFavorites
