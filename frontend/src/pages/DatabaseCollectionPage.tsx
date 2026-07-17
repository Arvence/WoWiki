import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import AppFooter from '../components/layout/AppFooter'
import AppHeader from '../components/layout/AppHeader'
import { fetchDatabaseCollection } from '../features/database/api/databaseService'
import { databaseCollections as categories, getDatabaseCollection, isDatabaseCategory } from '../features/database/database.config'
import type { DatabaseCategory as Category, DatabaseRecord, Dungeon, GameClass, Item, Raid } from '../features/database/types/database'
import type { Character } from '../features/characters/types/character'
const qualityColor: Record<Item['quality'], string> = { poor: 'text-muted', common: 'text-text', uncommon: 'text-success', rare: 'text-info', epic: 'text-purple-400', legendary: 'text-orange-400' }

export default function DatabaseCollectionPage(): JSX.Element {
  const { collection } = useParams<{ collection: string }>()
  const active = isDatabaseCategory(collection) ? collection : null
  const [query, setQuery] = useState('')
  const [records, setRecords] = useState<DatabaseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!active) return
    const controller = new AbortController()
    setLoading(true)
    setError('')
    fetchDatabaseCollection(active, controller.signal)
      .then((entries) => setRecords(entries as DatabaseRecord[]))
      .catch((requestError: unknown) => {
        if (!(requestError instanceof DOMException && requestError.name === 'AbortError')) setError('Unable to load game data.')
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [active])

  useEffect(() => { setQuery('') }, [active])

  const resolvedActive: Category = active ?? 'characters'
  const activeCollection = getDatabaseCollection(resolvedActive)
  const filteredRecords = useMemo(() => {
    if (!activeCollection.searchable || !query.trim()) return records
    const needle = query.trim().toLowerCase()
    return records.filter((entry) => JSON.stringify(entry).toLowerCase().includes(needle))
  }, [activeCollection.searchable, query, records])

  if (!active) return <Navigate to="/database/characters" replace />

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-[100rem] px-3 py-5 sm:px-5 sm:py-7">
        <section className="overflow-hidden rounded-2xl border border-border/70 bg-surface/65 shadow-[0_16px_45px_rgba(0,0,0,0.2)]">
          <header className="flex flex-col gap-4 border-b border-border/70 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-black tracking-widest text-background">DB</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2"><h1 className="text-xl font-black tracking-tight text-text sm:text-2xl">Game Database</h1><span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-bold text-primary">{records.length} records</span></div>
                <p className="truncate text-xs text-muted sm:text-sm">Compact reference data for Classic Azeroth</p>
              </div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0" role="tablist" aria-label="Database collections">
              {categories.map((category) => <Link key={category.id} to={category.href} role="tab" aria-selected={active === category.id} className={`flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-bold transition ${active === category.id ? 'bg-primary text-background shadow-md shadow-primary/10' : 'bg-background/45 text-muted hover:bg-primary/10 hover:text-text'}`}><span className={`text-[0.6rem] tracking-wider ${active === category.id ? 'text-background/65' : 'text-primary'}`}>{category.code}</span>{category.title}</Link>)}
            </div>
          </header>

          <div className="flex min-h-14 flex-col gap-3 border-b border-border/60 bg-background/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3"><h2 className="text-sm font-black uppercase tracking-[0.16em] text-text">{activeCollection.title}</h2><span className="text-xs text-muted">{filteredRecords.length} shown</span></div>
            {activeCollection.searchable ? <label className="relative w-full sm:w-80"><span className="sr-only">Search</span><svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Filter ${active}...`} className="h-9 w-full rounded-lg border border-border bg-background/65 pl-9 pr-8 text-sm text-text outline-none placeholder:text-muted/60 focus:border-primary" />{query && <button type="button" onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-text">&times;</button>}</label> : <span className="text-xs text-muted">Browse-only reference</span>}
          </div>

          <div className="min-h-[28rem]">
            {loading && <div className="divide-y divide-border/40">{[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-20 animate-pulse bg-background/15" />)}</div>}
            {error && <p className="m-4 rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-danger">{error}</p>}
            {!loading && !error && filteredRecords.length === 0 && <div className="py-24 text-center"><p className="font-bold text-text">No matching records</p><p className="mt-1 text-sm text-muted">Adjust your filter and try again.</p></div>}
            {!loading && !error && filteredRecords.length > 0 && <div className="divide-y divide-border/45">{filteredRecords.map((record) => <RecordRow key={record.id} category={active} record={record} />)}</div>}
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  )
}

function RecordRow({ category, record }: { category: Category; record: DatabaseRecord }) {
  if (category === 'characters') return <CharacterRow record={record as Character} />
  if (category === 'classes') return <ClassRow record={record as GameClass} />
  if (category === 'items') return <ItemRow record={record as Item} />
  return <InstanceRow record={record as Dungeon | Raid} raid={category === 'raids'} />
}

function Row({ code, title, subtitle, description, meta, titleClass = 'text-text' }: { code: string; title: string; subtitle: string; description: string; meta: ReactNode; titleClass?: string }) {
  return <article className="group grid min-h-20 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-x-3 px-4 py-3 transition hover:bg-primary/[0.045] sm:grid-cols-[2.5rem_minmax(11rem,0.75fr)_minmax(14rem,1.2fr)_auto] sm:px-6"><span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background/55 text-[0.6rem] font-black tracking-wider text-primary transition group-hover:border-primary/40">{code}</span><div className="min-w-0"><h3 className={`truncate text-sm font-bold ${titleClass}`}>{title}</h3><p className="truncate text-xs text-muted">{subtitle}</p></div><p className="col-start-2 mt-1 line-clamp-1 min-w-0 text-xs leading-5 text-muted sm:col-start-auto sm:mt-0 sm:text-sm">{description}</p><div className="col-start-2 mt-2 flex flex-wrap items-center gap-1.5 text-xs sm:col-start-auto sm:mt-0 sm:justify-end">{meta}</div></article>
}

function CharacterRow({ record }: { record: Character }) {
  return <Row code="CH" title={record.name} subtitle={record.race} description={record.description} meta={<><Pill>{record.class.name}</Pill><Pill>{record.faction.name}</Pill></>} />
}

function ClassRow({ record }: { record: GameClass }) {
  return <Row code="CL" title={record.name} subtitle={`${record.armor} · ${record.resource}`} description={record.description} meta={<>{record.roles.map((role) => <Pill key={role}>{role}</Pill>)}</>} />
}

function InstanceRow({ record, raid }: { record: Dungeon | Raid; raid: boolean }) {
  const level = 'levelRange' in record ? record.levelRange : record.level
  return <Row code={raid ? 'RD' : 'DG'} title={record.name} subtitle={record.location} description={record.description} meta={<><Pill>Lvl {level}</Pill><Pill>{record.playerLimit} players</Pill><Pill>{record.bosses.length} bosses</Pill></>} />
}

function ItemRow({ record }: { record: Item }) {
  return <Row code="IT" title={record.name} titleClass={qualityColor[record.quality]} subtitle={`${record.type} · ${record.quality}`} description={record.description} meta={<><Pill>iLvl {record.itemLevel}</Pill><span className="max-w-40 truncate text-primary">{record.source}</span></>} />
}

function Pill({ children }: { children: ReactNode }) {
  return <span className="whitespace-nowrap rounded-md border border-border bg-background/55 px-2 py-1 font-semibold capitalize text-muted">{children}</span>
}
