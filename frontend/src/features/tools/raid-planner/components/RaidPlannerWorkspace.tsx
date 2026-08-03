import { useMemo, useState, type FormEvent, type ReactNode } from 'react'

const STORAGE_KEY = 'wowiki:raid-planner:v1'
const raidSizes = [10, 20, 25, 40] as const
const raidOptions = [
  'Molten Core',
  "Onyxia's Lair",
  'Blackwing Lair',
  "Zul'Gurub",
  'Ruins of Ahn\'Qiraj',
  "Temple of Ahn'Qiraj",
  'Naxxramas',
] as const

const playerClasses = [
  { id: 'warrior', label: 'Warrior', color: 'border-amber-700/55 bg-amber-700/15 text-amber-300' },
  { id: 'paladin', label: 'Paladin', color: 'border-pink-400/55 bg-pink-400/10 text-pink-300' },
  { id: 'hunter', label: 'Hunter', color: 'border-lime-500/55 bg-lime-500/10 text-lime-300' },
  { id: 'rogue', label: 'Rogue', color: 'border-yellow-400/55 bg-yellow-400/10 text-yellow-200' },
  { id: 'priest', label: 'Priest', color: 'border-slate-300/55 bg-slate-200/10 text-slate-100' },
  { id: 'shaman', label: 'Shaman', color: 'border-blue-500/55 bg-blue-500/10 text-blue-300' },
  { id: 'mage', label: 'Mage', color: 'border-cyan-400/55 bg-cyan-400/10 text-cyan-200' },
  { id: 'warlock', label: 'Warlock', color: 'border-violet-500/55 bg-violet-500/10 text-violet-300' },
  { id: 'druid', label: 'Druid', color: 'border-orange-500/55 bg-orange-500/10 text-orange-300' },
] as const

const roles = [
  { id: 'tank', label: 'Tank', color: 'bg-sky-400' },
  { id: 'healer', label: 'Healer', color: 'bg-emerald-400' },
  { id: 'damage', label: 'Damage', color: 'bg-red-400' },
] as const

type PlayerClass = (typeof playerClasses)[number]['id']
type RaiderRole = (typeof roles)[number]['id']

type Raider = {
  id: string
  name: string
  playerClass: PlayerClass
  role: RaiderRole
  group: number
}

type RaidPlan = {
  version: 1
  id: string | null
  raid: string
  date: string
  startTime: string
  raidSize: number
  notes: string
  raiders: Raider[]
  updatedAt: string | null
}

type Notice = {
  text: string
  tone: 'success' | 'error' | 'info'
}

type InitialPlannerState = {
  plan: RaidPlan
  notice: Notice | null
}

const iconClassName = 'h-4 w-4'

const icons = {
  calendar: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></svg>,
  users: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  shield: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 3 4.5 6v5.2c0 4.7 3.2 8.2 7.5 9.8 4.3-1.6 7.5-5.1 7.5-9.8V6L12 3Z" /></svg>,
  wand: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m4 20 11-11M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2ZM19 13l.7 1.3L21 15l-1.3.7L19 17l-.7-1.3L17 15l1.3-.7L19 13Z" /></svg>,
  link: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" /></svg>,
  spark: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></svg>,
  plus: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>,
  trash: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" /></svg>,
}

