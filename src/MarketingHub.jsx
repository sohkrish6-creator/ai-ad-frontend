import {
  Link2, Share2, Antenna, Image as ImageIcon, Wand2, Palette, Send, Gift, MessageSquare, Target,
} from 'lucide-react'
import HubPage from './HubPage'

export default function MarketingHub() {
  return (
    <HubPage
      title="Marketing"
      sub="Client delivery — campaigns, content, creative, ads."
      sections={[
        {
          label: 'Campaigns',
          links: [
            { label: 'Google Ads Dashboard', path: '/google-ads/dashboard', desc: 'Connected account performance.', Icon: Link2 },
            { label: 'Meta Ads Test', path: '/meta-test', desc: 'Meta campaign testing.', Icon: Share2 },
            { label: 'Sports Growth (CrickHub)', path: '/cricket-ads', desc: 'Cricket media buying — inactive client, kept live for now.', Icon: Antenna },
            { label: 'Audience Finder', path: '/audience', desc: 'Targeting research for a campaign.', Icon: Target },
            { label: 'Offer Intelligence', path: '/offer', desc: 'Offer structuring and positioning.', Icon: Gift },
            { label: 'Command Center', path: '/command-center', desc: 'Multi-step AI task execution — becomes the Copilot later.', Icon: MessageSquare },
          ],
        },
        {
          label: 'Content',
          links: [
            { label: 'Instagram Coach', path: '/instagram-coach', desc: 'Pre-publish content check.', Icon: ImageIcon },
          ],
        },
        {
          label: 'Creative',
          links: [
            { label: 'Creative Studio', path: '/creative-studio', desc: 'AI ad creative generation.', Icon: Wand2 },
            { label: 'Ad Creative', path: '/ad-creative', desc: 'Legacy creative tool.', Icon: Palette },
          ],
        },
        {
          label: 'Creators',
          links: [
            { label: 'Creator Finder', path: '/creator-finder', desc: 'Influencer discovery and shortlisting.', Icon: Send },
          ],
        },
      ]}
    />
  )
}
