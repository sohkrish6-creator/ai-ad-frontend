import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Dashboard from './Dashboard'
import UrlInput from './UrlInput'
import Leads from './Leads'
import Competitor from './Competitor'
import AdIntel from './AdIntel'
import MarketingBrain from './MarketingBrain'
import Nav from './Nav'

function Layout() {
  const location = useLocation()
  const showNav = location.pathname !== '/'
  const isMobile = window.innerWidth < 768

  return (
    <div>
      {showNav && <Nav />}
      <div style={{
        marginLeft: showNav && !isMobile ? '200px' : '0',
        paddingBottom: showNav && isMobile ? '64px' : '0',
        minHeight: '100vh',
      }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/brain" element={<MarketingBrain />} />
          <Route path="/analyze" element={<UrlInput />} />
          <Route path="/competitor" element={<Competitor />} />
          <Route path="/ad-intel" element={<AdIntel />} />
          <Route path="/leads" element={<Leads />} />
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