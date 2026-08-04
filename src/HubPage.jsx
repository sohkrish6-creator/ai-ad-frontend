import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { card, cardInner, BONE, MUTED, GOLD, SLATE_L } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'

/**
 * HubPage — shared landing-page renderer for the 5-item top nav (Sales,
 * Marketing, Intelligence, Analytics, Settings). Phase A of the AdSOH IA
 * review: re-parents every existing page under a hub without rewriting or
 * deleting any of them — every link below points at a route that already
 * exists and already works.
 *
 * sections: [{ label, sub?, links: [{ label, path, desc, Icon }] }]
 */
export default function HubPage({ title, sub, sections }) {
  const navigate = useNavigate()
  return (
    <PageShell maxWidth="1000px">
      <PageHeader title={title} sub={sub} />
      {sections.map(section => (
        <div key={section.label} style={{ marginBottom: '28px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: '700', color: GOLD, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {section.label}
          </p>
          {section.sub && <p style={{ margin: '0 0 12px', fontSize: '12px', color: MUTED }}>{section.sub}</p>}
          {!section.sub && <div style={{ marginBottom: '12px' }} />}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
            {section.links.map(link => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  ...cardInner, display: 'flex', alignItems: 'flex-start', gap: '10px', textAlign: 'left',
                  padding: '14px 16px', cursor: 'pointer', border: `1px solid ${SLATE_L}`,
                  color: BONE, fontFamily: 'inherit',
                }}
              >
                {link.Icon && <link.Icon size={16} color={GOLD} style={{ flexShrink: 0, marginTop: '2px' }} />}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '700' }}>{link.label}</p>
                  {link.desc && <p style={{ margin: '3px 0 0', fontSize: '11.5px', color: MUTED, lineHeight: 1.4 }}>{link.desc}</p>}
                </div>
                <ChevronRight size={14} color={MUTED} style={{ flexShrink: 0, marginTop: '3px' }} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </PageShell>
  )
}
