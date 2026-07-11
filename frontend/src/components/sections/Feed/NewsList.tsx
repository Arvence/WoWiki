import { Link } from 'react-router-dom'
import CreateNewsCommunityEntry from '../../community/CreateNewsCommunityEntry'
import type { News } from '../../../types/news'

type NewsListProps = {
  news: News[]
  loading: boolean
  error: string | null
}

function formatUpdatedAt(updatedAt: string): string {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(updatedAt))
}

export default function NewsList({ news, loading, error }: NewsListProps): JSX.Element {
  if (loading) {
    return <p className="rounded-2xl border border-border bg-surface/80 p-6 text-text">Loading news...</p>
  }

  if (error) {
    return <p className="rounded-2xl border border-border bg-surface/80 p-6 text-danger">{error}</p>
  }

  if (news.length === 0) {
    return <p className="rounded-2xl border border-border bg-surface/80 p-6 text-muted">No news articles are available.</p>
  }

  return (
    <div className="space-y-6">
      {news.map((article) => (
        <article key={article.id} className="overflow-hidden rounded-2xl border border-border bg-surface/80 shadow-lg">
          {article.imageUrl && (
            <div className="h-64 bg-background/50 pb-2 sm:h-80">
              <img src={article.imageUrl} alt={`${article.title} logo`} className="h-full w-full object-contain" />
            </div>
          )}
          <div className="border-b border-border bg-background/50 p-4 sm:p-6">
            <span className="rounded bg-primary/10 px-2 py-1 text-sm text-primary">{article.category}</span>
            <div className="mt-4">
              <h2 className="text-2xl font-bold sm:text-3xl">
                <Link to={`/news/${article.id}`} className="text-left text-text transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  {article.title}
                </Link>
              </h2>
            </div>
            <p className="mt-2 text-sm text-muted">Updated {formatUpdatedAt(article.updatedAt)} · By <strong className="text-text">{article.author}</strong></p>
          </div>

          <div className="p-4 sm:p-6">
            <p className="text-lg leading-relaxed text-text">{article.summary}</p>
            <p className="mt-4 line-clamp-3 whitespace-pre-line leading-relaxed text-muted">{article.content}</p>
          </div>

          <footer className="flex items-center border-t border-border/70 bg-background/30 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-1 sm:gap-2">
              <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-wow-blood/15 hover:text-wow-blood focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={`Like ${article.title}`}>
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z" /></svg>
              </button>
              <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-primary/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={`Save ${article.title}`}>
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" /></svg>
              </button>
              <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-primary/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={`Share ${article.title}`}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" /></svg>
              </button>
              <span className="mx-1 h-5 w-px bg-border" />
              <span className="inline-flex items-center gap-2 px-2 text-sm tabular-nums text-muted" aria-label={`${article.viewerCount?.toLocaleString() ?? 0} views`}>
                <svg className="h-[18px] w-[18px] text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>
                {article.viewerCount?.toLocaleString() ?? 0}
              </span>
            </div>
            <div className="ml-auto">
              <CreateNewsCommunityEntry newsId={article.id} newsTitle={article.title} compact />
            </div>
          </footer>
        </article>
      ))}
    </div>
  )
}
