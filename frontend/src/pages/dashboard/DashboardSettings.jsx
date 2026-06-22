import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { useLanguage } from '../../hooks/useLanguage'
import { authApi } from '../../api/auth'
import { locationsApi } from '../../api/locations'
import { uploadToImgBB } from '../../utils/imageUpload'
import { CustomSelect } from '../../components/common/CustomSelect'
import Spinner from '../../components/ui/Spinner'
import { User, Settings, Image as ImageIcon, CheckCircle2, AlertCircle, UploadCloud } from 'lucide-react'
import toast from 'react-hot-toast'

const DashboardSettings = () => {
  const { language, t } = useLanguage()
  const { user, setUser } = useAuthStore()

  // Profile Fields
  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileLang, setProfileLang] = useState('')
  const [profileDiv, setProfileDiv] = useState('')
  const [profileDist, setProfileDist] = useState('')
  const [profileUpazila, setProfileUpazila] = useState('')
  const [profileBio, setProfileBio] = useState('')
  const [profilePhoto, setProfilePhoto] = useState('')
  
  const [uploadingImage, setUploadingImage] = useState(false)

  // Initialize state from user
  useEffect(() => {
    if (user) {
      setProfileName(user.name || user.full_name || '')
      setProfilePhone(user.phone || user.phone_number || '')
      setProfileLang(user.preferred_language || 'bn')
      setProfileDiv(user.division || '')
      setProfileDist(user.district || '')
      setProfileUpazila(user.upazila || '')
      setProfileBio(user.bio || '')
      setProfilePhoto(user.photo_url || '')
    }
  }, [user])

  // Queries for dynamic locations
  const { data: divisions, isLoading: loadingDivs } = useQuery({
    queryKey: ['locations', 'divisions'],
    queryFn: locationsApi.getDivisions,
  })

  // Map division names to backend choices
  const getDivisionSlug = (name) => {
    if (!name) return ''
    const lower = name.toLowerCase()
    if (lower === 'chattagram') return 'chattogram'
    if (lower === 'barisal') return 'barishal'
    return lower
  }

  // Derive IDs based on string values stored in DB
  const selectedDivId = divisions?.find(d => getDivisionSlug(d.name_en) === profileDiv?.toLowerCase())?.id

  const { data: districts, isLoading: loadingDists } = useQuery({
    queryKey: ['locations', 'districts', selectedDivId],
    queryFn: () => locationsApi.getDistricts(selectedDivId),
    enabled: !!selectedDivId,
  })

  const selectedDistId = districts?.find(d => d.name_en === profileDist)?.id

  const { data: upazilas, isLoading: loadingUpazilas } = useQuery({
    queryKey: ['locations', 'upazilas', selectedDistId],
    queryFn: () => locationsApi.getUpazilas(selectedDistId),
    enabled: !!selectedDistId,
  })

  // Save Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => authApi.updateMe(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      toast.success(language === 'bn' ? 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!' : 'Profile updated successfully!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || t('common.error'))
    },
  })

  const handleProfileSave = (e) => {
    e.preventDefault()
    updateProfileMutation.mutate({
      name: profileName,
      phone: profilePhone,
      preferred_language: profileLang,
      division: profileDiv,
      district: profileDist,
      upazila: profileUpazila,
      bio: profileBio,
      photo_url: profilePhoto,
    })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const url = await uploadToImgBB(file)
      setProfilePhoto(url)
      toast.success(language === 'bn' ? 'ছবি আপলোড সফল হয়েছে!' : 'Image uploaded successfully!')
    } catch (err) {
      toast.error(language === 'bn' ? 'ছবি আপলোড করতে ব্যর্থ হয়েছে' : 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Settings className="w-6 h-6" />
            </div>
            {t('profile.title')}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            {language === 'bn' 
              ? 'আপনার ব্যক্তিগত বিবরণী, ভাষা এবং অবস্থানের তথ্য পরিচালনা করুন।'
              : 'Manage your personal details, language preferences, and location.'}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border/60 rounded-3xl p-5 shadow-sm flex flex-col relative">
        <form onSubmit={handleProfileSave} className="space-y-6">
          
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 border-b border-border/50 pb-5">
            <div className="relative group shrink-0">
              <div className={`w-20 h-20 rounded-full overflow-hidden border-[3px] border-card shadow-md bg-pcp-surface flex items-center justify-center relative ${uploadingImage ? 'opacity-50' : ''}`}>
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground/30" />
                )}
                
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-white" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              {uploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Spinner size="md" className="text-pcp-green" />
                </div>
              )}
            </div>
            <div className="text-center sm:text-left space-y-2 flex-1">
              <h3 className="text-lg font-extrabold text-foreground">
                {language === 'bn' ? 'প্রোফাইল ছবি' : 'Profile Picture'}
              </h3>
              <p className="text-sm font-semibold text-muted-foreground max-w-sm">
                {language === 'bn' 
                  ? 'আপনার প্রোফাইলের জন্য একটি পরিষ্কার ছবি নির্বাচন করুন। সর্বাধিক ফাইলের আকার: 5MB।' 
                  : 'Select a clear picture for your profile. Maximum file size: 5MB.'}
              </p>
            </div>
          </div>

          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {t('auth.name')}
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm rounded-2xl border border-border bg-pcp-surface focus:outline-none focus:border-pcp-green font-semibold transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {t('auth.phone')}
              </label>
              <input
                type="text"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm rounded-2xl border border-border bg-pcp-surface focus:outline-none focus:border-pcp-green font-semibold transition-colors"
                placeholder="017XXXXXXXX"
              />
            </div>
            
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {language === 'bn' ? 'আমার সম্পর্কে (বায়ো)' : 'About Me (Bio)'}
              </label>
              <textarea
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                rows={2}
                placeholder={language === 'bn' ? 'আপনার সম্পর্কে কিছু লিখুন...' : 'Write something about yourself...'}
                className="w-full px-4 py-3 text-sm rounded-2xl border border-border bg-pcp-surface focus:outline-none focus:border-pcp-green font-semibold resize-none transition-colors"
              />
            </div>
          </div>

          <div className="border-t border-border/50 pt-5">
            <h3 className="text-base font-extrabold text-foreground mb-4">
              {language === 'bn' ? 'লোকেশন ও ভাষা সেটিংস' : 'Location & Language Settings'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Language */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {t('profile.preferred_language')}
                </label>
                <CustomSelect
                  value={profileLang}
                  onChange={setProfileLang}
                  options={[
                    { id: 'bn', label: 'বাংলা (Bangla)' },
                    { id: 'en', label: 'English' }
                  ]}
                  placeholder={language === 'bn' ? '-- ভাষা নির্বাচন করুন --' : '-- Select Language --'}
                />
              </div>

              {/* Division */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {t('hero.select_division')}
                </label>
                <CustomSelect
                  value={profileDiv}
                  onChange={(val) => {
                    setProfileDiv(val === 'all' ? '' : val)
                    setProfileDist('')
                    setProfileUpazila('')
                  }}
                  disabled={loadingDivs}
                  options={divisions?.map(d => ({
                    id: getDivisionSlug(d.name_en),
                    label: language === 'bn' ? d.name_bn : d.name_en
                  })) || []}
                  placeholder={language === 'bn' ? '-- বিভাগ --' : '-- Division --'}
                />
              </div>

              {/* District */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {t('hero.select_district')}
                </label>
                <CustomSelect
                  value={profileDist}
                  onChange={(val) => {
                    setProfileDist(val === 'all' ? '' : val)
                    setProfileUpazila('')
                  }}
                  disabled={!selectedDivId || loadingDists}
                  options={districts?.map(d => ({
                    id: d.name_en,
                    label: language === 'bn' ? d.name_bn : d.name_en
                  })) || []}
                  placeholder={language === 'bn' ? '-- জেলা --' : '-- District --'}
                />
              </div>

              {/* Upazila */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {t('hero.select_upazila')}
                </label>
                <CustomSelect
                  value={profileUpazila}
                  onChange={(val) => setProfileUpazila(val === 'all' ? '' : val)}
                  disabled={!selectedDistId || loadingUpazilas}
                  options={upazilas?.map(u => ({
                    id: u.name_en,
                    label: language === 'bn' ? u.name_bn : u.name_en
                  })) || []}
                  placeholder={language === 'bn' ? '-- উপজেলা --' : '-- Upazila --'}
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-5 border-t border-border/50 flex justify-end">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending || uploadingImage}
              className="px-6 py-2.5 bg-pcp-green hover:bg-pcp-green/95 text-white font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] disabled:opacity-55"
            >
              {updateProfileMutation.isPending && <Spinner size="sm" />}
              <span>{language === 'bn' ? 'পরিবর্তন সেভ করুন' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DashboardSettings
