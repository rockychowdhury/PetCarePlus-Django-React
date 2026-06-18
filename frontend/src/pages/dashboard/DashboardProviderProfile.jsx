import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { providersApi } from '../../api/providers'
import { guidelinesApi } from '../../api/guidelines'
import { useLanguage } from '../../hooks/useLanguage'
import { BANGLADESH_GEOGRAPHY } from '../../utils/geo'
import Spinner from '../../components/ui/Spinner'
import { Briefcase, CheckCircle, AlertCircle } from 'lucide-react'

const DashboardProviderProfile = () => {
  const { language, t } = useLanguage()
  const queryClient = useQueryClient()

  const [businessName, setBusinessName] = useState('')
  const [providerType, setProviderType] = useState('vet')
  const [descEn, setDescEn] = useState('')
  const [descBn, setDescBn] = useState('')
  const [selectedAnimals, setSelectedAnimals] = useState([])
  const [div, setDiv] = useState('')
  const [dist, setDist] = useState('')
  const [upazila, setUpazila] = useState('')
  const [union, setUnion] = useState('')

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState(false)

  // Fetch animal types for the checkboxes
  const { data: animalTypes } = useQuery({
    queryKey: ['animalTypes'],
    queryFn: guidelinesApi.getAnimalTypes,
  })

  // Fetch the provider's own profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['myProviderProfile'],
    queryFn: () => providersApi.getMyProviderProfile(),
    retry: false, // If it 404s, they don't have one yet
  })

  useEffect(() => {
    if (profile && !profile.detail) {
      setBusinessName(profile.business_name || '')
      setProviderType(profile.provider_type || 'vet')
      setDescEn(profile.description_en || '')
      setDescBn(profile.description_bn || '')
      setDiv(profile.division || '')
      setDist(profile.district || '')
      setUpazila(profile.upazila || '')
      setUnion(profile.union || '')
      if (profile.animal_types) {
        setSelectedAnimals(profile.animal_types.map(a => a.animal_type_id || a.id))
      }
    }
  }, [profile])

  const createMutation = useMutation({
    mutationFn: (data) => providersApi.registerProvider(data),
    onSuccess: () => {
      setSuccessMsg(true)
      queryClient.invalidateQueries(['myProviderProfile'])
      setTimeout(() => setSuccessMsg(false), 5000)
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.detail || err.response?.data?.message || t('common.error'))
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data) => providersApi.updateProvider(profile.id, data),
    onSuccess: () => {
      setSuccessMsg(true)
      queryClient.invalidateQueries(['myProviderProfile'])
      setTimeout(() => setSuccessMsg(false), 5000)
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.detail || err.response?.data?.message || t('common.error'))
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg(false)

    const payload = {
      business_name: businessName,
      provider_type: providerType,
      description_en: descEn,
      description_bn: descBn || descEn,
      division: div,
      district: dist,
      upazila: upazila,
      union: union,
      animal_type_ids: selectedAnimals,
    }

    if (profile && profile.id) {
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleAnimalToggle = (id) => {
    setSelectedAnimals(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  const activeDistricts = BANGLADESH_GEOGRAPHY.districts[div] || []

  if (isLoading) return <Spinner className="py-24" />

  return (
    <div className="bg-card border border-border/80 p-5 md:p-8 rounded-2xl shadow-sm space-y-6 max-w-3xl animate-fade-in">
      <div className="border-b border-border/60 pb-4 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            {language === 'bn' ? 'ব্যবসার প্রোফাইল' : 'Business Profile'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            আপনার সেবা প্রদানের ব্যবসার তথ্য, অবস্থান এবং সেবার ধরন হালনাগাদ করুন।
          </p>
        </div>
        {profile && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            profile.is_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {profile.is_verified ? (language === 'bn' ? 'যাচাইকৃত' : 'Verified') : (language === 'bn' ? 'অপেক্ষমাণ' : 'Pending')}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-left">
        {/* Business Name & Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-muted-foreground">
              {language === 'bn' ? 'ব্যবসার নাম / চেম্বারের নাম' : 'Business / Chamber Name'}
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-muted-foreground">
              {language === 'bn' ? 'সেবাদাতার ধরন' : 'Provider Type'}
            </label>
            <select
              value={providerType}
              onChange={(e) => setProviderType(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
            >
              <option value="vet">{language === 'bn' ? 'ভেটেরিনারি ডাক্তার' : 'Veterinarian'}</option>
              <option value="groomer">{language === 'bn' ? 'গ্রুমার' : 'Groomer'}</option>
              <option value="trainer">{language === 'bn' ? 'ট্রেইনার' : 'Trainer'}</option>
              <option value="sitter">{language === 'bn' ? 'সিটার / বোর্ডিং' : 'Pet Sitter/Boarding'}</option>
            </select>
          </div>
        </div>

        {/* Descriptions */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-muted-foreground">
              {language === 'bn' ? 'বর্ণনা (ইংরেজিতে)' : 'Description (English)'}
            </label>
            <textarea
              value={descEn}
              onChange={(e) => setDescEn(e.target.value)}
              rows={3}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-muted-foreground">
              {language === 'bn' ? 'বর্ণনা (বাংলায়)' : 'Description (Bangla)'}
            </label>
            <textarea
              value={descBn}
              onChange={(e) => setDescBn(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
            />
          </div>
        </div>

        {/* Supported Animals */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          <label className="text-sm font-bold text-foreground">
            {language === 'bn' ? 'যেসব প্রাণীর চিকিৎসা/সেবা দেন' : 'Supported Animals'}
          </label>
          <div className="flex flex-wrap gap-3 mt-2">
            {animalTypes?.map((animal) => (
              <label key={animal.id} className="flex items-center gap-2 cursor-pointer bg-pcp-surface/50 border border-border/60 px-3 py-2 rounded-xl hover:bg-pcp-surface transition-colors">
                <input
                  type="checkbox"
                  checked={selectedAnimals.includes(animal.id)}
                  onChange={() => handleAnimalToggle(animal.id)}
                  className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                />
                <span className="text-sm font-semibold text-foreground">
                  {language === 'bn' ? animal.name_bn : animal.name_en}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="pt-2 border-t border-border/50">
          <h3 className="text-sm font-bold text-foreground mb-3">{t('hero.location')} (চেম্বার / ক্লিনিক)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">{t('hero.select_division')}</label>
              <select
                value={div}
                onChange={(e) => {
                  setDiv(e.target.value)
                  setDist('')
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
              >
                <option value="">-- {t('hero.select_division')} --</option>
                {BANGLADESH_GEOGRAPHY.divisions.map((d) => (
                  <option key={d.id} value={d.id}>{language === 'bn' ? d.name_bn : d.name_en}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">{t('hero.select_district')}</label>
              <select
                value={dist}
                onChange={(e) => setDist(e.target.value)}
                disabled={!div}
                className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold disabled:opacity-50"
              >
                <option value="">-- {t('hero.select_district')} --</option>
                {activeDistricts.map((d) => (
                  <option key={d.id} value={d.id}>{language === 'bn' ? d.name_bn : d.name_en}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">{t('hero.select_upazila')}</label>
              <input
                type="text"
                value={upazila}
                onChange={(e) => setUpazila(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">ইউনিয়ন / এলাকা (Union / Area)</label>
              <input
                type="text"
                value={union}
                onChange={(e) => setUnion(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Banners */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex gap-2 items-center">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>প্রোফাইল সফলভাবে আপডেট করা হয়েছে!</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex gap-2 items-center">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit */}
        <div className="pt-4 flex justify-end border-t border-border/50 mt-4">
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] disabled:opacity-55"
          >
            {(createMutation.isPending || updateMutation.isPending) && <Spinner size="sm" />}
            <span>{t('profile.btn_save')}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default DashboardProviderProfile
