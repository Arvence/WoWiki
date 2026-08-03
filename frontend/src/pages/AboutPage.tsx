import { Link } from 'react-router-dom'
import InfoPageLayout, { type InfoSection } from '../components/layout/InfoPageLayout'

const sections: InfoSection[] = [
  {
    id: 'purpose',
    title: 'Why WoWiki exists',
    content: <><p>World of Warcraft knowledge is spread across wikis, patch notes, forum posts, and tools that often feel disconnected. WoWiki brings those experiences together in one focused place: a reference for learning the game, following community discoveries, and preparing to play.</p><p>It is a full-stack portfolio project built around a simple idea: finding an answer and acting on it should feel like part of the same journey. You can move from reading about a class to planning its talents, or from learning about a raid to organizing its roster, without leaving the platform.</p></>,
  },
  {
    id: 'experience',
    title: 'What you can do',
    content: <><p>WoWiki combines reference content, community features, and practical planning tools in a responsive experience.</p><ul className="grid gap-2 sm:grid-cols-2"><li className="border-l-2 border-primary/50 pl-3"><strong className="text-text">Explore the database</strong><br />Browse classes, items, factions, zones, raids, and other structured game data.</li><li className="border-l-2 border-primary/50 pl-3"><strong className="text-text">Discover content</strong><br />Search news, community posts, and database entries from one place.</li><li className="border-l-2 border-primary/50 pl-3"><strong className="text-text">Join the community</strong><br />Publish entries, discuss them through threaded comments, react, and report problems.</li><li className="border-l-2 border-primary/50 pl-3"><strong className="text-text">Prepare to play</strong><br />Build talent setups, find items, and create, organize, save, and share raid plans.</li></ul></>,
  },
  {
    id: 'principles',
    title: 'Product principles',
    content: <><p>The project is designed to feel useful before it feels large. Each feature aims to complete a clear task, keep important actions easy to find, and explain what happened when something succeeds or fails.</p><ul className="list-disc space-y-2 pl-5"><li>Keep navigation and language understandable for newer players.</li><li>Make layouts usable across desktop and mobile screens.</li><li>Show clear loading, empty, error, and success states.</li><li>Use consistent interactions across news, community, database, and tools.</li><li>Prefer focused features that work end to end over unfinished surface area.</li></ul></>,
  },
  {
    id: 'community',
    title: 'Built around community knowledge',
    content: <><p>Some of the most useful game knowledge comes from players testing routes, comparing approaches, and explaining details that formal references miss. Community entries provide a dedicated space for those observations and guides.</p><p>Registered members can publish entries and take part in threaded discussions. Reactions, viewer counts, profiles, and reporting connect those contributions to the rest of the experience, while bookmarks let readers keep useful news and community posts on their device.</p></>,
  },
  {
    id: 'independence',
    title: 'Independent and unofficial',
    content: <><p>WoWiki is an independent portfolio project. It is not affiliated with, sponsored by, or endorsed by Blizzard Entertainment, and it is not presented as an official game service.</p><p>World of Warcraft, Warcraft, Blizzard Entertainment, and associated names, characters, artwork, and game assets are trademarks or property of their respective owners. References are used for identification, commentary, education, and demonstration.</p></>,
  },
  {
    id: 'technology',
    title: 'How the platform is built',
    content: <><p>WoWiki uses a responsive React interface backed by API services for accounts, content, comments, reactions, reports, and structured game data. Shared components keep common patterns—such as search, feedback, authentication, and discussion—consistent across the site.</p><p>The project also explores product concerns beyond the happy path: protected account actions, validation, accessible controls, responsive layouts, durable data, and useful recovery states when a request cannot be completed.</p></>,
  },
  {
    id: 'roadmap',
    title: 'What comes next',
    content: <><p>The core browsing, account, community, and planning experiences are in place. Future work is focused on strengthening them rather than adding disconnected pages:</p><ol className="space-y-3"><li><strong className="text-text">01. Editorial workflows</strong><br />A focused review interface for submitted reports and content management.</li><li><strong className="text-text">02. Deeper guides</strong><br />Dedicated guide pages that connect practical advice directly to database entries and tools.</li><li><strong className="text-text">03. Account controls</strong><br />Additional security and profile settings, including password management.</li><li><strong className="text-text">04. Quality and polish</strong><br />More automated coverage, accessibility checks, performance work, and clearer product documentation.</li></ol></>,
  },
  {
    id: 'explore',
    title: 'Explore WoWiki',
    content: <><p>Start with the <Link to="/database" className="font-semibold text-primary hover:text-primary-hover">Database</Link> for structured game information, visit the <Link to="/community" className="font-semibold text-primary hover:text-primary-hover">Community</Link> for player knowledge, or open <Link to="/tools" className="font-semibold text-primary hover:text-primary-hover">Tools</Link> to plan a build or raid.</p><p>You can also use <Link to="/search" className="font-semibold text-primary hover:text-primary-hover">Search</Link> to look across the platform. The <Link to="/privacy" className="font-semibold text-primary hover:text-primary-hover">Privacy Policy</Link> and <Link to="/terms" className="font-semibold text-primary hover:text-primary-hover">Terms of Use</Link> explain how accounts and contributions are handled.</p></>,
  },
]

export default function AboutPage(): JSX.Element {
  return <InfoPageLayout eyebrow="The project" title="About WoWiki" summary="A full-stack World of Warcraft portfolio project that connects structured reference content, community knowledge, and practical planning tools in one experience." sections={sections} />
}
