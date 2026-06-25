import React, { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useLocationStore } from './store/locationStore'
import { authApi } from './api/auth'
import Spinner from './components/ui/Spinner'
import toast from 'react-hot-toast'

// Lazy loaded page assemblies for peak performance
const Home = lazy(() => import('./pages/Home'))
const Guidelines = lazy(() => import('./pages/Guidelines'))
const GuidelineDetail = lazy(() => import('./pages/GuidelineDetail'))
const Vaccination = lazy(() => import('./pages/Vaccination'))
const GovtResources = lazy(() => import('./pages/GovtResources'))
const Providers = lazy(() => import('./pages/Providers'))
const ProviderDetail = lazy(() => import('./pages/ProviderDetail'))
const AIAssistant = lazy(() => import('./pages/AIAssistant'))
const Rehoming = lazy(() => import('./pages/Rehoming'))
const RehomingDetail = lazy(() => import('./pages/RehomingDetail'))
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))

// Dashboard
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'))
const DashboardSettings = lazy(() => import('./pages/dashboard/DashboardSettings'))
const DashboardBookings = lazy(() => import('./pages/dashboard/DashboardBookings'))
const DashboardRehoming = lazy(() => import('./pages/dashboard/DashboardRehoming'))
const DashboardFavorites = lazy(() => import('./pages/dashboard/DashboardFavorites'))
const DashboardAISessions = lazy(() => import('./pages/dashboard/DashboardAISessions'))
const DashboardProviderProfile = lazy(() => import('./pages/dashboard/DashboardProviderProfile'))
const DashboardProviderServices = lazy(() => import('./pages/dashboard/DashboardProviderServices'))

// Route Guard: restricts access to logged-in users only
const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user)
  return user ? children : <Navigate to="/login" replace />
}

// Route Guard: restricts logged-in users from hitting login/register
const AnonymousRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user)
  return !user ? children : <Navigate to="/dashboard" replace />
}

// Global Auth Provider to keep local state synced with backend and block UI until initialized
const AuthProvider = ({ children }) => {
  const { user, isInitializing, setUser, setInitializing, logout } = useAuthStore()

  useEffect(() => {
    // Attempt to fetch profile on load. Cookies are handled securely by the browser.
    authApi.getMe()
      .then(data => setUser(data))
      .catch(err => {
        console.warn("Auth initialization failed (no active session):", err)
        setInitializing(false)
        if (user) logout()
      })
  }, [])

  // UI block removed to allow navbar to load while authenticating
  return children
}

const ScrollToTop = () => {
  const { pathname } = useLocation()
  
  useEffect(() => {
    // Force instant scroll to avoid weird visual sliding when navigating
    document.documentElement.style.scrollBehavior = 'auto'
    window.scrollTo(0, 0)
    document.documentElement.style.scrollBehavior = ''
  }, [pathname])
  
  return null
}

export const App = () => {
  const { division, setLocation } = useLocationStore()
  const language = useAuthStore((state) => state.language)

  useEffect(() => {
    // Only ask for geolocation if location is not set in store yet
    if (!division && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            )
            const data = await res.json()
            if (data && data.address) {
              const addr = data.address
              const divName = addr.state?.replace(' Division', '') || ''
              const distName = (addr.state_district || addr.county || addr.city)?.replace(' District', '') || ''
              const upzName = addr.city || addr.town || addr.county || ''
              const unionName = addr.suburb || addr.village || addr.neighbourhood || ''

              setLocation({
                division: divName,
                district: distName,
                upazila: upzName,
                union: unionName,
                latitude,
                longitude,
              })
            }
          } catch (e) {
            console.error('Auto location detection failed:', e)
          }
        },
        (error) => {
          console.warn('Geolocation permission denied or failed:', error)
          if (error.code === error.PERMISSION_DENIED) {
            const msg = language === 'bn'
              ? 'লোকেশন পারমিশন ব্লক করা! লোকাল ডাক্তারদের দেখতে উপরের "ম্যাপ পিন" আইকনে ক্লিক করে ম্যানুয়ালি সেট করুন।'
              : 'Location permission blocked! Click the "Map Pin" icon at the top to set your location manually.'
            
            toast(msg, {
              duration: 8000,
              icon: '📍',
              style: {
                background: '#fff3cd',
                color: '#856404',
                border: '1px solid #ffeeba',
                fontSize: '12px',
                fontWeight: 'bold',
              }
            })
          }
        }
      )
    }
  }, [division, setLocation, language])
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen bg-background">
              <Spinner size="lg" />
            </div>
          }
        >
          <Routes>
            {/* Public Content Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/guidelines" element={<Guidelines />} />
            <Route path="/guidelines/:id" element={<GuidelineDetail />} />
            <Route path="/vaccination" element={<Vaccination />} />
            <Route path="/resources" element={<GovtResources />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/providers/:id" element={<ProviderDetail />} />

            {/* Protected Content Routes */}
            <Route path="/ai-assistant" element={
              <ProtectedRoute>
                <AIAssistant />
              </ProtectedRoute>
            } />
            <Route path="/rehoming" element={
              <ProtectedRoute>
                <Rehoming />
              </ProtectedRoute>
            } />
            <Route path="/rehoming/:id" element={
              <ProtectedRoute>
                <RehomingDetail />
              </ProtectedRoute>
            } />

            {/* Anonymous Auth Routes */}
            <Route
              path="/login"
              element={
                <AnonymousRoute>
                  <Login />
                </AnonymousRoute>
              }
            />
            <Route
              path="/register"
              element={
                <AnonymousRoute>
                  <Register />
                </AnonymousRoute>
              }
            />

            {/* Secure Authenticated Routes - Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="bookings" replace />} />
              <Route path="settings" element={<DashboardSettings />} />
              <Route path="bookings" element={<DashboardBookings />} />
              <Route path="rehoming" element={<DashboardRehoming />} />
              <Route path="favorites" element={<DashboardFavorites />} />
              <Route path="ai-sessions" element={<DashboardAISessions />} />
              <Route path="provider-profile" element={<DashboardProviderProfile />} />
              <Route path="services" element={<DashboardProviderServices />} />
            </Route>

            {/* Wildcard Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
