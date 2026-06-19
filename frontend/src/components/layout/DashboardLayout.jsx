import React from 'react'
import { Link, useLocation, useNavigate, Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useLanguage } from '../../hooks/useLanguage'
import { LayoutDashboard, Calendar, Settings, Heart, Briefcase, PlusCircle, Activity } from 'lucide-react'

import { authApi } from '../../api/auth'

const DashboardLayout = () => {
  const { user, logout } = useAuthStore()
  const { language, t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (e) {
      console.error('Logout API failed:', e)
    }
    logout()
    navigate('/login')
  }

  const role = user?.role || 'pet_owner'

  // Define sidebar links based on role
  const getSidebarLinks = () => {
    const links = []

    // Links for everyone
    links.push({
      name: t('nav.bookings'),
      path: '/dashboard/bookings',
      icon: <Calendar className="w-5 h-5" />
    })

    if (role === 'pet_owner' || role === 'farmer') {
      links.push({
        name: language === 'bn' ? 'আমার রিহোমিং' : 'My Rehoming',
        path: '/dashboard/rehoming',
        icon: <LayoutDashboard className="w-5 h-5" />
      })
      links.push({
        name: language === 'bn' ? 'প্রিয় সেবাদাতা' : 'Favorite Providers',
        path: '/dashboard/favorites',
        icon: <Heart className="w-5 h-5" />
      })
      links.push({
        name: language === 'bn' ? 'এআই সেশন' : 'AI Sessions',
        path: '/dashboard/ai-sessions',
        icon: <Activity className="w-5 h-5" />
      })
    }

    if (role === 'provider') {
      links.push({
        name: language === 'bn' ? 'ব্যবসার প্রোফাইল' : 'Business Profile',
        path: '/dashboard/provider-profile',
        icon: <Briefcase className="w-5 h-5" />
      })
      links.push({
        name: language === 'bn' ? 'আমার সেবাসমূহ' : 'My Services',
        path: '/dashboard/services',
        icon: <PlusCircle className="w-5 h-5" />
      })
    }

    // Settings at the end
    links.push({
      name: t('nav.profile'), // 'Settings'
      path: '/dashboard/settings',
      icon: <Settings className="w-5 h-5" />
    })

    return links
  }

  const links = getSidebarLinks()

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      
      <div className="flex-1 flex flex-col md:flex-row w-full overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-72 bg-pcp-surface/40 dark:bg-pcp-surface/10 border-r border-border flex flex-col flex-shrink-0 z-10 shadow-sm overflow-y-auto">
          <div className="p-4 border-b border-border/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm overflow-hidden">
              {user?.photo_url ? (
                <img src={user?.photo_url} alt={user?.name || user?.full_name || 'User'} className="w-full h-full object-cover" />
              ) : (
                (user?.name || user?.full_name || 'U').charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-extrabold text-foreground truncate">{user?.name || user?.full_name}</h3>
              <p className="text-xs font-semibold text-pcp-green uppercase tracking-wider truncate mt-0.5">{t(`profile.roles.${role}`)}</p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible no-scrollbar">
            {links.map((link) => {
              const isActive = location.pathname.startsWith(link.path)
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 dark:text-indigo-400 dark:from-indigo-900/40 dark:to-purple-900/40'
                      : 'text-muted-foreground hover:bg-pcp-surface hover:text-foreground'
                  }`}
                >
                  <div className={`transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground group-hover:text-foreground'}`}>
                    {link.icon}
                  </div>
                  <span>{link.name}</span>
                </Link>
              )
            })}
            <Link
              to="/dashboard/favorites"
              className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap group ${
                location.pathname === '/dashboard/favorites'
                  ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 dark:text-indigo-400 dark:from-indigo-900/40 dark:to-purple-900/40'
                  : 'text-muted-foreground hover:bg-pcp-surface hover:text-foreground'
              }`}
            >
              <div className={`transition-colors ${location.pathname === '/dashboard/favorites' ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground group-hover:text-foreground'}`}>
                <Heart className="w-5 h-5" />
              </div>
              <span>{language === 'bn' ? 'ফেভারিট সেবাদাতা' : 'Favorite Providers'}</span>
            </Link>
          </nav>

          <div className="p-4 mt-auto border-t border-border/50 space-y-1">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-pcp-surface transition-all group"
            >
              <svg className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {language === 'bn' ? 'হোমে ফিরে যান' : 'Back to Home'}
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all group"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {language === 'bn' ? 'লগআউট' : 'Logout'}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-pcp-surface/20 min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
