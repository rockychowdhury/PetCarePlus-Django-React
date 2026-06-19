import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rehomingApi } from '../../api/rehoming'
import { useLanguage } from '../../hooks/useLanguage'
import { useAuthStore } from '../../store/authStore'
import Spinner from '../../components/ui/Spinner'
import { Heart, Activity, PlusCircle, CheckCircle, XCircle, AlertCircle, Trash2, Edit, User, ChevronDown, ChevronUp, Bot } from 'lucide-react'
import CreateRehomingModal from '../../components/rehoming/CreateRehomingModal'
import toast from 'react-hot-toast'

const DashboardRehoming = () => {
  const { language, t } = useLanguage()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  
  const [activeTab, setActiveTab] = useState('listings') // 'listings' or 'applications'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [expandedListing, setExpandedListing] = useState(null)

  // My Listings Query
  const { data: listingsData, isLoading: isLoadingListings } = useQuery({
    queryKey: ['myRehomingListings'],
    queryFn: () => rehomingApi.getMyListings(),
  })
  const listings = Array.isArray(listingsData) ? listingsData : (listingsData?.results || [])

  // Applications Query (Gets both sent and received)
  const { data: applicationsData, isLoading: isLoadingApps } = useQuery({
    queryKey: ['myRehomingApplications'],
    queryFn: () => rehomingApi.getApplications(),
  })
  const applications = Array.isArray(applicationsData) ? applicationsData : (applicationsData?.results || [])

  // Filter apps
  const mySentApps = applications.filter(app => app.applicant === user?.id)
  
  // App action mutation
  const updateAppMutation = useMutation({
    mutationFn: ({ id, status }) => rehomingApi.updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['myRehomingApplications'])
      queryClient.invalidateQueries(['myRehomingListings'])
      toast.success(language === 'bn' ? 'স্ট্যাটাস আপডেট হয়েছে!' : 'Status updated!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || t('common.error'))
    }
  })

  // Cancel Listing Mutation
  const updateListingMutation = useMutation({
    mutationFn: ({ id, status }) => rehomingApi.updateListing(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['myRehomingListings'])
      toast.success(language === 'bn' ? 'স্ট্যাটাস আপডেট হয়েছে!' : 'Status updated!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || t('common.error'))
    }
  })

  const handleUpdateAppStatus = (appId, status) => {
    let confirmMsg = 'Are you sure?'
    if (status === 'approved') confirmMsg = language === 'bn' ? 'আপনি কি এই আবেদনকারীকে অনুমোদন করতে চান? এটি অন্যান্য সব আবেদন বাতিল করবে।' : 'Are you sure you want to approve this applicant? This will reject all others.'
    if (status === 'rejected') confirmMsg = language === 'bn' ? 'আবেদনটি বাতিল করতে চান?' : 'Reject this application?'
    if (status === 'cancelled') confirmMsg = language === 'bn' ? 'আবেদনটি প্রত্যাহার করতে চান?' : 'Withdraw this application?'

    if (window.confirm(confirmMsg)) {
      updateAppMutation.mutate({ id: appId, status })
    }
  }

  const handleStatusChangeListing = (listingId, status) => {
    if (window.confirm(language === 'bn' ? 'আপনি কি এই পোস্টের স্ট্যাটাস পরিবর্তন করতে চান?' : 'Are you sure you want to change this listing status?')) {
      updateListingMutation.mutate({ id: listingId, status })
    }
  }

  const toggleExpand = (id) => {
    setExpandedListing(prev => prev === id ? null : id)
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary" />
            {language === 'bn' ? 'আমার রিহোমিং' : 'My Rehoming'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'bn' 
              ? 'আপনার রিহোমিং পোস্ট এবং জমা দেওয়া আবেদনসমূহ পরিচালনা করুন।' 
              : 'Manage your rehoming posts and submitted applications.'}
          </p>
        </div>
        <div className="flex bg-muted/50 p-1 rounded-xl w-fit">
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

      {/* LISTINGS TAB */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-card p-4 rounded-2xl border border-border/60 shadow-sm">
            <p className="text-sm font-bold text-muted-foreground">
              {language === 'bn' ? 'নতুন কোনো প্রাণীকে নতুন বাড়ি দিতে চান?' : 'Want to rehome a pet?'}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-pcp-green hover:bg-pcp-green-hover text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              {language === 'bn' ? 'পোস্ট তৈরি করুন' : 'Create Post'}
            </button>
          </div>

          {isLoadingListings || isLoadingApps ? (
            <Spinner className="py-12" />
          ) : !listings || listings.length === 0 ? (
            <div className="text-center py-16 px-4 bg-card rounded-2xl border border-dashed border-border/80">
              <Activity className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
              <p className="text-sm font-bold text-muted-foreground">
                {language === 'bn' ? 'আপনার কোনো রিহোমিং পোস্ট নেই।' : 'You have no rehoming posts.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => {
                const receivedApps = applications.filter(app => app.listing === listing.id)
                const isExpanded = expandedListing === listing.id

                return (
                  <div key={listing.id} className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
                    {/* Listing Header */}
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-muted border-2 border-border flex-shrink-0">
                          {listing.photo_url ? (
                            <img src={listing.photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Heart className="w-full h-full p-4 text-muted-foreground/50" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-lg text-foreground">
                              {listing.pet_name}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              listing.status === 'adopted' ? 'bg-emerald-100 text-emerald-800' :
                              listing.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {t(`rehoming.status.${listing.status}`)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground font-semibold flex items-center gap-1.5 mt-0.5">
                            {listing.breed} • {new Date(listing.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:items-end gap-2">
                        {listing.status === 'active' && (
                          <button
                            onClick={() => handleStatusChangeListing(listing.id, 'withdrawn')}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors w-fit"
                          >
                            {language === 'bn' ? 'পোস্ট বাতিল করুন' : 'Withdraw Post'}
                          </button>
                        )}
                        <button
                          onClick={() => toggleExpand(listing.id)}
                          className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-colors w-full sm:w-auto justify-center"
                        >
                          {language === 'bn' ? 'আবেদনসমূহ' : 'Applications'}
                          <span className="bg-indigo-200 text-indigo-800 px-2 rounded-full text-xs ml-1">
                            {receivedApps.length}
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                        </button>
                      </div>
                    </div>

                    {/* Applications List (Expanded) */}
                    {isExpanded && (
                      <div className="bg-pcp-surface/30 border-t border-border/50 p-5 space-y-4">
                        {receivedApps.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4 font-medium italic">
                            {language === 'bn' ? 'এখনও কোনো আবেদন আসেনি।' : 'No applications received yet.'}
                          </p>
                        ) : (
                          <div className="grid gap-4">
                            {receivedApps.map(app => (
                              <div key={app.id} className="bg-white dark:bg-gray-800 border border-border/60 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="w-4 h-4 text-primary" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-foreground">{app.applicant_name}</p>
                                        <p className="text-[10px] text-muted-foreground">{app.applicant_email}</p>
                                      </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                      app.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                      app.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                      'bg-rose-100 text-rose-800'
                                    }`}>
                                      {t(`rehoming.status.${app.status}`)}
                                    </span>
                                  </div>
                                  
                                  <div className="bg-pcp-surface rounded-lg p-3 relative">
                                    <p className="text-sm text-foreground/90 italic leading-relaxed">"{app.message}"</p>
                                    
                                    {/* AI Score Badge */}
                                    <div className="absolute -top-3 -right-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-extrabold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1 border border-white/20">
                                      <Bot className="w-3 h-3" />
                                      AI Score: {app.ai_score !== null ? `${app.ai_score}/10` : 'N/A'}
                                    </div>
                                  </div>
                                </div>
                                
                                {app.status === 'pending' && listing.status === 'active' && (
                                  <div className="flex md:flex-col justify-end gap-2 shrink-0 md:w-32">
                                    <button
                                      onClick={() => handleUpdateAppStatus(app.id, 'approved')}
                                      className="flex-1 md:flex-none px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      {t('common.approve')}
                                    </button>
                                    <button
                                      onClick={() => handleUpdateAppStatus(app.id, 'rejected')}
                                      className="flex-1 md:flex-none px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                      {t('common.reject')}
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
              })}
            </div>
          )}
        </div>
      )}

      {/* APPLICATIONS TAB */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {isLoadingApps ? (
            <Spinner className="py-12" />
          ) : mySentApps.length === 0 ? (
            <div className="text-center py-16 px-4 bg-card rounded-2xl border border-dashed border-border/80">
              <Heart className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
              <p className="text-sm font-bold text-muted-foreground">
                {language === 'bn' ? 'আপনি কোনো আবেদন করেননি।' : 'You have not submitted any applications.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mySentApps.map((app) => (
                <div key={app.id} className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                          {app.listing_details?.photo_url ? (
                            <img src={app.listing_details.photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Heart className="w-full h-full p-2.5 text-muted-foreground/50" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-foreground">
                            {app.listing_details?.pet_name || 'Pet'}
                          </h3>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                            {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        app.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        app.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {t(`rehoming.status.${app.status}`)}
                      </span>
                    </div>

                    <div className="bg-pcp-surface/50 p-3 rounded-xl">
                      <p className="text-xs font-bold text-muted-foreground mb-1">
                        {language === 'bn' ? 'আপনার মেসেজ:' : 'Your Message:'}
                      </p>
                      <p className="text-sm text-foreground/90 italic line-clamp-3">"{app.message}"</p>
                    </div>
                  </div>

                  {app.status === 'pending' && (
                    <div className="flex justify-end pt-2 border-t border-border/50">
                      <button
                        onClick={() => handleUpdateAppStatus(app.id, 'cancelled')}
                        className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {language === 'bn' ? 'আবেদন প্রত্যাহার করুন' : 'Withdraw Application'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      </div>
      {isCreateModalOpen && (
        <CreateRehomingModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </>
  )
}

export default DashboardRehoming
