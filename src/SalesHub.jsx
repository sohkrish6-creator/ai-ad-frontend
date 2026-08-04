import {
  Table2, Crosshair, ListChecks, Users, MessageSquare, Phone, BarChart2, Ban, Settings2, Rocket,
} from 'lucide-react'
import HubPage from './HubPage'

export default function SalesHub() {
  return (
    <HubPage
      title="Sales"
      sub="Find, qualify, contact, close — the money-making surface. Revenue Engine + Voice Outreach + CRM, one hub."
      sections={[
        {
          label: 'Pipeline & Queue',
          links: [
            { label: 'Pipeline', path: '/revenue-engine/pipeline', desc: 'Every prospect, funnel view, priority-ranked.', Icon: Table2 },
            { label: "Today's Queue", path: '/revenue-engine/today', desc: 'Call/message list for today — deep-links to the workspace.', Icon: ListChecks },
            { label: 'CRM / Leads', path: '/leads', desc: 'All leads across every channel.', Icon: Users },
          ],
        },
        {
          label: 'Discover',
          sub: 'Three entry points into the same discovery engine today — will consolidate to one in Phase C.',
          links: [
            { label: 'Revenue Engine — Goal', path: '/revenue-engine', desc: 'Describe a segment or revenue target, get a Quick Scan.', Icon: Rocket },
            { label: 'Prospect Discovery', path: '/prospects', desc: 'Legacy discovery flow.', Icon: Crosshair },
            { label: 'Voice Outreach — Build Batch', path: '/voice-outreach', desc: 'Legacy voice-specific batch builder.', Icon: Phone },
          ],
        },
        {
          label: 'Outreach & Calls',
          links: [
            { label: 'Outreach AI', path: '/outreach', desc: 'Multi-channel message drafts from Marketing Brain memory.', Icon: MessageSquare },
            { label: 'Voice Call Dashboard', path: '/voice-outreach/calls', desc: 'Live/past AI-dialed calls.', Icon: Phone },
            { label: 'Voice Outreach Analytics', path: '/voice-outreach/analytics', desc: 'Call conversion, sentiment, objections.', Icon: BarChart2 },
          ],
        },
        {
          label: 'Settings',
          links: [
            { label: 'Rate Card', path: '/revenue-engine/settings', desc: 'Your real prices — blocks budget estimates until set.', Icon: Settings2 },
            { label: 'Business Profile & Compliance', path: '/voice-outreach/settings', desc: 'Business name, services offered, calling window.', Icon: Settings2 },
            { label: 'DNC List', path: '/voice-outreach/dnc', desc: 'Numbers permanently blocked from calling.', Icon: Ban },
          ],
        },
      ]}
    />
  )
}
