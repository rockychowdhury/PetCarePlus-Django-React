import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { useLanguage } from '../../hooks/useLanguage'
import { authApi } from '../../api/auth'
import { BANGLADESH_GEOGRAPHY } from '../../utils/geo'
import Spinner from '../../components/ui/Spinner'
import { ArrowRight, Lock, Mail, User, Phone, MapPin, AlertCircle, CheckCircle } from 'lucide-react'

export const Register = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { login } = useAuthStore()

  // Form fields state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('pet_owner')
  const [division, setDivision] = useState('')
  const [district, setDistrict] = useState('')
  const [upazila, setUpazila] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState('bn')
  const [errorText, setErrorText] = useState('')
  const [successText, setSuccessText] = useState('')

  // Mutation to handle registration
  const registerMutation = useMutation({
    mutationFn: (userData) => authApi.register(userData),
    onSuccess: (data) => {
      setSuccessText('নিবন্ধন সফল হয়েছে! অ্যাকাউন্টে প্রবেশ করা হচ্ছে...')
      
      // Auto login on success
      login(data.user, data.access)
      
      setTimeout(() => {
        navigate('/profile')
      }, 1500)
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

    registerMutation.mutate({
      name,
      email,
      password,
      phone,
      role,
      division,
      district,
      upazila,
      preferred_language: preferredLanguage,
    })
  }

  const activeDistricts = BANGLADESH_GEOGRAPHY.districts[division] || []

  return (
    <div className="min-h-screen w-full bg-pcp-surface/20 flex items-center justify-center p-4 py-12">
      <div className="bg-card border border-border/80 rounded-2xl shadow-lg w-full max-w-[500px] p-6 sm:p-8 space-y-6 animate-fade-in-up text-left">
        {/* Header */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">{t('auth.name')}</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Robin"
                  className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-muted-foreground w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">{t('auth.phone')}</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="017XXXXXXXX"
                  className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                />
              </div>
            </div>

            {/* Role select */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">{t('auth.select_role')}</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
              >
                <option value="pet_owner">{t('profile.roles.pet_owner')}</option>
                <option value="farmer">{t('profile.roles.farmer')}</option>
                <option value="provider">{t('profile.roles.provider')}</option>
              </select>
            </div>

            {/* Division */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">{t('hero.select_division')}</label>
              <select
                value={division}
                onChange={(e) => {
                  setDivision(e.target.value)
                  setDistrict('')
                }}
                required
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
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
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">{t('hero.select_district')}</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={!division}
                required
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold disabled:opacity-50"
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
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">{t('hero.select_upazila')}</label>
              <input
                type="text"
                value={upazila}
                onChange={(e) => setUpazila(e.target.value)}
                disabled={!district}
                required
                placeholder="Upazila"
                className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold disabled:opacity-50"
              />
            </div>

            {/* Preferred language */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">{t('profile.preferred_language')}</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
              >
                <option value="bn">{t('common.bangla')}</option>
                <option value="en">{t('common.english')}</option>
              </select>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-muted-foreground w-4 h-4" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">{t('auth.confirm_password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-muted-foreground w-4 h-4" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Description of role */}
          <p className="text-[10px] text-muted-foreground leading-relaxed text-center">
            {t('auth.select_role_desc')}
          </p>

          {/* Success banner */}
          {successText && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm flex gap-2 items-center dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successText}</span>
            </div>
          )}

          {/* Error banner */}
          {errorText && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm flex gap-2 items-center dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={registerMutation.isPending || !!successText}
            className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all disabled:opacity-55"
          >
            {registerMutation.isPending && <Spinner size="sm" />}
            <span>{t('auth.btn_register')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer link */}
        <div className="text-center pt-2">
          <Link
            to="/login"
            className="text-xs text-primary hover:underline font-semibold"
          >
            {t('auth.have_account')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register
