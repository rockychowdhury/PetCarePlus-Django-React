import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rehomingApi } from '../api/rehoming'
import { useAuthStore } from '../store/authStore'
import { useLanguage } from '../hooks/useLanguage'
import PageLayout from '../components/layout/PageLayout'
import ApplicationForm from '../components/rehoming/ApplicationForm'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'
import {
  Heart,
  MapPin,
  Calendar,
  BadgeCheck,
  AlertCircle,
  ArrowLeft,
  Share2,
  Phone,
  Mail,
} from 'lucide-react'

export const RehomingDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const queryClient = useQueryClient()
  const { user, token } = useAuthStore()

  // Fetch listing detail
  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['rehomingListing', id],
    queryFn: () => rehomingApi.getListingDetail(id),
    enabled: !!id,
  })

  // Fetch applications if owner
  const isOwner = token && user?.id === listing?.owner
  const { data: applicationsResponse } = useQuery({
    queryKey: ['rehomingApplications'],
    queryFn: () => rehomingApi.getApplications(),
    enabled: !!token,
  })
  const applications = Array.isArray(applicationsResponse) 
    ? applicationsResponse 
    : (applicationsResponse?.results || [])
  const listingApplications = applications.filter((app) => app.listing === parseInt(id))

  // Mutation to update application status (Approve/Reject)
  const updateAppStatusMutation = useMutation({
    mutationFn: ({ appId, status }) => rehomingApi.updateApplicationStatus(appId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['rehomingApplications'])
      queryClient.invalidateQueries(['rehomingListing', id])
      toast.success(language === 'bn' ? 'আবেদন আপডেট করা হয়েছে' : 'Application updated')
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || t('common.error'))
    },
  })

  const handleApprove = (appId) => {
    if (window.confirm(language === 'bn' ? 'আপনি কি দত্তক অনুমোদন করতে চান? এটি পোষা প্রাণীটির মালিকানা হস্তান্তর করবে।' : 'Are you sure you want to approve this adoption? It will transfer pet ownership.')) {
      updateAppStatusMutation.mutate({ appId, status: 'approved' })
    }
  }

  const handleReject = (appId) => {
    if (window.confirm(language === 'bn' ? 'আবেদনটি প্রত্যাখ্যান করতে চান?' : 'Are you sure you want to reject this application?')) {
      updateAppStatusMutation.mutate({ appId, status: 'rejected' })
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: listing?.pet_name,
      text: language === 'bn'
        ? `${listing?.pet_name} — PetCarePlus-এ দত্তক নেওয়ার জন্য উপলব্ধ`
        : `Adopt ${listing?.pet_name} on PetCarePlus`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success(language === 'bn' ? 'লিঙ্ক কপি হয়েছে!' : 'Link copied!', { icon: '🔗' })
      }
    } catch (err) {}
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </PageLayout>
    )
  }

  if (error || !listing) {
    return (
      <PageLayout>
        <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
          <h2 className="text-xl font-bold text-rose-600">{t('common.error')}</h2>
          <button
            onClick={() => navigate('/rehoming')}
            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg text-xs"
          >
            {t('common.back')}
          </button>
        </div>
      </PageLayout>
    )
  }

  const getStatusBadge = () => {
    if (listing.status === 'adopted') {
      return (
        <span className="px-3 py-1 bg-pcp-green text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider">
          {language === 'bn' ? 'দত্তক নেওয়া হয়েছে' : 'ADOPTED'}
        </span>
      )
    }
    return (
      <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider">
        {language === 'bn' ? 'সক্রিয়' : 'ACTIVE'}
      </span>
    )
  }

  return (
    <PageLayout>
      <div className="bg-pcp-surface/20 py-8 min-h-screen border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
          
          {/* Back Button & Share */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/rehoming')}
              className="inline-flex items-center gap-2 text-xs font-bold text-pcp-text-secondary dark:text-muted-foreground hover:text-pcp-green transition-colors px-3 py-1.5 bg-card border border-border/80 dark:border-white/5 rounded-xl shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সব তালিকা' : 'All Listings'}</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-xs font-bold text-pcp-text-secondary dark:text-muted-foreground hover:text-pcp-green transition-colors px-3 py-1.5 bg-card border border-border/80 dark:border-white/5 rounded-xl shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'শেয়ার' : 'Share'}</span>
            </button>
          </div>

          {/* ============ HERO BANNER ============ */}
          <div className="bg-card dark:bg-card border border-pcp-border/60 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-stretch gap-6 md:gap-8 overflow-hidden relative group">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pcp-green-muted/20 to-transparent rounded-full filter blur-2xl -z-0 pointer-events-none" />

            {/* Pet Photo */}
            <div className="w-36 h-36 md:w-48 md:h-48 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-pcp-green-muted/30 to-pcp-green-muted dark:from-muted/40 dark:to-muted/20 border border-pcp-border/40 relative z-10 shadow-sm">
              {listing.photo_url ? (
                <img
                  src={listing.photo_url}
                  alt={listing.pet_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-pcp-text-primary/20 dark:text-white/20">
                  <Heart className="w-12 h-12 stroke-1" />
                </div>
              )}
            </div>

            {/* Header Details */}
            <div className="flex-grow flex flex-col justify-between text-center md:text-left py-2 relative z-10 space-y-4 md:space-y-0">
              <div className="space-y-3">
                {/* Badges */}
                <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                  {getStatusBadge()}
                  {listing.vaccinated && (
                    <span className="inline-flex items-center justify-center px-3 py-1 bg-pcp-green-bg dark:bg-pcp-green/10 text-pcp-text-secondary dark:text-pcp-green-light border border-pcp-border dark:border-pcp-green/20 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                      {language === 'bn' ? 'ভ্যাকসিনেটেড' : 'Vaccinated'}
                    </span>
                  )}
                  {listing.spayed_neutered && (
                    <span className="inline-flex items-center justify-center px-3 py-1 bg-pcp-green-bg dark:bg-pcp-green/10 text-pcp-text-secondary dark:text-pcp-green-light border border-pcp-border dark:border-pcp-green/20 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                      {language === 'bn' ? 'বন্ধ্যাকরণ' : 'Spayed/Neutered'}
                    </span>
                  )}
                </div>

                {/* Pet Name */}
                <h1 className="text-2xl md:text-4xl font-extrabold text-pcp-text-primary dark:text-foreground leading-tight tracking-tight">
                  {listing.pet_name}
                </h1>

                <p className="text-sm text-pcp-text-secondary dark:text-muted-foreground font-semibold">
                  {listing.breed || (language === 'bn' ? 'মিশ্র জাত' : 'Mixed Breed')}
                </p>

                {/* Info Row */}
                <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-pcp-green dark:text-pcp-green-light shrink-0" />
                    <span className="text-xs font-semibold text-pcp-text-secondary dark:text-muted-foreground/80">
                      {listing.age ? `${listing.age} ${language === 'bn' ? 'বছর' : (listing.age > 1 ? 'years' : 'year')}` : (language === 'bn' ? 'অজানা' : 'Unknown')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4 text-pcp-green dark:text-pcp-green-light shrink-0" />
                    <span className="text-xs font-semibold text-pcp-text-secondary dark:text-muted-foreground/80 capitalize">
                      {language === 'bn' ? (listing.gender === 'male' ? 'পুরুষ' : 'স্ত্রী') : listing.gender}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap text-xs font-semibold text-pcp-text-secondary dark:text-muted-foreground">
                <MapPin className="w-4 h-4 text-pcp-green dark:text-pcp-green-light shrink-0" />
                <span>
                  {listing.district || listing.owner_details?.district || 'Bangladesh'}
                </span>
              </div>
            </div>
          </div>

          {/* ============ MAIN GRID ============ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ===== LEFT COLUMN: Details ===== */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Reason */}
              <div className="bg-card dark:bg-card border border-pcp-border/60 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm text-left space-y-4">
                <h3 className="text-lg font-bold text-pcp-text-primary dark:text-foreground border-b border-pcp-border/30 dark:border-border/30 pb-2">
                  {t('rehoming.reason')}
                </h3>
                <p className="text-sm text-pcp-text-secondary dark:text-muted-foreground/90 leading-relaxed italic">
                  "{listing.reason}"
                </p>
              </div>

              {/* Description */}
              {listing.description && (
                <div className="bg-card dark:bg-card border border-pcp-border/60 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm text-left space-y-4">
                  <h3 className="text-lg font-bold text-pcp-text-primary dark:text-foreground border-b border-pcp-border/30 dark:border-border/30 pb-2">
                    {language === 'bn' ? 'বিবরণ' : 'Description'}
                  </h3>
                  <p className="text-sm text-pcp-text-secondary dark:text-muted-foreground/90 leading-relaxed">
                    {listing.description}
                  </p>
                </div>
              )}

              {/* Adopter Requirements */}
              {listing.adopter_requirements && (
                <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-3xl p-6 md:p-8 shadow-sm text-left space-y-4">
                  <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 border-b border-rose-200 dark:border-rose-900/40 pb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {language === 'bn' ? 'দত্তক নেওয়ার শর্তসমূহ' : 'Adopter Requirements'}
                  </h3>
                  <p className="text-sm text-rose-800 dark:text-rose-300 font-medium leading-relaxed">
                    {listing.adopter_requirements}
                  </p>
                </div>
              )}
            </div>

            {/* ===== RIGHT COLUMN: Contact & Actions ===== */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Action Area (Apply / Review Apps) */}
              <div className="bg-card dark:bg-card border border-pcp-border/60 dark:border-white/5 rounded-3xl p-6 shadow-sm text-left">
                {isOwner ? (
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm uppercase text-pcp-green tracking-wider border-b border-border/40 pb-2">
                      {t('rehoming.applications_received')} ({listingApplications.length})
                    </h4>
                    
                    {listingApplications.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2 text-center bg-muted/40 rounded-xl p-4 border border-dashed">
                        {language === 'bn' ? 'এই তালিকায় এখনো কোনো আবেদনপত্র জমা পড়েনি।' : 'No applications received yet.'}
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {listingApplications.map((app) => (
                          <div
                            key={app.id}
                            className="p-3 border border-border/80 rounded-xl space-y-2 bg-pcp-surface/40 text-xs"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-foreground">
                                {app.applicant_details?.name || app.applicant_details?.email}
                              </span>
                              <div className="flex items-center gap-2">
                                {app.ai_score !== null && app.ai_score !== undefined && (
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${app.ai_score >= 8 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : app.ai_score >= 5 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                    AI Score: {app.ai_score}/10
                                  </span>
                                )}
                                <span className="text-[10px] text-muted-foreground">{app.applicant_details?.phone || ''}</span>
                              </div>
                            </div>
                            <p className="text-muted-foreground italic leading-relaxed bg-background/50 p-2 rounded-lg border border-border/40">
                              "{app.message}"
                            </p>
                            
                            {app.status === 'pending' && (
                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  onClick={() => handleReject(app.id)}
                                  className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-md text-[10px] font-bold hover:bg-rose-100 transition-colors"
                                >
                                  {t('rehoming.btn_reject')}
                                </button>
                                <button
                                  onClick={() => handleApprove(app.id)}
                                  className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-md text-[10px] font-bold hover:bg-emerald-100 transition-colors"
                                >
                                  {t('rehoming.btn_approve')}
                                </button>
                              </div>
                            )}
                            {app.status !== 'pending' && (
                              <div className="text-right pt-1">
                                <span className={`text-[10px] font-bold uppercase ${app.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {t(`rehoming.status_app.${app.status}`)}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : token ? (
                  <div>
                    <ApplicationForm
                      listingId={listing.id}
                      ownerName={listing.owner_details?.name || listing.owner_details?.email || (language === 'bn' ? 'মালিক' : 'Owner')}
                      adopterName={user?.name || user?.email || ''}
                      adopterContact={[user?.phone, user?.email].filter(Boolean).join(', ')}
                      onCancel={() => {}}
                      onSuccess={() => {}}
                    />
                  </div>
                ) : (
                  <div className="text-center py-6 bg-muted/40 border border-dashed border-border rounded-xl space-y-3">
                    <p className="text-sm font-semibold text-muted-foreground px-4">
                      {language === 'bn' ? 'দত্তক নেওয়ার আবেদন করতে আপনাকে লগইন করতে হবে।' : 'You must be logged in to apply.'}
                    </p>
                    <Link
                      to="/login"
                      className="inline-block px-5 py-2 bg-pcp-green text-white text-xs font-bold rounded-xl shadow-sm hover:bg-pcp-green-hover transition-all"
                    >
                      {t('nav.login')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export default RehomingDetail
