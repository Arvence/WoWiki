import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Actions from '../../../components/ui/Actions'
import ViewerCount from '../../../components/ui/ViewerCount'
import { formatDate } from '../../../shared/utils/date'
import { setNewsLiked } from '../api/newsService'
import type { News } from '../types/news'

type NewsListProps = {
  news: News[]
  loading: boolean
  error: string | null
  columns?: 1 | 2 | 3
}

const NEWS_IMAGE_MIN_WIDTH = 640

function formatUpdatedAt(updatedAt: string): string {
  return formatDate(updatedAt, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function NewsList({ news, loading, error, columns = 1 }: NewsListProps): JSX.Element {
  const listRef = useRef<HTMLDivElement>(null)
  const [hasImageSpace, setHasImageSpace] = useState(false)

  useEffect(() => {
    const list = listRef.current
    if (!list) return

    const updateImageSpace = (width: number) => setHasImageSpace(width >= NEWS_IMAGE_MIN_WIDTH)
    updateImageSpace(list.getBoundingClientRect().width)

    const observer = new ResizeObserver(([entry]) => updateImageSpace(entry.contentRect.width))
    observer.observe(list)
    return () => observer.disconnect()
  }, [error, loading, news.length])

  const showImages = columns === 1 && hasImageSpace

  if (loading) {
    return (
      <div className="grid gap-2" aria-label="Loading news">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="animate-pulse rounded-2xl bg-surface/60 px-4 py-4 sm:px-5">
            <div className="h-3 w-32 rounded bg-surface-alt" />
            <div className="mt-2 h-5 w-2/3 rounded bg-surface-alt" />
            <div className="mt-2 h-3 w-full max-w-xl rounded bg-surface-alt/70" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="rounded-2xl bg-danger/10 p-5 text-danger">{error}</p>
  }

  if (news.length === 0) {
    return <p className="rounded-2xl bg-surface/60 p-5 text-muted">No news articles are available.</p>
  }

  const layoutClass = columns === 1
    ? 'grid gap-2'
    : columns === 2
      ? 'grid gap-3 sm:grid-cols-2'
      : 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3'

  return (
    <div ref={listRef} className={layoutClass}>
      {news.map((article) => (
        <article
          key={article.id}
          className={`group relative isolate overflow-hidden rounded-2xl bg-surface/55 shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-0.5 hover:bg-surface/80 hover:shadow-[0_12px_35px_rgba(0,0,0,0.14)] ${columns === 1 ? 'min-h-32' : 'min-h-48'}`}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.055] via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" aria-hidden="true" />

          <div className="flex h-full min-w-0">
            <div className={`relative z-10 min-w-0 flex-1 px-4 py-3.5 sm:px-5 ${showImages ? 'max-w-[72%]' : ''}`}>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.68rem] text-muted">
                <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-[0.12em] text-primary">
                  <span className="h-1.5 w-1.5 rotate-45 bg-primary" aria-hidden="true" />
                  {article.category}
                </span>
                <time dateTime={article.updatedAt}>Updated {formatUpdatedAt(article.updatedAt)}</time>
                <span className="text-primary/50" aria-hidden="true">/</span>
                <span>By <strong className="font-semibold text-text/90">{article.author}</strong></span>
              </div>

              <h2 className="mt-1.5 text-lg font-bold leading-snug">
                <Link to={`/news/${article.id}`} className="text-text transition group-hover:text-primary focus:outline-none focus-visible:text-primary focus-visible:underline">
                  {article.title}
                </Link>
              </h2>
              <p className="mt-1 line-clamp-2 max-w-3xl text-sm leading-5 text-muted">{article.summary}</p>

              <footer className="mt-2.5 flex flex-wrap items-center gap-2">
                <Actions target={{ id: article.id, title: article.title, path: `/news/${article.id}` }} storageKey="news" onLike={async (liked) => { await setNewsLiked(article.id, liked) }} />
                <span className="text-primary/35" aria-hidden="true">&bull;</span>
                <ViewerCount count={article.viewerCount} compact />
              </footer>
            </div>

            {showImages && article.imageUrl && (
              <Link
                to={`/news/${article.id}`}
                className="absolute inset-0 z-0 overflow-hidden bg-background/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                aria-label={`Read ${article.title}`}
              >
                <img
                  src={article.imageUrl}
                  alt=""
                  className="absolute inset-y-0 right-0 h-full w-auto max-w-none object-contain object-right opacity-40 transition duration-500 group-hover:scale-[1.025] group-hover:opacity-50"
                />
              </Link>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
