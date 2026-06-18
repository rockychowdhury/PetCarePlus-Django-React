import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rehomingApi } from '../../api/rehoming'
import { useLanguage } from '../../hooks/useLanguage'
import Spinner from '../../components/ui/Spinner'
import { Heart, Activity, CheckCircle, XCircle, AlertCircle, Trash2, Edit } from 'lucide-react'

const DashboardRehoming = () => {
  const { language, t } = useLanguage()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('listings') // 'listings' or 'applications'

  // My Listings Query
  const { data: listingsData, isLoading: isLoadingListings } = useQuery({
    queryKey: ['myRehomingListings'],
    queryFn: () => rehomingApi.getMyListings(),
  })
  const listings = Array.isArray(listingsData) ? listingsData : (listingsData?.results || [])

  // My Applications Query
  const { data: applicationsData, isLoading: isLoadingApps } = useQuery({
    queryKey: ['myRehomingApplications'],
    queryFn: () => rehomingApi.getApplications(),
  })
  const applications = Array.isArray(applicationsData) ? applicationsData : (applicationsData?.results || [])

  // Cancel Application Mutation
  const updateAppMutation = useMutation({
    mutationFn: ({ id, status }) => rehomingApi.updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['myRehomingApplications'])
      queryClient.invalidateQueries(['myRehomingListings'])
    },
    onError: (err) => {
      alert(err.response?.data?.detail || t('common.error'))
    }
  })

  // Cancel Listing Mutation
  const updateListingMutation = useMutation({
    mutationFn: ({ id, status }) => rehomingApi.updateListing(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['myRehomingListings'])
    },
    onError: (err) => {
      alert(err.response?.data?.detail || t('common.error'))
    }
  })

  const handleCancelApp = (appId) => {
    if (window.confirm(language === 'bn' ? 'আপনি কি আবেদনটি বাতিল করতে চান?' : 'Are you sure you want to cancel this application?')) {
      updateAppMutation.mutate({ id: appId, status: 'cancelled' })
    }
  }

  const handleStatusChangeListing = (listingId, status) => {
    if (window.confirm(language === 'bn' ? 'আপনি কি এই পোস্টের স্ট্যাটাস পরিবর্তন করতে চান?' : 'Are you sure you want to change this listing status?')) {
      updateListingMutation.mutate({ id: listingId, status })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-border/60 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            {language === 'bn' ? 'আমার রিহোমিং' : 'My Rehoming'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            আপনার রিহোমিং পোস্ট এবং জমা দেওয়া আবেদনসমূহ পরিচালনা করুন।
          </p>
        </div>
        <div className="flex bg-muted/50 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'listings'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {language === 'bn' ? 'আমার পোস্ট' : 'My Posts'}
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'applications'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {language === 'bn' ? 'আমার আবেদন' : 'My Applications'}
          </button>
        </div>
      </div>

      {activeTab === 'listings' && (
        <div className="space-y-4">
          {isLoadingListings ? (
            <Spinner className="py-12" />
          ) : !listings || listings.length === 0 ? (
            <div className="text-center py-16 px-4 bg-card rounded-2xl border border-dashed border-border/80">
              <Activity className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
              <p className="text-sm font-bold text-muted-foreground">
                {language === 'bn' ? 'আপনার কোনো রিহোমিং পোস্ট নেই।' : 'You have no rehoming posts.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {listings.map((listing) => (
                <div key={listing.id} className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                        {listing.photo_url ? (
                          <img src={listing.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Heart className="w-full h-full p-3 text-muted-foreground/50" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-foreground">
                          {listing.pet_name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-semibold">
                          {listing.breed}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      listing.status === 'adopted' ? 'bg-emerald-100 text-emerald-800' :
                      listing.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {t(`rehoming.status.${listing.status}`)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-foreground/80 pt-2 border-t border-border/50 line-clamp-2">
                    {listing.reason}
                  </div>

                  {listing.status === 'active' && (
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleStatusChangeListing(listing.id, 'cancelled')}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-4">
          {isLoadingApps ? (
            <Spinner className="py-12" />
          ) : !applications || applications.length === 0 ? (
            <div className="text-center py-16 px-4 bg-card rounded-2xl border border-dashed border-border/80">
              <Activity className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
              <p className="text-sm font-bold text-muted-foreground">
                {language === 'bn' ? 'আপনার কোনো আবেদন নেই।' : 'You have no applications.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {applications.map((app) => (
                <div key={app.id} className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-base text-foreground">
                        {language === 'bn' ? 'আবেদন' : 'Application'} #{app.id}
                      </h3>
                      <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                        {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      app.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      app.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {t(`rehoming.status.${app.status}`)}
                    </span>
                  </div>

                  <div className="bg-pcp-surface/50 p-3 rounded-xl space-y-1">
                    <p className="text-xs font-bold text-muted-foreground">
                      {language === 'bn' ? 'মেসেজ:' : 'Message:'}
                    </p>
                    <p className="text-sm text-foreground/90 italic">"{app.message}"</p>
                  </div>

                  {app.status === 'pending' && (
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleCancelApp(app.id)}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DashboardRehoming
