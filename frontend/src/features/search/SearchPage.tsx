import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AppFooter from '../../components/layout/AppFooter'
import AppHeader from '../../components/layout/AppHeader'
import { searchWoWiki, type SearchResult } from './searchService'

export default function SearchPage(): JSX.Element {
  const [params] = useSearchParams()
  const query = (params.get('q') ?? '').trim()
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!query) { setResults([]); return }
    const controller = new AbortController()
    setLoading(true); setError('')
    searchWoWiki(query, controller.signal)
      .then(setResults)
      .catch((requestError: unknown) => {
        if (!(requestError instanceof DOMException && requestError.name === 'AbortError')) setError('Search is unavailable right now. Please try again.')
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [query])

  return <div className="min-h-screen bg-background">
    <AppHeader />
    <main className="mx-auto min-h-[65vh] w-full max-w-5xl px-3 py-8 sm:px-5">
      <header className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Search WoWiki</p>
        <h1 className="mt-2 text-2xl font-black text-text sm:text-3xl">{query ? `Results for “${query}”` : 'Explore Azeroth'}</h1>
        <p className="mt-2 text-sm text-muted">{loading ? 'Searching across the archive…' : query ? `${results.length} ${results.length === 1 ? 'result' : 'results'} across news, community, and the game database.` : 'Use the search field above to find articles, discussions, characters, instances, and items.'}</p>
      </header>
      {error && <p className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">{error}</p>}
      {loading && <div className="space-y-3" aria-label="Loading search results">{[1, 2, 3, 4].map((item) => <div key={item} className="h-28 animate-pulse rounded-xl border border-border/50 bg-surface/60" />)}</div>}
      {!loading && !error && query && results.length === 0 && <section className="rounded-2xl border border-border/60 bg-surface/60 px-6 py-16 text-center"><p className="font-bold text-text">No matching entries</p><p className="mt-2 text-sm text-muted">Try fewer words or a broader term such as a class, zone, or item type.</p></section>}
      {!loading && !error && results.length > 0 && <section className="overflow-hidden rounded-2xl border border-border/60 bg-surface/60 divide-y divide-border/50">{results.map((result) => <Link key={result.id} to={result.href} className="group block px-5 py-4 transition hover:bg-primary/[0.06] sm:px-6"><div className="flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-wider"><span className="rounded-md bg-primary/10 px-2 py-1 text-primary">{result.kind}</span><span className="text-muted">{result.category}</span></div><h2 className="mt-2 text-lg font-bold text-text transition group-hover:text-primary">{result.title}</h2><p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">{result.description}</p></Link>)}</section>}
    </main>
    <AppFooter />
  </div>
}
