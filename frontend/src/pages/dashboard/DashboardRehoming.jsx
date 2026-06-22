import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rehomingApi } from '../../api/rehoming'
import { useLanguage } from '../../hooks/useLanguage'
import { useAuthStore } from '../../store/authStore'
import Spinner from '../../components/ui/Spinner'
import { Heart, Activity, PlusCircle, CheckCircle, XCircle, AlertCircle, Trash2, Edit, User, ChevronDown, ChevronUp, Bot, Eye } from 'lucide-react'
import CreateRehomingModal from '../../components/rehoming/CreateRehomingModal'
import toast from 'react-hot-toast'

const DashboardRehoming = () => {
  const { language, t } = useLanguage()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  
  const [activeTab, setActiveTab] = useState('listings') // 'listings' or 'applications'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [expandedListing, setExpandedListing] = useState(null)
  
  // Modal states
  const [approvalModalAppId, setApprovalModalAppId] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null })

  const formatEmailText = (text) => {
    if (!text) return null;
    if (text.includes('\n')) return text;
    
    return text
      .replace(/(Hello[a-zA-Z\s]+[,.]|Hi[a-zA-Z\s]+[,.]|Dear[a-zA-Z\s]+[,.])/gi, '$&\n\n')
      .replace(/(Sincerely[,.]|Regards[,.]|Best[,.]|Thank you[,.]|Thanks[,.])/gi, '\n\n$&')
      .replace(/(For further query|I will be waiting)/gi, '\n\n$&');
  }

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
    if (status === 'approved') {
      setApprovalModalAppId(appId)
      return
    }

    if (status === 'reviewed') {
      updateAppMutation.mutate({ id: appId, status })
      return
    }

    let confirmMsg = 'Are you sure?'
    if (status === 'rejected') confirmMsg = language === 'bn' ? 'আবেদনটি বাতিল করতে চান?' : 'Reject this application?'
    if (status === 'cancelled') confirmMsg = language === 'bn' ? 'আবেদনটি প্রত্যাহার করতে চান?' : 'Withdraw this application?'

    setConfirmDialog({
      isOpen: true,
      title: language === 'bn' ? 'নিশ্চিত করুন' : 'Confirm Action',
      message: confirmMsg,
      onConfirm: () => updateAppMutation.mutate({ id: appId, status })
    })
  }

  const confirmApproval = () => {
    if (approvalModalAppId) {
      updateAppMutation.mutate({ id: approvalModalAppId, status: 'approved' })
      setApprovalModalAppId(null)
    }
  }

  const handleStatusChangeListing = (listingId, status) => {
    setConfirmDialog({
      isOpen: true,
      title: language === 'bn' ? 'নিশ্চিত করুন' : 'Confirm Action',
      message: language === 'bn' ? 'আপনি কি এই পোস্টের স্ট্যাটাস পরিবর্তন করতে চান?' : 'Are you sure you want to change this listing status?',
      onConfirm: () => updateListingMutation.mutate({ id: listingId, status })
    })
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
                              <div key={app.id} className="bg-white dark:bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row mb-3">
                                {/* Main content - Email style */}
                                <div className="flex-1 p-5 space-y-4">
                                  {/* Header */}
                                  <div className="flex items-start justify-between border-b border-border/40 pb-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-pcp-green/10 text-pcp-green flex items-center justify-center font-bold text-lg uppercase shadow-sm">
                                        {app.applicant_name?.charAt(0) || 'U'}
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-base text-foreground leading-none">{app.applicant_name}</h4>
                                        <span className="text-xs text-muted-foreground">{app.applicant_email}</span>
                                      </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1.5">
                                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                        app.status === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                        app.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                        'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                                      }`}>
                                        {t(`rehoming.status_app.${app.status}`)}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Body */}
                                  <div className="text-sm text-foreground/80 leading-relaxed font-medium">
                                    <div className="bg-pcp-surface rounded-lg p-3 relative">
                                      <span className="text-muted-foreground font-normal block mb-2">{language === 'bn' ? 'আবেদনের বার্তা:' : 'Application Message:'}</span>
                                      
                                      <div className="whitespace-pre-wrap font-sans mt-2 text-foreground/90">
                                        {formatEmailText(app.message)}
                                      </div>
                                      
                                      {/* AI Score Badge - Absolute layout as requested */}
                                      {app.ai_score !== null && app.ai_score !== undefined && (
                                        <div className="absolute -top-3 -right-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-extrabold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1 border border-white/20">
                                          <Bot className="w-3 h-3" />
                                          AI Score: {app.ai_score}/10
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Actions Sidebar */}
                                {['pending', 'reviewed'].includes(app.status) && listing.status === 'active' && (
                                  <div className="bg-muted/30 border-t md:border-t-0 md:border-l border-border/60 p-5 flex md:flex-col justify-center gap-3 md:w-40 shrink-0">
                                    {app.status === 'pending' && (
                                      <button
                                        onClick={() => handleUpdateAppStatus(app.id, 'reviewed')}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all shadow-sm"
                                      >
                                        <Eye className="w-4 h-4" />
                                        {language === 'bn' ? 'পর্যালোচনা' : 'Mark Reviewed'}
                                      </button>
                                    )}
                                    
                                    <button
                                      onClick={() => handleUpdateAppStatus(app.id, 'approved')}
                                      className="flex-1 md:flex-none flex flex-col items-center justify-center gap-0.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-2 py-2.5 rounded-xl transition-all shadow-sm text-center"
                                    >
                                      <div className="flex items-center gap-1">
                                        <CheckCircle className="w-4 h-4" />
                                        {t('rehoming.btn_approve').split(' ')[0]}
                                      </div>
                                      <span className="text-[10px] font-normal opacity-90 leading-tight">(Transfer Ownership)</span>
                                    </button>
                                    
                                    <button
                                      onClick={() => handleUpdateAppStatus(app.id, 'rejected')}
                                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-white dark:bg-transparent border border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold px-3 py-2.5 rounded-xl transition-all"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      {t('rehoming.btn_reject')}
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
            <div className="grid grid-cols-1 gap-4">
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
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        app.status === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        app.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                      }`}>
                        {t(`rehoming.status_app.${app.status}`)}
                      </span>
                    </div>

                    <div className="bg-pcp-surface rounded-lg p-4 relative text-sm font-medium">
                      <span className="text-muted-foreground font-normal block mb-3 border-b border-border/40 pb-2">
                        {language === 'bn' ? 'আপনার মেসেজ:' : 'Your Message:'}
                      </span>
                      <div className="whitespace-pre-wrap font-sans text-foreground/90 leading-relaxed">
                        {formatEmailText(app.message)}
                      </div>
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
      {approvalModalAppId && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg p-6 space-y-5 animate-fade-in-up text-left shadow-xl">
            <h3 className="text-xl font-bold text-foreground border-b border-border/50 pb-3 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              {language === 'bn' ? 'নিরাপত্তা নিশ্চিতকরণ' : 'Safety Checklist'}
            </h3>
            
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p className="font-semibold text-foreground">
                {language === 'bn' 
                  ? 'পোষা প্রাণী হস্তান্তরের আগে অনুগ্রহ করে নিচের বিষয়গুলো ডাবল-চেক করুন:' 
                  : 'Please double-check the following before handing over your pet:'}
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>{language === 'bn' ? 'আবেদনকারীর সাথে সরাসরি কথা বলুন।' : 'Speak with the applicant directly via phone/video call.'}</li>
                <li>{language === 'bn' ? 'প্রথম সাক্ষাতের জন্য একটি নিরাপদ ও জনবহুল স্থান নির্বাচন করুন।' : 'Meet in a public, safe, and well-lit place for the first time.'}</li>
                <li>{language === 'bn' ? 'জাতীয় পরিচয়পত্র (NID) যাচাই করে নিন।' : 'Verify their national identity (NID or Passport).'}</li>
                <li>{language === 'bn' ? 'টিকার কার্ড এবং অন্যান্য মেডিকেল রেকর্ড হস্তান্তর করুন।' : 'Hand over all vaccination cards and medical records.'}</li>
              </ul>
              
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-300 rounded-xl mt-4 font-bold italic border border-rose-200 dark:border-rose-800">
                {language === 'bn' 
                  ? 'সতর্কতা: এই অনুমোদন দেওয়া হলে অন্যান্য সকল আবেদন বাতিল হয়ে যাবে এবং পোস্টটি "দত্তক দেওয়া হয়েছে" হিসেবে চিহ্নিত হবে।' 
                  : 'Warning: Approving this applicant will reject all other pending applicants and mark the post as "Adopted".'}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setApprovalModalAppId(null)}
                className="px-5 py-2.5 bg-card border border-border text-foreground hover:bg-muted font-bold rounded-xl transition-all"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmApproval}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-md transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                {language === 'bn' ? 'হ্যাঁ, অনুমোদন করুন' : 'Confirm & Approve'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Generic Confirm Modal */}
      {confirmDialog.isOpen && createPortal(
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-xs p-6 shadow-xl animate-fade-in-up text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
            <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-500 mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-extrabold text-foreground mb-2">{confirmDialog.title}</h3>
            <p className="text-sm text-muted-foreground mb-7 px-2 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                className="px-5 py-2.5 rounded-xl text-xs font-bold border border-border hover:bg-muted transition-colors flex-1"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                  setConfirmDialog({ ...confirmDialog, isOpen: false });
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors flex-1 shadow-sm"
              >
                {language === 'bn' ? 'হ্যাঁ, নিশ্চিত' : 'Yes, Confirm'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      </div>
      {isCreateModalOpen && (
        <CreateRehomingModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </>
  )
}

export default DashboardRehoming
