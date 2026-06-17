import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useLanguage } from '../../hooks/useLanguage'
import { authApi } from '../../api/auth'
import { Menu, X, Globe, User, LogOut, Calendar, Heart, Info, PhoneCall } from 'lucide-react'

export const Navbar = () => {
  const { language, setLanguage, t } = useLanguage()
  const { user, logout, token } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageToggle = async () => {
    const nextLang = language === 'bn' ? 'en' : 'bn'
    setLanguage(nextLang)
    if (token && user) {
      try {
        await authApi.updateMe({ preferred_language: nextLang })
      } catch (err) {
        console.error('Failed to sync language to backend:', err)
      }
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsOpen(false)
  }

  const navItems = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.guidelines'), path: '/guidelines' },
    { name: t('nav.vaccination'), path: '/vaccination' },
    { name: t('nav.providers'), path: '/providers' },
    { name: t('nav.rehoming'), path: '/rehoming' },
    { name: t('nav.govt_resources'), path: '/resources' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/80 supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shadow-sm border border-primary/20 shrink-0 bg-[#CBE8B9]">
                <img src="/favicon.png" alt="PetCarePlus Logo" className="w-[110%] h-auto max-w-none object-cover" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-pcp-green to-pcp-green-light bg-clip-text text-transparent tracking-tight">
                PetCarePlus
              </span>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-primary bg-secondary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Controls & Language */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Language Switcher Button */}
            <button
              onClick={handleLanguageToggle}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors flex items-center gap-1.5 border border-transparent hover:border-border hover:bg-muted/30"
              title={language === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
            >
              <Globe className="w-4.5 h-4.5" />
              <span className="text-xs font-semibold">
                {language === 'bn' ? 'EN' : 'বাং'}
              </span>
            </button>

            {token && user ? (
              <div className="flex items-center space-x-1">
                <Link
                  to="/bookings"
                  className={`p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors border border-transparent hover:border-border hover:bg-muted/30 flex items-center gap-1`}
                  title={t('nav.bookings')}
                >
                  <Calendar className="w-4.5 h-4.5" />
                </Link>
                <Link
                  to="/profile"
                  className={`p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors border border-transparent hover:border-border hover:bg-muted/30 flex items-center gap-1`}
                  title={t('nav.profile')}
                >
                  <User className="w-4.5 h-4.5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-sm"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Button */}
          <div className="flex items-center md:hidden space-x-2">
            {/* Language Switcher on mobile navbar directly */}
            <button
              onClick={handleLanguageToggle}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg border border-border/60 hover:bg-muted/30 flex items-center gap-1"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-bold">{language === 'bn' ? 'EN' : 'বাং'}</span>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg border border-border/60 hover:bg-muted/30"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                  isActive(item.path)
                    ? 'text-primary bg-secondary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 pb-4 border-t border-border px-4 space-y-2">
            {token && user ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="bg-primary/10 text-primary p-2 rounded-full">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{user.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {t(`profile.roles.${user.role}`)}
                    </div>
                  </div>
                </div>

                <Link
                  to="/bookings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-base font-semibold text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                  {t('nav.bookings')}
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-base font-semibold text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <User className="w-5 h-5" />
                  {t('nav.profile')}
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-base font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
