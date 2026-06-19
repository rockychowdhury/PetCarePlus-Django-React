import React from 'react'
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useLanguage } from '../../hooks/useLanguage'
import { LayoutDashboard, Calendar, Settings, Heart, Briefcase, PlusCircle, Activity } from 'lucide-react'
import Navbar from '../layout/Navbar'
import Footer from '../layout/Footer'

const DashboardLayout = () => {
  const { user, token } = useAuthStore()
  const { language, t } = useLanguage()
  const location = useLocation()

  // Protect Dashboard: redirect to login if no token
  if (!token) {
    return <Navigate to="/login" replace />
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
      <Navbar />
      
      <div className="flex-1 flex flex-col md:flex-row w-full overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-72 bg-card border-r border-border flex flex-col flex-shrink-0 z-10 shadow-sm overflow-y-auto">
          <div className="hidden md:flex items-center gap-4 px-6 py-6 border-b border-border/50">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-extrabold shadow-sm">
              {user?.name?.charAt(0) || user?.first_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden text-left">
              <h3 className="font-bold text-base text-foreground truncate">{user?.name || user?.first_name}</h3>
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
          </nav>
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
