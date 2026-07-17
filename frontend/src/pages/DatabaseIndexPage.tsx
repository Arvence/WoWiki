import { Link } from 'react-router-dom'
import AppFooter from '../components/layout/AppFooter'
import AppHeader from '../components/layout/AppHeader'

const collections = [
  { code: 'CH', title: 'Characters', note: 'Heroes, rulers, villains, and legends', href: '/database/characters' },
  { code: 'CL', title: 'Classes', note: 'Combat roles and adventuring paths', href: '/database/classes' },
  { code: 'DG', title: 'Dungeons', note: 'Five-player journeys beneath Azeroth', href: '/database/dungeons' },
  { code: 'RD', title: 'Raids', note: 'The most dangerous group encounters', href: '/database/raids' },
  { code: 'IT', title: 'Items', note: 'Weapons, armor, artifacts, and rewards', href: '/database/items' },
]

export default function DatabaseIndexPage(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-[94rem] flex-1 px-4 py-7 sm:px-6 sm:py-10">
        <section className="relative isolate overflow-hidden rounded-3xl border border-border/70 bg-surface/70 px-6 py-8 shadow-[0_22px_60px_rgba(0,0,0,0.22)] sm:px-9 sm:py-10 lg:px-12">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_8%_0%,rgba(199,156,58,0.18),transparent_30%),radial-gradient(circle_at_96%_90%,rgba(161,59,43,0.10),transparent_26%)]" aria-hidden="true" />
          <div className="pointer-events-none absolute right-8 top-8 hidden h-28 w-28 rounded-full border border-primary/10 lg:block" aria-hidden="true"><span className="absolute inset-4 rounded-full border border-primary/10" /><span className="absolute inset-1/2 h-px w-16 -translate-x-1/2 bg-primary/15" /><span className="absolute left-1/2 top-1/2 h-16 w-px -translate-y-1/2 bg-primary/15" /></div>
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-primary">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-[0.65rem] font-black tracking-widest text-background shadow-lg shadow-primary/20">DB</span>
            WoWiki reference archive
          </div>
          <div className="mt-6 grid gap-9 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_23rem]">
            <div className="max-w-4xl">
              <h1 className="text-3xl font-black tracking-tight text-text sm:text-5xl">World of Warcraft Database</h1>
              <div className="mt-5 space-y-4 text-sm leading-7 text-muted sm:text-base sm:leading-8">
              <p>
                Azeroth is built from countless connected stories, places, people, and rewards. The WoWiki Database brings that information together as a structured reference for players who want a clear path through the world—whether they are recalling the history of a familiar character, comparing the identities of the game’s classes, preparing for an instance, or tracking down a memorable item.
              </p>
              <p>
                Each collection is organized around one part of the game and presented on its own focused page. Characters connect the factions and events that shaped the world. Classes describe the paths available to adventurers. Dungeons and raids gather the group challenges hidden across Azeroth, while the item archive records the weapons, armor, and treasures earned along the way.
              </p>
                <p>
                This archive is designed to grow alongside WoWiki. As more records are added, these collections will form a connected map of Classic World of Warcraft knowledge: easy to browse when you need a quick answer, consistent enough to compare related game data, and useful as a starting point for deeper guides and community discoveries.
                </p>
              </div>
            </div>
            <aside className="hidden self-end border-l border-border/70 pl-7 lg:block" aria-label="Archive contents">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">Inside the archive</p>
              <ol className="mt-4 divide-y divide-border/50">
                {collections.map((collection, index) => <li key={collection.href}><Link to={collection.href} className="group flex items-center justify-between gap-4 py-3 text-sm"><span className="font-semibold text-muted transition group-hover:text-primary">{collection.title}</span><span className="font-mono text-[0.65rem] text-muted/60">0{index + 1}</span></Link></li>)}
              </ol>
            </aside>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-border/60 pt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            <span><strong className="mr-2 text-primary">05</strong>Collections</span>
            <span><strong className="mr-2 text-primary">01</strong>Connected archive</span>
            <span><strong className="mr-2 text-primary">∞</strong>Stories to document</span>
          </div>
        </section>

        <section className="pt-8" aria-labelledby="collections-heading">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div><p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">Choose a path</p><h2 id="collections-heading" className="mt-1 text-xl font-black text-text">Explore the archive</h2></div>
            <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">{collections.length} collections</span>
          </div>
          <nav className="mt-4 grid gap-x-8 lg:grid-cols-2" aria-label="Game database collections">
            {collections.map((collection, index) => (
              <Link key={collection.href} to={collection.href} className="group grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-4 border-b border-border/60 px-2 py-4 transition hover:bg-primary/[0.055] sm:px-4 sm:py-5 lg:rounded-xl">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-[0.65rem] font-black tracking-wider text-primary shadow-sm transition group-hover:border-primary/50 group-hover:bg-primary group-hover:text-background">{collection.code}</span>
                <span className="min-w-0"><span className="block text-sm font-bold text-text transition group-hover:text-primary sm:text-base">{collection.title}</span><span className="mt-0.5 block truncate text-xs text-muted sm:text-sm">{collection.note}</span></span>
                <span className="flex items-center gap-3 text-xs font-semibold text-muted">
                  <span className="hidden tabular-nums sm:inline">0{index + 1}</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition group-hover:translate-x-1 group-hover:border-primary group-hover:text-primary"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg></span>
                </span>
              </Link>
            ))}
          </nav>
        </section>
      </main>
      <AppFooter />
    </div>
  )
}
