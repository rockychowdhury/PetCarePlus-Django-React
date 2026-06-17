import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { useLanguage } from '../../hooks/useLanguage'
import { authApi } from '../../api/auth'
import { locationsApi } from '../../api/locations'
import Spinner from '../../components/ui/Spinner'
import { ArrowRight, Lock, Mail, User, Phone, MapPin, AlertCircle, CheckCircle, Navigation } from 'lucide-react'

export const Register = () => {
  const { language, t } = useLanguage()
  const navigate = useNavigate()
  const { login } = useAuthStore()

  // Form fields state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('pet_owner')
  
  // Location hierarchy IDs
  const [divisionId, setDivisionId] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [upazilaId, setUpazilaId] = useState('')
  const [unionId, setUnionId] = useState('')
  
  // Coordinates
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [locationStatus, setLocationStatus] = useState('')

  const [preferredLanguage, setPreferredLanguage] = useState('bn')
  const [errorText, setErrorText] = useState('')
  const [successText, setSuccessText] = useState('')

  // Fetch location data from API
  const { data: divisions = [] } = useQuery({
    queryKey: ['locations', 'divisions'],
    queryFn: locationsApi.getDivisions,
  })

  const { data: districts = [] } = useQuery({
    queryKey: ['locations', 'districts', divisionId],
    queryFn: () => locationsApi.getDistricts(divisionId),
    enabled: !!divisionId,
  })

  const { data: upazilas = [] } = useQuery({
    queryKey: ['locations', 'upazilas', districtId],
    queryFn: () => locationsApi.getUpazilas(districtId),
    enabled: !!districtId,
  })

  const { data: unions = [] } = useQuery({
    queryKey: ['locations', 'unions', upazilaId],
    queryFn: () => locationsApi.getUnions(upazilaId),
    enabled: !!upazilaId,
  })

  // Detect Geolocation
  const handleDetectLocation = () => {
    setLocationStatus(language === 'bn' ? 'অপেক্ষা করুন...' : 'Detecting...')
    if (!navigator.geolocation) {
      setLocationStatus(language === 'bn' ? 'সমর্থিত নয়' : 'Not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
        setLocationStatus(language === 'bn' ? 'লোকেশন পাওয়া গেছে' : 'Location captured')
      },
      (error) => {
        setLocationStatus(language === 'bn' ? 'লোকেশন পাওয়া যায়নি' : 'Location failed')
      }
    )
  }

  // Mutation to handle registration
  const registerMutation = useMutation({
    mutationFn: (userData) => authApi.register(userData),
    onSuccess: (data) => {
      setSuccessText('নিবন্ধন সফল হয়েছে! অ্যাকাউন্টে প্রবেশ করা হচ্ছে...')
      login(data.user, data.access)
      setTimeout(() => navigate('/profile'), 1500)
    },
    onError: (err) => {
      setErrorText(err.response?.data?.detail || err.response?.data?.message || t('common.error'))
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorText('')
    setSuccessText('')

    if (password !== confirmPassword) {
      setErrorText('পাসওয়ার্ড দুটি মেলেনি!')
      return
    }

    // Resolve string names from selected IDs for the backend User model
    const selectedDivision = divisions.find(d => String(d.id) === String(divisionId))?.name_en || ''
    const selectedDistrict = districts.find(d => String(d.id) === String(districtId))?.name_en || ''
    const selectedUpazila = upazilas.find(u => String(u.id) === String(upazilaId))?.name_en || ''
    const selectedUnion = unions.find(u => String(u.id) === String(unionId))?.name_en || ''

    registerMutation.mutate({
      name,
      email,
      password,
      phone,
      role,
      division: selectedDivision,
      district: selectedDistrict,
      upazila: selectedUpazila,
      union: selectedUnion,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      preferred_language: preferredLanguage,
    })
  }

  return (
    <div className="min-h-screen w-full bg-pcp-surface/20 flex items-center justify-center p-4 py-12">
      <div className="bg-card border border-border/80 rounded-2xl shadow-lg w-full max-w-[700px] p-6 sm:p-8 space-y-6 animate-fade-in-up text-left">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-bold bg-gradient-to-r from-pcp-green to-pcp-green-light bg-clip-text text-transparent">
              PetCarePlus
            </span>
          </Link>
          <h2 className="text-lg sm:text-xl font-extrabold text-foreground">
            {t('auth.register_title')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Identity & Contact Section */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-bold border-b pb-1">Identity & Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">{t('auth.name')}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 text-muted-foreground w-4 h-4" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Robin" className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">{t('auth.email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-muted-foreground w-4 h-4" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">{t('auth.phone')}</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 text-muted-foreground w-4 h-4" />
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="017XXXXXXXX" className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">{t('auth.select_role')}</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold">
                    <option value="pet_owner">{t('profile.roles.pet_owner')}</option>
                    <option value="farmer">{t('profile.roles.farmer')}</option>
                    <option value="provider">{t('profile.roles.provider')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address & Location Section */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-bold border-b pb-1">Location Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">{t('hero.select_division')}</label>
                  <select value={divisionId} onChange={(e) => { setDivisionId(e.target.value); setDistrictId(''); setUpazilaId(''); setUnionId(''); }} required className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold">
                    <option value="">-- {t('hero.select_division')} --</option>
                    {divisions.map((div) => (
                      <option key={div.id} value={div.id}>{language === 'bn' ? div.name_bn : div.name_en}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">{t('hero.select_district')}</label>
                  <select value={districtId} onChange={(e) => { setDistrictId(e.target.value); setUpazilaId(''); setUnionId(''); }} disabled={!divisionId} required className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold disabled:opacity-50">
                    <option value="">-- {t('hero.select_district')} --</option>
                    {districts.map((dist) => (
                      <option key={dist.id} value={dist.id}>{language === 'bn' ? dist.name_bn : dist.name_en}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">{t('hero.select_upazila')}</label>
                  <select value={upazilaId} onChange={(e) => { setUpazilaId(e.target.value); setUnionId(''); }} disabled={!districtId} required className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold disabled:opacity-50">
                    <option value="">-- Select Upazila --</option>
                    {upazilas.map((upz) => (
                      <option key={upz.id} value={upz.id}>{language === 'bn' ? upz.name_bn : upz.name_en}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Union</label>
                  <select value={unionId} onChange={(e) => setUnionId(e.target.value)} disabled={!upazilaId} className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold disabled:opacity-50">
                    <option value="">-- Select Union --</option>
                    {unions.map((uni) => (
                      <option key={uni.id} value={uni.id}>{language === 'bn' ? uni.name_bn : uni.name_en}</option>
                    ))}
                  </select>
                </div>
                
                {/* Geolocation Fields */}
                <div className="sm:col-span-2 bg-muted/30 p-3 rounded-xl border border-border/60 flex flex-col sm:flex-row gap-3 items-center justify-between mt-2">
                  <div className="flex-1 w-full text-xs space-y-2">
                    <p className="font-semibold text-muted-foreground">Exact Coordinates (Optional)</p>
                    <div className="flex gap-2 w-full">
                      <input type="text" readOnly placeholder="Lat" value={latitude} className="flex-1 px-2 py-1 bg-pcp-surface border rounded" />
                      <input type="text" readOnly placeholder="Lng" value={longitude} className="flex-1 px-2 py-1 bg-pcp-surface border rounded" />
                    </div>
                  </div>
                  <button type="button" onClick={handleDetectLocation} className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-card border border-primary/40 text-primary font-bold rounded-lg text-xs hover:bg-primary hover:text-white transition-colors">
                    <Navigation className="w-4 h-4" />
                    {language === 'bn' ? 'লোকেশন শনাক্ত করুন' : 'Detect Location'}
                  </button>
                  {locationStatus && <span className="text-[10px] text-primary w-full text-right sm:w-auto">{locationStatus}</span>}
                </div>
              </div>
            </div>

            {/* Security & Settings Section */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-bold border-b pb-1">Security</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">{t('profile.preferred_language')}</label>
                  <select value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)} className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold">
                    <option value="bn">{t('common.bangla')}</option>
                    <option value="en">{t('common.english')}</option>
                  </select>
                </div>
                <div className="hidden sm:block"></div> {/* Spacer */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">{t('auth.password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-muted-foreground w-4 h-4" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">{t('auth.confirm_password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-muted-foreground w-4 h-4" />
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••" className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground leading-relaxed text-center">
            {t('auth.select_role_desc')}
          </p>

          {successText && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm flex gap-2 items-center">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successText}</span>
            </div>
          )}

          {errorText && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm flex gap-2 items-center">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorText}</span>
            </div>
          )}

          <button type="submit" disabled={registerMutation.isPending || !!successText} className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all disabled:opacity-55">
            {registerMutation.isPending && <Spinner size="sm" />}
            <span>{t('auth.btn_register')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <Link to="/login" className="text-xs text-primary hover:underline font-semibold">
            {t('auth.have_account')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register
