import React, { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useLocationStore } from './store/locationStore'
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
const Bookings = lazy(() => import('./pages/Bookings'))
const Profile = lazy(() => import('./pages/Profile'))
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))

// Route Guard: restricts access to logged-in users only
const ProtectedRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token)
  return token ? children : <Navigate to="/login" replace />
}

// Route Guard: restricts logged-in users from hitting login/register
const AnonymousRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token)
  return !token ? children : <Navigate to="/profile" replace />
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
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/rehoming" element={<Rehoming />} />

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

          {/* Secure Authenticated Routes */}
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Wildcard Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