function emptyPlan(): RaidPlan {
  return {
    version: 1,
    id: null,
    raid: '',
    date: '',
    startTime: '19:00',
    raidSize: 40,
    notes: '',
    raiders: [],
    updatedAt: null,
  }
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function encodePlan(plan: RaidPlan): string {
  const bytes = new TextEncoder().encode(JSON.stringify(plan))
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function decodePlan(value: string): unknown {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
  return JSON.parse(new TextDecoder().decode(bytes))
}

function normalizePlan(value: unknown): RaidPlan | null {
  if (!value || typeof value !== 'object') return null

  const record = value as Record<string, unknown>
  const raidSize = typeof record.raidSize === 'number' && raidSizes.includes(record.raidSize as (typeof raidSizes)[number])
    ? record.raidSize
    : 40
  const groupCount = Math.ceil(raidSize / 5)
  const validClassIds = new Set<string>(playerClasses.map((playerClass) => playerClass.id))
  const validRoleIds = new Set<string>(roles.map((role) => role.id))
  const raiders = Array.isArray(record.raiders)
    ? record.raiders.slice(0, raidSize).flatMap((entry): Raider[] => {
        if (!entry || typeof entry !== 'object') return []
        const raider = entry as Record<string, unknown>
        if (typeof raider.name !== 'string' || !raider.name.trim()) return []
        if (typeof raider.playerClass !== 'string' || !validClassIds.has(raider.playerClass)) return []
        if (typeof raider.role !== 'string' || !validRoleIds.has(raider.role)) return []
        const group = typeof raider.group === 'number'
          ? Math.min(groupCount, Math.max(1, Math.round(raider.group)))
          : 1

        return [{
          id: typeof raider.id === 'string' ? raider.id : createId(),
          name: raider.name.trim().slice(0, 32),
          playerClass: raider.playerClass as PlayerClass,
          role: raider.role as RaiderRole,
          group,
        }]
      })
    : []

  return {
    version: 1,
    id: typeof record.id === 'string' ? record.id : null,
    raid: typeof record.raid === 'string' ? record.raid.slice(0, 80) : '',
    date: typeof record.date === 'string' ? record.date : '',
    startTime: typeof record.startTime === 'string' ? record.startTime : '19:00',
    raidSize,
    notes: typeof record.notes === 'string' ? record.notes.slice(0, 500) : '',
    raiders,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : null,
  }
}

function initialPlannerState(): InitialPlannerState {
  try {
    const sharedValue = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('plan')
    if (sharedValue) {
      const sharedPlan = normalizePlan(decodePlan(sharedValue))
      if (sharedPlan) {
        return {
          plan: sharedPlan,
          notice: { text: 'Shared raid loaded. Save it to keep a local copy.', tone: 'info' },
        }
      }
    }
  } catch {
    return {
      plan: emptyPlan(),
      notice: { text: 'That share link could not be opened.', tone: 'error' },
    }
  }

  try {
    const savedValue = localStorage.getItem(STORAGE_KEY)
    if (savedValue) {
      const savedPlan = normalizePlan(JSON.parse(savedValue))
      if (savedPlan) {
        return {
          plan: savedPlan,
          notice: { text: 'Your saved raid has been restored.', tone: 'info' },
        }
      }
    }
  } catch {
    // Local storage is optional; the planner still works for this session.
  }

  return { plan: emptyPlan(), notice: null }
}

function Panel({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}): JSX.Element {
  return (
    <section className={`rounded-2xl border border-border/45 bg-background/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] ${className}`}>
      {children}
    </section>
  )
}

function buildCalendarUrl(plan: RaidPlan): string {
  const parameters = new URLSearchParams({
    action: 'TEMPLATE',
    text: plan.raid ? `WoWiki Raid: ${plan.raid}` : 'WoWiki Raid',
    details: plan.notes || `Raid roster for ${plan.raid || 'WoWiki'}`,
  })

  if (plan.date && plan.startTime) {
    const start = new Date(`${plan.date}T${plan.startTime}:00`)
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000)
    const format = (date: Date) => {
      const twoDigits = (number: number) => String(number).padStart(2, '0')
      return `${date.getFullYear()}${twoDigits(date.getMonth() + 1)}${twoDigits(date.getDate())}T${twoDigits(date.getHours())}${twoDigits(date.getMinutes())}00`
    }
    parameters.set('dates', `${format(start)}/${format(end)}`)
  }

  return `https://calendar.google.com/calendar/render?${parameters.toString()}`
}

function RaidConfiguration({
  plan,
  dirty,
  onChange,
  onRaidSizeChange,
  onSave,
  onShare,
  onNew,
}: {
  plan: RaidPlan
  dirty: boolean
  onChange: (field: 'raid' | 'date' | 'startTime' | 'notes', value: string) => void
  onRaidSizeChange: (size: number) => void
  onSave: () => void
  onShare: () => void
  onNew: () => void
}): JSX.Element {
  const shareReady = Boolean(plan.id && plan.raiders.length > 0 && !dirty)
  const status = !plan.id ? 'Not created' : dirty ? 'Unsaved changes' : 'Saved locally'

  return (
    <Panel className="min-w-0 overflow-hidden p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-black text-text">Raid setup</h2>
            <span className={`rounded-full border px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] ${plan.id && !dirty ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300' : 'border-border/60 bg-surface-alt/60 text-muted'}`}>
              {status}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">Create the raid, build the roster, then save and share one link.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {plan.id ? (
            <button type="button" onClick={onNew} className="rounded-xl border border-border bg-background/45 px-3.5 py-2 text-xs font-bold text-muted transition hover:border-border/80 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
              New raid
            </button>
          ) : null}
          <button
            type="button"
            onClick={onShare}
            disabled={!shareReady}
            title={shareReady ? 'Copy a shareable raid link' : 'Save a raid with at least one raider before sharing'}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/45 px-3.5 py-2 text-xs font-bold text-muted transition hover:border-primary/45 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-border disabled:hover:text-muted"
          >
            {icons.link}
            Share raid
          </button>
          <a
            href={buildCalendarUrl(plan)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/35 bg-primary/[0.08] px-3.5 py-2 text-xs font-bold text-primary transition hover:border-primary/60 hover:bg-primary/[0.14] hover:text-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {icons.calendar}
            Calendar
          </a>
          <button
            type="button"
            onClick={onSave}
            disabled={Boolean(plan.id && !dirty)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-black text-background shadow-[0_8px_24px_rgba(199,156,58,0.16)] transition hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-default disabled:opacity-55"
          >
            {icons.spark}
            {!plan.id ? 'Create raid' : dirty ? 'Save changes' : 'Saved'}
          </button>
        </div>
      </div>

      <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(13rem,1.4fr)_minmax(10rem,1fr)_minmax(8rem,.7fr)_auto]">
        <label className="grid min-w-0 gap-1.5">
          <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">Raid</span>
          <select value={plan.raid} onChange={(event) => onChange('raid', event.target.value)} className="h-11 min-w-0 max-w-full rounded-xl border border-border/55 bg-surface-alt/70 px-3 text-sm font-semibold text-text outline-none transition focus:border-primary/65 focus:ring-2 focus:ring-primary/15">
            <option value="">Select a raid</option>
            {raidOptions.map((raid) => <option key={raid} value={raid}>{raid}</option>)}
          </select>
        </label>

        <label className="grid min-w-0 gap-1.5">
          <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">Date</span>
          <span className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icons.calendar}</span>
            <input value={plan.date} onInput={(event) => onChange('date', event.currentTarget.value)} onChange={(event) => onChange('date', event.target.value)} type="date" className="h-11 w-full min-w-0 max-w-full rounded-xl border border-border/55 bg-surface-alt/70 pl-10 pr-3 text-sm font-semibold text-text outline-none transition [color-scheme:dark] focus:border-primary/65 focus:ring-2 focus:ring-primary/15" />
          </span>
        </label>

        <label className="grid min-w-0 gap-1.5">
          <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">Start time</span>
          <input value={plan.startTime} onInput={(event) => onChange('startTime', event.currentTarget.value)} onChange={(event) => onChange('startTime', event.target.value)} type="time" className="h-11 min-w-0 max-w-full rounded-xl border border-border/55 bg-surface-alt/70 px-3 text-sm font-semibold text-text outline-none transition [color-scheme:dark] focus:border-primary/65 focus:ring-2 focus:ring-primary/15" />
        </label>

        <fieldset className="grid min-w-0 gap-1.5">
          <legend className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">Raid size</legend>
          <div className="flex h-11 items-center rounded-xl border border-border/55 bg-surface-alt/70 p-1">
            {raidSizes.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={plan.raidSize === size}
                disabled={plan.raiders.length > size}
                onClick={() => onRaidSizeChange(size)}
                className={`h-full min-w-10 rounded-lg px-2 text-xs font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-30 ${plan.raidSize === size ? 'bg-primary text-background shadow-sm' : 'text-muted hover:bg-background/50 hover:text-text'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <label className="mt-3 grid gap-1.5">
        <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">Raid briefing <span className="font-semibold normal-case tracking-normal">(optional)</span></span>
        <textarea value={plan.notes} onChange={(event) => onChange('notes', event.target.value)} maxLength={500} rows={2} placeholder="Loot rules, voice channel, invites, or leader notes..." className="resize-y rounded-xl border border-border/55 bg-surface-alt/70 px-3 py-2.5 text-sm leading-6 text-text outline-none placeholder:text-muted/55 focus:border-primary/65 focus:ring-2 focus:ring-primary/15" />
      </label>
    </Panel>
  )
}

function PlannerStats({ plan }: { plan: RaidPlan }): JSX.Element {
  const groups = Math.ceil(plan.raidSize / 5)
  const assignedGroups = new Set(plan.raiders.map((raider) => raider.group)).size
  const readiness = Math.round((plan.raiders.length / plan.raidSize) * 100)
  const stats = [
    { label: 'Raiders', value: `${plan.raiders.length} / ${plan.raidSize}`, note: `${plan.raidSize - plan.raiders.length} open slots`, icon: icons.users },
    { label: 'Groups', value: `${assignedGroups} / ${groups}`, note: 'Five raiders per group', icon: icons.shield },
    { label: 'Saved', value: plan.id ? (plan.updatedAt ? 'Yes' : 'No') : 'No', note: plan.updatedAt ? `Updated ${new Date(plan.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Create the raid to begin', icon: icons.spark },
    { label: 'Readiness', value: `${readiness}%`, note: plan.raiders.length ? 'Based on filled roster slots' : 'Waiting for roster', icon: icons.wand },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="min-w-0 rounded-2xl border border-border/40 bg-background/28 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">{stat.label}</span>
            <span className="text-primary/80">{stat.icon}</span>
          </div>
          <strong className="mt-3 block text-2xl font-black text-text">{stat.value}</strong>
          <span className="mt-1 block truncate text-xs text-muted" title={stat.note}>{stat.note}</span>
        </div>
      ))}
    </div>
  )
}

