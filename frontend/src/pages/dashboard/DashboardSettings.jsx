import React, { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { useLanguage } from '../../hooks/useLanguage'
import { authApi } from '../../api/auth'
import { BANGLADESH_GEOGRAPHY } from '../../utils/geo'
import Spinner from '../../components/ui/Spinner'
import { CheckCircle, AlertCircle, User } from 'lucide-react'

const DashboardSettings = () => {
  const { language, t } = useLanguage()
  const { user, setUser } = useAuthStore()

  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileLang, setProfileLang] = useState('')
  const [profileDiv, setProfileDiv] = useState('')
  const [profileDist, setProfileDist] = useState('')
  const [profileUpazila, setProfileUpazila] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState(false)

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

  const activeDistricts = BANGLADESH_GEOGRAPHY.districts[profileDiv] || []

  return (
    <div className="bg-card border border-border/80 p-5 md:p-8 rounded-2xl shadow-sm space-y-6 max-w-3xl animate-fade-in">
      <div className="border-b border-border/60 pb-4">
        <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          {t('profile.title')}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          আপনার ব্যক্তিগত বিবরণী, ভাষা এবং অবস্থানের তথ্য পরিচালনা করুন।
        </p>
      </div>

      <form onSubmit={handleProfileSave} className="space-y-5 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">{t('auth.name')}</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
            />
          </div>

          {/* Mobile number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">{t('auth.phone')}</label>
            <input
              type="text"
              value={profilePhone}
              onChange={(e) => setProfilePhone(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
            />
          </div>
        </div>

        {/* Preferred language */}
        <div className="space-y-1.5 md:w-1/2">
          <label className="text-xs font-bold text-muted-foreground">{t('profile.preferred_language')}</label>
          <select
            value={profileLang}
            onChange={(e) => setProfileLang(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
          >
            <option value="bn">{t('common.bangla')}</option>
            <option value="en">{t('common.english')}</option>
          </select>
        </div>

        <div className="pt-2">
          <h3 className="text-sm font-bold text-foreground mb-3">{t('hero.location')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Division */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">{t('hero.select_division')}</label>
              <select
                value={profileDiv}
                onChange={(e) => {
                  setProfileDiv(e.target.value)
                  setProfileDist('')
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
              >
                <option value="">-- {t('hero.select_division')} --</option>
                {BANGLADESH_GEOGRAPHY.divisions.map((div) => (
                  <option key={div.id} value={div.id}>
                    {language === 'bn' ? div.name_bn : div.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">{t('hero.select_district')}</label>
              <select
                value={profileDist}
                onChange={(e) => setProfileDist(e.target.value)}
                disabled={!profileDiv}
                className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold disabled:opacity-50"
              >
                <option value="">-- {t('hero.select_district')} --</option>
                {activeDistricts.map((dist) => (
                  <option key={dist.id} value={dist.id}>
                    {language === 'bn' ? dist.name_bn : dist.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Upazila */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">{t('hero.select_upazila')}</label>
              <input
                type="text"
                value={profileUpazila}
                onChange={(e) => setProfileUpazila(e.target.value)}
                disabled={!profileDist}
                className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {profileSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex gap-2 items-center">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>প্রোফাইল সফলভাবে আপডেট করা হয়েছে! (Profile updated successfully!)</span>
          </div>
        )}

        {/* Error Banner */}
        {profileError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex gap-2 items-center">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        {/* Submit button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={updateProfileMutation.isPending || !!profileSuccess}
            className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] disabled:opacity-55"
          >
            {updateProfileMutation.isPending && <Spinner size="sm" />}
            <span>{t('profile.btn_save')}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default DashboardSettings
