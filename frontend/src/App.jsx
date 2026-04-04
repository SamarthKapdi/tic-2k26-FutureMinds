import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import Layout from './components/Layout'
import Chatbot from './components/Chatbot'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ProfileSetup from './pages/ProfileSetup'
import Dashboard from './pages/Dashboard'
import Blood from './pages/Blood'
import Fund from './pages/Fund'
import Missing from './pages/Missing'
import MapView from './pages/MapView'
import Leaderboard from './pages/Leaderboard'
import Settings from './pages/Settings'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AboutUs from './pages/AboutUs'
import OurMission from './pages/OurMission'
import OurTeam from './pages/OurTeam'
import ContactUs from './pages/ContactUs'
import BloodInfo from './pages/BloodInfo'
import FundInfo from './pages/FundInfo'
import MissingInfo from './pages/MissingInfo'
import MapInfo from './pages/MapInfo'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import CookiePolicy from './pages/CookiePolicy'
import NotFound from './pages/NotFound'
import { Spinner } from './components/ui'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

function ProtectedRoute({ children, allowIncompleteProfile = false }) {
  const { isAuthenticated, loading, user } = useAuth()
  if (loading) return <Spinner size="lg" />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!allowIncompleteProfile && (!user?.name || !user.name.trim())) {
    return <Navigate to="/profile/setup" replace />
  }
  return children
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth()

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <Landing />
          </Layout>
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate
              to={user?.name ? '/dashboard' : '/profile/setup'}
              replace
            />
          ) : (
            <Layout>
              <Login />
            </Layout>
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Layout>
              <Register />
            </Layout>
          )
        }
      />
      <Route
        path="/profile/setup"
        element={
          <ProtectedRoute allowIncompleteProfile>
            <Layout>
              <ProfileSetup />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/blood"
        element={
          <ProtectedRoute>
            <Layout>
              <Blood />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/fund"
        element={
          <ProtectedRoute>
            <Layout>
              <Fund />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/missing"
        element={
          <ProtectedRoute>
            <Layout>
              <Missing />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/map"
        element={
          <ProtectedRoute>
            <Layout>
              <MapView />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Leaderboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Informational Public Routes */}
      <Route
        path="/info/blood"
        element={
          <Layout>
            <BloodInfo />
          </Layout>
        }
      />
      <Route
        path="/info/fund"
        element={
          <Layout>
            <FundInfo />
          </Layout>
        }
      />
      <Route
        path="/info/missing"
        element={
          <Layout>
            <MissingInfo />
          </Layout>
        }
      />
      <Route
        path="/info/map"
        element={
          <Layout>
            <MapInfo />
          </Layout>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/login"
        element={
          <Layout>
            <AdminLogin />
          </Layout>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <Layout>
            <AdminDashboard />
          </Layout>
        }
      />
      <Route
        path="/about"
        element={
          <Layout>
            <AboutUs />
          </Layout>
        }
      />
      <Route
        path="/mission"
        element={
          <Layout>
            <OurMission />
          </Layout>
        }
      />
      <Route
        path="/team"
        element={
          <Layout>
            <OurTeam />
          </Layout>
        }
      />
      <Route
        path="/contact"
        element={
          <Layout>
            <ContactUs />
          </Layout>
        }
      />
      <Route
        path="/privacy-policy"
        element={
          <Layout>
            <PrivacyPolicy />
          </Layout>
        }
      />
      <Route
        path="/terms-of-service"
        element={
          <Layout>
            <TermsOfService />
          </Layout>
        }
      />
      <Route
        path="/cookie-policy"
        element={
          <Layout>
            <CookiePolicy />
          </Layout>
        }
      />
      <Route
        path="*"
        element={
          <Layout>
            <NotFound />
          </Layout>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <AppRoutes />
            <Chatbot />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '12px',
                  background: '#1A1A2E',
                  color: '#fff',
                  fontSize: '14px',
                },
                success: {
                  iconTheme: { primary: '#2D6A4F', secondary: '#fff' },
                },
                error: { iconTheme: { primary: '#E63946', secondary: '#fff' } },
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
