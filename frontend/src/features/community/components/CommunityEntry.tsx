import { Link } from 'react-router-dom'
import type { CommunityEntryData } from '../types/community'
import ViewerCount from '../../../components/ui/ViewerCount'
import { formatDate } from '../../../shared/utils/date'

type CommunityEntryProps = {
  entry: CommunityEntryData
}

export default function CommunityEntry({ entry }: CommunityEntryProps): JSX.Element {
  const authorInitial = entry.author.charAt(0).toUpperCase()
  const formattedPublishedAt = formatDate(entry.publishedAt, { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <article className="group relative isolate overflow-hidden rounded-xl bg-primary/[0.055] px-4 py-3 shadow-[inset_0_0_0_1px_rgba(212,169,73,0.06),0_5px_20px_rgba(0,0,0,0.07)] transition duration-200 hover:-translate-y-0.5 hover:bg-primary/[0.085] hover:shadow-[inset_0_0_0_1px_rgba(212,169,73,0.1),0_8px_26px_rgba(0,0,0,0.11)]">
      <div className="pointer-events-none absolute -right-10 -top-12 -z-10 h-28 w-28 rounded-full bg-primary/[0.07] blur-2xl transition group-hover:bg-primary/10" aria-hidden="true" />
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-[0.13em] text-primary">
          <span className="h-1.5 w-1.5 rotate-45 bg-primary" aria-hidden="true" />
          {entry.category}
        </span>
        <time className="text-xs text-muted" dateTime={entry.publishedAt}>{formattedPublishedAt}</time>
      </div>

      <h3 className="text-sm font-semibold leading-5 text-text">
        <Link to={`/community/${entry.id}`} className="transition group-hover:text-primary">
          <span className="absolute inset-0" aria-hidden="true" />
          {entry.title}
        </Link>
      </h3>
      <p className="mt-1 line-clamp-1 text-xs leading-5 text-muted">{entry.excerpt}</p>
      {entry.newsId && <Link to={`/news/${entry.newsId}`} className="relative mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover">View related news <span aria-hidden="true">&rarr;</span></Link>}

      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.65rem] font-semibold text-primary" aria-hidden="true">
            {authorInitial}
          </span>
          <span className="truncate text-xs font-medium text-text">{entry.author}</span>
        </div>

        <div className="flex shrink-0 items-center gap-2.5 text-xs text-muted">
          <ViewerCount count={entry.viewerCount} compact />
          <span className="inline-flex items-center gap-1" aria-label={`${entry.commentCount} comments`}>
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
          </svg>
          {entry.commentCount}
          </span>
        </div>
      </div>
    </article>
  )
}
