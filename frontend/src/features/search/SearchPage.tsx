import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AppFooter from '../../components/layout/AppFooter'
import AppHeader from '../../components/layout/AppHeader'
import SearchResultIcon from './SearchResultIcon'
import { searchWoWiki, type SearchResult } from './searchService'

type SearchFilter = 'All' | SearchResult['kind']

const filters: SearchFilter[] = ['All', 'News', 'Community', 'Database']
const suggestedSearches = ['Molten Core', 'Deadmines', 'Warrior', 'Thrall']

export default function SearchPage(): JSX.Element {
  const [params, setParams] = useSearchParams()
  const query = (params.get('q') ?? '').trim()
  const requestedFilter = params.get('type')
  const activeFilter: SearchFilter = filters.find((filter) => filter.toLocaleLowerCase() === requestedFilter?.toLocaleLowerCase()) ?? 'All'
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!query) {
      setResults([])
      setLoading(false)
      setError('')
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError('')
    setResults([])
    searchWoWiki(query, controller.signal)
      .then(setResults)
      .catch((requestError: unknown) => {
        if (!(requestError instanceof DOMException && requestError.name === 'AbortError')) {
          setError('Search is unavailable right now. Please try again.')
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })

    return () => controller.abort()
  }, [query, retryCount])

  const resultCounts: Record<SearchFilter, number> = {
    All: results.length,
    News: results.filter((result) => result.kind === 'News').length,
    Community: results.filter((result) => result.kind === 'Community').length,
    Database: results.filter((result) => result.kind === 'Database').length,
  }
  const visibleResults = activeFilter === 'All' ? results : results.filter((result) => result.kind === activeFilter)

  const selectFilter = (filter: SearchFilter) => {
    const nextParams = new URLSearchParams(params)
    if (filter === 'All') nextParams.delete('type')
    else nextParams.set('type', filter.toLocaleLowerCase())
    setParams(nextParams, { replace: true })
  }

  return <div className="min-h-screen bg-background">
    <AppHeader />
    <main className="mx-auto min-h-[65vh] w-full max-w-5xl px-3 py-8 sm:px-5 sm:py-10">
      <header className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Search WoWiki</p>
        <h1 className="mt-2 text-2xl font-black text-text sm:text-3xl">{query ? `Results for "${query}"` : 'Explore Azeroth'}</h1>
        <p className="mt-2 text-sm text-muted" aria-live="polite">
          {loading
            ? 'Searching across the archive...'
            : query
              ? `${results.length} ${results.length === 1 ? 'result' : 'results'} across news, community, and the game database.`
              : 'Find news, player discussions, characters, classes, instances, and items from one place.'}
        </p>
      </header>

      {error && <section className="flex flex-col items-start gap-4 rounded-2xl border border-danger/40 bg-danger/10 p-5 sm:flex-row sm:items-center sm:justify-between" role="alert">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/15 text-danger"><SearchResultIcon kind="All" /></span>
          <p className="text-sm font-semibold text-danger">{error}</p>
        </div>
        <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="rounded-xl border border-danger/50 px-4 py-2 text-sm font-bold text-danger transition hover:bg-danger/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger">Try again</button>
      </section>}

      {loading && <div className="space-y-3" aria-label="Loading search results">
        {[1, 2, 3, 4].map((item) => <div key={item} className="grid h-32 grid-cols-[3rem_1fr] gap-4 rounded-2xl border border-border/50 bg-surface/60 p-5"><span className="h-12 w-12 animate-pulse rounded-xl bg-surface-alt" /><span className="space-y-3"><span className="block h-3 w-28 animate-pulse rounded bg-surface-alt" /><span className="block h-5 w-2/3 animate-pulse rounded bg-surface-alt" /><span className="block h-3 w-full animate-pulse rounded bg-surface-alt" /></span></div>)}
      </div>}

      {!loading && !error && !query && <EmptySearch />}

      {!loading && !error && query && results.length === 0 && <section className="rounded-2xl border border-border/60 bg-surface/60 px-6 py-14 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-background/50 text-primary"><SearchResultIcon kind="All" className="h-6 w-6" /></span>
        <h2 className="mt-4 font-bold text-text">No matches found</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">Check the spelling or try fewer words. Broad terms such as a class, zone, raid, or item type usually work best.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">{suggestedSearches.map((suggestion) => <Link key={suggestion} to={`/search?q=${encodeURIComponent(suggestion)}`} className="rounded-full border border-border bg-background/45 px-3 py-1.5 text-xs font-bold text-muted transition hover:border-primary/60 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">{suggestion}</Link>)}</div>
      </section>}

      {!loading && !error && results.length > 0 && <>
        <nav className="mb-4 flex flex-wrap gap-2" aria-label="Filter search results">
          {filters.map((filter) => {
            const selected = filter === activeFilter
            return <button key={filter} type="button" onClick={() => selectFilter(filter)} aria-pressed={selected} className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selected ? 'border-primary/65 bg-primary text-background shadow-md shadow-primary/10' : 'border-border/60 bg-surface/60 text-muted hover:border-primary/40 hover:bg-primary/[0.06] hover:text-text'}`}>
              <SearchResultIcon kind={filter} className="h-4 w-4" />
              <span>{filter}</span>
              <span className={`rounded-md px-1.5 py-0.5 text-[0.65rem] ${selected ? 'bg-background/20' : 'bg-background/60'}`}>{resultCounts[filter]}</span>
            </button>
          })}
        </nav>

        {visibleResults.length > 0 ? <section className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/60 bg-surface/60" aria-label={`${activeFilter} search results`}>
          {visibleResults.map((result) => <Link key={result.id} to={result.href} aria-label={`${result.kind}: ${result.title}`} className="group grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 px-4 py-4 transition hover:bg-primary/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:gap-4 sm:px-6 sm:py-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/55 text-primary shadow-inner shadow-black/10 transition group-hover:border-primary/40 group-hover:bg-primary/10 sm:h-12 sm:w-12">
              <SearchResultIcon kind={result.kind} category={result.category} className="h-5 w-5 sm:h-6 sm:w-6" />
            </span>
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.68rem] font-black uppercase tracking-wider"><span className="text-primary">{result.kind}</span><span className="h-1 w-1 rounded-full bg-border" aria-hidden="true" /><span className="text-muted">{result.category}</span></span>
              <span className="mt-1.5 block text-base font-bold text-text transition group-hover:text-primary sm:text-lg"><HighlightedText text={result.title} query={query} /></span>
              <span className="mt-1 line-clamp-2 text-sm leading-6 text-muted"><HighlightedText text={result.description} query={query} /></span>
            </span>
            <svg className="mt-3 h-4 w-4 self-start text-muted/60 transition group-hover:translate-x-1 group-hover:text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" /></svg>
          </Link>)}
        </section> : <section className="rounded-2xl border border-border/60 bg-surface/60 px-6 py-12 text-center">
          <p className="font-bold text-text">No {activeFilter.toLowerCase()} matches</p>
          <p className="mt-2 text-sm text-muted">Other result types still contain matches for this search.</p>
          <button type="button" onClick={() => selectFilter('All')} className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-black text-background transition hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">Show all results</button>
        </section>}
      </>}
    </main>
    <AppFooter />
  </div>
}

function EmptySearch(): JSX.Element {
  return <section className="rounded-2xl border border-border/60 bg-surface/60 px-5 py-12 text-center sm:px-8">
    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.08] text-primary"><SearchResultIcon kind="All" className="h-7 w-7" /></span>
    <h2 className="mt-5 text-lg font-black text-text">What are you looking for?</h2>
    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted">Use the search bar above, or start with one of these popular subjects.</p>
    <div className="mt-6 flex flex-wrap justify-center gap-2.5">{suggestedSearches.map((suggestion) => <Link key={suggestion} to={`/search?q=${encodeURIComponent(suggestion)}`} className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/45 px-4 py-2.5 text-sm font-bold text-text transition hover:-translate-y-0.5 hover:border-primary/55 hover:bg-primary/[0.07] hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"><SearchResultIcon kind="All" className="h-4 w-4 text-primary" />{suggestion}</Link>)}</div>
  </section>
}

function HighlightedText({ text, query }: { text: string; query: string }): JSX.Element {
  const terms = Array.from(new Set(query.split(/\s+/).map((term) => term.trim().toLocaleLowerCase()).filter(Boolean))).sort((a, b) => b.length - a.length)
  if (terms.length === 0) return <>{text}</>

  const expression = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi')
  const termSet = new Set(terms)
  return <>{text.split(expression).map((part, index) => termSet.has(part.toLocaleLowerCase()) ? <mark key={`${part}-${index}`} className="rounded-sm bg-primary/15 text-inherit">{part}</mark> : part)}</>
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
