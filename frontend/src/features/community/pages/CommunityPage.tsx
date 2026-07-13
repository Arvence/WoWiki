import AppFooter from '../../../components/layout/AppFooter'
import AppHeader from '../../../components/layout/AppHeader'
import CommunityEntry from '../components/CommunityEntry'
import CreateNewsCommunityEntry from '../components/CreateNewsCommunityEntry'
import { useCommunityEntries } from '../hooks/useCommunityEntries'

export default function CommunityPage(): JSX.Element {
  const { entries, loading, error } = useCommunityEntries()

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-surface to-surface-alt/40 px-6 py-8 shadow-xl sm:px-9 sm:py-10">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">WoWiki community</p>
              <h1 className="mt-2 text-3xl font-extrabold text-text sm:text-4xl">Community Forums</h1>
              <p className="mt-3 text-base leading-7 text-muted">Discuss builds, ask for help, document discoveries, and turn player experience into knowledge everyone can use.</p>
            </div>
            <CreateNewsCommunityEntry />
          </div>
        </section>

        <section id="entries" className="scroll-mt-24 pt-9" aria-labelledby="entries-heading">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Browse discussions</p>
              <h2 id="entries-heading" className="mt-1 text-2xl font-bold text-text">All community entries</h2>
            </div>
            {!loading && !error && <span className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-muted">{entries.length} entries</span>}
          </div>

          {loading && <p className="py-12 text-center text-muted">Loading community entries...</p>}
          {error && <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 p-5 text-danger">{error}</p>}
          {!loading && !error && entries.length > 0 && (
            <div className="mt-5 grid gap-2 md:grid-cols-2">
              {entries.map((entry) => <CommunityEntry key={entry.id} entry={entry} />)}
            </div>
          )}
          {!loading && !error && entries.length === 0 && <p className="py-12 text-center text-muted">No community entries available yet.</p>}
        </section>
      </main>
      <AppFooter />
    </div>
  )
}
