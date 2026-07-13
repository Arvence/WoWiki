import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import TextTooltip from '../../../components/ui/TextTooltip'
import { formatCompactAge, formatDate } from '../../../shared/utils/date'
import type { News } from '../types/news'

type RecentNewsProps = {
  news: News[]
  loading: boolean
  error: string | null
}

const SINGLE_COLUMN_NEWS_LIMIT = 5
const TWO_COLUMN_NEWS_LIMIT = 10

export default function RecentNews({ news, loading, error }: RecentNewsProps): JSX.Element {
  const sortedNews = useMemo(
    () => [...news].sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()),
    [news],
  )
  const visibleNews = sortedNews.slice(0, TWO_COLUMN_NEWS_LIMIT)

  return (
    <section className="relative isolate mb-6 overflow-hidden rounded-xl border border-border bg-surface/90 shadow-sm" aria-labelledby="recent-news-heading">
      <img
        src="/images/featured-news-notice-board.png"
        alt=""
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-64 w-full object-cover object-center opacity-60"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, rgba(0, 0, 0, 0.78) 55%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 0%, rgba(0, 0, 0, 0.78) 55%, transparent 100%)',
        }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-64 bg-surface/20" aria-hidden="true" />

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-alt/45 px-4 py-2.5 sm:px-5">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">Latest updates</p>
          <h2 id="recent-news-heading" className="text-lg font-bold text-text">Recent News</h2>
        </div>

        <button
          type="button"
          disabled
          title="News filtering is coming soon"
          className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-border bg-background/50 px-3 text-xs font-semibold text-muted opacity-60"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
          Filter
        </button>
      </div>

      {loading && (
        <div className="relative z-10 grid md:grid-cols-2" aria-label="Loading recent news">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="grid animate-pulse grid-cols-[2.5rem_minmax(0,1fr)_4rem] items-center gap-2 border-b border-border/70 bg-background/70 px-4 py-2.5 md:odd:border-r sm:px-5">
              <span className="h-3 rounded bg-surface-alt" />
              <span className="h-4 rounded bg-surface-alt" />
              <span className="h-5 rounded-full bg-surface-alt" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && <p className="relative z-10 px-5 py-6 text-sm text-danger">Recent news could not be loaded.</p>}

      {!loading && !error && visibleNews.length > 0 && (
        <ol className="relative z-10 grid md:grid-cols-2">
          {visibleNews.map((article, index) => (
            <li
              key={article.id}
              className={`border-b border-border/70 md:odd:border-r ${index >= SINGLE_COLUMN_NEWS_LIMIT ? 'hidden md:block' : ''}`}
            >
              <Link to={`/news/${article.id}`} className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-2 bg-background/70 px-4 py-2.5 transition hover:bg-surface-alt/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:px-5">
                <time dateTime={article.updatedAt} title={formatDate(article.updatedAt, { dateStyle: 'long', timeStyle: 'short' })} className="text-xs font-medium text-muted">
                  {formatCompactAge(article.updatedAt)}
                </time>
                <TextTooltip text={article.title} className="w-full">
                  <span className="block min-w-0 flex-1 truncate text-sm font-semibold text-text transition group-hover:text-primary">{article.title}</span>
                </TextTooltip>
                <span className="max-w-20 truncate rounded bg-primary/10 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-primary">{article.category}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}

      {!loading && !error && visibleNews.length === 0 && <p className="relative z-10 px-5 py-6 text-sm text-muted">No recent news is available.</p>}
    </section>
  )
}
