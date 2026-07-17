import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import TextTooltip from '../../../components/ui/TextTooltip'
import ViewerCount from '../../../components/ui/ViewerCount'
import { formatCompactNumber } from '../../../shared/utils/number'
import { useCommunityEntries } from '../hooks/useCommunityEntries'

const getEntryVisibilityClass = (index: number): string => {
  if (index < 3) return ''
  if (index < 6) return 'hidden sm:block'
  if (index < 9) return 'hidden lg:block'
  return 'hidden min-[2200px]:block'
}

export default function Community(): JSX.Element {
  const { entries, loading, error } = useCommunityEntries()

  const recentEntries = useMemo(
    () => [...entries]
      .sort((first, second) => new Date(second.publishedAt).getTime() - new Date(first.publishedAt).getTime())
      .slice(0, 12),
    [entries],
  )

  return (
    <section
      className="relative mt-5 pb-0.5 sm:mt-6"
      aria-label="Community entries"
    >
      <div className="pointer-events-none absolute inset-x-0 -top-3 flex items-center justify-center opacity-80" aria-hidden="true">
        <span className="h-px w-16 bg-gradient-to-r from-transparent via-primary/15 to-primary/50 sm:w-28" />
        <span className="mx-2 h-2 w-2 rotate-45 bg-primary/70 shadow-[0_0_14px_rgba(199,156,58,0.3)]" />
        <span className="h-px w-16 bg-gradient-to-l from-transparent via-primary/15 to-primary/50 sm:w-28" />
      </div>
      <div className="w-full pt-1">
        {loading && (
          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3 min-[2200px]:grid-cols-4" aria-label="Loading community entries">
            {Array.from({ length: 12 }, (_, index) => index).map((item) => (
              <div key={item} className={`${getEntryVisibilityClass(item)} flex min-h-8 animate-pulse items-center rounded-lg bg-surface/45 px-2.5`}>
                <div className="h-3 w-4/5 rounded bg-surface-alt" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && <p className="mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">Community entries could not be loaded.</p>}

        {!loading && !error && recentEntries.length > 0 && (
          <ol className="grid min-w-0 gap-1 sm:grid-cols-2 lg:grid-cols-3 min-[2200px]:grid-cols-4">
            {recentEntries.map((entry, index) => (
              <li key={entry.id} className={`min-w-0 ${getEntryVisibilityClass(index)}`}>
                <article className="group relative flex min-h-8 min-w-0 items-center gap-2 overflow-hidden rounded-lg bg-primary/[0.055] px-2.5 text-[0.62rem] text-muted shadow-[inset_0_0_0_1px_rgba(212,169,73,0.05),0_3px_12px_rgba(0,0,0,0.05)] transition duration-200 hover:bg-primary/[0.09] hover:shadow-[inset_0_0_0_1px_rgba(212,169,73,0.1),0_5px_16px_rgba(0,0,0,0.09)]">
                  <span className="pointer-events-none absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary/0 transition group-hover:bg-primary/70" aria-hidden="true" />
                  <span className="max-w-16 shrink-0 truncate text-[0.5rem] font-bold uppercase tracking-[0.1em] text-primary">{entry.category}</span>
                  <TextTooltip text={entry.title} className="min-w-0 flex-1">
                    <Link to={`/community/${entry.id}`} className="block min-w-0 truncate text-xs font-semibold text-text transition group-hover:text-primary focus:outline-none focus-visible:text-primary focus-visible:underline">{entry.title}</Link>
                  </TextTooltip>

                  <span className="hidden max-w-20 shrink-0 items-center gap-1.5 xl:flex" title={entry.author}>
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.48rem] font-bold uppercase text-primary" aria-hidden="true">{entry.author.charAt(0)}</span>
                    <span className="truncate" aria-label={`Author: ${entry.author}`}>{entry.author}</span>
                  </span>

                  <span className="flex shrink-0 items-center gap-2 tabular-nums">
                    <span className="inline-flex items-center gap-1" aria-label={`${entry.commentCount} replies`} title="Replies">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /></svg>
                      {formatCompactNumber(entry.commentCount)}
                    </span>
                    <ViewerCount count={entry.viewerCount} compact className="px-0 text-[0.62rem] [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted" />
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
