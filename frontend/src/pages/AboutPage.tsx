import InfoPageLayout, { type InfoSection } from '../components/layout/InfoPageLayout'

const sections: InfoSection[] = [
  {
    id: 'experience',
    title: 'What you can do',
    content: <p>Browse a curated World of Warcraft Classic reference, read News, join community discussions, save bookmarks, plan a raid, and allocate talent points. The Blue Tracker and calendar use sample entries.</p>,
  },
  {
    id: 'technology',
    title: 'How it works',
    content: <p>The React frontend uses a YARP gateway to reach the NestJS API and ASP.NET Core services for authentication and PDF downloads. SQLite stores local content and account data. Moderators can publish News immediately or schedule it when TaskForge is configured.</p>,
  },
  {
    id: 'independence',
    title: 'Independent and unofficial',
    content: <p>WoWiki is an independent portfolio project. It is not affiliated with, sponsored by, or endorsed by Blizzard Entertainment. World of Warcraft and related names and artwork belong to their respective owners.</p>,
  },
]

export default function AboutPage(): JSX.Element {
  return <InfoPageLayout eyebrow="Portfolio project" title="About WoWiki" summary="A Classic reference, community demo, and planning toolkit." sections={sections} />
}
