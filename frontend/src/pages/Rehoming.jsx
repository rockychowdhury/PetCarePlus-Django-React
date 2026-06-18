import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rehomingApi } from '../api/rehoming'
import { animalsApi } from '../api/animals'
import { guidelinesApi } from '../api/guidelines'
import { useAuthStore } from '../store/authStore'
import { useLanguage } from '../hooks/useLanguage'
import PageLayout from '../components/layout/PageLayout'
import ListingCard from '../components/rehoming/ListingCard'
import ApplicationForm from '../components/rehoming/ApplicationForm'
import Spinner from '../components/ui/Spinner'
import { Heart, Plus, Mail, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react'

export const Rehoming = () => {
  const { language, t } = useLanguage()
  const queryClient = useQueryClient()
  const { user, token } = useAuthStore()

  // Modal / Form States
  const [selectedListing, setSelectedListing] = useState(null)
  const [createFormOpen, setCreateFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    pet_name: '',
    animal_type: '',
    breed: '',
    gender: 'Unknown',
    age: '',
    weight_kg: '',
    vaccinated: false,
    spayed_neutered: false,
    description: '',
    reason: '',
  })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)

  // Query active listings (scoped cascade local network)
  const { data: listingsResponse, isLoading: isLoadingListings } = useQuery({
    queryKey: ['rehomingListings'],
    queryFn: () => rehomingApi.getListings(),
  })
  const listings = listingsResponse?.results || []

  // Fetch animal types for the form
  const { data: animalTypesData } = useQuery({
    queryKey: ['animalTypes'],
    queryFn: () => animalsApi.getAnimalTypes(),
  })
  const animalTypes = Array.isArray(animalTypesData) ? animalTypesData : (animalTypesData?.results || [])

  // Query rehoming applications (sent or received)
  const { data: applicationsResponse, isLoading: isLoadingApps } = useQuery({
    queryKey: ['rehomingApplications'],
    queryFn: () => rehomingApi.getApplications(),
    enabled: !!token,
  })
  const applications = applicationsResponse || []

  // Mutation to create a rehoming listing
  const createListingMutation = useMutation({
    mutationFn: (data) => rehomingApi.createListing(data),
    onSuccess: () => {
      setFormSuccess(true)
      setFormData({
        pet_name: '',
        animal_type: '',
        breed: '',
        gender: 'Unknown',
        age: '',
        weight_kg: '',
        vaccinated: false,
        spayed_neutered: false,
        description: '',
        reason: '',
      })
      queryClient.invalidateQueries(['rehomingListings'])
      setTimeout(() => {
        setFormSuccess(false)
        setCreateFormOpen(false)
      }, 2000)
    },
    onError: (err) => {
      setFormError(err.response?.data?.detail || err.response?.data?.message || t('common.error'))
    },
  })

  // Mutation to update application status (Approve/Reject)
  const updateAppStatusMutation = useMutation({
    mutationFn: ({ id, status }) => rehomingApi.updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['rehomingApplications'])
      queryClient.invalidateQueries(['rehomingListings'])
      // Refresh detail modal if open
      if (selectedListing) {
        setSelectedListing(null)
      }
    },
    onError: (err) => {
      alert(err.response?.data?.detail || t('common.error'))
    },
  })

  const handleCreateSubmit = (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess(false)
    if (!formData.pet_name || !formData.animal_type || !formData.reason.trim()) return

    createListingMutation.mutate(formData)
  }

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

  const canPostListing = token && user?.role === 'pet_owner'

  // Filter applications received for a specific listing
  const getApplicationsForListing = (listingId) => {
    return applications.filter((app) => app.listing === listingId)
  }

  return (
    <PageLayout>
      <div className="bg-pcp-surface/20 py-8 min-h-screen border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="text-left space-y-1.5 max-w-xl">
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                {t('rehoming.title')}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                {t('rehoming.subtitle')}
              </p>
            </div>
            
            {canPostListing && (
              <button
                onClick={() => setCreateFormOpen(true)}
                className="flex-shrink-0 px-4 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{t('rehoming.btn_post')}</span>
              </button>
            )}
          </div>

          {/* Warning disclaimer */}
          <div className="p-4 bg-accent/5 border border-accent/20 rounded-2xl flex gap-3 text-left">
            <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('rehoming.notice')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left/Main Column: Listings Grid */}
            <div className="lg:col-span-8">
              {isLoadingListings ? (
                <Spinner className="py-24" />
              ) : listings.length === 0 ? (
                <div className="text-center py-20 px-4 bg-card rounded-2xl border border-dashed border-border/80">
                  <Heart className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
                  <p className="text-sm font-bold text-muted-foreground">
                    {t('rehoming.no_listings')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <div
                      key={listing.id}
                      onClick={() => setSelectedListing(listing)}
                      className="cursor-pointer animate-fade-in-up"
                    >
                      <ListingCard listing={listing} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: User's Adoption Applications Panel */}
            {token && (
              <div className="lg:col-span-4 bg-card border border-border/80 p-5 rounded-2xl shadow-sm text-left space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-foreground border-b border-border/60 pb-2">
                  📬 {language === 'bn' ? 'আমার দত্তক আবেদন সমূহ' : 'My Adoption Applications'}
                </h3>
                
                {isLoadingApps ? (
                  <Spinner className="py-4" />
                ) : !applications || applications.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">
                    আপনার কোনো দত্তক আবেদন বা প্রাপ্ত তালিকা এখনো নেই।
                  </p>
                ) : (
                  <div className="space-y-3">
                    {applications.map((app) => {
                      const isReceived = app.listing_details?.owner === user.id
                      const petName = app.listing_details?.pet_name

                      return (
                        <div
                          key={app.id}
                          className="p-3 bg-pcp-surface/20 border border-border/80 rounded-xl space-y-2 text-xs"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-foreground">
                              {petName}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                app.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : app.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {t(`rehoming.status_app.${app.status}`)}
                            </span>
                          </div>
                          
                          <p className="text-muted-foreground leading-relaxed italic line-clamp-2">
                            "{app.message}"
                          </p>

                          <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t border-border/40 pt-1.5">
                            <span>
                              {isReceived
                                ? `${language === 'bn' ? 'প্রেরক:' : 'From:'} ${app.applicant_details?.name || app.applicant_details?.email}`
                                : `${language === 'bn' ? 'মালিক:' : 'Owner:'} ${app.listing_details?.owner_name}`}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Create Post Dialog Overlay */}
          {createFormOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 animate-fade-in-up text-left">
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  {t('rehoming.btn_post')}
                </h3>

                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  {/* Pet Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">
                      {language === 'bn' ? 'পোষা প্রাণীর নাম' : 'Pet Name'}
                    </label>
                    <input
                      type="text"
                      value={formData.pet_name}
                      onChange={(e) => setFormData({ ...formData, pet_name: e.target.value })}
                      required
                      placeholder={language === 'bn' ? 'যেমন: টমি' : 'e.g. Tommy'}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Select Animal Type */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">
                        {language === 'bn' ? 'প্রাণীর ধরন' : 'Animal Type'}
                      </label>
                      <select
                        value={formData.animal_type}
                        onChange={(e) => setFormData({ ...formData, animal_type: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                      >
                        <option value="">-- {language === 'bn' ? 'নির্বাচন করুন' : 'Select'} --</option>
                        {animalTypes.map((at) => (
                          <option key={at.id} value={at.id}>
                            {language === 'bn' ? at.name_bn || at.name_en : at.name_en}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Breed */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">
                        {language === 'bn' ? 'জাত (যদি থাকে)' : 'Breed (Optional)'}
                      </label>
                      <input
                        type="text"
                        value={formData.breed}
                        onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Gender */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">
                        {language === 'bn' ? 'লিঙ্গ' : 'Gender'}
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                      >
                        <option value="Male">{language === 'bn' ? 'পুরুষ' : 'Male'}</option>
                        <option value="Female">{language === 'bn' ? 'মহিলা' : 'Female'}</option>
                        <option value="Unknown">{language === 'bn' ? 'অজানা' : 'Unknown'}</option>
                      </select>
                    </div>

                    {/* Weight */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">
                        {language === 'bn' ? 'ওজন (কেজি)' : 'Weight (kg)'}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.weight_kg}
                        onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex gap-6 pt-2 pb-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                      <input
                        type="checkbox"
                        checked={formData.vaccinated}
                        onChange={(e) => setFormData({ ...formData, vaccinated: e.target.checked })}
                        className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                      />
                      {language === 'bn' ? 'ভ্যাকসিন দেওয়া হয়েছে' : 'Vaccinated'}
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                      <input
                        type="checkbox"
                        checked={formData.spayed_neutered}
                        onChange={(e) => setFormData({ ...formData, spayed_neutered: e.target.checked })}
                        className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                      />
                      {language === 'bn' ? 'বন্ধ্যাকরণ করা হয়েছে' : 'Spayed/Neutered'}
                    </label>
                  </div>

                  {/* Reason */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">
                      {t('rehoming.reason')}
                    </label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      required
                      rows={3}
                      placeholder={language === 'bn' ? 'পুনর্বাসনের কারণ উল্লেখ করুন...' : 'Specify rehoming reason...'}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">
                      {language === 'bn' ? 'অন্যান্য বিবরণ' : 'Description'}
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>

                  {/* Success banner */}
                  {formSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex gap-1.5 items-center dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
                      <CheckCircle className="w-4 h-4" />
                      <span>তালিকাটি সফলভাবে তৈরি করা হয়েছে!</span>
                    </div>
                  )}

                  {/* Error banner */}
                  {formError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex gap-1.5 items-center dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50">
                      <AlertCircle className="w-4 h-4" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCreateFormOpen(false)}
                      className="px-4 py-2 border border-border bg-card text-foreground text-xs font-semibold rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={createListingMutation.isPending || !formData.pet_name || !formData.animal_type || !!formSuccess}
                      className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-55"
                    >
                      {createListingMutation.isPending && <Spinner size="sm" />}
                      <span>{t('common.submit')}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Listing Details Detail View Overlay Modal */}
          {selectedListing && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-5 animate-fade-in-up text-left relative max-h-[90vh] overflow-y-auto">
                
                <div className="flex gap-4 items-start border-b border-border/60 pb-3">
                  <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                    {selectedListing.photo_url ? (
                      <img
                        src={selectedListing.photo_url}
                        alt={selectedListing.pet_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/60">
                        <Heart className="w-8 h-8 stroke-1" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {selectedListing.pet_name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                      {selectedListing.breed} • {selectedListing.age ? `${selectedListing.age} ${language === 'bn' ? 'বছর' : 'years'}` : ''}
                    </p>
                  </div>
                </div>

                {/* Reason description */}
                <div className="space-y-1.5 text-xs sm:text-sm text-foreground/80 bg-pcp-surface/40 p-4 rounded-xl border border-border/80">
                  <span className="font-bold text-foreground text-[10px] uppercase tracking-wider block">
                    {t('rehoming.reason')}:
                  </span>
                  <p className="leading-relaxed italic">"{selectedListing.reason}"</p>
                </div>

                {/* Owner info details */}
                <div className="space-y-1.5 text-xs text-muted-foreground bg-pcp-surface/20 p-4 rounded-xl border border-border/80">
                  <span className="font-bold text-foreground text-[10px] uppercase tracking-wider block">
                    {t('rehoming.listing_owner')}:
                  </span>
                  <p className="font-semibold text-foreground/90">{selectedListing.owner_details?.name || selectedListing.owner_details?.email}</p>
                  <p>{selectedListing.owner_details?.phone || ''}</p>
                  <p>{selectedListing.owner_details?.upazila ? `${selectedListing.owner_details.upazila}, ` : ''}{selectedListing.owner_details?.district}</p>
                </div>

                {/* Decision Making Flow */}
                {token && selectedListing.owner === user.id ? (
                  // Applications Received for owner's listing
                  <div className="space-y-3 pt-2">
                    <h4 className="font-bold text-xs uppercase text-primary tracking-wider border-b border-border/40 pb-1">
                      {t('rehoming.applications_received')} ({getApplicationsForListing(selectedListing.id).length})
                    </h4>
                    
                    {getApplicationsForListing(selectedListing.id).length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">
                        এই তালিকায় এখনো কোনো আবেদনপত্র জমা পড়েনি।
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                        {getApplicationsForListing(selectedListing.id).map((app) => (
                          <div
                            key={app.id}
                            className="p-3 border border-border/80 rounded-xl space-y-2 bg-pcp-surface/40 text-xs"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-foreground">
                                {app.applicant_details?.name || app.applicant_details?.email}
                              </span>
                              <span className="text-[10px] text-muted-foreground">{app.applicant_details?.phone || ''}</span>
                            </div>
                            <p className="text-muted-foreground italic leading-relaxed">
                              "{app.message}"
                            </p>
                            
                            {app.status === 'pending' && (
                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  onClick={() => handleReject(app.id)}
                                  className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded text-[10px] font-bold hover:bg-rose-100 transition-colors"
                                >
                                  {t('rehoming.btn_reject')}
                                </button>
                                <button
                                  onClick={() => handleApprove(app.id)}
                                  className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded text-[10px] font-bold hover:bg-emerald-100 transition-colors"
                                >
                                  {t('rehoming.btn_approve')}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : token ? (
                  // Adoption application form for visitors
                  <div className="pt-2">
                    <ApplicationForm
                      listingId={selectedListing.id}
                      onCancel={() => setSelectedListing(null)}
                      onSuccess={() => setSelectedListing(null)}
                    />
                  </div>
                ) : (
                  // Prompt to login
                  <div className="text-center py-4 bg-muted/40 border border-dashed border-border rounded-xl space-y-2">
                    <p className="text-xs text-muted-foreground">
                      দত্তক নেওয়ার আবেদন করতে আপনাকে লগইন করতে হবে।
                    </p>
                    <Link
                      to="/login"
                      onClick={() => setSelectedListing(null)}
                      className="inline-block px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/95 transition-all"
                    >
                      {t('nav.login')}
                    </Link>
                  </div>
                )}

                {/* Close Button if visitor */}
                {(!token || selectedListing.owner === user?.id) && (
                  <div className="flex justify-end pt-3">
                    <button
                      onClick={() => setSelectedListing(null)}
                      className="px-4 py-2 border border-border bg-card text-foreground text-xs font-semibold rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </PageLayout>
  )
}

export default Rehoming
