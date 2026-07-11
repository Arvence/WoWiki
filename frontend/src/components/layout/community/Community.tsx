import { useEffect, useState } from 'react'
import { fetchCommunityEntries } from '../../../api/communityService'
import type { CommunityEntryData } from '../../../types/community'
import CommunityEntry from './CommunityEntry'

export default function Community(): JSX.Element {
  const [entries, setEntries] = useState<CommunityEntryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadEntries = async () => {
      try {
        setEntries(await fetchCommunityEntries())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    void loadEntries()
  }, [])

  return (
    <aside className="order-3 lg:col-span-2 xl:order-1 xl:col-span-1" aria-labelledby="community-heading">
      <div className="xl:sticky xl:top-24">
        <section className="overflow-hidden rounded-lg border border-border bg-surface/80 shadow-sm">
          <div className="border-b border-border bg-surface-alt/40 px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">From the community</p>
                <h2 id="community-heading" className="mt-1 text-xl font-bold text-text">Member Entries</h2>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary" aria-hidden="true">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 12h8M12 8v8" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-5 text-muted">Guides, discoveries, and stories written by WoWiki members.</p>
          </div>

          {loading && (
            <div className="space-y-4 px-4 py-4" aria-label="Loading community entries">
              {[0, 1, 2].map((item) => (
                <div key={item} className="animate-pulse space-y-2">
                  <div className="h-3 w-1/3 rounded bg-surface-alt" />
                  <div className="h-4 w-4/5 rounded bg-surface-alt" />
                  <div className="h-3 w-full rounded bg-surface-alt" />
                </div>
              ))}
            </div>
          )}

          {error && <p className="m-4 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p>}

          {!loading && !error && entries.length > 0 && (
            <div className="divide-y divide-border">
              {entries.map((entry) => (
                <CommunityEntry key={entry.id} entry={entry} />
              ))}
            </div>
          )}

          {!loading && !error && entries.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted">No community entries available.</p>
          )}

          <a href="#" className="flex items-center justify-between border-t border-border px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-surface-alt/50">
            View all community entries
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </a>
        </section>
      </div>
    </aside>
  )
}
