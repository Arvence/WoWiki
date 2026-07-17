import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCommunityEntries } from '../hooks/useCommunityEntries'

const featuredGroups = [
  { title: 'Classic', items: [{ id: '1', label: 'Deadmines Route' }, { id: '6', label: 'Blackrock Depths Checklist' }, { id: '13', label: 'Dungeon Loot Rules' }, { id: '3', label: 'First Raid Prep' }] },
  { title: 'Leveling', items: [{ id: '11', label: 'Faster Quest Routes' }, { id: '7', label: 'Leveling Gold Tips' }, { id: '4', label: 'Choosing Professions' }, { id: '14', label: 'Bank Alt Setup' }] },
  { title: 'Phase Two', items: [{ id: '5', label: 'Dungeon Threat Basics' }, { id: '10', label: 'Efficient Healing' }, { id: '12', label: 'Gear Upgrade Basics' }, { id: '8', label: 'Warsong Gulch Basics' }] },
] as const

export default function FeaturedContent(): JSX.Element {
  const { entries, loading, error } = useCommunityEntries()
  const groupedEntries = useMemo(() => {
    const entriesById = new Map(entries.map((entry) => [entry.id, entry]))
    return featuredGroups.map((group) => ({
      ...group,
      entries: group.items.filter((item) => entriesById.has(item.id)),
    }))
  }, [entries])
  const hasEntries = groupedEntries.some((group) => group.entries.length > 0)

  return (
    <section className="mt-2 overflow-hidden rounded-lg border border-border/60 bg-surface/35 sm:mt-3" aria-labelledby="featured-content-heading">
      <h2 id="featured-content-heading" className="sr-only">Featured Content</h2>

      {loading && (
        <div className="grid divide-y divide-border/50 md:grid-cols-3 md:divide-x md:divide-y-0" aria-label="Loading featured content">
          {featuredGroups.map((group) => <div key={group.title} className="h-24 animate-pulse bg-surface/35" />)}
        </div>
      )}

      {!loading && error && <p className="px-3 py-2.5 text-sm text-danger">Featured content could not be loaded.</p>}

      {!loading && !error && hasEntries && (
        <div className="grid divide-y divide-border/60 md:grid-cols-3 md:divide-x md:divide-y-0">
          {groupedEntries.map((group) => (
            <section key={group.title} aria-labelledby={`featured-${group.title.toLowerCase().replace(' ', '-')}`}>
              <h3 id={`featured-${group.title.toLowerCase().replace(' ', '-')}`} className="border-b border-primary/30 px-3 py-2.5 text-center text-xs font-bold uppercase tracking-[0.14em] text-primary">{group.title}</h3>
              <ul className="grid grid-cols-2">
                {group.entries.map((item) => (
                  <li key={item.id} className="min-w-0 odd:border-r odd:border-border/45 [&:nth-child(-n+2)]:border-b [&:nth-child(-n+2)]:border-border/45">
                    <Link to={`/community/${item.id}`} className="block truncate px-2 py-2 text-[0.8rem] font-medium text-text/90 transition hover:bg-primary/[0.08] hover:text-primary focus:outline-none focus-visible:bg-primary/[0.08] focus-visible:text-primary">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {!loading && !error && !hasEntries && <p className="px-3 py-2.5 text-sm text-muted">No featured guides are available.</p>}
    </section>
  )
}
