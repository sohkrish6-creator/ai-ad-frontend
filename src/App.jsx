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
import OrganicIntelligence from './OrganicIntelligence'
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
import VoiceOutreachBatchBuilder from './VoiceOutreachBatchBuilder'
import VoiceOutreachReview from './VoiceOutreachReview'
import VoiceOutreachDNC from './VoiceOutreachDNC'
import VoiceOutreachSettings from './VoiceOutreachSettings'
import VoiceOutreachCallDashboard from './VoiceOutreachCallDashboard'
import VoiceOutreachCallDetail from './VoiceOutreachCallDetail'
import VoiceOutreachAnalytics from './VoiceOutreachAnalytics'
import RevenueEngineGoal from './RevenueEngineGoal'
import RevenueEnginePipeline from './RevenueEnginePipeline'
import RevenueEngineToday from './RevenueEngineToday'
import RevenueEngineLeadWorkspace from './RevenueEngineLeadWorkspace'
import RevenueEngineSettings from './RevenueEngineSettings'
import SalesHub from './SalesHub'
import MarketingHub from './MarketingHub'
import IntelligenceHub from './IntelligenceHub'
import AnalyticsHub from './AnalyticsHub'
import SettingsHub from './SettingsHub'
import Nav from './Nav'
import { ToastProvider } from './ToastContext'
import CommandPalette from './CommandPalette'
import { RefreshCw } from 'lucide-react'
import { INK, GOLD, BONE, MUTED, SLATE, SLATE_L, FONT_BODY } from './ds'

// Post-audit fix (Item 3): loading used to render `null` unconditionally,
// so a Supabase getSession() failure (network blip, outage, storage read
// error) left the whole app on a permanent blank page — no error, no
// retry, nothing a user would recognize as a failure rather than their
// own connection being broken. AuthContext now surfaces `authError`
// (including a timeout on a hung request) and a `retry()` that re-runs
// the real check.
function AuthErrorScreen({ authError, retry }) {
  return (
    <div style={{
      minHeight: '100vh', background: INK, color: BONE, fontFamily: FONT_BODY,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div style={{
        maxWidth: '380px', width: '100%', background: SLATE, border: `1px solid ${SLATE_L}`,
        borderRadius: '10px', padding: '28px', textAlign: 'center',
      }}>
        <p style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: '700' }}>Couldn't verify your session</p>
        <p style={{ margin: '0 0 20px', fontSize: '13px', color: MUTED, lineHeight: 1.5 }}>{authError}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={retry} style={{
            display: 'flex', alignItems: 'center', gap: '6px', background: GOLD, border: 'none',
            color: '#0B0B0D', padding: '9px 16px', borderRadius: '7px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
          }}>
            <RefreshCw size={13} /> Retry
          </button>
          <a href="/login" style={{
            display: 'flex', alignItems: 'center', color: MUTED, padding: '9px 16px', borderRadius: '7px',
            fontSize: '13px', fontWeight: '600', textDecoration: 'none', border: `1px solid ${SLATE_L}`,
          }}>
            Sign in
          </a>
        </div>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading, authError, retry } = useAuth()
  if (authError) return <AuthErrorScreen authError={authError} retry={retry} />
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
          <Route path="/organic-intelligence" element={<ProtectedRoute><OrganicIntelligence /></ProtectedRoute>} />
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
          <Route path="/voice-outreach" element={<ProtectedRoute><VoiceOutreachBatchBuilder /></ProtectedRoute>} />
          <Route path="/voice-outreach/review/:batchId" element={<ProtectedRoute><VoiceOutreachReview /></ProtectedRoute>} />
          <Route path="/voice-outreach/dnc" element={<ProtectedRoute><VoiceOutreachDNC /></ProtectedRoute>} />
          <Route path="/voice-outreach/settings" element={<ProtectedRoute><VoiceOutreachSettings /></ProtectedRoute>} />
          <Route path="/voice-outreach/calls" element={<ProtectedRoute><VoiceOutreachCallDashboard /></ProtectedRoute>} />
          <Route path="/voice-outreach/calls/:callId" element={<ProtectedRoute><VoiceOutreachCallDetail /></ProtectedRoute>} />
          <Route path="/voice-outreach/analytics" element={<ProtectedRoute><VoiceOutreachAnalytics /></ProtectedRoute>} />
          <Route path="/revenue-engine" element={<ProtectedRoute><RevenueEngineGoal /></ProtectedRoute>} />
          <Route path="/revenue-engine/pipeline" element={<ProtectedRoute><RevenueEnginePipeline /></ProtectedRoute>} />
          <Route path="/revenue-engine/today" element={<ProtectedRoute><RevenueEngineToday /></ProtectedRoute>} />
          <Route path="/revenue-engine/lead/:prospectId" element={<ProtectedRoute><RevenueEngineLeadWorkspace /></ProtectedRoute>} />
          <Route path="/revenue-engine/settings" element={<ProtectedRoute><RevenueEngineSettings /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><SalesHub /></ProtectedRoute>} />
          <Route path="/marketing" element={<ProtectedRoute><MarketingHub /></ProtectedRoute>} />
          <Route path="/intel" element={<ProtectedRoute><IntelligenceHub /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsHub /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsHub /></ProtectedRoute>} />
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