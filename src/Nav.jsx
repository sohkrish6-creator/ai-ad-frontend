import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Dna, Brain, Globe, Search,
  Radio, Palette, Target, Users, Menu, X, PlaySquare, TrendingUp, Gift, Monitor, Eye, MessageSquare, BarChart2, Activity, Zap, Trophy, Crosshair, Antenna, Link2, Share2, Sparkles, Radar, Clock, Wand2, BookOpen, LogOut, User,
} from 'lucide-react'
import { useAuth } from './AuthContext'
import { supabase } from './lib/supabase'

const INK   = '#0B0B0D'
const SLATE = '#23242B'
const SLATE_L = '#2E2F38'
const BONE  = '#EDEAE3'
const GOLD  = '#C9A227'
const MUTED = '#8A8A92'
const GREEN = '#3FA66B'

const FONT_DISPLAY = "'Fraunces', Georgia, serif"
const FONT_BODY    = "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif"

const links = [
  { path: '/dashboard',    label: 'Dashboard',       Icon: LayoutDashboard },
  { path: '/history',      label: 'History',         Icon: Clock           },
  { path: '/intelligence', label: 'BI Platform',     Icon: Dna             },
  { path: '/brain',        label: 'Marketing Brain', Icon: Brain           },
  { path: '/smart-analysis', label: 'Smart Analysis', Icon: Sparkles       },
  { path: '/social-intelligence',      label: 'Social Intel',          Icon: Radar     },
  { path: '/marketing-intelligence',   label: 'Marketing Intel',       Icon: BookOpen  },
  { path: '/analyze',      label: 'AI Analyzer',     Icon: Globe           },
  { path: '/competitor',   label: 'Competitor',      Icon: Search          },
  { path: '/ad-intel',     label: 'Ad Intel',        Icon: Radio           },
  { path: '/ad-creative',  label: 'Ad Creative',     Icon: Palette         },
  { path: '/creative-studio', label: 'Creative Studio', Icon: Wand2       },
  { path: '/command-center', label: 'Command Center', Icon: MessageSquare },
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
  { path: '/ai-optimizer',  label: 'AI Optimizer',   Icon: Zap             },
  { path: '/result-center', label: 'Result Center',  Icon: Trophy          },
  { path: '/prospects',     label: 'Prospects',      Icon: Crosshair       },
  { path: '/cricket-ads',  label: 'Sports Growth',  Icon: Antenna         },
  { path: '/account-audit', label: 'Account Audit',  Icon: BarChart2     },
  { path: '/google-ads',  label: 'Google Ads Import', Icon: Link2         },
  { path: '/meta-test',   label: 'Meta Ads Test',     Icon: Share2        },
]