function RoleCoverage({ plan }: { plan: RaidPlan }): JSX.Element {
  const healerTarget = plan.raidSize === 40 ? 10 : plan.raidSize <= 10 ? 3 : Math.max(4, Math.round(plan.raidSize * 0.24))
  const tankTarget = plan.raidSize <= 10 || plan.raidSize < 40 ? 2 : 4
  const targets: Record<RaiderRole, number> = {
    tank: tankTarget,
    healer: healerTarget,
    damage: plan.raidSize - tankTarget - healerTarget,
  }

  return (
    <Panel className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-text">Role coverage</h3>
          <p className="mt-1 text-xs text-muted">Live count against suggested targets.</p>
        </div>
        <span className="text-primary">{icons.shield}</span>
      </div>
      <div className="mt-5 space-y-4">
        {roles.map((role) => {
          const count = plan.raiders.filter((raider) => raider.role === role.id).length
          const percentage = Math.min(100, Math.round((count / targets[role.id]) * 100))
          return (
            <div key={role.id}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-bold text-text">{role.label}</span>
                <span className="text-muted">{count} / {targets[role.id]}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-alt">
                <span className={`block h-full rounded-full transition-[width] ${role.color}`} style={{ width: `${percentage}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

function RaidSummary({ plan, dirty }: { plan: RaidPlan; dirty: boolean }): JSX.Element {
  return (
    <Panel className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-text">Share checklist</h3>
          <p className="mt-1 text-xs text-muted">Everything needed for a clean handoff.</p>
        </div>
        <span className="text-primary">{icons.link}</span>
      </div>
      <ol className="mt-4 space-y-3 text-xs">
        {[
          { done: Boolean(plan.id), label: 'Raid created' },
          { done: plan.raiders.length > 0, label: 'Raiders added and grouped' },
          { done: Boolean(plan.id && !dirty), label: 'Latest changes saved' },
        ].map((item, index) => (
          <li key={item.label} className="flex items-center gap-2.5">
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[0.65rem] font-black ${item.done ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-border bg-background/45 text-muted'}`}>
              {item.done ? '✓' : index + 1}
            </span>
            <span className={item.done ? 'text-text' : 'text-muted'}>{item.label}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 rounded-xl border border-border/40 bg-surface/35 px-3 py-2.5 text-[0.68rem] leading-5 text-muted">
        Saved raids stay in this browser. Share links carry a read-only copy that another player can open and save.
      </p>
    </Panel>
  )
}

function AddRaiderForm({
  groupCount,
  groupSizes,
  initialGroup,
  onAdd,
  onCancel,
}: {
  groupCount: number
  groupSizes: readonly number[]
  initialGroup: number
  onAdd: (name: string, playerClass: PlayerClass, role: RaiderRole, group: number) => void
  onCancel: () => void
}): JSX.Element {
  const [name, setName] = useState('')
  const [playerClass, setPlayerClass] = useState<PlayerClass>('warrior')
  const [role, setRole] = useState<RaiderRole>('damage')
  const [group, setGroup] = useState(Math.min(initialGroup, groupCount))

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onAdd(name, playerClass, role, group)
    setName('')
  }

  return (
    <form onSubmit={submit} className="grid gap-3 border-b border-border/40 bg-primary/[0.035] p-4 md:grid-cols-[minmax(10rem,1.2fr)_minmax(8rem,.8fr)_minmax(8rem,.8fr)_minmax(7rem,.6fr)_auto] md:items-end sm:p-5">
      <label className="grid gap-1.5">
        <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">Raider name</span>
        <input autoFocus value={name} onChange={(event) => setName(event.target.value)} maxLength={32} placeholder="Character name" className="h-10 rounded-lg border border-border/55 bg-background/70 px-3 text-sm text-text outline-none placeholder:text-muted/55 focus:border-primary/65 focus:ring-2 focus:ring-primary/15" />
      </label>
      <label className="grid gap-1.5">
        <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">Class</span>
        <select value={playerClass} onChange={(event) => setPlayerClass(event.target.value as PlayerClass)} className="h-10 rounded-lg border border-border/55 bg-background/70 px-3 text-sm text-text outline-none focus:border-primary/65">
          {playerClasses.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
      </label>
      <label className="grid gap-1.5">
        <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">Role</span>
        <select value={role} onChange={(event) => setRole(event.target.value as RaiderRole)} className="h-10 rounded-lg border border-border/55 bg-background/70 px-3 text-sm text-text outline-none focus:border-primary/65">
          {roles.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
      </label>
      <label className="grid gap-1.5">
        <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">Group</span>
        <select value={group} onChange={(event) => setGroup(Number(event.target.value))} className="h-10 rounded-lg border border-border/55 bg-background/70 px-3 text-sm text-text outline-none focus:border-primary/65">
          {Array.from({ length: groupCount }, (_, index) => index + 1).map((groupNumber) => (
            <option key={groupNumber} value={groupNumber} disabled={groupSizes[groupNumber - 1] >= 5}>Group {groupNumber}{groupSizes[groupNumber - 1] >= 5 ? ' (full)' : ''}</option>
          ))}
        </select>
      </label>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="h-10 rounded-lg border border-border px-3 text-xs font-bold text-muted transition hover:text-text">Cancel</button>
        <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-black text-background transition hover:bg-primary-hover">{icons.plus} Add</button>
      </div>
    </form>
  )
}

function RosterBoard({
  plan,
  showAddRaider,
  addGroup,
  onShowAddRaider,
  onHideAddRaider,
  onAddRaider,
  onMoveRaider,
  onRemoveRaider,
  onAutoBalance,
}: {
  plan: RaidPlan
  showAddRaider: boolean
  addGroup: number
  onShowAddRaider: (group?: number) => void
  onHideAddRaider: () => void
  onAddRaider: (name: string, playerClass: PlayerClass, role: RaiderRole, group: number) => void
  onMoveRaider: (raiderId: string, group: number) => void
  onRemoveRaider: (raiderId: string) => void
  onAutoBalance: () => void
}): JSX.Element {
  const groupCount = Math.ceil(plan.raidSize / 5)
  const groupSizes = Array.from({ length: groupCount }, (_, index) => plan.raiders.filter((raider) => raider.group === index + 1).length)
  const canAdd = Boolean(plan.id && plan.raiders.length < plan.raidSize)

  return (
    <Panel className="min-w-0 overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="font-black text-text">Raid roster</h2>
          <p className="mt-1 text-xs text-muted">Add each player to a group, or move them with the group menu.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onAutoBalance} disabled={plan.raiders.length < 2} className="rounded-lg border border-border/55 px-3 py-2 text-xs font-bold text-muted transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-45">Auto-balance</button>
          <button type="button" onClick={() => onShowAddRaider()} disabled={!canAdd} title={!plan.id ? 'Create the raid before adding raiders' : undefined} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/35 bg-primary/[0.08] px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary/[0.14] disabled:cursor-not-allowed disabled:opacity-45">
            {icons.plus} Add raider
          </button>
        </div>
      </div>

      {showAddRaider ? (
        <AddRaiderForm groupCount={groupCount} groupSizes={groupSizes} initialGroup={addGroup} onAdd={onAddRaider} onCancel={onHideAddRaider} />
      ) : null}

      <div className="grid gap-3 p-4 sm:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: groupCount }, (_, groupIndex) => {
          const groupNumber = groupIndex + 1
          const groupRaiders = plan.raiders.filter((raider) => raider.group === groupNumber)
          return (
            <article key={groupNumber} className="overflow-hidden rounded-xl border border-border/45 bg-surface/55">
              <header className="flex items-center justify-between border-b border-border/35 bg-surface-alt/55 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[0.65rem] font-black text-primary">{groupNumber}</span>
                  <h3 className="text-xs font-black uppercase tracking-[0.1em] text-text">Group {groupNumber}</h3>
                </div>
                <span className="text-[0.65rem] font-semibold text-muted">{groupRaiders.length} / 5</span>
              </header>
              <div className="divide-y divide-border/25">
                {groupRaiders.map((raider) => {
                  const classInfo = playerClasses.find((option) => option.id === raider.playerClass) ?? playerClasses[0]
                  const roleInfo = roles.find((option) => option.id === raider.role) ?? roles[2]
                  return (
                    <div key={raider.id} className="flex min-h-14 items-center gap-2 px-2.5 py-2">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[0.68rem] font-black ${classInfo.color}`}>{raider.name.slice(0, 2).toUpperCase()}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-black text-text">{raider.name}</span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[0.62rem] text-muted"><span className={`h-1.5 w-1.5 rounded-full ${roleInfo.color}`} />{classInfo.label} · {roleInfo.label}</span>
                      </span>
                      <select value={raider.group} onChange={(event) => onMoveRaider(raider.id, Number(event.target.value))} aria-label={`Move ${raider.name} to group`} className="h-8 w-12 rounded-md border border-border/45 bg-background/65 px-1 text-[0.68rem] font-bold text-text outline-none focus:border-primary">
                        {Array.from({ length: groupCount }, (_, index) => index + 1).map((destination) => <option key={destination} value={destination} disabled={destination !== raider.group && groupSizes[destination - 1] >= 5}>{destination}</option>)}
                      </select>
                      <button type="button" onClick={() => onRemoveRaider(raider.id)} aria-label={`Remove ${raider.name}`} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-red-500/10 hover:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/45">{icons.trash}</button>
                    </div>
                  )
                })}
                {Array.from({ length: Math.max(0, 5 - groupRaiders.length) }, (_, slotIndex) => (
                  <button key={slotIndex} type="button" onClick={() => onShowAddRaider(groupNumber)} disabled={!canAdd} className="group flex min-h-11 w-full items-center gap-2.5 px-3 py-2 text-left transition hover:bg-primary/[0.045] focus:outline-none focus-visible:bg-primary/[0.08] disabled:cursor-not-allowed disabled:hover:bg-transparent">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-dashed border-border/70 bg-background/30 text-muted/50 transition group-hover:border-primary/45 group-hover:text-primary group-disabled:group-hover:border-border/70 group-disabled:group-hover:text-muted/50">{icons.plus}</span>
                    <span>
                      <span className="block text-xs font-bold text-muted/80 transition group-hover:text-text group-disabled:group-hover:text-muted/80">Empty slot</span>
                      <span className="block text-[0.62rem] text-muted/45">{plan.id ? 'Add to this group' : 'Create raid first'}</span>
                    </span>
                  </button>
                ))}
              </div>
            </article>
          )
        })}
      </div>
    </Panel>
  )
}

export default function RaidPlannerWorkspace(): JSX.Element {
  const [initialState] = useState(initialPlannerState)
  const [plan, setPlan] = useState<RaidPlan>(initialState.plan)
  const [dirty, setDirty] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(initialState.notice)
  const [showAddRaider, setShowAddRaider] = useState(false)
  const [addGroup, setAddGroup] = useState(1)
  const groupCount = Math.ceil(plan.raidSize / 5)

  const updatePlan = (updater: (current: RaidPlan) => RaidPlan) => {
    setPlan(updater)
    setDirty(true)
    setNotice(null)
  }

  const savePlan = () => {
    if (!plan.raid || !plan.date || !plan.startTime) {
      setNotice({ text: 'Choose a raid, date, and start time first.', tone: 'error' })
      return
    }

    const savedPlan: RaidPlan = {
      ...plan,
      id: plan.id ?? createId(),
      updatedAt: new Date().toISOString(),
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPlan))
      setPlan(savedPlan)
      setDirty(false)
      setNotice({ text: plan.id ? 'Raid changes saved.' : 'Raid created. You can add raiders now.', tone: 'success' })
    } catch {
      setNotice({ text: 'This browser could not save the raid locally.', tone: 'error' })
    }
  }

  const sharePlan = async () => {
    if (!plan.id || dirty || plan.raiders.length === 0) return

    const url = `${window.location.origin}${window.location.pathname}#plan=${encodePlan(plan)}`
    try {
      await navigator.clipboard.writeText(url)
      setNotice({ text: 'Share link copied to your clipboard.', tone: 'success' })
    } catch {
      setNotice({ text: 'Could not copy the link. Try sharing from your browser menu.', tone: 'error' })
    }
  }

  const newPlan = () => {
    setPlan(emptyPlan())
    setDirty(false)
    setNotice({ text: 'New raid started. Your previous saved raid stays available until you save this one.', tone: 'info' })
    setShowAddRaider(false)
    window.history.replaceState(null, '', window.location.pathname)
  }

  const addRaider = (name: string, playerClass: PlayerClass, role: RaiderRole, group: number) => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNotice({ text: 'Enter a character name.', tone: 'error' })
      return
    }
    if (plan.raiders.some((raider) => raider.name.toLocaleLowerCase() === trimmedName.toLocaleLowerCase())) {
      setNotice({ text: `${trimmedName} is already in the roster.`, tone: 'error' })
      return
    }
    if (plan.raiders.length >= plan.raidSize) {
      setNotice({ text: 'The raid roster is full.', tone: 'error' })
      return
    }
    if (plan.raiders.filter((raider) => raider.group === group).length >= 5) {
      setNotice({ text: `Group ${group} is full.`, tone: 'error' })
      return
    }

    updatePlan((current) => ({
      ...current,
      raiders: [...current.raiders, { id: createId(), name: trimmedName, playerClass, role, group }],
    }))
    setNotice({ text: `${trimmedName} added to Group ${group}. Save when the roster is ready.`, tone: 'success' })
  }

  const moveRaider = (raiderId: string, group: number) => {
    if (plan.raiders.filter((raider) => raider.group === group && raider.id !== raiderId).length >= 5) {
      setNotice({ text: `Group ${group} is full.`, tone: 'error' })
      return
    }
    updatePlan((current) => ({
      ...current,
      raiders: current.raiders.map((raider) => raider.id === raiderId ? { ...raider, group } : raider),
    }))
  }

  const removeRaider = (raiderId: string) => {
    updatePlan((current) => ({ ...current, raiders: current.raiders.filter((raider) => raider.id !== raiderId) }))
  }

  const autoBalance = () => {
    updatePlan((current) => ({
      ...current,
      raiders: current.raiders.map((raider, index) => ({ ...raider, group: (index % groupCount) + 1 })),
    }))
    setNotice({ text: 'Raiders distributed evenly across the available groups.', tone: 'success' })
  }

  const noticeClasses = useMemo(() => {
    if (!notice) return ''
    if (notice.tone === 'success') return 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
    if (notice.tone === 'error') return 'border-red-500/35 bg-red-500/10 text-red-200'
    return 'border-sky-500/35 bg-sky-500/10 text-sky-200'
  }, [notice])

  return (
    <section className="w-full min-w-0 overflow-hidden rounded-2xl border border-border/35 bg-surface p-3 shadow-[0_22px_60px_rgba(0,0,0,0.3)] sm:p-5" aria-label="Raid planner workspace">
      <div className="min-w-0 space-y-4">
        <RaidConfiguration
          plan={plan}
          dirty={dirty}
          onChange={(field, value) => updatePlan((current) => ({ ...current, [field]: value }))}
          onRaidSizeChange={(raidSize) => updatePlan((current) => ({
            ...current,
            raidSize,
            raiders: current.raiders.map((raider) => ({ ...raider, group: Math.min(raider.group, Math.ceil(raidSize / 5)) })),
          }))}
          onSave={savePlan}
          onShare={sharePlan}
          onNew={newPlan}
        />

        {notice ? <p role={notice.tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${noticeClasses}`}>{notice.text}</p> : null}

        <PlannerStats plan={plan} />

        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <RosterBoard
            plan={plan}
            showAddRaider={showAddRaider}
            addGroup={addGroup}
            onShowAddRaider={(group = 1) => { setAddGroup(group); setShowAddRaider(true) }}
            onHideAddRaider={() => setShowAddRaider(false)}
            onAddRaider={addRaider}
            onMoveRaider={moveRaider}
            onRemoveRaider={removeRaider}
            onAutoBalance={autoBalance}
          />
          <aside className="grid content-start gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <RoleCoverage plan={plan} />
            <RaidSummary plan={plan} dirty={dirty} />
          </aside>
        </div>
      </div>
    </section>
  )
}
