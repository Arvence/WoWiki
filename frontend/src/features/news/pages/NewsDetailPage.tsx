import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchNewsById, setNewsLiked } from '../api/newsService'
import AppFooter from '../../../components/layout/AppFooter'
import AppHeader from '../../../components/layout/AppHeader'
import CreateNewsCommunityEntry from '../../community/components/CreateNewsCommunityEntry'
import Actions from '../../../components/ui/Actions'
import ViewerCount from '../../../components/ui/ViewerCount'
import { formatDate } from '../../../shared/utils/date'
import type { News } from '../types/news'

export default function NewsDetailPage(): JSX.Element {
  const { newsId } = useParams<{ newsId: string }>()
  const [article, setArticle] = useState<News | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!newsId) {
      setError('News article not found')
      setLoading(false)
      return
    }

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
                <p className="text-sm text-muted">Updated {formatDate(article.updatedAt, { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
              <div className="ml-auto flex w-full items-center justify-end gap-2 sm:w-auto">
                <Actions target={{ id: article.id, title: article.title, path: `/news/${article.id}` }} storageKey="news" onLike={async (liked) => setArticle(await setNewsLiked(article.id, liked))} />
                <CreateNewsCommunityEntry newsId={article.id} newsTitle={article.title} />
              </div>
            </div>
            <header className="border-b border-border px-4 py-6 sm:px-8 sm:py-8">
              <div className="flex items-center gap-3">
                <span className="rounded bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">{article.category}</span>
                <ViewerCount count={article.viewerCount} className="border-l border-border pl-3" />
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