function Nav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const isMobile = window.innerWidth < 768

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  // Close drawer whenever route changes — Nav stays mounted between pages
  // so drawerOpen state would otherwise persist across navigations
  useEffect(() => { setDrawerOpen(false) }, [location.pathname])

  if (isMobile) {
    return (
      <>
        <style>{`
          .nav-drawer-link { text-decoration: none; transition: background 0.12s ease; }
          .nav-drawer-link:not(.active):hover { background: ${SLATE} !important; }
        `}</style>

        {/* Fixed top bar */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '48px',
          background: INK, borderBottom: `1px solid ${SLATE}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', zIndex: 1000, boxSizing: 'border-box',
        }}>
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', margin: '-6px', display: 'flex', alignItems: 'center' }}
          >
            <Menu size={20} color={MUTED} />
          </button>
          <span style={{
            fontSize: '15px', fontWeight: '700', letterSpacing: '-0.3px', color: BONE,
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            pointerEvents: 'none', fontFamily: FONT_DISPLAY,
          }}>
            <span style={{ color: GOLD, marginRight: '4px' }}>✦</span>Adsoh
          </span>
          <kbd
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            style={{
              fontSize: '10px', color: MUTED, border: `1px solid ${SLATE_L}`, borderRadius: '4px',
              padding: '3px 6px', fontWeight: '600', cursor: 'pointer', background: SLATE,
              fontFamily: FONT_BODY,
            }}
          >
            ⌘K
          </kbd>
        </div>

        {/* Overlay */}
        {drawerOpen && (
          <div
            onClick={() => setDrawerOpen(false)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.65)', zIndex: 1500,
            }}
          />
        )}

        {/* Slide-in drawer */}
        <div style={{
          position: 'fixed', top: 0, left: 0,
          width: '260px', height: '100vh',
          background: INK, borderRight: `1px solid ${SLATE}`,
          zIndex: 2000, boxSizing: 'border-box',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', flexDirection: 'column',
          padding: '0 12px 20px',
          overflowY: 'auto',
          fontFamily: FONT_BODY,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 4px 22px' }}>
            <span style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '-0.3px', color: BONE, fontFamily: FONT_DISPLAY }}>
              <span style={{ color: GOLD, marginRight: '5px' }}>✦</span>Adsoh
            </span>
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
            >
              <X size={18} color={MUTED} />
            </button>
          </div>

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
                    padding: '8px 10px', borderRadius: '5px',
                    borderLeft: active ? `3px solid ${GOLD}` : '3px solid transparent',
                    background: active ? 'rgba(201,162,39,0.07)' : 'transparent',
                    color: active ? BONE : MUTED,
                    fontSize: '13px', fontWeight: active ? '500' : '400',
                    letterSpacing: '-0.1px', textDecoration: 'none',
                  }}
                >
                  <Icon size={14} strokeWidth={active ? 2 : 1.5} color={active ? GOLD : '#3E3F4A'} style={{ flexShrink: 0 }} />
                  {label}
                </Link>
              )
            })}
          </div>

          <div style={{ padding: '14px 10px 0', borderTop: `1px solid ${SLATE}`, marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: user ? '8px' : '0' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: GREEN, boxShadow: `0 0 0 2px rgba(63,166,107,0.2)`, flexShrink: 0 }} />
              <span style={{ color: MUTED, fontSize: '11px', fontFamily: FONT_BODY }}>{user?.email || 'Sohscape'}</span>
            </div>
            {user && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/account" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: MUTED, fontSize: '11px', textDecoration: 'none', padding: '4px 0' }}>
                  <User size={11} /> Account
                </Link>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: MUTED, fontSize: '11px', cursor: 'pointer', padding: '4px 0', fontFamily: FONT_BODY }}>
                  <LogOut size={11} /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  // ── DESKTOP sidebar ───────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .nav-link { transition: background 0.12s ease, color 0.12s ease; text-decoration: none; }
        .nav-link:not(.active):hover { background: ${SLATE} !important; color: ${BONE} !important; }
        .nav-link:not(.active):hover svg { color: ${MUTED} !important; }
      `}</style>
      <div style={{
        position: 'fixed', left: 0, top: 0,
        width: '220px', height: '100vh',
        background: INK, borderRight: `1px solid ${SLATE}`,
        padding: '20px 12px', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column',
        fontFamily: FONT_BODY,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 10px 24px' }}>
          <span style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '-0.3px', color: BONE, fontFamily: FONT_DISPLAY }}>
            <span style={{ color: GOLD, marginRight: '5px' }}>✦</span>Adsoh
          </span>
          <kbd
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            title="Open command palette"
            style={{
              fontSize: '10px', color: MUTED, border: `1px solid ${SLATE_L}`, borderRadius: '4px',
              padding: '3px 6px', fontWeight: '600', cursor: 'pointer', background: SLATE,
            }}
          >
            ⌘K
          </kbd>
        </div>

        {/* Pulse Ledger divider below header */}
        <div style={{ margin: '0 0 12px', padding: '0 2px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="10" viewBox="0 0 196 10" preserveAspectRatio="none" aria-hidden="true">
            <line x1="0" y1="5" x2="196" y2="5" stroke={SLATE_L} strokeWidth="1" />
            {[0,2,5,9,13,16,19].map((tick, i) => {
              const x = (tick / 19) * 196
              const isGold = [2, 9, 16].includes(tick)
              const h = isGold ? 7 : 3
              return <line key={i} x1={x} y1={5 - h/2} x2={x} y2={5 + h/2} stroke={isGold ? GOLD : '#3A3B46'} strokeWidth={isGold ? 1.5 : 0.8} />
            })}
          </svg>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px', overflowY: 'auto' }}>
          {links.map(({ path, label, Icon }) => {
            const active = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={`nav-link${active ? ' active' : ''}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 10px', borderRadius: '5px',
                  borderLeft: active ? `3px solid ${GOLD}` : '3px solid transparent',
                  background: active ? 'rgba(201,162,39,0.07)' : 'transparent',
                  color: active ? BONE : MUTED,
                  fontSize: '13px', fontWeight: active ? '500' : '400',
                  letterSpacing: '-0.1px',
                }}
              >
                <Icon size={14} strokeWidth={active ? 2 : 1.5} color={active ? GOLD : '#3E3F4A'} style={{ flexShrink: 0 }} />
                {label}
              </Link>
            )
          })}
        </div>

        <div style={{ padding: '14px 10px 0', borderTop: `1px solid ${SLATE}`, marginTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: user ? '6px' : '0' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: GREEN, boxShadow: `0 0 0 2px rgba(63,166,107,0.2)`, flexShrink: 0 }} />
            <span style={{ color: MUTED, fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || 'Sohscape'}</span>
          </div>
          {user && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/account" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: MUTED, fontSize: '11px', textDecoration: 'none' }}>
                <User size={11} /> Account
              </Link>
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: MUTED, fontSize: '11px', cursor: 'pointer', padding: 0, fontFamily: FONT_BODY }}>
                <LogOut size={11} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Nav
