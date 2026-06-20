import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { providersApi } from '../../api/providers'
import { guidelinesApi } from '../../api/guidelines'
import { locationsApi } from '../../api/locations'
import { useLanguage } from '../../hooks/useLanguage'
import { BANGLADESH_GEOGRAPHY } from '../../utils/geo'
import Spinner from '../../components/ui/Spinner'
import { Briefcase, CheckCircle, AlertCircle, MapPin } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

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
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

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

  // Location queries based on names
  const { data: divisions } = useQuery({
    queryKey: ['locations', 'divisions'],
    queryFn: locationsApi.getDivisions
  })
  
  const selectedDivId = divisions?.find(d => d.name_en?.trim().toLowerCase() === div?.trim().toLowerCase())?.id
  const { data: districts } = useQuery({
    queryKey: ['locations', 'districts', selectedDivId],
    queryFn: () => locationsApi.getDistricts(selectedDivId),
    enabled: !!selectedDivId
  })
  
  const selectedDistId = districts?.find(d => d.name_en?.trim().toLowerCase() === dist?.trim().toLowerCase())?.id
  const { data: upazilas } = useQuery({
    queryKey: ['locations', 'upazilas', selectedDistId],
    queryFn: () => locationsApi.getUpazilas(selectedDistId),
    enabled: !!selectedDistId
  })
  
  const selectedUpazilaId = upazilas?.find(u => u.name_en?.trim().toLowerCase() === upazila?.trim().toLowerCase())?.id
  const { data: unionsList } = useQuery({
    queryKey: ['locations', 'unions', selectedUpazilaId],
    queryFn: () => locationsApi.getUnions(selectedUpazilaId),
    enabled: !!selectedUpazilaId
  })

  // Set all form values directly from profile — no cascading needed
  useEffect(() => {
    if (profile && !profile.detail) {
      setBusinessName(profile.business_name || '')
      setProviderType(profile.provider_type || 'vet')
      setDescEn(profile.description_en || '')
      setDescBn(profile.description_bn || '')
      const pDiv = (profile.division || '').trim().toLowerCase()
      setDiv(
        pDiv === 'chattogram' ? 'chattagram' : 
        (pDiv === 'barishal' ? 'barisal' : pDiv)
      )
      setDist((profile.district || '').trim().toLowerCase())
      setUpazila((profile.upazila || '').trim().toLowerCase())
      setUnion((profile.union || '').trim().toLowerCase())
      setLat(profile.latitude || '')
      setLng(profile.longitude || '')
      setPhone(profile.phone || '')
      setEmail(profile.email || '')
      if (profile.supported_animal_types) {
        setSelectedAnimals(profile.supported_animal_types.map(a => a.animal_type_id || a.id))
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
      description_bn: descBn,
      division: div === 'chattagram' ? 'chattogram' : (div === 'barisal' ? 'barishal' : div),
      district: districts?.find(d => d.name_en.toLowerCase() === dist)?.name_en || dist,
      upazila: upazilas?.find(u => u.name_en.toLowerCase() === upazila)?.name_en || upazila,
      union: unionsList?.find(u => u.name_en.toLowerCase() === union)?.name_en || union,
      latitude: lat ? parseFloat(Number(lat).toFixed(6)) : null,
      longitude: lng ? parseFloat(Number(lng).toFixed(6)) : null,
      phone: phone,
      email: email,
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

  const captureGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude
          setLat(latitude)
          setLng(longitude)

          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
            const data = await res.json()
            if (data && data.address) {
              const state = data.address.state
              const county = data.address.county || data.address.state_district
              const city = data.address.city || data.address.town || data.address.suburb
              
              if (state) {
                const divMatch = state.replace(' Division', '').toLowerCase()
                setDiv(divMatch === 'barisal' ? 'barisal' : (divMatch === 'chattogram' ? 'chattagram' : divMatch))
              }
              if (county) {
                setDist(county.replace(' District', '').toLowerCase())
              }
              if (city) {
                setUpazila(city.toLowerCase())
              }
            }
          } catch (e) {
            console.error('Reverse geocoding failed', e)
          }
        },
        (error) => {
          alert('Error capturing GPS: ' + error.message)
        }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
    }
  }

  if (isLoading) return <Spinner className="py-24" />

  return (
    <div className="bg-white dark:bg-card p-4 md:p-6 rounded-none sm:rounded-2xl space-y-4 w-full max-w-6xl animate-fade-in mx-auto">
      <div className="border-b border-border/60 pb-3 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-[#1b5e20]" />
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

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Core Details Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              {language === 'bn' ? 'ব্যবসার নাম / চেম্বারের নাম' : 'Business / Chamber Name'}
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f8f9fa] dark:bg-muted/50 focus:outline-none focus:border-pcp-green font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              {language === 'bn' ? 'সেবাদাতার ধরন' : 'Provider Type'}
            </label>
            <Select value={providerType} onValueChange={setProviderType}>
              <SelectTrigger className="w-full h-auto px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f8f9fa] dark:bg-muted/50 focus:ring-0 focus:outline-none focus:border-pcp-green font-semibold">
                <SelectValue placeholder="Select Provider Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vet">{language === 'bn' ? 'ভেটেরিনারি ডাক্তার' : 'Veterinarian'}</SelectItem>
                <SelectItem value="groomer">{language === 'bn' ? 'গ্রুমার' : 'Groomer'}</SelectItem>
                <SelectItem value="trainer">{language === 'bn' ? 'ট্রেইনার' : 'Trainer'}</SelectItem>
                <SelectItem value="sitter">{language === 'bn' ? 'সিটার / বোর্ডিং' : 'Pet Sitter/Boarding'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              {language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f8f9fa] dark:bg-muted/50 focus:outline-none focus:border-pcp-green font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              {language === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f8f9fa] dark:bg-muted/50 focus:outline-none focus:border-pcp-green font-semibold"
            />
          </div>
        </div>

        {/* Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              {language === 'bn' ? 'বর্ণনা (ইংরেজিতে)' : 'Description (English)'}
            </label>
            <textarea
              value={descEn}
              onChange={(e) => setDescEn(e.target.value)}
              rows={3}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f8f9fa] dark:bg-muted/50 focus:outline-none focus:border-pcp-green font-semibold"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              {language === 'bn' ? 'বর্ণনা (বাংলায়)' : 'Description (Bangla)'}
            </label>
            <textarea
              value={descBn}
              onChange={(e) => setDescBn(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f8f9fa] dark:bg-muted/50 focus:outline-none focus:border-pcp-green font-semibold"
            />
          </div>
        </div>

        {/* Supported Animals */}
        <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-border/50">
          <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
            {language === 'bn' ? 'যেসব প্রাণীর চিকিৎসা/সেবা দেন' : 'Supported Animals'}
          </label>
          <div className="flex flex-wrap gap-3">
            {animalTypes?.map((animal) => {
              const isChecked = selectedAnimals.includes(animal.id)
              return (
                <label key={animal.id} className={`flex items-center gap-2.5 cursor-pointer px-4 py-2 rounded-[12px] border transition-all ${
                  isChecked 
                    ? 'bg-[#f4fbf6] border-[#2b8a3e] text-[#2b8a3e] shadow-sm' 
                    : 'bg-white dark:bg-muted/20 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleAnimalToggle(animal.id)}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    isChecked ? 'bg-[#2b8a3e] border-[#2b8a3e]' : 'border-slate-300 dark:border-slate-600 bg-transparent'
                  }`}>
                    {isChecked && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm font-extrabold">
                    {language === 'bn' ? animal.name_bn : animal.name_en}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Location & GPS */}
        <div className="pt-4 border-t border-slate-100 dark:border-border/50 relative">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{language === 'bn' ? 'লোকেশন' : 'Location'}</h3>
            <button 
              type="button" 
              onClick={captureGPS}
              className="text-xs bg-[#e9ecef] dark:bg-muted/50 hover:bg-[#dee2e6] text-slate-700 dark:text-slate-300 font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors absolute top-0 right-0"
            >
              <MapPin className="w-3.5 h-3.5" /> {language === 'bn' ? 'বর্তমান অবস্থান নিন' : 'Capture Current Location'}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Division</label>
              <Select value={div || undefined} onValueChange={(val) => { setDiv(val); setDist(''); setUpazila(''); setUnion('') }}>
                <SelectTrigger className="w-full h-auto px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f8f9fa] dark:bg-muted/50 focus:ring-0 focus:outline-none focus:border-pcp-green font-semibold">
                  <SelectValue placeholder="-- Select Division --" />
                </SelectTrigger>
                <SelectContent>
                  {!divisions?.length && div && (
                    <SelectItem value={div}>{profile?.division || div}</SelectItem>
                  )}
                  {divisions?.map((d) => (
                    <SelectItem key={d.id} value={d.name_en?.trim().toLowerCase()}>{language === 'bn' ? d.name_bn : d.name_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">District</label>
              <Select value={dist || undefined} onValueChange={(val) => { setDist(val); setUpazila(''); setUnion('') }} disabled={!div}>
                <SelectTrigger className="w-full h-auto px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f8f9fa] dark:bg-muted/50 focus:ring-0 focus:outline-none focus:border-pcp-green font-semibold disabled:opacity-50">
                  <SelectValue placeholder="-- District --" />
                </SelectTrigger>
                <SelectContent>
                  {!districts?.length && dist && (
                    <SelectItem value={dist}>{profile?.district || dist}</SelectItem>
                  )}
                  {districts?.map((d) => (
                    <SelectItem key={d.id} value={d.name_en?.trim().toLowerCase()}>{language === 'bn' ? d.name_bn : d.name_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Upazila</label>
              <Select value={upazila || undefined} onValueChange={(val) => { setUpazila(val); setUnion('') }} disabled={!dist}>
                <SelectTrigger className="w-full h-auto px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f8f9fa] dark:bg-muted/50 focus:ring-0 focus:outline-none focus:border-pcp-green font-semibold disabled:opacity-50">
                  <SelectValue placeholder="-- Upazila --" />
                </SelectTrigger>
                <SelectContent>
                  {!upazilas?.length && upazila && (
                    <SelectItem value={upazila}>{profile?.upazila || upazila}</SelectItem>
                  )}
                  {upazilas?.map((u) => (
                    <SelectItem key={u.id} value={u.name_en?.trim().toLowerCase()}>{language === 'bn' ? u.name_bn : u.name_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Union/Area</label>
              <Select value={union || undefined} onValueChange={setUnion} disabled={!upazila}>
                <SelectTrigger className="w-full h-auto px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f8f9fa] dark:bg-muted/50 focus:ring-0 focus:outline-none focus:border-pcp-green font-semibold disabled:opacity-50">
                  <SelectValue placeholder="-- Union --" />
                </SelectTrigger>
                <SelectContent>
                  {!unionsList?.length && union && (
                    <SelectItem value={union}>{profile?.union || union}</SelectItem>
                  )}
                  {unionsList?.map((u) => (
                    <SelectItem key={u.id} value={u.name_en?.trim().toLowerCase()}>{language === 'bn' ? u.name_bn : u.name_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Lat (GPS)</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f8f9fa] dark:bg-muted/50 focus:outline-none focus:border-pcp-green font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Lng (GPS)</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f8f9fa] dark:bg-muted/50 focus:outline-none focus:border-pcp-green font-semibold"
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
        <div className="pt-6 flex justify-end border-t border-slate-100 dark:border-border/50 mt-8">
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-8 py-3 bg-[#1b5e20] hover:bg-[#154617] text-white font-extrabold rounded-[12px] text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-55"
          >
            {(createMutation.isPending || updateMutation.isPending) && <Spinner size="sm" />}
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default DashboardProviderProfile
