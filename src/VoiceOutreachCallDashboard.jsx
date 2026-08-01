import { PhoneOff } from 'lucide-react'
import { card, MUTED, BONE } from './ds'
import PageShell from './PageShell'
import PageHeader from './PageHeader'

// Phase 1 shell only — live calling ships in Phase 2 once real Vapi
// credentials are connected. No polling, no data fetch: there is genuinely
// nothing to show yet, and pretending otherwise would fabricate activity.
export default function VoiceOutreachCallDashboard() {
  return (
    <PageShell maxWidth="960px">
      <PageHeader title="Voice Outreach — Call Dashboard" sub="Live call monitoring launches in Phase 2." />
      <div style={{ ...card, padding: '48px 24px', textAlign: 'center' }}>
        <PhoneOff size={28} color={MUTED} style={{ marginBottom: '14px' }} />
        <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '600', color: BONE }}>No active calls yet</p>
        <p style={{ margin: 0, fontSize: '13px', color: MUTED, maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
          Phase 1 covers prospect discovery, weakness detection, and human-approved pitch scripts — real Vapi
          calling, live transcripts, and this dashboard's data will connect in Phase 2 once calling credentials
          are set up.
        </p>
      </div>
    </PageShell>
  )
}
