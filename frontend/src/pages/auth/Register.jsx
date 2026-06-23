import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useLanguage } from '../../hooks/useLanguage'
import { authApi } from '../../api/auth'
import Spinner from '../../components/ui/Spinner'
import { ArrowRight, Mail, User, Phone, AlertCircle, CheckCircle } from 'lucide-react'

export const Register = () => {
  const { language, t } = useLanguage()
  const navigate = useNavigate()

  // Form fields state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('pet_owner')
  
  const [errorText, setErrorText] = useState('')
  const [registered, setRegistered] = useState(false)

  // Mutation to handle registration
  const registerMutation = useMutation({
    mutationFn: (userData) => authApi.register(userData),
    onSuccess: () => {
      setRegistered(true)
    },
    onError: (err) => {
      setErrorText(err.response?.data?.detail || err.response?.data?.message || t('common.error'))
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorText('')

    registerMutation.mutate({
      name,
      email,
      password,
      role,
    })
  }

  if (registered) {
    return (
      <div className="min-h-screen w-full bg-pcp-surface/20 flex items-center justify-center p-4 py-8 animate-fade-in">
        <div className="bg-card border border-border/80 rounded-2xl shadow-lg w-full max-w-[420px] p-6 text-center flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle className="w-8 h-8" />
          </div>
          
          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-extrabold text-foreground">
              {language === 'bn' ? 'নিবন্ধন সফল হয়েছে!' : 'Registration Successful!'}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {role === 'provider' ? (
                language === 'bn' ? (
                  <>
                    আপনার সেবাদাতা অ্যাকাউন্টটি সফলভাবে তৈরি করা হয়েছে তবে এটি বর্তমানে অনুমোদনের অপেক্ষায় রয়েছে। 
                    অনুগ্রহ করে যাচাইকরণের জন্য আপনার নিকটস্থ প্রাণিসম্পদ অধিদপ্তরের কর্মকর্তার সাথে যোগাযোগ করুন।
                    যাচাইকরণ সম্পন্ন হলে, আপনি লগইন পাসওয়ার্ডসহ একটি ইমেইল পাবেন।
                  </>
                ) : (
                  <>
                    Your provider account has been successfully created but is currently pending approval.
                    Please contact your nearest Department of Livestock Services officer to verify your profile.
                    Once verified, you will receive an email with your login password.
                  </>
                )
              ) : (
                language === 'bn' ? (
                  <>
                    স্বাগতম! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। 
                    অনুগ্রহ করে লগইন পেজে গিয়ে আপনার ইমেইল এবং পাসওয়ার্ড দিয়ে প্রবেশ করুন।
                  </>
                ) : (
                  <>
                    Welcome! Your account has been successfully created.
                    Please proceed to the login page and sign in with your email and password.
                  </>
                )
              )}
            </p>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            <span>{language === 'bn' ? 'লগইন পেজে যান' : 'Proceed to Login'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-pcp-surface/20 flex items-center justify-center p-4 py-8">
      <div className="bg-card border border-border/80 rounded-2xl shadow-lg w-full max-w-[420px] p-5 sm:p-6 space-y-4 animate-fade-in-up text-left">
        <div className="text-center space-y-1">
          <Link to="/" className="inline-block">
            <span className="text-xl font-bold bg-gradient-to-r from-pcp-green to-pcp-green-light bg-clip-text text-transparent">
              PetCarePlus
            </span>
          </Link>
          <h2 className="text-base sm:text-lg font-extrabold text-foreground">
            {t('auth.register_title')}
          </h2>
          <p className="text-[10px] text-muted-foreground">
            {language === 'bn' 
              ? 'নিবন্ধনের পর পাসওয়ার্ড ইমেইলে পাঠানো হবে।' 
              : 'Password will be emailed after registration.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {/* Full name */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground">{t('auth.name')}</label>
              <div className="relative">
                <User className="absolute left-3 top-2 text-muted-foreground w-3.5 h-3.5" />
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="e.g. Shahin" 
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold" 
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2 text-muted-foreground w-3.5 h-3.5" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="you@example.com" 
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold" 
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground">{t('auth.password')}</label>
              <div className="relative">
                <AlertCircle className="absolute left-3 top-2 text-muted-foreground w-3.5 h-3.5" />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  minLength={8}
                  placeholder="••••••••" 
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold" 
                />
              </div>
            </div>

            {/* Compact Role Selector Cards */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                {t('auth.select_role')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* Pet Owner Option */}
                <div
                  onClick={() => setRole('pet_owner')}
                  className={`cursor-pointer py-2 px-1.5 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center gap-1 ${
                    role === 'pet_owner'
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary shadow-sm'
                      : 'border-border bg-pcp-surface hover:border-primary/50 text-muted-foreground'
                  }`}
                >
                  <span className="text-lg">🐕</span>
                  <span className="text-[10px] font-extrabold block truncate w-full">
                    {t('profile.roles.pet_owner')}
                  </span>
                </div>

                {/* Farmer Option */}
                <div
                  onClick={() => setRole('farmer')}
                  className={`cursor-pointer py-2 px-1.5 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center gap-1 ${
                    role === 'farmer'
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary shadow-sm'
                      : 'border-border bg-pcp-surface hover:border-primary/50 text-muted-foreground'
                  }`}
                >
                  <span className="text-lg">🐄</span>
                  <span className="text-[10px] font-extrabold block truncate w-full">
                    {t('profile.roles.farmer')}
                  </span>
                </div>

                {/* Service Provider Option */}
                <div
                  onClick={() => setRole('provider')}
                  className={`cursor-pointer py-2 px-1.5 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center gap-1 ${
                    role === 'provider'
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary shadow-sm'
                      : 'border-border bg-pcp-surface hover:border-primary/50 text-muted-foreground'
                  }`}
                >
                  <span className="text-lg">🏥</span>
                  <span className="text-[10px] font-extrabold block truncate w-full">
                    {t('profile.roles.provider')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {errorText && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex gap-1.5 items-center dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errorText}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={registerMutation.isPending} 
            className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all disabled:opacity-55"
          >
            {registerMutation.isPending && <Spinner size="sm" />}
            <span>{t('auth.btn_register')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-1 border-t border-border/40">
          <Link to="/login" className="text-[11px] text-primary hover:underline font-semibold">
            {t('auth.have_account')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register
