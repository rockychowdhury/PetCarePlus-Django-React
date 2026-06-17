import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { useLanguage } from '../hooks/useLanguage'
import { petsApi } from '../api/pets'
import { authApi } from '../api/auth'
import { guidelinesApi } from '../api/guidelines'
import { BANGLADESH_GEOGRAPHY } from '../utils/geo'
import PageLayout from '../components/layout/PageLayout'
import Spinner from '../components/ui/Spinner'
import { User, Phone, MapPin, Heart, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react'

export const Profile = () => {
  const { language, t } = useLanguage()
  const queryClient = useQueryClient()
  const { user, setUser, token } = useAuthStore()

  // Profile fields editing state
  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileLang, setProfileLang] = useState('')
  const [profileDiv, setProfileDiv] = useState('')
  const [profileDist, setProfileDist] = useState('')
  const [profileUpazila, setProfileUpazila] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState(false)

  // Add Pet Dialog State
  const [petFormOpen, setPetFormOpen] = useState(false)
  const [petName, setPetName] = useState('')
  const [petNameBn, setPetNameBn] = useState('')
  const [petAnimalTypeId, setPetAnimalTypeId] = useState('')
  const [petBreed, setPetBreed] = useState('')
  const [petAge, setPetAge] = useState('')
  const [petGender, setPetGender] = useState('male')
  const [petPhotoUrl, setPetPhotoUrl] = useState('')
  const [petError, setPetError] = useState('')
  const [petSuccess, setPetSuccess] = useState(false)

  // Sync state with user profile
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '')
      setProfilePhone(user.phone || '')
      setProfileLang(user.preferred_language || 'bn')
      setProfileDiv(user.division || '')
      setProfileDist(user.district || '')
      setProfileUpazila(user.upazila || '')
    }
  }, [user])

  // Query animal types
  const { data: animalTypes } = useQuery({
    queryKey: ['animalTypesProfile'],
    queryFn: guidelinesApi.getAnimalTypes,
  })
  // Enforce companion-only: filter to get only category='companion' animals!
  const companionAnimals = animalTypes?.filter((animal) => animal.category === 'companion') || []

  // Query companion pets list
  const { data: pets, isLoading: isLoadingPets } = useQuery({
    queryKey: ['profilePets'],
    queryFn: () => petsApi.getPets(),
    enabled: !!token && user?.role === 'pet_owner',
  })

  // Mutation to update user profile
  const updateProfileMutation = useMutation({
    mutationFn: (data) => authApi.updateMe(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 5000)
    },
    onError: (err) => {
      setProfileError(err.response?.data?.detail || t('common.error'))
    },
  })

  // Mutation to add pet
  const addPetMutation = useMutation({
    mutationFn: (data) => petsApi.addPet(data),
    onSuccess: () => {
      setPetSuccess(true)
      setPetName('')
      setPetNameBn('')
      setPetAnimalTypeId('')
      setPetBreed('')
      setPetAge('')
      setPetGender('male')
      setPetPhotoUrl('')
      queryClient.invalidateQueries(['profilePets'])
      setTimeout(() => {
        setPetSuccess(false)
        setPetFormOpen(false)
      }, 2000)
    },
    onError: (err) => {
      setPetError(err.response?.data?.detail || err.response?.data?.message || t('common.error'))
    },
  })

  // Mutation to delete/soft-delete pet
  const deletePetMutation = useMutation({
    mutationFn: (id) => petsApi.deletePet(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['profilePets'])
    },
    onError: (err) => {
      alert(err.response?.data?.detail || t('common.error'))
    },
  })

  const handleProfileSave = (e) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess(false)

    updateProfileMutation.mutate({
      name: profileName,
      phone: profilePhone,
      preferred_language: profileLang,
      division: profileDiv,
      district: profileDist,
      upazila: profileUpazila,
    })
  }

  const handleAddPetSubmit = (e) => {
    e.preventDefault()
    setPetError('')
    setPetSuccess(false)

    if (!petName || !petAnimalTypeId || !petAge) return

    addPetMutation.mutate({
      name: petName,
      name_bn: petNameBn || petName,
      animal_type: petAnimalTypeId,
      breed: petBreed,
      age: parseInt(petAge) || 0,
      gender: petGender,
      photo_url: petPhotoUrl || null,
    })
  }

  const handleDeletePet = (petId) => {
    if (window.confirm(language === 'bn' ? 'আপনি কি এই পোষা প্রাণীর প্রোফাইল মুছে ফেলতে চান?' : 'Are you sure you want to remove this pet profile?')) {
      deletePetMutation.mutate(petId)
    }
  }

  const activeDistricts = BANGLADESH_GEOGRAPHY.districts[profileDiv] || []

  return (
    <PageLayout>
      <div className="bg-pcp-surface/20 py-8 min-h-screen border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
          
          {/* Header Title */}
          <div className="text-center sm:text-left space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              {t('profile.title')}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              আপনার ব্যক্তিগত বিবরণী, ভাষা এবং অবস্থানের তথ্য পরিচালনা করুন।
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Panel: Profile settings form */}
            <div className="lg:col-span-5 bg-card border border-border/80 p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-foreground border-b border-border/60 pb-2 text-left">
                👤 {t('profile.title')}
              </h3>

              <form onSubmit={handleProfileSave} className="space-y-4 text-left">
                {/* Full name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">{t('auth.name')}</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                  />
                </div>

                {/* Mobile number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">{t('auth.phone')}</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                  />
                </div>

                {/* Preferred language */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">{t('profile.preferred_language')}</label>
                  <select
                    value={profileLang}
                    onChange={(e) => setProfileLang(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                  >
                    <option value="bn">{t('common.bangla')}</option>
                    <option value="en">{t('common.english')}</option>
                  </select>
                </div>

                {/* Division selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">{t('hero.select_division')}</label>
                  <select
                    value={profileDiv}
                    onChange={(e) => {
                      setProfileDiv(e.target.value)
                      setProfileDist('')
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                  >
                    <option value="">-- {t('hero.select_division')} --</option>
                    {BANGLADESH_GEOGRAPHY.divisions.map((div) => (
                      <option key={div.id} value={div.id}>
                        {language === 'bn' ? div.name_bn : div.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">{t('hero.select_district')}</label>
                  <select
                    value={profileDist}
                    onChange={(e) => setProfileDist(e.target.value)}
                    disabled={!profileDiv}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold disabled:opacity-50"
                  >
                    <option value="">-- {t('hero.select_district')} --</option>
                    {activeDistricts.map((dist) => (
                      <option key={dist.id} value={dist.id}>
                        {language === 'bn' ? dist.name_bn : dist.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upazila select */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">{t('hero.select_upazila')}</label>
                  <input
                    type="text"
                    value={profileUpazila}
                    onChange={(e) => setProfileUpazila(e.target.value)}
                    disabled={!profileDist}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold disabled:opacity-50"
                  />
                </div>

                {/* Success Banner */}
                {profileSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex gap-1.5 items-center dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>প্রোফাইল সফলভাবে আপডেট করা হয়েছে!</span>
                  </div>
                )}

                {/* Error Banner */}
                {profileError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex gap-1.5 items-center dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending || !!profileSuccess}
                  className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all shadow-sm active:scale-[0.98] disabled:opacity-55"
                >
                  {updateProfileMutation.isPending && <Spinner size="sm" />}
                  <span>{t('profile.btn_save')}</span>
                </button>
              </form>
            </div>

            {/* Right Panel: Pets Management (Available only to pet owners) */}
            {user?.role === 'pet_owner' && (
              <div className="lg:col-span-7 bg-card border border-border/80 p-5 rounded-2xl shadow-sm text-left space-y-4">
                <div className="flex justify-between items-center border-b border-border/60 pb-2">
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    🐈 {t('profile.pets_title')}
                  </h3>
                  
                  <button
                    onClick={() => setPetFormOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg text-xs font-semibold transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('profile.btn_add_pet')}</span>
                  </button>
                </div>

                {isLoadingPets ? (
                  <Spinner className="py-8" />
                ) : !pets || pets.length === 0 ? (
                  <div className="text-center py-12 px-4 bg-pcp-surface/20 border border-dashed border-border rounded-xl">
                    <Heart className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
                    <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                      {t('profile.no_pets')}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pets.map((pet) => {
                      const petName = language === 'bn' ? (pet.name_bn || pet.name) : pet.name
                      return (
                        <div
                          key={pet.id}
                          className="p-3 border border-border/80 bg-pcp-surface/20 rounded-xl flex items-center justify-between gap-4 group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                              {pet.photo_url ? (
                                <img
                                  src={pet.photo_url}
                                  alt={pet.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                                  <Heart className="w-6 h-6 stroke-1" />
                                </div>
                              )}
                            </div>
                            <div className="text-left space-y-0.5">
                              <h4 className="font-bold text-xs sm:text-sm text-foreground truncate max-w-[120px]">
                                {petName}
                              </h4>
                              <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                                {pet.breed || (language === 'bn' ? 'মিশ্র জাত' : 'Mixed')}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeletePet(pet.id)}
                            className="p-2 text-muted-foreground hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                            title={t('common.delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Add Companion Pet Form Overlay Modal */}
          {petFormOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 animate-fade-in-up text-left">
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  {t('profile.btn_add_pet')}
                </h3>

                <form onSubmit={handleAddPetSubmit} className="space-y-4">
                  {/* Select Companion Animal Type */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">
                      {t('profile.pet_type')} (Companion Only)
                    </label>
                    <select
                      value={petAnimalTypeId}
                      onChange={(e) => setPetAnimalTypeId(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                    >
                      <option value="">-- {t('profile.pet_type')} --</option>
                      {companionAnimals.map((animal) => (
                        <option key={animal.id} value={animal.id}>
                          {language === 'bn' ? animal.name_bn : animal.name_en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pet Name (English) */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">
                      {t('profile.pet_name')} (English)
                    </label>
                    <input
                      type="text"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      required
                      placeholder="e.g. Casper"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>

                  {/* Pet Name (Bangla) */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">
                      {t('profile.pet_name')} (বাংলায় - ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      value={petNameBn}
                      onChange={(e) => setPetNameBn(e.target.value)}
                      placeholder="যেমন: ক্যাসপার"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>

                  {/* Breed */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">
                      {t('profile.pet_breed')}
                    </label>
                    <input
                      type="text"
                      value={petBreed}
                      onChange={(e) => setPetBreed(e.target.value)}
                      placeholder="e.g. Persian"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>

                  {/* Age & Gender */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">
                        {t('profile.pet_age')}
                      </label>
                      <input
                        type="number"
                        value={petAge}
                        onChange={(e) => setPetAge(e.target.value)}
                        required
                        min="0"
                        placeholder="e.g. 2"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">
                        লিঙ্গ/জেন্ডার
                      </label>
                      <select
                        value={petGender}
                        onChange={(e) => setPetGender(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                      >
                        <option value="male">{language === 'bn' ? 'পুরুষ' : 'Male'}</option>
                        <option value="female">{language === 'bn' ? 'স্ত্রী' : 'Female'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Photo URL */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">
                      {t('profile.pet_photo')} (URL)
                    </label>
                    <input
                      type="text"
                      value={petPhotoUrl}
                      onChange={(e) => setPetPhotoUrl(e.target.value)}
                      placeholder="e.g. https://images.unsplash.com/..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>

                  {/* Success banner */}
                  {petSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex gap-1.5 items-center dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
                      <CheckCircle className="w-4 h-4" />
                      <span>পোষা প্রাণী সফলভাবে যুক্ত করা হয়েছে!</span>
                    </div>
                  )}

                  {/* Error banner */}
                  {petError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex gap-1.5 items-center dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50">
                      <AlertCircle className="w-4 h-4" />
                      <span>{petError}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPetFormOpen(false)}
                      className="px-4 py-2 border border-border bg-card text-foreground text-xs font-semibold rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={addPetMutation.isPending || !!petSuccess}
                      className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-55"
                    >
                      {addPetMutation.isPending && <Spinner size="sm" />}
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

export default Profile
