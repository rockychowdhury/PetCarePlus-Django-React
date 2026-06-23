import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useLanguage } from '../../hooks/useLanguage'
import { authApi } from '../../api/auth'
import { Menu, X, Languages, LogOut, LayoutGrid, Calendar, Power, Sparkles } from 'lucide-react'

export const Navbar = () => {
  const { language, setLanguage, t } = useLanguage()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = React.useRef(null)

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLanguageToggle = async () => {
    const nextLang = language === 'bn' ? 'en' : 'bn'
    setLanguage(nextLang)
    if (user) {
      try {
        await authApi.updateMe({ preferred_language: nextLang })
      } catch (err) {
        console.error('Failed to sync language to backend:', err)
      }
    }
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (e) {
      console.error('Logout API failed:', e)
    }
    logout()
    navigate('/')
    setIsOpen(false)
  }

  const navItems = [
    { name: language === 'bn' ? 'সেবাদাতা' : 'Providers', path: '/providers' },
    { name: language === 'bn' ? 'এআই সহকারী' : 'AI Assistant', path: '/ai-assistant' },
    { name: language === 'bn' ? 'দত্তক' : 'Rehoming', path: '/rehoming' },
    { name: language === 'bn' ? 'নির্দেশিকা' : 'Guidelines', path: '/guidelines' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50 supports-[backdrop-filter]:bg-background/60 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <Sparkles className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform" />
              <span className="text-xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                PetCarePlus
              </span>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Controls & Language */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Switcher */}
            <button
              onClick={handleLanguageToggle}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              title={language === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
            >
              <Languages className="w-4 h-4" />
              <span>{language === 'bn' ? 'EN' : 'BN'}</span>
            </button>

            {/* Divider */}
            <div className="w-px h-4 bg-border/60" />

            {user ? (
              <div className="relative flex items-center" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="truncate max-w-[100px]">{user.name}</span>
                  <Menu className="w-4 h-4" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 bg-card border border-border/50 rounded-xl shadow-lg py-2 animate-fade-in z-50">
                    <div className="px-4 py-2 mb-2 border-b border-border/30">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{t(`profile.roles.${user.role}`)}</p>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      {language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
                    </Link>
                    
                    <Link
                      to="/dashboard/bookings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      {language === 'bn' ? 'বুকিং' : 'Bookings'}
                    </Link>

                    <div className="mt-2 pt-2 border-t border-border/30">
                      <button
                        onClick={() => { setIsUserMenuOpen(false); handleLogout(); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {language === 'bn' ? 'লগআউট' : 'Logout'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {language === 'bn' ? 'লগইন' : 'Login'}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-colors"
                >
                  {language === 'bn' ? 'রেজিস্টার' : 'Sign Up'}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Button */}
          <div className="flex items-center md:hidden space-x-4">
            <button
              onClick={handleLanguageToggle}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Languages className="w-4 h-4" />
              <span className="text-xs font-bold">{language === 'bn' ? 'EN' : 'BN'}</span>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden border-b border-border/40 bg-background animate-fade-in shadow-md">
          <div className="px-4 pt-3 pb-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 pb-6 border-t border-border/40 px-4 space-y-3">
            {user ? (
              <div className="space-y-1">
                <div className="px-3 py-2 mb-2">
                  <div className="text-sm font-bold text-foreground">{user.name}</div>
                  <div className="text-xs text-muted-foreground capitalize mt-0.5">
                    {language === 'bn' && user.role === 'regular' ? 'সাধারণ ব্যবহারকারী' : 
                     language === 'bn' && user.role === 'provider' ? 'সেবাদাতা' : 
                     user.role}
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <LayoutGrid className="w-4.5 h-4.5" />
                  {language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
                </Link>
                
                <Link
                  to="/dashboard/bookings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Calendar className="w-4.5 h-4.5" />
                  {language === 'bn' ? 'বুকিং' : 'Bookings'}
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-500 hover:text-rose-600 rounded-lg hover:bg-rose-50/50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <Power className="w-4.5 h-4.5" />
                  {language === 'bn' ? 'লগআউট' : 'Logout'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {language === 'bn' ? 'লগইন' : 'Login'}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                >
                  {language === 'bn' ? 'রেজিস্টার' : 'Sign Up'}
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
