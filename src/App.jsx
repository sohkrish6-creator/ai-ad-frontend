import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
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
import MetaAdsTest from './MetaAdsTest'
import Nav from './Nav'

function Layout() {
  const location = useLocation()
  const showNav = location.pathname !== '/'
  const isMobile = window.innerWidth < 768

  return (
    <div>
      {showNav && <Nav />}
      <div style={{
        marginLeft: showNav && !isMobile ? '220px' : '0',
        paddingTop: showNav && isMobile ? '48px' : '0',
        minHeight: '100vh',
        background: '#FAFAFA',
        overflowX: 'hidden',
        width: showNav && !isMobile ? 'calc(100% - 220px)' : '100%',
        boxSizing: 'border-box',
      }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/intelligence" element={<Intelligence />} />
          <Route path="/brain" element={<MarketingBrain />} />
          <Route path="/ad-creative" element={<AdCreative />} />
          <Route path="/audience" element={<AudienceFinder />} />
          <Route path="/analyze" element={<UrlInput />} />
          <Route path="/competitor" element={<Competitor />} />
          <Route path="/ad-intel" element={<AdIntel />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/youtube" element={<YouTube />} />
          <Route path="/opportunity" element={<OpportunityEngine />} />
          <Route path="/offer" element={<OfferIntelligence />} />
          <Route path="/website-audit" element={<WebsiteAudit />} />
          <Route path="/visibility" element={<VisibilityIntelligence />} />
          <Route path="/outreach" element={<OutreachAI />} />
          <Route path="/kpi-engine" element={<KPIEngine />} />
          <Route path="/performance" element={<PerformanceIntelligence />} />
          <Route path="/ai-optimizer" element={<AIOptimizer />} />
          <Route path="/result-center" element={<ResultCenter />} />
          <Route path="/prospects" element={<ProspectDiscovery />} />
          <Route path="/cricket-ads" element={<CricketAds />} />
          <Route path="/google-ads" element={<GoogleAdsConnect />} />
          <Route path="/google-ads/dashboard" element={<GoogleAdsDashboard />} />
          <Route path="/meta-test" element={<MetaAdsTest />} />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App