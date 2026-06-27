import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { useLanguage } from '../../hooks/useLanguage'
import { authApi } from '../../api/auth'
import Spinner from '../../components/ui/Spinner'
import { ArrowRight, Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react'

export const Login = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorText, setErrorText] = useState('')
  const [successText, setSuccessText] = useState('')

  // Mutation to handle logging in
  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => authApi.login(email, password),
    onSuccess: (data) => {
      setSuccessText('লগইন সফল হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...')
      
      // Save to Zustand store
      login(data.user)
      
      setTimeout(() => {
        navigate('/dashboard')
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
    if (!email || !password) return
    loginMutation.mutate({ email, password })
  }

  const quickLogin = (qEmail) => {
    const qPassword = 'PetCarePlus'
    setEmail(qEmail)
    setPassword(qPassword)
    setErrorText('')
    setSuccessText('')
    loginMutation.mutate({ email: qEmail, password: qPassword })
  }

  return (
    <div className="min-h-screen w-full bg-pcp-surface/20 flex items-center justify-center p-4">
      <div className="bg-card border border-border/80 rounded-2xl shadow-lg w-full max-w-[420px] p-6 sm:p-8 space-y-6 animate-fade-in-up text-left">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-bold bg-gradient-to-r from-pcp-green to-pcp-green-light bg-clip-text text-transparent">
              PetCarePlus
            </span>
          </Link>
          <h2 className="text-lg sm:text-xl font-extrabold text-foreground">
            {t('auth.login_title')}
          </h2>
        </div>

        {/* Quick Login for Recruiters */}
        <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/50">
          <p className="text-xs font-semibold text-center text-muted-foreground uppercase tracking-wider">Quick Login (Recruiter Access)</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickLogin('owner@pcp.com')}
              className="py-2 px-1 bg-pcp-surface hover:bg-pcp-green/10 border border-border hover:border-pcp-green rounded-lg text-xs font-bold text-foreground transition-colors"
            >
              Pet Owner
            </button>
            <button
              type="button"
              onClick={() => quickLogin('farmer@pcp.com')}
              className="py-2 px-1 bg-pcp-surface hover:bg-amber-500/10 border border-border hover:border-amber-500 rounded-lg text-xs font-bold text-foreground transition-colors"
            >
              Farmer
            </button>
            <button
              type="button"
              onClick={() => quickLogin('provider@pcp.com')}
              className="py-2 px-1 bg-pcp-surface hover:bg-blue-500/10 border border-border hover:border-blue-500 rounded-lg text-xs font-bold text-foreground transition-colors"
            >
              Provider
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">
              {t('auth.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-muted-foreground w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">
              {t('auth.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-muted-foreground w-4 h-4" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-border bg-pcp-surface focus:outline-none focus:border-primary font-semibold"
              />
            </div>
          </div>

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
            disabled={loginMutation.isPending || !!successText}
            className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all disabled:opacity-55"
          >
            {loginMutation.isPending && <Spinner size="sm" />}
            <span>{t('auth.btn_login')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer link */}
        <div className="text-center pt-2">
          <Link
            to="/register"
            className="text-xs text-primary hover:underline font-semibold"
          >
            {t('auth.no_account')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
