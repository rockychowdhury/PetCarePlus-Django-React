import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useLanguage } from '../../hooks/useLanguage'
import { authApi } from '../../api/auth'
import { Menu, X, Languages, LogOut, LayoutGrid, Calendar, Power } from 'lucide-react'

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
    <nav className="sticky top-0 z-50 bg-white/70 dark:bg-black/50 backdrop-blur-2xl border-b border-border/40 shadow-[0_4px_30px_rgba(0,0,0,0.03)] supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-sm border border-primary/20 shrink-0 bg-[#CBE8B9] group-hover:scale-105 transition-transform duration-300">
                <img src="/favicon.png" alt="PetCarePlus Logo" className="w-[110%] h-auto max-w-none object-cover" />
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent tracking-tight">
                PetCarePlus
              </span>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  isActive(item.path)
                    ? 'text-primary bg-primary/10 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Controls & Language */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Language Switcher Button */}
            <button
              onClick={handleLanguageToggle}
              className="px-3 py-2 text-muted-foreground hover:text-foreground rounded-xl transition-all duration-300 flex items-center gap-1.5 border border-border/40 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm"
              title={language === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
            >
              <Languages className="w-4 h-4 text-primary" />
              <span className="text-xs font-black tracking-wider">
                {language === 'bn' ? 'EN' : 'BN'}
              </span>
            </button>

            {user ? (
              <div className="relative flex items-center" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-xl transition-all duration-300 border border-border/40 hover:border-primary/30 shadow-sm"
                  title="User Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-60 bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-xl py-2 animate-fade-in z-50">
                    <div className="px-5 py-4 border-b border-border/40 mb-2 bg-muted/10">
                      <p className="text-sm font-extrabold text-foreground truncate">{user.name}</p>
                      <p className="text-xs font-bold text-primary capitalize mt-1">
                        {language === 'bn' && user.role === 'regular' ? 'সাধারণ ব্যবহারকারী' : 
                         language === 'bn' && user.role === 'provider' ? 'সেবাদাতা' : 
                         user.role}
                      </p>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <LayoutGrid className="w-4.5 h-4.5" />
                      {language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
                    </Link>
                    
                    <Link
                      to="/dashboard/bookings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Calendar className="w-4.5 h-4.5" />
                      {language === 'bn' ? 'বুকিং' : 'Bookings'}
                    </Link>

                    <div className="mt-2 pt-2 border-t border-border/40">
                      <button
                        onClick={() => { setIsUserMenuOpen(false); handleLogout(); }}
                        className="w-full flex items-center gap-3 px-5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-4.5 h-4.5" />
                        {language === 'bn' ? 'লগআউট' : 'Logout'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3 pl-2">
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  {language === 'bn' ? 'লগইন' : 'Login'}
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all duration-300 shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5"
                >
                  {language === 'bn' ? 'রেজিস্টার' : 'Sign Up'}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Button */}
          <div className="flex items-center md:hidden space-x-3">
            <button
              onClick={handleLanguageToggle}
              className="p-2 text-muted-foreground hover:text-foreground rounded-xl border border-border/40 hover:bg-primary/5 flex items-center gap-1.5 shadow-sm"
            >
              <Languages className="w-4 h-4 text-primary" />
              <span className="text-xs font-black">{language === 'bn' ? 'EN' : 'BN'}</span>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-muted-foreground hover:text-foreground rounded-xl border border-border/40 hover:bg-muted/30 shadow-sm"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden border-b border-border/40 bg-white/95 dark:bg-black/95 backdrop-blur-2xl animate-fade-in shadow-xl">
          <div className="px-4 pt-3 pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-bold transition-colors ${
                  isActive(item.path)
                    ? 'text-primary bg-primary/10 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 pb-6 border-t border-border/40 px-4 space-y-3">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-4 px-4 py-3 bg-muted/20 rounded-xl border border-border/40">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-full">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-foreground">{user.name}</div>
                    <div className="text-xs font-bold text-primary capitalize mt-0.5">
                      {language === 'bn' && user.role === 'regular' ? 'সাধারণ ব্যবহারকারী' : 
                       language === 'bn' && user.role === 'provider' ? 'সেবাদাতা' : 
                       user.role}
                    </div>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-base font-bold text-muted-foreground hover:text-primary rounded-xl hover:bg-primary/10 transition-colors"
                >
                  <LayoutGrid className="w-5 h-5" />
                  {language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
                </Link>
                
                <Link
                  to="/dashboard/bookings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-base font-bold text-muted-foreground hover:text-primary rounded-xl hover:bg-primary/10 transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                  {language === 'bn' ? 'বুকিং' : 'Bookings'}
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-base font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                >
                  <Power className="w-5 h-5" />
                  {language === 'bn' ? 'লগআউট' : 'Logout'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3 text-sm font-bold text-muted-foreground hover:text-foreground border border-border/60 rounded-xl hover:bg-muted/30 transition-colors shadow-sm"
                >
                  {language === 'bn' ? 'লগইন' : 'Login'}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-md transition-colors"
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
