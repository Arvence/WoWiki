import { useEffect, useState } from 'react'
import { formatDate } from '../../../shared/utils/date'
import { fetchEditorNews } from '../api/newsService'
import type { EditorNewsPreview } from '../types/news'

const statuses = {
  draft: { label: 'Draft', tone: 'bg-surface-alt text-muted' },
  scheduled: { label: 'Scheduled', tone: 'bg-primary/10 text-primary' },
  published: { label: 'Published', tone: 'bg-success/10 text-success' },
}

export function NewsStatusLabel({ status }: { status: EditorNewsPreview['status'] }): JSX.Element {
  const { label, tone } = statuses[status]
  return <span className={`rounded-sm px-1.5 py-0.5 text-xs font-semibold ${tone}`}>{label}</span>
}

type NewsArticleListProps = {
  selectedId?: string
  revision: number
  disabled: boolean
  onSelect: (id: string) => void
}

export default function NewsArticleList({ selectedId, revision, disabled, onSelect }: NewsArticleListProps): JSX.Element {
  const [query, setQuery] = useState('')
  const [articles, setArticles] = useState<EditorNewsPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const search = query.trim()

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    const load = () => {
      void fetchEditorNews(search, controller.signal)
        .then((items) => { if (!controller.signal.aborted) setArticles(items) })
        .catch((reason: unknown) => {
          if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Could not load articles.')
        })
        .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    }
    const timer = search ? window.setTimeout(load, 250) : undefined
    if (!search) load()
    return () => {
      if (timer !== undefined) window.clearTimeout(timer)
      controller.abort()
    }
  }, [search, revision, retry])

  return (
    <aside id="articles" aria-labelledby="articles-heading" className="min-w-0 scroll-mt-32 rounded-md bg-surface lg:sticky lg:top-24">
      <div className="border-b border-border/50 px-4 py-4">
        <h2 id="articles-heading" className="mb-3 font-semibold text-text">Articles</h2>
        <div className="relative">
          <svg className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path strokeLinecap="round" d="m16 16 4 4" /></svg>
          <input type="search" aria-label="Search articles" value={query} maxLength={160} onChange={(event) => setQuery(event.target.value)}
            placeholder="Search articles…" className="w-full min-w-0 rounded-md border border-border bg-background/75 py-2 pl-8 pr-3 text-sm text-text outline-none placeholder:text-muted/65 focus:border-primary/70 focus:ring-2 focus:ring-primary/15 [color-scheme:dark]" />
        </div>
      </div>
      <div className="max-h-[28rem] overflow-y-auto p-2.5 [scrollbar-color:rgb(var(--color-border))_transparent] lg:max-h-[clamp(15rem,calc(100dvh-15rem),46rem)]" aria-busy={loading}>
        {loading ? <p role="status" className="p-2 text-sm text-muted">Loading articles…</p>
          : error ? <div className="p-2 text-sm"><p role="alert" className="text-danger">{error}</p><button type="button" onClick={() => setRetry((count) => count + 1)} className="mt-2 font-semibold text-primary hover:text-primary-hover">Try again</button></div>
            : articles.length === 0 ? <p role="status" className="p-2 text-sm text-muted">{search ? 'No articles match this search.' : 'No articles yet.'}</p>
              : <ul className="divide-y divide-border/40">
                {articles.map((article) => {
                  const selected = selectedId === article.id
                  const date = article.scheduledAtUtc ?? article.updatedAt
                  return (
                    <li key={article.id} className="py-1 first:pt-0 last:pb-0">
                      <button type="button" disabled={disabled} aria-pressed={selected} onClick={() => onSelect(article.id)}
                        className={`grid w-full grid-cols-[4.5rem_minmax(0,1fr)] gap-2.5 rounded-md p-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-wait ${selected ? 'bg-primary/15' : 'hover:bg-primary/5'}`}>
                        <span className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-sm bg-background text-muted/55">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="9" r="1.5" /><path d="m4 17 5-5 4 4 3-3 4 4" /></svg>
                          {article.imageUrl && <img key={article.imageUrl} src={article.imageUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" onError={(event) => event.currentTarget.classList.add('hidden')} />}
                        </span>
                        <span className="min-w-0">
                          <span className={`block break-words text-sm font-semibold leading-tight ${selected ? 'text-primary-hover' : 'text-text'}`}>{article.title}</span>
                          <span className="mt-1 line-clamp-2 break-words text-xs leading-snug text-muted">{article.summary}</span>
                          <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <NewsStatusLabel status={article.status} />
                            <time className="text-xs text-muted" dateTime={date} title={article.scheduledAtUtc ? 'Scheduled publication date' : 'Last updated'}>{formatDate(date, { dateStyle: 'medium', timeZone: 'Europe/Berlin' })}</time>
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>}
      </div>
    </aside>
  )
}
