import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import ErrorBoundary from './ErrorBoundary'
import { AuthProvider, useAuth } from './AuthContext'
import Login from './Login'
import Signup from './Signup'
import ForgotPassword from './ForgotPassword'
import Account from './Account'
import Dashboard from './Dashboard'
import UrlInput from './UrlInput'
import Leads from './Leads'
import Competitor from './Competitor'
import AdIntel from './AdIntel'
import MarketingBrain from './MarketingBrain'
import AdCreative from './AdCreative'
import AudienceFinder from './AudienceFinder'
import Intelligence from './Intelligence'
import YouTube from './YouTube'
import OpportunityEngine from './OpportunityEngine'
import OfferIntelligence from './OfferIntelligence'
import WebsiteAudit from './WebsiteAudit'
import VisibilityIntelligence from './VisibilityIntelligence'
import OutreachAI from './OutreachAI'
import KPIEngine from './KPIEngine'
import PerformanceIntelligence from './PerformanceIntelligence'
import AIOptimizer from './AIOptimizer'
import ResultCenter from './ResultCenter'
import ProspectDiscovery from './ProspectDiscovery'
import CricketAds from './CricketAds'
import GoogleAdsConnect from './GoogleAdsConnect'
import GoogleAdsDashboard from './GoogleAdsDashboard'
import AccountAudit from './AccountAudit'
import MetaAdsTest from './MetaAdsTest'
import SmartAnalysis from './SmartAnalysis'
import SocialIntelligence from './SocialIntelligence'
import History from './History'
import CreativeStudio from './CreativeStudio'
import CommandCenter from './CommandCenter'
import MarketingIntelligence from './MarketingIntelligence'
import CreatorFinder from './CreatorFinder'
import InstagramCoach from './InstagramCoach'
import Nav from './Nav'
import { ToastProvider } from './ToastContext'
import CommandPalette from './CommandPalette'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

const AUTH_PATHS = new Set(['/login', '/signup', '/forgot-password'])

function Layout() {
  const location = useLocation()
  const isAuthPage = AUTH_PATHS.has(location.pathname)
  const showNav = !isAuthPage && location.pathname !== '/'
  const isMobile = window.innerWidth < 768

  return (
    <div>
      <ScrollToTop />
      {showNav && <Nav />}
      {!isAuthPage && <CommandPalette />}
      <div style={{
        marginLeft: showNav && !isMobile ? '220px' : '0',
        paddingTop: showNav && isMobile ? '48px' : '0',
        minHeight: '100vh',
        background: 'var(--ink)',
        overflowX: 'hidden',
        width: showNav && !isMobile ? 'calc(100% - 220px)' : '100%',
        boxSizing: 'border-box',
      }}>
        <ErrorBoundary>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected app routes */}
          <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/intelligence" element={<ProtectedRoute><Intelligence /></ProtectedRoute>} />
          <Route path="/brain" element={<ProtectedRoute><MarketingBrain /></ProtectedRoute>} />
          <Route path="/ad-creative" element={<ProtectedRoute><AdCreative /></ProtectedRoute>} />
          <Route path="/audience" element={<ProtectedRoute><AudienceFinder /></ProtectedRoute>} />
          <Route path="/analyze" element={<ProtectedRoute><UrlInput /></ProtectedRoute>} />
          <Route path="/competitor" element={<ProtectedRoute><Competitor /></ProtectedRoute>} />
          <Route path="/ad-intel" element={<ProtectedRoute><AdIntel /></ProtectedRoute>} />
          <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
          <Route path="/youtube" element={<ProtectedRoute><YouTube /></ProtectedRoute>} />
          <Route path="/opportunity" element={<ProtectedRoute><OpportunityEngine /></ProtectedRoute>} />
          <Route path="/offer" element={<ProtectedRoute><OfferIntelligence /></ProtectedRoute>} />
          <Route path="/website-audit" element={<ProtectedRoute><WebsiteAudit /></ProtectedRoute>} />
          <Route path="/visibility" element={<ProtectedRoute><VisibilityIntelligence /></ProtectedRoute>} />
          <Route path="/outreach" element={<ProtectedRoute><OutreachAI /></ProtectedRoute>} />
          <Route path="/kpi-engine" element={<ProtectedRoute><KPIEngine /></ProtectedRoute>} />
          <Route path="/performance" element={<ProtectedRoute><PerformanceIntelligence /></ProtectedRoute>} />
          <Route path="/ai-optimizer" element={<ProtectedRoute><AIOptimizer /></ProtectedRoute>} />
          <Route path="/result-center" element={<ProtectedRoute><ResultCenter /></ProtectedRoute>} />
          <Route path="/prospects" element={<ProtectedRoute><ProspectDiscovery /></ProtectedRoute>} />
          <Route path="/cricket-ads" element={<ProtectedRoute><CricketAds /></ProtectedRoute>} />
          <Route path="/google-ads" element={<ProtectedRoute><GoogleAdsConnect /></ProtectedRoute>} />
          <Route path="/google-ads/dashboard" element={<ProtectedRoute><GoogleAdsDashboard /></ProtectedRoute>} />
          <Route path="/account-audit" element={<ProtectedRoute><AccountAudit /></ProtectedRoute>} />
          <Route path="/meta-test" element={<ProtectedRoute><MetaAdsTest /></ProtectedRoute>} />
          <Route path="/smart-analysis" element={<ProtectedRoute><SmartAnalysis /></ProtectedRoute>} />
          <Route path="/social-intelligence" element={<ProtectedRoute><SocialIntelligence /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/creative-studio" element={<ProtectedRoute><CreativeStudio /></ProtectedRoute>} />
          <Route path="/command-center" element={<ProtectedRoute><CommandCenter /></ProtectedRoute>} />
          <Route path="/creator-finder" element={<ProtectedRoute><CreatorFinder /></ProtectedRoute>} />
          <Route path="/instagram-coach" element={<ProtectedRoute><InstagramCoach /></ProtectedRoute>} />
          <Route path="/marketing-intelligence" element={<ProtectedRoute><MarketingIntelligence /></ProtectedRoute>} />
          <Route path="/creative-director" element={<Navigate to="/creative-studio" replace />} />
          <Route path="/ad-to-creative" element={<Navigate to="/creative-studio" replace />} />
        </Routes>
        </ErrorBoundary>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App