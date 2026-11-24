import InfoPageLayout, { type InfoSection } from '../components/layout/InfoPageLayout'

const sections: InfoSection[] = [
  {
    id: 'information',
    title: 'Data stored by WoWiki',
    content: <p>The local instance stores account details, bookmarks, reactions, saved raids, submitted content, and issue reports in SQLite. Posts and comments show the display name used when they were created. Reports are stored privately by the instance.</p>,
  },
  {
    id: 'cookies',
    title: 'Browser storage',
    content: <p>WoWiki uses a session cookie to keep you signed in. The Raid Planner can save a plan in this browser without an account. Clearing browser storage removes that local copy.</p>,
  },
  {
    id: 'external',
    title: 'External resources',
    content: <p>The Talent Calculator requests icon images from ClassicDB. External links open the destination site. If you share a Raid Planner link, it includes a copy of the plan for anyone with the link to open.</p>,
  },
]

export default function PrivacyPage(): JSX.Element {
  return <InfoPageLayout eyebrow="Local data" title="Privacy Policy" summary="How this portfolio demo stores account, browser, and content data." sections={sections} />
}
