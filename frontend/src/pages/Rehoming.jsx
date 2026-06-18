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
  const { user, token } = useAuthStore()

  // Modal / Form States
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
    adopter_requirements: '',
  })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)

  const [selectedAnimalId, setSelectedAnimalId] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Query active listings (scoped cascade local network)
  const { data: listingsResponse, isLoading: isLoadingListings } = useQuery({
    queryKey: ['rehomingListings'],
    queryFn: () => rehomingApi.getListings(),
  })
  let listings = listingsResponse?.results || []

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
        adopter_requirements: '',
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
                <button
                  onClick={() => setCreateFormOpen(true)}
                  className="flex-shrink-0 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white text-sm font-bold rounded-2xl shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4.5 h-4.5" />
                  <span>{t('rehoming.btn_post')}</span>
                </button>
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
              {token && (
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
                <Spinner className="py-24" />
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
                      rows={2}
                      placeholder={language === 'bn' ? 'পুনর্বাসনের কারণ উল্লেখ করুন...' : 'Specify rehoming reason...'}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>

                  {/* Adopter Requirements */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground">
                      {language === 'bn' ? 'দত্তক নেওয়ার শর্তসমূহ' : 'Adopter Requirements'}
                    </label>
                    <textarea
                      value={formData.adopter_requirements}
                      onChange={(e) => setFormData({ ...formData, adopter_requirements: e.target.value })}
                      rows={2}
                      placeholder={language === 'bn' ? 'যেমন: পূর্বে পোষা প্রাণী পালনের অভিজ্ঞতা থাকতে হবে' : 'e.g. Must have prior pet experience'}
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

        </div>
      </div>
    </PageLayout>
  )
}

export default Rehoming
