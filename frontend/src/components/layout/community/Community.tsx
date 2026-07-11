import CommunityEntry, { type CommunityEntryData } from './CommunityEntry'

const exampleEntries: CommunityEntryData[] = [
  {
    id: 1,
    author: 'Arannis',
    title: 'A beginner-friendly route through the Deadmines',
    excerpt: 'A room-by-room walkthrough with suggested levels, key quests, and tips for handling each boss with a new group.',
    category: 'Dungeon Guide',
    publishedAt: 'July 10, 2026',
    comments: 18,
  },
  {
    id: 2,
    author: 'Moonfeather',
    title: 'What the Emerald Dream tells us about Azeroth',
    excerpt: 'A community lore theory connecting recent discoveries to older druid stories and the origins of the world trees.',
    category: 'Lore',
    publishedAt: 'July 8, 2026',
    comments: 31,
  },
  {
    id: 3,
    author: 'Brakka',
    title: 'Preparing your first raid without overgearing',
    excerpt: 'Practical advice for consumables, group roles, and communication when your guild is stepping into its first raid night.',
    category: 'Raiding',
    publishedAt: 'July 5, 2026',
    comments: 24,
  },
]

export default function Community(): JSX.Element {
  return (
    <aside className="order-3 lg:col-span-2 xl:order-1 xl:col-span-1" aria-labelledby="community-heading">
      <div className="xl:sticky xl:top-24">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">From the community</p>
            <h2 id="community-heading" className="mt-1 text-2xl font-bold text-text">Member Entries</h2>
            <p className="mt-1 text-sm text-muted">Guides, discoveries, and stories written by WoWiki members.</p>
          </div>
          <a href="#" className="text-sm font-medium text-primary hover:underline">View all entries</a>
        </div>

        <div className="space-y-4">
          {exampleEntries.map((entry) => (
            <CommunityEntry key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </aside>
  )
}
