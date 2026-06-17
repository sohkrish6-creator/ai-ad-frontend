import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Dashboard from './Dashboard'
import UrlInput from './UrlInput'
import Leads from './Leads'
import Nav from './Nav'

function Layout() {
  const location = useLocation()
  const showNav = location.pathname !== '/'

  return (
    <div style={{ display: 'flex' }}>
      {showNav && <Nav />}
      <div style={{
        marginLeft: showNav ? '200px' : '0',
        flex: 1,
        minHeight: '100vh',
      }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analyze" element={<UrlInput />} />
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