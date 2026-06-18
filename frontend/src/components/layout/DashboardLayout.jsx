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
        icon: <Activity className="w-5 h-5" />
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
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-card border-r border-border flex-shrink-0 p-4 space-y-4">
          <div className="hidden md:flex items-center gap-3 px-2 py-3 border-b border-border/50">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
              {user?.name?.charAt(0) || user?.first_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden text-left">
              <h3 className="font-bold text-sm text-foreground truncate">{user?.name || user?.first_name}</h3>
              <p className="text-xs text-muted-foreground capitalize truncate">{t(`profile.roles.${role}`)}</p>
            </div>
          </div>

          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {links.map((link) => {
              const isActive = location.pathname.startsWith(link.path)
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-pcp-surface hover:text-foreground'
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-pcp-surface/20 min-w-0">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  )
}

export default DashboardLayout
