import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { downloadNewsPdf, fetchNews, fetchNewsById, setNewsLiked } from '../api/newsService'
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
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [relatedArticles, setRelatedArticles] = useState<News[]>([])

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
        try {
          const allNews = await fetchNews()
          setRelatedArticles(allNews
            .filter((item) => item.id !== newsArticle.id)
            .sort((first, second) => Number(second.category === newsArticle.category) - Number(first.category === newsArticle.category))
            .slice(0, 3))
        } catch {
          setRelatedArticles([])
        }
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
          <div className="mt-6 grid items-start md:grid-cols-[3.5rem_minmax(0,1fr)] lg:grid-cols-[3.5rem_minmax(0,1fr)_19.5rem]">
            <div className="flex w-fit justify-start border-t border-primary bg-surface/60 px-2 py-2 md:sticky md:top-24 md:w-auto md:justify-center md:border-l md:border-t-0">
              <Actions
                target={{ id: article.id, title: article.title, path: `/news/${article.id}` }}
                storageKey="news"
                orientation="responsive"
                leadingAction={<CreateNewsCommunityEntry newsId={article.id} newsTitle={article.title} action />}
                onLike={async (liked) => setArticle(await setNewsLiked(article.id, liked))}
                showDownload
                downloading={downloadingPdf}
                onDownload={async () => {
                  setDownloadingPdf(true)
                  setError(null)
                  try {
                    await downloadNewsPdf(article)
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to create PDF')
                  } finally {
                    setDownloadingPdf(false)
                  }
                }}
              />
            </div>

            <article className="min-w-0 overflow-hidden bg-surface/60">
              {article.imageUrl && (
                <div className="h-64 bg-background/50 py-4 sm:h-96">
                  <img src={article.imageUrl} alt={article.title} className="h-full w-full object-contain" />
                </div>
              )}
              <header className="border-b border-border px-4 py-6 sm:px-8 sm:py-8">
                <div className="flex items-center gap-3">
                  <span className="rounded bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">{article.category}</span>
                  <ViewerCount count={article.viewerCount} className="border-l border-border pl-3" />
                </div>
                <h1 className="mt-4 text-3xl font-light text-primary sm:text-4xl">{article.title}</h1>
              </header>
              <div className="space-y-5 px-4 py-6 sm:px-8 sm:py-8">
                <p className="text-xl font-medium leading-8 text-text">{article.summary}</p>
                <p className="whitespace-pre-line text-base leading-7 text-muted">{article.content}</p>
              </div>
            </article>

            <aside className="mt-4 md:col-start-2 lg:col-start-auto lg:ml-6 lg:mt-0 lg:sticky lg:top-24" aria-label="Article details">
              <section className="overflow-hidden bg-surface/80 shadow-sm" aria-label="Author details">
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">Written by</p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-lg font-bold text-primary" aria-hidden="true">
                      {article.author.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-text">{article.author}</p>
                      <p className="text-xs text-muted">WoWiki contributor</p>
                    </div>
                  </div>
                  <dl className="mt-5 border-t border-border pt-4">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Last updated</dt>
                      <dd className="mt-1 text-sm text-text">{formatDate(article.updatedAt, { dateStyle: 'medium', timeStyle: 'short' })}</dd>
                    </div>
                  </dl>
                </div>
              </section>

              {relatedArticles.length > 0 && (
                <section className="mt-5 bg-surface/80 p-5 shadow-sm" aria-labelledby="see-also-heading">
                  <h2 id="see-also-heading" className="text-xs font-bold uppercase tracking-widest text-primary">See also</h2>
                  <ul className="mt-3 divide-y divide-border">
                    {relatedArticles.map((relatedArticle) => (
                      <li key={relatedArticle.id} className="py-3 first:pt-0 last:pb-0">
                        <Link to={`/news/${relatedArticle.id}`} className="group block">
                          <span className="block text-xs font-semibold uppercase tracking-wide text-muted">{relatedArticle.category}</span>
                          <span className="mt-1 block text-sm font-medium leading-5 text-text transition group-hover:text-primary">{relatedArticle.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </aside>
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  )
}
