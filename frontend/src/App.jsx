import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Spinner from './components/ui/Spinner'

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
