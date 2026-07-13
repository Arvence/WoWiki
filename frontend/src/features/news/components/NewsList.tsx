import { Link } from 'react-router-dom'
import CreateNewsCommunityEntry from '../../community/components/CreateNewsCommunityEntry'
import type { News } from '../types/news'
import { setNewsLiked } from '../api/newsService'
import Actions from '../../../components/ui/Actions'
import ViewerCount from '../../../components/ui/ViewerCount'
import { formatDate } from '../../../shared/utils/date'

type NewsListProps = {
  news: News[]
  loading: boolean
  error: string | null
}

function formatUpdatedAt(updatedAt: string): string {
  return formatDate(updatedAt, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
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
              <Link
                to={`/news/${article.id}`}
                className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                aria-label={`Read ${article.title}`}
              >
                <img src={article.imageUrl} alt={`${article.title} logo`} className="h-full w-full object-contain" />
              </Link>
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
              <Actions target={{ id: article.id, title: article.title, path: `/news/${article.id}` }} storageKey="news" onLike={async (liked) => { await setNewsLiked(article.id, liked) }} />
              <span className="mx-1 h-5 w-px bg-border" />
              <ViewerCount count={article.viewerCount} />
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
