import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import AppFooter from '../../components/layout/AppFooter'
import AppHeader from '../../components/layout/AppHeader'
import { useAuth } from '../auth/AuthContext'
import { fetchCommunityEntries } from '../community/api/communityService'
import { fetchNews } from '../news/api/newsService'
import { formatDate } from '../../shared/utils/date'
import { BOOKMARK_CHANGE_EVENT, isBookmarked, setBookmarked, type BookmarkKind } from './bookmarkStorage'

type BookmarkItem = {
  id: string
  kind: BookmarkKind
  title: string
  description: string
  category: string
  author: string
  date: string
  image?: string
  path: string
}

type BookmarkFilter = 'all' | BookmarkKind

const FILTER_LABELS: Record<BookmarkFilter, string> = {
  all: 'All bookmarks',
  news: 'News',
  community: 'Community',
}

function BookmarkIcon({ className = 'h-5 w-5', filled = false }: { className?: string; filled?: boolean }): JSX.Element {
  return <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" /></svg>
}

export default function BookmarksPage(): JSX.Element {
  const { user, loading: authLoading } = useAuth()
  const [content, setContent] = useState<BookmarkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<BookmarkFilter>('all')
  const [bookmarkRevision, setBookmarkRevision] = useState(0)

  useEffect(() => {
    const refreshBookmarks = () => setBookmarkRevision((current) => current + 1)
    window.addEventListener('storage', refreshBookmarks)
    window.addEventListener(BOOKMARK_CHANGE_EVENT, refreshBookmarks)
    return () => {
      window.removeEventListener('storage', refreshBookmarks)
      window.removeEventListener(BOOKMARK_CHANGE_EVENT, refreshBookmarks)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadContent = async () => {
      setLoading(true)
      setError(null)
      const [newsResult, communityResult] = await Promise.allSettled([fetchNews(), fetchCommunityEntries()])
      if (cancelled) return

      const items: BookmarkItem[] = []
      if (newsResult.status === 'fulfilled') {
        items.push(...newsResult.value.map((article) => ({
          id: article.id,
          kind: 'news' as const,
          title: article.title,
          description: article.summary,
          category: article.category,
          author: article.author,
          date: article.updatedAt,
          image: article.imageUrl,
          path: `/news/${article.id}`,
        })))
      }
      if (communityResult.status === 'fulfilled') {
        items.push(...communityResult.value.map((entry) => ({
          id: entry.id,
          kind: 'community' as const,
          title: entry.title,
          description: entry.excerpt,
          category: entry.category,
          author: entry.author,
          date: entry.publishedAt,
          image: entry.image,
          path: `/community/${entry.id}`,
        })))
      }

      if (newsResult.status === 'rejected' && communityResult.status === 'rejected') setError('Could not load your bookmarked content. Please try again.')
      else if (newsResult.status === 'rejected' || communityResult.status === 'rejected') setError('Some bookmarked content could not be loaded.')

      setContent(items.sort((first, second) => Date.parse(second.date) - Date.parse(first.date)))
      setLoading(false)
    }

    void loadContent()
    return () => { cancelled = true }
  }, [])

  const bookmarks = useMemo(() => content.filter((item) => isBookmarked(item.kind, item.id)), [content, bookmarkRevision])
  const visibleBookmarks = useMemo(() => filter === 'all' ? bookmarks : bookmarks.filter((item) => item.kind === filter), [bookmarks, filter])
  const totals = useMemo(() => ({
    all: bookmarks.length,
    news: bookmarks.filter((item) => item.kind === 'news').length,
    community: bookmarks.filter((item) => item.kind === 'community').length,
  }), [bookmarks])

  if (!authLoading && !user) return <Navigate to="/auth" state={{ from: '/bookmarks' }} replace />

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section aria-labelledby="bookmarks-heading">
          <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 id="bookmarks-heading" className="text-2xl font-bold text-text sm:text-3xl">Bookmarks</h1>
              <p className="mt-1 text-sm text-muted">Your bookmarks are stored on this device.</p>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter bookmarks">
              {(Object.keys(FILTER_LABELS) as BookmarkFilter[]).map((item) => (
                <button key={item} type="button" onClick={() => setFilter(item)} aria-pressed={filter === item} className={`rounded-lg px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${filter === item ? 'bg-primary text-background shadow-sm' : 'bg-surface text-muted hover:bg-surface-alt hover:text-text'}`}>
                  {FILTER_LABELS[item]} <span className={`ml-1 tabular-nums ${filter === item ? 'text-background/70' : 'text-muted/70'}`}>{totals[item]}</span>
                </button>
              ))}
            </div>
          </div>

          {loading && <div className="grid gap-4 py-6 md:grid-cols-2" aria-label="Loading bookmarks">{[0, 1, 2, 3].map((item) => <div key={item} className="h-48 animate-pulse rounded-xl border border-border/40 bg-surface/70" />)}</div>}
          {error && <p role="alert" className="mt-5 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}

          {!loading && bookmarks.length === 0 && (
            <div className="my-7 flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface/45 px-6 py-14 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary"><BookmarkIcon className="h-6 w-6" /></span>
              <h3 className="mt-5 text-xl font-bold text-text">Your library is ready</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted">Use the bookmark icon on any news story or community post, and it will appear here.</p>
              <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-background transition hover:bg-primary-hover">Explore content <span aria-hidden="true">→</span></Link>
            </div>
          )}

          {!loading && bookmarks.length > 0 && visibleBookmarks.length === 0 && <p className="my-8 rounded-xl border border-border bg-surface/50 p-8 text-center text-muted">No {FILTER_LABELS[filter].toLowerCase()} saved yet.</p>}

          {!loading && visibleBookmarks.length > 0 && (
            <div className="grid gap-4 py-6 md:grid-cols-2">
              {visibleBookmarks.map((item) => (
                <article key={`${item.kind}:${item.id}`} className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-surface shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-xl">
                  <Link to={item.path} className="relative flex h-36 items-center justify-center overflow-hidden bg-background" aria-label={`Open ${item.title}`}>
                    {item.image ? <img src={item.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]" /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(199,156,58,0.16),transparent_50%)]" />}
                    {!item.image && <BookmarkIcon className="h-9 w-9 text-primary/55" />}
                    <span className="absolute left-3 top-3 rounded-md border border-white/10 bg-background/85 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-primary backdrop-blur">{item.kind === 'news' ? 'News' : 'Community'}</span>
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2 text-xs text-muted"><span className="font-semibold text-primary">{item.category}</span><span aria-hidden="true">•</span><span>{formatDate(item.date, { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
                    <h3 className="mt-2 text-lg font-bold leading-6 text-text"><Link to={item.path} className="transition hover:text-primary">{item.title}</Link></h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{item.description}</p>
                    <div className="mt-auto flex items-center justify-between gap-4 border-t border-border/60 pt-4 text-sm">
                      <span className="min-w-0 truncate text-muted">By <span className="font-medium text-text">{item.author}</span></span>
                      <button type="button" onClick={() => setBookmarked(item.kind, item.id, false)} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 font-semibold text-primary transition hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={`Remove ${item.title} from bookmarks`}><BookmarkIcon className="h-4 w-4" filled /> Remove</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <AppFooter />
    </div>
  )
}
