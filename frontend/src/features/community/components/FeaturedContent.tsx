import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCommunityEntries } from '../api/communityService'
import type { CommunityEntryData } from '../types/community'

const featuredGroups = [
  {
    title: 'Dungeons',
    description: 'Routes and group play',
    items: [
      { id: '1', label: 'Deadmines Route' },
      { id: '6', label: 'Blackrock Depths Checklist' },
      { id: '13', label: 'Dungeon Loot Rules' },
      { id: '3', label: 'First Raid Prep' },
    ],
  },
  {
    title: 'Leveling',
    description: 'Progress and economy',
    items: [
      { id: '11', label: 'Faster Quest Routes' },
      { id: '7', label: 'Leveling Gold Tips' },
      { id: '4', label: 'Choosing Professions' },
      { id: '14', label: 'Bank Alt Setup' },
    ],
  },
  {
    title: 'Talents',
    description: 'Build fundamentals',
    items: [
      { id: '5', label: 'Dungeon Threat Basics' },
      { id: '10', label: 'Efficient Healing' },
      { id: '12', label: 'Gear Upgrade Basics' },
      { id: '8', label: 'Warsong Gulch Basics' },
    ],
  },
] as const

export default function FeaturedContent(): JSX.Element {
  const [entries, setEntries] = useState<CommunityEntryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadEntries = async () => {
      try {
        setEntries(await fetchCommunityEntries())
        setError(false)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    void loadEntries()
  }, [])

  const groupedEntries = useMemo(() => {
    const entriesById = new Map(entries.map((entry) => [entry.id, entry]))
    return featuredGroups.map((group) => ({
      title: group.title,
      description: group.description,
      entries: group.items.flatMap((item) => {
        const entry = entriesById.get(item.id)
        return entry ? [{ entry, label: item.label }] : []
      }),
    }))
  }, [entries])
  const hasEntries = groupedEntries.some((group) => group.entries.length > 0)

  return (
    <section className="mb-6 overflow-hidden rounded-xl border border-border bg-surface/80 shadow-sm" aria-labelledby="featured-content-heading">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-alt/35 px-4 py-2.5 sm:px-5">
        <div className="flex items-baseline gap-2">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">Guides</p>
          <h2 id="featured-content-heading" className="text-sm font-semibold text-text">Featured Content</h2>
        </div>
        <Link to="/community#entries" className="text-xs font-semibold text-muted transition hover:text-primary focus:outline-none focus-visible:text-primary">
          View all <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      <div>
        <div className="min-w-0">
          {loading && (
            <div className="grid md:grid-cols-3" aria-label="Loading featured content">
          {featuredGroups.map((group) => (
            <div key={group.title} className="border-b border-border last:border-b-0 md:border-b-0 md:[&:not(:last-child)]:border-r">
              <div className="flex items-center justify-between border-b border-border bg-background/40 px-3 py-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-primary">{group.title}</h3>
                  <p className="mt-0.5 text-[0.6rem] text-muted">{group.description}</p>
                </div>
                <span className="text-[0.6rem] font-semibold tabular-nums text-muted">04 guides</span>
              </div>
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="h-9 animate-pulse border-b border-border/70 bg-background px-3 py-2 last:border-b-0">
                  <div className="h-full rounded bg-surface-alt" />
                </div>
              ))}
            </div>
          ))}
            </div>
          )}

          {!loading && error && <p className="px-4 py-3 text-sm text-danger">Featured content could not be loaded.</p>}

          {!loading && !error && hasEntries && (
            <div className="grid md:grid-cols-3">
          {groupedEntries.map((group) => (
            <section key={group.title} aria-labelledby={`featured-${group.title.toLowerCase()}-heading`} className="border-b border-border last:border-b-0 md:border-b-0 md:[&:not(:last-child)]:border-r">
              <div className="flex items-center justify-between border-b border-border bg-background/40 px-3 py-2">
                <div>
                  <h3 id={`featured-${group.title.toLowerCase()}-heading`} className="text-xs font-bold uppercase tracking-wide text-primary">{group.title}</h3>
                  <p className="mt-0.5 text-[0.6rem] text-muted">{group.description}</p>
                </div>
                <span className="text-[0.6rem] font-semibold tabular-nums text-muted">{String(group.entries.length).padStart(2, '0')} guides</span>
              </div>
              <ol className="divide-y divide-border/70">
                {group.entries.slice(0, 4).map(({ entry, label }, index) => (
                  <li key={entry.id}>
                    <Link to={`/community/${entry.id}`} className="group flex h-9 min-w-0 items-center gap-2.5 bg-background px-3 transition hover:bg-surface-alt/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary">
                      <span className="w-4 shrink-0 text-[0.6rem] font-semibold tabular-nums text-muted/70" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                      <span className="block min-w-0 flex-1 truncate text-xs font-semibold text-text transition group-hover:text-primary">{label}</span>
                      <span className="shrink-0 text-xs text-primary opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true">&rarr;</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ))}
            </div>
          )}

          {!loading && !error && !hasEntries && <p className="px-4 py-3 text-sm text-muted">No featured guides are available.</p>}
        </div>
      </div>
    </section>
  )
}
