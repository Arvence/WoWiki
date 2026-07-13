import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCommunityEntries } from '../hooks/useCommunityEntries'

const featuredGroups = [
  {
    title: 'Classic',
    imageUrl: '/images/featured-content-horde-board-optimized.jpg',
    imagePosition: 'center',
    items: [
      { id: '1', label: 'Deadmines Route' },
      { id: '6', label: 'Blackrock Depths Checklist' },
      { id: '13', label: 'Dungeon Loot Rules' },
      { id: '3', label: 'First Raid Prep' },
    ],
  },
  {
    title: 'Leveling',
    imageUrl: '/images/featured-news-notice-board.png',
    imagePosition: 'center',
    items: [
      { id: '11', label: 'Faster Quest Routes' },
      { id: '7', label: 'Leveling Gold Tips' },
      { id: '4', label: 'Choosing Professions' },
      { id: '14', label: 'Bank Alt Setup' },
    ],
  },
  {
    title: 'Phase Two',
    imageUrl: '/images/calendar-undead-casting-bg.png',
    imagePosition: 'center 35%',
    items: [
      { id: '5', label: 'Dungeon Threat Basics' },
      { id: '10', label: 'Efficient Healing' },
      { id: '12', label: 'Gear Upgrade Basics' },
      { id: '8', label: 'Warsong Gulch Basics' },
    ],
  },
] as const

export default function FeaturedContent(): JSX.Element {
  const { entries, loading, error } = useCommunityEntries()

  const groupedEntries = useMemo(() => {
    const entriesById = new Map(entries.map((entry) => [entry.id, entry]))
    return featuredGroups.map((group) => ({
      title: group.title,
      imageUrl: group.imageUrl,
      imagePosition: group.imagePosition,
      entries: group.items.flatMap((item) => {
        const entry = entriesById.get(item.id)
        return entry ? [{ entry, label: item.label }] : []
      }),
    }))
  }, [entries])
  const hasEntries = groupedEntries.some((group) => group.entries.length > 0)

  return (
    <section
      className="relative isolate mb-6 overflow-hidden rounded-2xl bg-surface/90 shadow-[0_18px_45px_rgba(0,0,0,0.22)]"
      aria-labelledby="featured-content-heading"
    >
      <img
        src="/images/featured-content-horde-board-optimized.jpg"
        alt=""
        decoding="async"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-[center_26%] opacity-55 saturate-90"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-background/15 via-background/25 to-background/40" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/[0.07] blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" aria-hidden="true" />

      <h2 id="featured-content-heading" className="sr-only">Featured Content</h2>

      <div className="relative z-10">
        {loading && (
          <div className="grid divide-y divide-border/35 bg-background/40 md:grid-cols-3 md:divide-x md:divide-y-0" aria-label="Loading featured content">
            {featuredGroups.map((group) => (
              <div key={group.title} className="flex min-h-64 flex-col p-5">
                <div className="flex items-center gap-3 pb-4">
                  <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-surface-alt" />
                  <div className="h-5 w-24 animate-pulse rounded bg-surface-alt" />
                </div>
                <div className="flex flex-1 flex-col divide-y divide-border/20 overflow-hidden rounded-xl bg-background/30">
                  {Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className="min-h-9 flex-1 animate-pulse bg-surface-alt/35" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && <p className="m-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-4 text-sm text-danger">Featured content could not be loaded.</p>}

        {!loading && !error && hasEntries && (
          <div className="grid divide-y divide-border/35 bg-background/40 backdrop-blur-[1px] md:grid-cols-3 md:divide-x md:divide-y-0">
            {groupedEntries.map((group) => (
              <section
                key={group.title}
                aria-labelledby={`featured-${group.title.toLowerCase()}-heading`}
                className="group/collection flex min-h-64 flex-col p-5 transition duration-300 hover:bg-background/15"
              >
                <div className="flex items-center gap-3 px-1 pb-4">
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-surface shadow-[0_6px_18px_rgba(0,0,0,0.3)]">
                    <img
                      src={group.imageUrl}
                      alt=""
                      className="h-full w-full object-cover saturate-75 transition duration-300 group-hover/collection:scale-105 group-hover/collection:saturate-100"
                      style={{ objectPosition: group.imagePosition }}
                      aria-hidden="true"
                    />
                  </span>
                  <h3 id={`featured-${group.title.toLowerCase()}-heading`} className="min-w-0 text-base font-bold tracking-tight text-text">
                    {group.title}
                  </h3>
                </div>

                <ol className="flex flex-1 flex-col divide-y divide-border/20 overflow-hidden rounded-xl bg-background/30">
                  {group.entries.slice(0, 4).map(({ entry, label }) => (
                    <li key={entry.id} className="flex min-h-9 flex-1">
                      <Link
                        to={`/community/${entry.id}`}
                        title={label}
                        className="group/link relative flex min-w-0 flex-1 items-center px-3 py-2 text-[0.8rem] font-semibold text-text/90 transition-all before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:origin-center before:scale-y-0 before:rounded-full before:bg-primary before:transition-transform hover:bg-background/25 hover:pl-4 hover:text-primary hover:before:scale-y-100 focus:outline-none focus-visible:bg-background/25 focus-visible:pl-4 focus-visible:text-primary focus-visible:before:scale-y-100"
                      >
                        <span className="block min-w-0 flex-1 truncate">{label}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        )}

        {!loading && !error && !hasEntries && <p className="m-4 rounded-lg bg-background/50 px-4 py-4 text-sm text-muted">No featured guides are available.</p>}
      </div>

    </section>
  )
}
