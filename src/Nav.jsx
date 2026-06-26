import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Dna, Brain, Globe, Search,
  Radio, Palette, Target, Users, Menu, X, PlaySquare, TrendingUp, Gift, Monitor, Eye, MessageSquare, BarChart2, Activity,
} from 'lucide-react'

const GOLD = '#D4AF37'

const links = [
  { path: '/dashboard',    label: 'Dashboard',       Icon: LayoutDashboard },
  { path: '/intelligence', label: 'BI Platform',     Icon: Dna             },
  { path: '/brain',        label: 'Marketing Brain', Icon: Brain           },
  { path: '/analyze',      label: 'AI Analyzer',     Icon: Globe           },
  { path: '/competitor',   label: 'Competitor',      Icon: Search          },
  { path: '/ad-intel',     label: 'Ad Intel',        Icon: Radio           },
  { path: '/ad-creative',  label: 'Ad Creative',     Icon: Palette         },
  { path: '/audience',     label: 'Audience Finder', Icon: Target          },
  { path: '/leads',        label: 'Leads',           Icon: Users           },
  { path: '/youtube',      label: 'YouTube Intel',   Icon: PlaySquare      },
  { path: '/opportunity',  label: 'Opportunity',     Icon: TrendingUp      },
  { path: '/offer',         label: 'Offer Intel',     Icon: Gift            },
  { path: '/website-audit',   label: 'Website Audit',  Icon: Monitor         },
  { path: '/visibility',     label: 'Visibility',     Icon: Eye             },
  { path: '/outreach',       label: 'Outreach AI',    Icon: MessageSquare   },
  { path: '/kpi-engine',    label: 'KPI Engine',     Icon: BarChart2       },
  { path: '/performance',   label: 'Performance',    Icon: Activity        },
]

function Nav() {
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const isMobile = window.innerWidth < 768

  // ── MOBILE: top bar + slide-in drawer ────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <style>{`
          .nav-drawer-link { text-decoration: none; transition: background 0.12s ease; }
          .nav-drawer-link:not(.active):hover { background: #F5F5F5 !important; }
        `}</style>

        {/* Fixed top bar */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '48px',
          background: '#fff', borderBottom: '1px solid #EAEAEA',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', zIndex: 1000, boxSizing: 'border-box',
        }}>
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', margin: '-6px', display: 'flex', alignItems: 'center' }}
          >
            <Menu size={20} color="#171717" />
          </button>
          <span style={{
            fontSize: '14px', fontWeight: '600', letterSpacing: '-0.3px', color: '#171717',
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}>
            <span style={{ color: GOLD, marginRight: '5px' }}>✦</span>Adsoh
          </span>
          <div style={{ width: '32px' }} />
        </div>

        {/* Overlay */}
        {drawerOpen && (
          <div
            onClick={() => setDrawerOpen(false)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.35)', zIndex: 1500,
            }}
          />
        )}

        {/* Slide-in drawer */}
        <div style={{
          position: 'fixed', top: 0, left: 0,
          width: '260px', height: '100vh',
          background: '#fff', borderRight: '1px solid #EAEAEA',
          zIndex: 2000, boxSizing: 'border-box',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', flexDirection: 'column',
          padding: '0 12px 20px',
          overflowY: 'auto',
        }}>
          {/* Drawer header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 4px 22px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', letterSpacing: '-0.3px', color: '#171717' }}>
              <span style={{ color: GOLD, marginRight: '5px' }}>✦</span>Adsoh
            </span>
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
            >
              <X size={18} color="#888" />
            </button>
          </div>

          {/* Links */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {links.map(({ path, label, Icon }) => {
              const active = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  className={`nav-drawer-link${active ? ' active' : ''}`}
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 10px', borderRadius: '6px',
                    background: active ? '#F0F0F0' : 'transparent',
                    color: active ? '#171717' : '#888',
                    fontSize: '14px', fontWeight: active ? '500' : '400',
                    letterSpacing: '-0.1px',
                  }}
                >
                  <Icon size={15} strokeWidth={active ? 2 : 1.5} color={active ? GOLD : '#BBBBBB'} style={{ flexShrink: 0 }} />
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 10px 0', borderTop: '1px solid #EAEAEA', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 0 2px #22C55E20', flexShrink: 0 }} />
              <span style={{ color: '#AAAAAA', fontSize: '11px' }}>Krish · Sohscape</span>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ── DESKTOP sidebar ───────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap');
        .nav-link { transition: background 0.15s ease, color 0.15s ease; }
        .nav-link:not(.active):hover { background: #F5F5F5 !important; color: #333 !important; }
        .nav-link:not(.active):hover svg { color: #888 !important; }
      `}</style>
      <div style={{
        position: 'fixed', left: 0, top: 0,
        width: '220px', height: '100vh',
        background: '#fff', borderRight: '1px solid #EAEAEA',
        padding: '20px 12px', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column',
        fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
      }}>
        <div style={{ padding: '4px 10px 28px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', letterSpacing: '-0.3px', color: '#171717' }}>
            <span style={{ color: GOLD, marginRight: '6px' }}>✦</span>Adsoh
          </span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {links.map(({ path, label, Icon }) => {
            const active = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={`nav-link${active ? ' active' : ''}`}
                style={{
                  textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 10px', borderRadius: '6px',
                  background: active ? '#F0F0F0' : 'transparent',
                  color: active ? '#171717' : '#888',
                  fontSize: '13px', fontWeight: active ? '500' : '400',
                  letterSpacing: '-0.1px',
                }}
              >
                <Icon size={14} strokeWidth={active ? 2 : 1.5} color={active ? GOLD : '#BBBBBB'} style={{ flexShrink: 0 }} />
                {label}
              </Link>
            )
          })}
        </div>

        <div style={{ padding: '16px 10px 0', borderTop: '1px solid #EAEAEA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 0 2px #22C55E20', flexShrink: 0 }} />
            <span style={{ color: '#AAAAAA', fontSize: '11px' }}>Krish · Sohscape</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default Nav
