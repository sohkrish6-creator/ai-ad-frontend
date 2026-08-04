import { BarChart2, Activity, Zap, Trophy, Clock, Phone } from 'lucide-react'
import HubPage from './HubPage'

export default function AnalyticsHub() {
  return (
    <HubPage
      title="Analytics"
      sub="Performance, revenue, forecasting. Revenue Dashboard ships in Phase 2 of Revenue Engine."
      sections={[
        {
          label: 'Performance',
          links: [
            { label: 'Performance Intelligence', path: '/performance', desc: 'Cross-channel performance view.', Icon: Activity },
            { label: 'KPI Engine', path: '/kpi-engine', desc: 'KPI tracking and alerts.', Icon: BarChart2 },
            { label: 'AI Optimizer', path: '/ai-optimizer', desc: 'Automated optimization suggestions.', Icon: Zap },
            { label: 'Result Center', path: '/result-center', desc: 'Outcome reporting.', Icon: Trophy },
            { label: 'Voice Outreach Analytics', path: '/voice-outreach/analytics', desc: 'Call conversion, sentiment, objections.', Icon: Phone },
          ],
        },
        {
          label: 'Reports',
          links: [
            { label: 'History', path: '/history', desc: 'Activity log across every module.', Icon: Clock },
          ],
        },
      ]}
    />
  )
}
