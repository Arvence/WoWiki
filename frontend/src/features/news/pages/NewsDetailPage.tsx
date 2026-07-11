import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchNewsById, setNewsLiked } from '../api/newsService'
import AppFooter from '../../../components/layout/AppFooter'
import AppHeader from '../../../components/layout/AppHeader'
import CreateNewsCommunityEntry from '../../community/components/CreateNewsCommunityEntry'
import type { News } from '../types/news'

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export default function NewsDetailPage(): JSX.Element {
  const { newsId } = useParams<{ newsId: string }>()
  const [article, setArticle] = useState<News | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [updatingLike, setUpdatingLike] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [shareFeedback, setShareFeedback] = useState<string | null>(null)
  const shareFeedbackTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!newsId) {
      setError('News article not found')
      setLoading(false)
      return
    }

    setLiked(localStorage.getItem(`wowiki:liked-news:${newsId}`) === 'true')
    setSaved(localStorage.getItem(`wowiki:saved-news:${newsId}`) === 'true')

    const loadArticle = async () => {
      try {
        const newsArticle = await fetchNewsById(newsId)
        setArticle(newsArticle)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    void loadArticle()
  }, [newsId])

  useEffect(() => () => {
    if (shareFeedbackTimer.current !== null) window.clearTimeout(shareFeedbackTimer.current)
  }, [])

  const handleLike = async () => {
    if (!article || updatingLike) return
    const nextLiked = !liked
    setUpdatingLike(true)
    setActionMessage(null)
    try {
      const updatedArticle = await setNewsLiked(article.id, nextLiked)
      setArticle(updatedArticle)
      setLiked(nextLiked)
      localStorage.setItem(`wowiki:liked-news:${article.id}`, String(nextLiked))
    } catch {
      setActionMessage('Could not update your like. Please try again.')
    } finally {
      setUpdatingLike(false)
    }
  }

  const handleSave = () => {
    if (!article) return
    const nextSaved = !saved
    setSaved(nextSaved)
    localStorage.setItem(`wowiki:saved-news:${article.id}`, String(nextSaved))
    setActionMessage(nextSaved ? 'Article saved.' : 'Article removed from saved items.')
  }

  const handleShare = async () => {
    if (!article) return
    try {
      await navigator.clipboard.writeText(window.location.href)
      setActionMessage('Link copied to clipboard.')
      setShareFeedback('Link copied!')
    } catch {
      setActionMessage('Could not share this article.')
      setShareFeedback('Copy failed')
    }
    if (shareFeedbackTimer.current !== null) window.clearTimeout(shareFeedbackTimer.current)
    shareFeedbackTimer.current = window.setTimeout(() => setShareFeedback(null), 2200)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-text">
          <span aria-hidden="true">&larr;</span> Back to news
        </Link>

        {loading && <p className="mt-6 border-y border-border py-10 text-center text-muted">Loading article...</p>}
        {error && <p className="mt-6 border border-danger/30 bg-danger/10 p-5 text-danger">{error}</p>}

        {article && (
          <article className="mt-6 overflow-hidden border-y border-border bg-surface/60">
            {article.imageUrl && (
              <div className="h-64 bg-background/50 sm:h-96 py-4">
                <img src={article.imageUrl} alt={article.title} className="h-full w-full object-contain" />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3 border-b border-border bg-background/40 px-4 py-4 sm:px-8">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-bold text-primary" aria-hidden="true">
                {article.author.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-text">{article.author}</p>
                <p className="text-sm text-muted">Updated {formatDate(article.updatedAt)}</p>
              </div>
              <div className="ml-auto flex w-full items-center justify-end gap-2 sm:w-auto">
                <div className="flex items-center gap-1 sm:gap-2">
                  <button type="button" onClick={() => void handleLike()} disabled={updatingLike} aria-label={liked ? `Unlike ${article.title}` : `Like ${article.title}`} aria-pressed={liked} className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60 ${liked ? 'bg-wow-blood/20 text-wow-blood' : 'text-muted hover:bg-wow-blood/15 hover:text-wow-blood'}`}>
                    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z" /></svg>
                  </button>
                  <button type="button" onClick={handleSave} aria-label={saved ? `Remove ${article.title} from saved articles` : `Save ${article.title}`} aria-pressed={saved} className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${saved ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-primary/10 hover:text-primary'}`}>
                    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" /></svg>
                  </button>
                  <div className="relative">
                    {shareFeedback && (
                      <span role="status" className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap rounded-lg border border-primary/30 bg-surface px-3 py-1.5 text-xs font-semibold text-text shadow-xl shadow-black/30">
                        {shareFeedback}
                        <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-primary/30 bg-surface" aria-hidden="true" />
                      </span>
                    )}
                    <button type="button" onClick={() => void handleShare()} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-primary/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={`Copy link to ${article.title}`}>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" /></svg>
                    </button>
                  </div>
                </div>
                <CreateNewsCommunityEntry newsId={article.id} newsTitle={article.title} />
              </div>
              {actionMessage && <span className="sr-only" role="status">{actionMessage}</span>}
            </div>
            <header className="border-b border-border px-4 py-6 sm:px-8 sm:py-8">
              <div className="flex items-center gap-3">
                <span className="rounded bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">{article.category}</span>
                <span className="inline-flex items-center gap-2 border-l border-border pl-3 text-sm tabular-nums text-muted" aria-label={`${article.viewerCount?.toLocaleString() ?? 0} views`}>
                  <svg className="h-[18px] w-[18px] text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>
                  {article.viewerCount?.toLocaleString() ?? 0}
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-bold text-text sm:text-4xl">{article.title}</h1>
            </header>
            <div className="space-y-5 px-4 py-6 sm:px-8 sm:py-8">
              <p className="text-xl font-medium leading-8 text-text">{article.summary}</p>
              <p className="whitespace-pre-line text-base leading-7 text-muted">{article.content}</p>
            </div>
          </article>
        )}
      </main>
      <AppFooter />
    </div>
  )
}
