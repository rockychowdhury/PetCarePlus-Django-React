import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rehomingApi } from '../api/rehoming'
import { guidelinesApi } from '../api/guidelines'
import { useAuthStore } from '../store/authStore'
import { useLanguage } from '../hooks/useLanguage'
import { useLocationStore } from '../store/locationStore'
import PageLayout from '../components/layout/PageLayout'
import ListingCard from '../components/rehoming/ListingCard'
import ApplicationForm from '../components/rehoming/ApplicationForm'
import Spinner from '../components/ui/Spinner'
import { CustomSelect } from '../components/common/CustomSelect'
import { getAnimalIcon } from '../utils/animals'
import { Heart, Plus, Mail, CheckCircle, AlertCircle, Info, Trash2, Search, Compass, MapPin } from 'lucide-react'

export const Rehoming = () => {
  const { language, t } = useLanguage()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const [selectedAnimalId, setSelectedAnimalId] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Query active listings (scoped cascade local network)
  const { data: listingsResponse, isLoading: isLoadingListings } = useQuery({
    queryKey: ['rehomingListings'],
    queryFn: () => rehomingApi.getListings(),
  })
  let listings = listingsResponse?.results || []
  listings = listings.filter(l => l.status === 'active')

  // Apply local filtering for Animal Type and Search
  if (selectedAnimalId !== 'all') {
    listings = listings.filter(l => l.animal_type === selectedAnimalId || String(l.animal_type) === String(selectedAnimalId))
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    listings = listings.filter(l => 
      (l.pet_name && l.pet_name.toLowerCase().includes(q)) || 
      (l.breed && l.breed.toLowerCase().includes(q))
    )
  }

  // Fetch animal types for the form and filter for rehoming
  const { data: animalTypesData } = useQuery({
    queryKey: ['animalTypes'],
    queryFn: () => guidelinesApi.getAnimalTypes(),
  })
  const allAnimalTypes = Array.isArray(animalTypesData) ? animalTypesData : (animalTypesData?.results || [])
  const animalTypes = allAnimalTypes.filter(a => a.supports_rehoming)

  // Mutation to update application status (Approve/Reject)
  const updateAppStatusMutation = useMutation({
    mutationFn: ({ id, status }) => rehomingApi.updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['rehomingApplications'])
      queryClient.invalidateQueries(['rehomingListings'])
    },
    onError: (err) => {
      alert(err.response?.data?.detail || t('common.error'))
    },
  })

  const handleApprove = (appId) => {
    if (window.confirm(language === 'bn' ? 'আপনি কি দত্তক অনুমোদন করতে চান? এটি পোষা প্রাণীটির মালিকানা হস্তান্তর করবে।' : 'Are you sure you want to approve this adoption? It will transfer pet ownership.')) {
      updateAppStatusMutation.mutate({ id: appId, status: 'approved' })
    }
  }

  const handleReject = (appId) => {
    if (window.confirm(language === 'bn' ? 'আবেদনটি প্রত্যাখ্যান করতে চান?' : 'Are you sure you want to reject this application?')) {
      updateAppStatusMutation.mutate({ id: appId, status: 'rejected' })
    }
  }

  const canPostListing = user && user?.role === 'pet_owner'

  const { district: storeDist, upazila: storeUpz, union: storeUnion } = useLocationStore()
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
            <div className="text-center sm:text-left space-y-1.5 max-w-xl">
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                {t('rehoming.title')}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                {t('rehoming.subtitle')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-1.5 bg-white dark:bg-pcp-card border border-pcp-border shadow-sm px-4 py-2 rounded-full text-sm font-bold text-pcp-green">
                <MapPin className="w-4 h-4 text-pcp-green shrink-0" />
                <span className="max-w-[200px] truncate">{locationText}</span>
              </div>
              {canPostListing && (
                <Link
                  to="/dashboard/rehoming"
                  className="flex-shrink-0 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white text-sm font-bold rounded-2xl shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4.5 h-4.5" />
                  <span>{t('rehoming.btn_post')}</span>
                </Link>
              )}
            </div>
          </div>

          {/* Warning disclaimer */}
          <div className="p-4 bg-accent/5 border border-accent/20 rounded-2xl flex gap-3 items-start animate-fade-in text-left">
            <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium">
              {t('rehoming.notice')}
            </p>
          </div>

          {/* Filtering Tabs & Search/Animal Dropdown */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            {/* View tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 w-full md:w-auto no-scrollbar">
              <button
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl border bg-primary text-white border-primary shadow-sm transition-all"
              >
                <Heart className="w-4 h-4" />
                <span>{language === 'bn' ? 'সব তালিকা' : 'All Pets'}</span>
              </button>
              {user && (
                <Link
                  to="/dashboard/rehoming"
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl border bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                  <span>{language === 'bn' ? 'আমার আবেদন' : 'My Applications'}</span>
                </Link>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pcp-text-muted dark:text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'bn' ? 'নাম বা জাত খুঁজুন...' : 'Search by name or breed...'}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-pcp-border dark:border-border/60 bg-white dark:bg-pcp-card focus:outline-none focus:border-pcp-green focus:ring-1 focus:ring-pcp-green transition-all shadow-sm font-semibold placeholder:text-pcp-text-muted/60"
                />
              </div>

              <div className="w-full sm:w-auto min-w-[200px]">
                <CustomSelect
                  value={selectedAnimalId}
                  onChange={setSelectedAnimalId}
                  icon={<Compass className="w-4.5 h-4.5 text-pcp-text-muted dark:text-muted-foreground" />}
                  options={(animalTypes || []).map(a => {
                    const Icon = getAnimalIcon(a.slug)
                    return {
                      id: a.id,
                      label: language === 'bn' ? a.name_bn || a.name_en : a.name_en,
                      icon: <Icon className="w-4 h-4 text-pcp-green dark:text-pcp-green-light shrink-0" />
                    }
                  })}
                  placeholder={language === 'bn' ? '-- প্রাণীর ধরন --' : '-- Animal Type --'}
                />
              </div>
            </div>
          </div>

          <div className="w-full">
            {/* Full Width Listings Grid */}
            <div>
              {isLoadingListings ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="group relative flex flex-col justify-between h-full bg-pcp-card dark:bg-card rounded-3xl shadow-sm border border-pcp-border/60 dark:border-white/5 p-4 overflow-hidden animate-pulse"
                    >
                      {/* Top Banner Cover Area Skeleton */}
                      <div className="relative h-[150px] w-full shrink-0 rounded-2xl mb-4 bg-muted" />

                      {/* Content Area Skeleton */}
                      <div className="flex flex-col flex-grow px-1">
                        <div className="w-3/4 h-5 bg-muted rounded mb-2.5" />
                        <div className="w-1/2 h-3.5 bg-muted rounded mb-3.5" />
                        
                        <div className="w-2/3 h-4 bg-muted rounded mb-3.5" />
                        <div className="w-1/2 h-3.5 bg-muted rounded mb-3.5" />

                        <div className="h-px bg-pcp-border/30 dark:bg-border/30 my-2.5" />
                        
                        <div className="w-full h-8 bg-muted rounded mb-2.5" />
                      </div>

                      {/* Footer Area Skeleton */}
                      <div className="mt-4 pt-3 border-t border-pcp-border/40 dark:border-border/40">
                        <div className="w-full h-10 bg-muted rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-20 px-4 bg-card rounded-2xl border border-dashed border-border/80">
                  <Heart className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
                  <p className="text-sm font-bold text-muted-foreground">
                    {t('rehoming.no_listings')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {listings.map((listing) => (
                    <Link
                      key={listing.id}
                      to={`/rehoming/${listing.id}`}
                      className="block animate-fade-in-up"
                    >
                      <ListingCard listing={listing} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  )
}

export default Rehoming
