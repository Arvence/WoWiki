import { Link } from 'react-router-dom'
import InfoPageLayout, { type InfoSection } from '../components/layout/InfoPageLayout'

const sections: InfoSection[] = [
  {
    id: 'purpose',
    title: 'Why WoWiki exists',
    content: <><p>WoWiki is a community-driven World of Warcraft encyclopedia built to make a vast, changing game easier to understand. It brings lore, characters, places, systems, guides, and player discoveries into one connected reference.</p><p>The project is designed for both quick answers and deep exploration. A new player should be able to find a clear dungeon route, while a long-time lore reader should be able to follow relationships across eras, factions, and worlds without losing context.</p></>,
  },
  {
    id: 'coverage',
    title: 'What we cover',
    content: <><p>WoWiki organizes information across the full Warcraft universe while keeping practical game information distinct from interpretation and community opinion.</p><ul className="grid gap-2 sm:grid-cols-2"><li className="border-l-2 border-primary/50 pl-3"><strong className="text-text">World and lore</strong><br />Characters, factions, events, locations, timelines, and cosmology.</li><li className="border-l-2 border-primary/50 pl-3"><strong className="text-text">Game systems</strong><br />Classes, professions, items, quests, reputations, and progression.</li><li className="border-l-2 border-primary/50 pl-3"><strong className="text-text">Group content</strong><br />Dungeons, raids, encounters, preparation, and role guidance.</li><li className="border-l-2 border-primary/50 pl-3"><strong className="text-text">Community knowledge</strong><br />Routes, discoveries, theories, discussion, and field-tested advice.</li></ul></>,
  },
  {
    id: 'editorial',
    title: 'Editorial standards',
    content: <><p>Useful reference material depends on clarity about what is known, what has changed, and what remains interpretation. WoWiki aims to separate confirmed information from speculation and to identify the game version or patch context when it matters.</p><p>Editors are encouraged to use primary sources such as official patch notes, in-game text, developer publications, and directly observable mechanics. Secondary sources may provide useful context, but claims should remain traceable and proportionate to the strength of the evidence.</p><ul className="list-disc space-y-2 pl-5"><li>Write for readers who may not know specialized terminology.</li><li>State assumptions, version differences, and unresolved conflicts.</li><li>Prefer reproducible instructions over unexplained conclusions.</li><li>Correct errors visibly and preserve useful discussion context.</li><li>Distinguish neutral reference content from personal recommendations.</li></ul></>,
  },
  {
    id: 'community',
    title: 'Built with the community',
    content: <><p>Players often discover practical knowledge before it appears in a formal guide. Community entries give members a place to publish routes, observations, theories, and advice connected to the encyclopedia.</p><p>Comments and threaded replies allow claims to be tested, clarified, and improved. Reactions help readers recognize useful contributions, while reporting and moderation tools protect the discussion from abuse and manipulation.</p><p>As account features mature, contributions will connect to persistent profiles, revision history, saved material, and transparent moderation records.</p></>,
  },
  {
    id: 'independence',
    title: 'Independent and unofficial',
    content: <><p>WoWiki is an independent community project. It is not affiliated with, sponsored by, or endorsed by Blizzard Entertainment.</p><p>World of Warcraft, Warcraft, Blizzard Entertainment, and associated names, characters, artwork, and game assets are trademarks or property of their respective owners. References are used for identification, commentary, education, and community documentation.</p><p>WoWiki’s editorial decisions are made around reader usefulness, source quality, and community safety rather than publisher or advertiser influence.</p></>,
  },
  {
    id: 'technology',
    title: 'How the platform is built',
    content: <><p>WoWiki uses a responsive web application and structured API so articles, community entries, comments, and reference data can share consistent interfaces. Reusable components keep interactions such as reactions, viewer counts, emoji selection, and threaded discussion predictable across the site.</p><p>The platform is being developed toward persistent accounts, durable database storage, searchable content relationships, contribution history, and moderation workflows. Accessibility, performance, and maintainable content structures are treated as product requirements rather than finishing touches.</p></>,
  },
  {
    id: 'roadmap',
    title: 'Where WoWiki is going',
    content: <><p>The next stage is turning the current community experience into a durable publishing platform. Planned work includes:</p><ol className="space-y-3"><li><strong className="text-text">01. Accounts and identity</strong><br />Secure sessions, profiles, contribution history, and ownership controls.</li><li><strong className="text-text">02. Persistent knowledge</strong><br />Database-backed entries, comments, reactions, bookmarks, reports, and revisions.</li><li><strong className="text-text">03. Discovery</strong><br />Full-text search, filters, categories, related pages, trending discussions, and saved collections.</li><li><strong className="text-text">04. Editorial tooling</strong><br />Drafts, citations, review queues, version context, and transparent correction history.</li><li><strong className="text-text">05. Community safety</strong><br />Moderation dashboards, appeals, rate limits, and configurable trust controls.</li></ol></>,
  },
  {
    id: 'participate',
    title: 'Take part',
    content: <><p>Read critically, share what you have tested, explain disagreements with evidence, and help new players understand the parts of the game experienced players take for granted.</p><p>Corrections, privacy questions, partnership inquiries, and safety reports can be sent through the <Link to="/contact" className="font-semibold text-primary hover:text-primary-hover">Contact page</Link>. The <Link to="/terms" className="font-semibold text-primary hover:text-primary-hover">Terms of Use</Link> describe contribution rules, and the <Link to="/privacy" className="font-semibold text-primary hover:text-primary-hover">Privacy Policy</Link> explains how information is handled.</p></>,
  },
]

export default function AboutPage(): JSX.Element {
  return <InfoPageLayout eyebrow="The project" title="About WoWiki" summary="An independent, community-built encyclopedia connecting reliable Warcraft reference material with the practical knowledge and discussion of the players who explore it." sections={sections} />
}
