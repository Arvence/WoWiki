import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TextTooltip from '../../../components/ui/TextTooltip'
import ViewerCount from '../../../components/ui/ViewerCount'
import { formatCompactNumber } from '../../../shared/utils/number'
import { fetchCommunityEntries } from '../api/communityService'
import type { CommunityEntryData } from '../types/community'
import CreateNewsCommunityEntry from './CreateNewsCommunityEntry'

const getEntryVisibilityClass = (index: number): string => {
  if (index < 3) return ''
  if (index < 6) return 'hidden sm:block'
  if (index < 9) return 'hidden lg:block'
  return 'hidden min-[2200px]:block'
}

const getEntryPaddingClass = (index: number): string => {
  const tabletPadding = index % 2 === 0 ? 'sm:pl-0 sm:pr-3' : 'sm:pl-3 sm:pr-0'
  const desktopPadding = index % 3 === 0
    ? 'lg:pl-0 lg:pr-3'
    : index % 3 === 2
      ? 'lg:pl-3 lg:pr-0'
      : 'lg:px-3'
  const widePadding = index % 4 === 0
    ? 'min-[2200px]:pl-0 min-[2200px]:pr-3'
    : index % 4 === 3
      ? 'min-[2200px]:pl-3 min-[2200px]:pr-0'
      : 'min-[2200px]:px-3'

  return `px-0 ${tabletPadding} ${desktopPadding} ${widePadding}`
}

export default function Community(): JSX.Element {
  const [entries, setEntries] = useState<CommunityEntryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadEntries = async () => {
      try {
        setEntries(await fetchCommunityEntries())
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    void loadEntries()
    window.addEventListener('wowiki:community-entry-created', loadEntries)
    return () => window.removeEventListener('wowiki:community-entry-created', loadEntries)
  }, [])

  const recentEntries = useMemo(
    () => [...entries]
      .sort((first, second) => new Date(second.publishedAt).getTime() - new Date(first.publishedAt).getTime())
      .slice(0, 12),
    [entries],
  )

  return (
    <section className="border-b border-b-border border-t border-t-primary/30" aria-labelledby="community-heading">
      <div className="w-full">
        <div className="flex min-h-8 items-center justify-between gap-4 py-1">
          <div className="flex items-baseline gap-2">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">Community</p>
            <h2 id="community-heading" className="text-sm font-semibold text-text">Featured Entries</h2>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <CreateNewsCommunityEntry plus />
            <Link to="/community#entries" className="inline-flex h-7 items-center gap-1 text-[0.65rem] font-semibold text-muted transition hover:text-primary focus:outline-none focus-visible:text-primary">
              See all entries <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>

        {loading && (
          <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2 lg:grid-cols-3 min-[2200px]:grid-cols-4" aria-label="Loading community entries">
            {Array.from({ length: 12 }, (_, index) => index).map((item) => (
              <div key={item} className={`${getEntryVisibilityClass(item)} ${getEntryPaddingClass(item)} flex min-h-7 animate-pulse items-center bg-background`}>
                <div className="h-3 w-full rounded bg-surface-alt" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && <p className="mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">Community entries could not be loaded.</p>}

        {!loading && !error && recentEntries.length > 0 && (
          <ol className="grid gap-px border-t border-border bg-border sm:grid-cols-2 lg:grid-cols-3 min-[2200px]:grid-cols-4">
            {recentEntries.map((entry, index) => (
              <li key={entry.id} className={getEntryVisibilityClass(index)}>
                <article className={`group flex min-h-7 min-w-0 items-center gap-2 bg-background text-[0.65rem] text-muted transition hover:bg-surface-alt/50 ${getEntryPaddingClass(index)}`}>
                  <span className="max-w-20 shrink-0 truncate rounded bg-primary/10 px-1.5 py-0.5 text-[0.5rem] font-bold uppercase tracking-wide text-primary">{entry.category}</span>
                  <TextTooltip text={entry.title} className="flex-1">
                    <Link to={`/community/${entry.id}`} className="block min-w-0 flex-1 truncate text-xs font-semibold text-text transition group-hover:text-primary focus:outline-none focus-visible:text-primary focus-visible:underline">{entry.title}</Link>
                  </TextTooltip>

                  <span className="flex max-w-24 shrink-0 items-center gap-1.5" title={entry.author}>
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-[0.5rem] font-bold uppercase text-primary" aria-hidden="true">{entry.author.charAt(0)}</span>
                    <span className="truncate" aria-label={`Author: ${entry.author}`}>{entry.author}</span>
                  </span>

                  <span className="flex shrink-0 items-center gap-2 tabular-nums">
                    <span className="inline-flex items-center gap-1" aria-label={`${entry.commentCount} replies`} title="Replies">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /></svg>
                      {formatCompactNumber(entry.commentCount)}
                    </span>
                    <ViewerCount count={entry.viewerCount} compact className="px-0 text-[0.65rem] [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted" />
                  </span>
                </article>
              </li>
            ))}
          </ol>
        )}

        {!loading && !error && recentEntries.length === 0 && <p className="mt-3 text-sm text-muted">No community entries available.</p>}
      </div>
    </section>
  )
}
