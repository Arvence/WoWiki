import type { CommunityEntryData } from '../types/community'

type CommunityEntryProps = {
  entry: CommunityEntryData
}

export default function CommunityEntry({ entry }: CommunityEntryProps): JSX.Element {
  const authorInitial = entry.author.charAt(0).toUpperCase()
  const publishedDate = new Date(entry.publishedAt)
  const formattedPublishedAt = Number.isNaN(publishedDate.getTime())
    ? entry.publishedAt
    : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(publishedDate)

  return (
    <article className="group relative px-4 py-3.5 transition hover:bg-surface-alt/40">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="rounded bg-primary/10 px-2 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-primary">
          {entry.category}
        </span>
        <time className="text-xs text-muted" dateTime={entry.publishedAt}>{formattedPublishedAt}</time>
      </div>

      <h3 className="text-base font-semibold leading-6 text-text">
        <a href="#" className="transition group-hover:text-primary">
          <span className="absolute inset-0" aria-hidden="true" />
          {entry.title}
        </a>
      </h3>
      <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted">{entry.excerpt}</p>
      {entry.newsId && <a href={`/news/${entry.newsId}`} className="relative mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover">View related news <span aria-hidden="true">&rarr;</span></a>}

      <div className="mt-2.5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-background/60 text-[0.65rem] font-semibold text-primary" aria-hidden="true">
            {authorInitial}
          </span>
          <span className="truncate text-sm font-medium text-text">{entry.author}</span>
        </div>

        <span className="flex shrink-0 items-center gap-1 text-xs text-muted">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
          </svg>
          {entry.commentCount}
        </span>
      </div>
    </article>
  )
}
