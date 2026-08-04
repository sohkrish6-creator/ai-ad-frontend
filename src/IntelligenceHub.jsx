import {
  Monitor, Eye, BarChart2, Globe, Dna, Brain, Search, Radio, PlaySquare,
  TrendingUp, Compass, Radar, BookOpen, Sparkles,
} from 'lucide-react'
import HubPage from './HubPage'

export default function IntelligenceHub() {
  return (
    <HubPage
      title="Intelligence"
      sub="Research and diagnosis — audits, competitor analysis, market and organic intelligence."
      sections={[
        {
          label: 'Audit',
          sub: 'Three separate audit surfaces today — will merge into one Quick/Deep toggle in Phase B.',
          links: [
            { label: 'Website Audit', path: '/website-audit', desc: 'Technical + conversion audit of a site.', Icon: Monitor },
            { label: 'Account Audit', path: '/account-audit', desc: 'Google Ads account deep audit.', Icon: BarChart2 },
            { label: 'Visibility', path: '/visibility', desc: 'SEO + AEO + GEO visibility check.', Icon: Eye },
            { label: 'AI Analyzer', path: '/analyze', desc: 'URL-in, full business analysis out.', Icon: Globe },
          ],
        },
        {
          label: 'Business Intelligence',
          links: [
            { label: 'BI Platform', path: '/intelligence', desc: 'Core business-DNA gathering engine.', Icon: Dna },
            { label: 'Marketing Brain', path: '/brain', desc: 'Full report: business, market, competitor, offer.', Icon: Brain },
            { label: 'Smart Analysis', path: '/smart-analysis', desc: '7-module parallel deep-dive.', Icon: Sparkles },
            { label: 'Marketing Intelligence', path: '/marketing-intelligence', desc: 'Cross-channel marketing insight.', Icon: BookOpen },
          ],
        },
        {
          label: 'Competitors & Market',
          links: [
            { label: 'Competitor', path: '/competitor', desc: 'Live competitor site scrape + analysis.', Icon: Search },
            { label: 'Ad Intel', path: '/ad-intel', desc: 'Competitor ad intelligence.', Icon: Radio },
            { label: 'Opportunity Engine', path: '/opportunity', desc: 'Audience/offer/platform opportunity scoring.', Icon: TrendingUp },
            { label: 'YouTube Intel', path: '/youtube', desc: 'YouTube channel & content intelligence.', Icon: PlaySquare },
          ],
        },
        {
          label: 'Organic & Social',
          links: [
            { label: 'Organic Intelligence', path: '/organic-intelligence', desc: 'Search Console, SEO, content performance.', Icon: Compass },
            { label: 'Social Intelligence', path: '/social-intelligence', desc: 'Social presence and performance.', Icon: Radar },
          ],
        },
      ]}
    />
  )
}
