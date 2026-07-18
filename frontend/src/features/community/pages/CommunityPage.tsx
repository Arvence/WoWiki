import { useMemo, useState } from 'react'
import AppFooter from '../../../components/layout/AppFooter'
import AppHeader from '../../../components/layout/AppHeader'
import CommunityEntry from '../components/CommunityEntry'
import { useCommunityEntries } from '../hooks/useCommunityEntries'

export default function CommunityPage(): JSX.Element {
  const { entries, loading, error } = useCommunityEntries()
  const [feed, setFeed] = useState<'top' | 'latest' | 'event'>('latest')
  const [listing, setListing] = useState<'detail' | 'card'>('detail')
  const [listingMenuOpen, setListingMenuOpen] = useState(false)
  const visibleEntries = useMemo(() => {
    const filtered = feed === 'event' ? entries.filter((entry) => entry.category.toLowerCase().includes('event')) : [...entries]
    return filtered.sort((a, b) => feed === 'top' ? b.viewerCount + b.commentCount * 10 - (a.viewerCount + a.commentCount * 10) : Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
  }, [entries, feed])

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section id="entries" className="scroll-mt-24" aria-label="Community entries">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3" aria-label="Community feed controls">
            <div className="flex items-center gap-1">{(['top', 'latest', 'event'] as const).map((item) => <button key={item} type="button" onClick={() => setFeed(item)} className={`rounded-md px-3 py-2 text-sm font-semibold capitalize ${feed === item ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-background hover:text-text'}`}>{item}</button>)}</div>
            <div className="relative" aria-label="Listing type">
              <button type="button" onClick={() => setListingMenuOpen((open) => !open)} aria-expanded={listingMenuOpen} aria-haspopup="true" className="inline-flex h-8 items-center justify-center px-2 text-muted transition hover:text-text" aria-label={`View: ${listing === 'detail' ? 'Detail' : 'Card'}`}>
                <span className="flex items-center justify-center">
                  {listing === 'detail' ? <svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16" aria-hidden="true"><path d="M14.7 2H5.3C3.48 2 2 3.48 2 5.3v9.4C2 16.52 3.48 18 5.3 18h9.4c1.82 0 3.3-1.48 3.3-3.3V5.3C18 3.48 16.52 2 14.7 2zM5.3 3.8h9.4c.83 0 1.5.67 1.5 1.5v1.43H3.8V5.3c0-.83.67-1.5 1.5-1.5zm10.9 4.73v2.93H3.8V8.53h12.4zm-1.5 7.67H5.3c-.83 0-1.5-.67-1.5-1.5v-1.43h12.4v1.43c0 .83-.67 1.5-1.5 1.5z" /></svg> : <svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16" aria-hidden="true"><path d="M5 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5zm0 1.8h10A1.2 1.2 0 0 1 16.2 5v10a1.2 1.2 0 0 1-1.2 1.2H5A1.2 1.2 0 0 1 3.8 15V5A1.2 1.2 0 0 1 5 3.8z" /></svg>}
                </span>
                <span className="ml-1 flex"><svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16" aria-hidden="true"><path d="M10 13.7a.897.897 0 0 1-.636-.264l-4.6-4.6a.9.9 0 1 1 1.272-1.273L10 11.526l3.964-3.963a.9.9 0 0 1 1.272 1.273l-4.6 4.6A.897.897 0 0 1 10 13.7z" /></svg></span>
              </button>
              {listingMenuOpen && <div className="absolute right-0 top-full z-30 mt-2 w-11 rounded-lg bg-surface p-1 shadow-xl ring-1 ring-border"><button type="button" aria-label="Detail view" title="Detail view" onClick={() => { setListing('detail'); setListingMenuOpen(false) }} className={`flex h-9 w-9 items-center justify-center rounded-md ${listing === 'detail' ? 'bg-primary/10 text-primary' : 'text-text hover:bg-background'}`}><svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16" aria-hidden="true"><path d="M14.7 2H5.3C3.48 2 2 3.48 2 5.3v9.4C2 16.52 3.48 18 5.3 18h9.4c1.82 0 3.3-1.48 3.3-3.3V5.3C18 3.48 16.52 2 14.7 2zM5.3 3.8h9.4c.83 0 1.5.67 1.5 1.5v1.43H3.8V5.3c0-.83.67-1.5 1.5-1.5zm10.9 4.73v2.93H3.8V8.53h12.4zm-1.5 7.67H5.3c-.83 0-1.5-.67-1.5-1.5v-1.43h12.4v1.43c0 .83-.67 1.5-1.5 1.5z" /></svg></button><button type="button" aria-label="Card view" title="Card view" onClick={() => { setListing('card'); setListingMenuOpen(false) }} className={`flex h-9 w-9 items-center justify-center rounded-md ${listing === 'card' ? 'bg-primary/10 text-primary' : 'text-text hover:bg-background'}`}><svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16" aria-hidden="true"><path d="M5 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5zm0 1.8h10A1.2 1.2 0 0 1 16.2 5v10a1.2 1.2 0 0 1-1.2 1.2H5A1.2 1.2 0 0 1 3.8 15V5A1.2 1.2 0 0 1 5 3.8z" /></svg></button></div>}
            </div>
          </div>

          {loading && <p className="py-12 text-center text-muted">Loading community entries...</p>}
          {error && <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 p-5 text-danger">{error}</p>}
          {!loading && !error && visibleEntries.length > 0 && (
            <div className={`mt-5 grid gap-2 ${listing === 'card' ? 'mx-auto w-full max-w-2xl' : ''}`}>
              {visibleEntries.map((entry) => <CommunityEntry key={entry.id} entry={entry} variant={listing} />)}
            </div>
          )}
          {!loading && !error && visibleEntries.length === 0 && <p className="py-12 text-center text-muted">No community entries available for this feed.</p>}
        </section>
      </main>
      <AppFooter />
    </div>
  )
}
