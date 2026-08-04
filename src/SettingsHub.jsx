import { User, Link2, Share2, Ban, Wallet, Phone } from 'lucide-react'
import HubPage from './HubPage'

export default function SettingsHub() {
  return (
    <HubPage
      title="Settings"
      sub="Business profile, integrations, compliance, and team — all in one place, not scattered per-module."
      sections={[
        {
          label: 'Business Profile',
          links: [
            { label: 'Business Profile & Services', path: '/voice-outreach/settings', desc: 'Business name, services offered, calling window — blocks pitch generation until set.', Icon: Phone },
            { label: 'Rate Card', path: '/revenue-engine/settings', desc: 'Real prices per service, never invented.', Icon: Wallet },
          ],
        },
        {
          label: 'Integrations',
          links: [
            { label: 'Google Ads', path: '/google-ads', desc: 'Connect a Google Ads account.', Icon: Link2 },
            { label: 'Meta', path: '/meta-test', desc: 'Meta Ads connection test.', Icon: Share2 },
          ],
        },
        {
          label: 'Compliance',
          links: [
            { label: 'DNC List', path: '/voice-outreach/dnc', desc: 'Numbers permanently blocked from calling.', Icon: Ban },
          ],
        },
        {
          label: 'Account',
          links: [
            { label: 'Account & Team', path: '/account', desc: 'Your account details.', Icon: User },
          ],
        },
      ]}
    />
  )
}
