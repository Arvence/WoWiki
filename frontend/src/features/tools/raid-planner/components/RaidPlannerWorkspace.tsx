import { useState, type ReactNode } from 'react'

type PlannerTab = 'roster' | 'assignments' | 'preparation' | 'activity'

const tabs: readonly { id: PlannerTab; label: string; count?: string }[] = [
  { id: 'roster', label: 'Roster', count: '0' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'preparation', label: 'Preparation' },
  { id: 'activity', label: 'Activity' },
]

const raidSizes = [10, 20, 25, 40] as const

const iconClassName = 'h-4 w-4'

const icons = {
  calendar: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></svg>,
  users: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  shield: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 3 4.5 6v5.2c0 4.7 3.2 8.2 7.5 9.8 4.3-1.6 7.5-5.1 7.5-9.8V6L12 3Z" /></svg>,
  wand: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m4 20 11-11M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2ZM19 13l.7 1.3L21 15l-1.3.7L19 17l-.7-1.3L17 15l1.3-.7L19 13Z" /></svg>,
  sword: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m14 5 5-2 2 2-2 5-9 9-5-5 9-9Z" /><path d="m7 17-3 3M5 14l5 5" /></svg>,
  link: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" /></svg>,
  spark: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></svg>,
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

function RaidConfiguration({
  raidSize,
  onRaidSizeChange,
}: {
  raidSize: number
  onRaidSizeChange: (size: number) => void
}): JSX.Element {
  return (
    <Panel className="min-w-0 overflow-hidden p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-black text-text">Raid setup</h2>
            <span className="rounded-full border border-border/60 bg-surface-alt/60 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-muted">
              Unsaved
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">Set the frame now; encounter data can plug in later.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled
            title="Sharing will be enabled when raid data is connected"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/45 px-3.5 py-2 text-xs font-bold text-muted opacity-65"
          >
            {icons.link}
            Share raid
          </button>
          <a
            href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=WoWiki%20Raid"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/35 bg-primary/[0.08] px-3.5 py-2 text-xs font-bold text-primary transition hover:border-primary/60 hover:bg-primary/[0.14] hover:text-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {icons.calendar}
            Add to Google Calendar
          </a>
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-black text-background shadow-[0_8px_24px_rgba(199,156,58,0.16)] transition hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
            {icons.spark}
            Create raid
          </button>
        </div>
      </div>

      <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(13rem,1.4fr)_minmax(10rem,1fr)_minmax(8rem,.7fr)_auto]">
        <label className="grid min-w-0 gap-1.5">
          <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">Raid</span>
          <select className="h-11 min-w-0 max-w-full rounded-xl border border-border/55 bg-surface-alt/70 px-3 text-sm font-semibold text-text outline-none transition focus:border-primary/65 focus:ring-2 focus:ring-primary/15">
            <option>Select a raid</option>
          </select>
        </label>

        <label className="grid min-w-0 gap-1.5">
          <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">Date</span>
          <span className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icons.calendar}</span>
            <input type="date" className="h-11 w-full min-w-0 max-w-full rounded-xl border border-border/55 bg-surface-alt/70 pl-10 pr-3 text-sm font-semibold text-text outline-none transition [color-scheme:dark] focus:border-primary/65 focus:ring-2 focus:ring-primary/15" />
          </span>
        </label>

        <label className="grid min-w-0 gap-1.5">
          <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">Start time</span>
          <input type="time" className="h-11 min-w-0 max-w-full rounded-xl border border-border/55 bg-surface-alt/70 px-3 text-sm font-semibold text-text outline-none transition [color-scheme:dark] focus:border-primary/65 focus:ring-2 focus:ring-primary/15" />
        </label>

        <fieldset className="grid min-w-0 gap-1.5">
          <legend className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">Raid size</legend>
          <div className="flex h-11 items-center rounded-xl border border-border/55 bg-surface-alt/70 p-1">
            {raidSizes.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={raidSize === size}
                onClick={() => onRaidSizeChange(size)}
                className={`h-full min-w-10 rounded-lg px-2 text-xs font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${raidSize === size ? 'bg-primary text-background shadow-sm' : 'text-muted hover:bg-background/50 hover:text-text'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </Panel>
  )
}

function PlannerStats({ raidSize }: { raidSize: number }): JSX.Element {
  const groups = Math.ceil(raidSize / 5)
  const stats = [
    { label: 'Raiders', value: `0 / ${raidSize}`, note: `${raidSize} open slots`, icon: icons.users },
    { label: 'Groups', value: String(groups), note: 'Five slots each', icon: icons.shield },
    { label: 'Assignments', value: '0', note: 'No encounters added', icon: icons.sword },
    { label: 'Readiness', value: '—', note: 'Waiting for roster', icon: icons.wand },
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
          <span className="mt-1 block text-xs text-muted">{stat.note}</span>
        </div>
      ))}
    </div>
  )
}

function RoleCoverage({ raidSize }: { raidSize: number }): JSX.Element {
  const roleTargets = raidSize <= 10
    ? [
        { label: 'Tanks', target: 2, color: 'bg-sky-400' },
        { label: 'Healers', target: 3, color: 'bg-emerald-400' },
        { label: 'Damage', target: raidSize - 5, color: 'bg-red-400' },
      ]
    : [
        { label: 'Tanks', target: raidSize === 40 ? 4 : 2, color: 'bg-sky-400' },
        { label: 'Healers', target: raidSize === 40 ? 10 : Math.max(4, Math.round(raidSize * 0.24)), color: 'bg-emerald-400' },
        { label: 'Damage', target: raidSize === 40 ? 26 : raidSize - 2 - Math.max(4, Math.round(raidSize * 0.24)), color: 'bg-red-400' },
      ]

  return (
    <Panel className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-text">Role coverage</h3>
          <p className="mt-1 text-xs text-muted">Suggested targets for this raid size.</p>
        </div>
        <span className="text-primary">{icons.shield}</span>
      </div>
      <div className="mt-5 space-y-4">
        {roleTargets.map((role) => (
          <div key={role.label}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-bold text-text">{role.label}</span>
              <span className="text-muted">0 / {role.target}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-alt">
              <span className={`block h-full w-0 rounded-full ${role.color}`} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function RosterBoard({ raidSize }: { raidSize: number }): JSX.Element {
  const groupCount = Math.ceil(raidSize / 5)

  return (
    <Panel className="min-w-0 overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="font-black text-text">Raid roster</h2>
          <p className="mt-1 text-xs text-muted">Groups are ready for drag-and-drop roster data.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" disabled className="rounded-lg border border-border/55 px-3 py-2 text-xs font-bold text-muted opacity-65">Auto-balance</button>
          <button type="button" disabled className="rounded-lg border border-primary/35 bg-primary/[0.08] px-3 py-2 text-xs font-bold text-primary opacity-65">Add raider</button>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: groupCount }, (_, groupIndex) => (
          <article key={groupIndex} className="overflow-hidden rounded-xl border border-border/45 bg-surface/55">
            <header className="flex items-center justify-between border-b border-border/35 bg-surface-alt/55 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[0.65rem] font-black text-primary">{groupIndex + 1}</span>
                <h3 className="text-xs font-black uppercase tracking-[0.1em] text-text">Group {groupIndex + 1}</h3>
              </div>
              <span className="text-[0.65rem] font-semibold text-muted">0 / 5</span>
            </header>
            <div className="divide-y divide-border/25">
              {Array.from({ length: 5 }, (_, slotIndex) => (
                <button
                  key={slotIndex}
                  type="button"
                  className="group flex min-h-11 w-full items-center gap-2.5 px-3 py-2 text-left transition hover:bg-primary/[0.045] focus:outline-none focus-visible:bg-primary/[0.08]"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-dashed border-border/70 bg-background/30 text-muted/50 transition group-hover:border-primary/45 group-hover:text-primary">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                  </span>
                  <span>
                    <span className="block text-xs font-bold text-muted/80 transition group-hover:text-text">Empty slot</span>
                    <span className="block text-[0.62rem] text-muted/45">Any role</span>
                  </span>
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Panel>
  )
}

function RaidBriefing(): JSX.Element {
  return (
    <Panel className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-text">Raid briefing</h3>
          <p className="mt-1 text-xs text-muted">One place for the plan every raider should see.</p>
        </div>
        <span className="text-primary">{icons.calendar}</span>
      </div>
      <div className="mt-4 rounded-xl border border-dashed border-border/65 bg-surface/35 px-4 py-6 text-center">
        <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">{icons.spark}</span>
        <p className="mt-3 text-sm font-bold text-text">No briefing yet</p>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-muted">Raid notes, loot rules, voice details, and leader instructions will live here.</p>
        <button type="button" disabled className="mt-4 rounded-lg border border-border/55 px-3 py-2 text-xs font-bold text-muted opacity-65">Add briefing</button>
      </div>
    </Panel>
  )
}

function EmptyTabPanel({
  icon,
  eyebrow,
  title,
  description,
  cards,
}: {
  icon: ReactNode
  eyebrow: string
  title: string
  description: string
  cards: readonly string[]
}): JSX.Element {
  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-border/40 px-5 py-5">
        <span className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-primary">{eyebrow}</span>
        <div className="mt-2 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">{icon}</span>
          <div>
            <h2 className="text-xl font-black text-text">{title}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">{description}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card} className="min-h-40 rounded-xl border border-dashed border-border/60 bg-surface/35 p-4">
            <div className="flex h-full flex-col justify-between">
              <div>
                <span className="block text-xs font-black uppercase tracking-[0.1em] text-text">{card}</span>
                <span className="mt-2 block text-xs leading-5 text-muted">Nothing configured yet.</span>
              </div>
              <button type="button" disabled className="mt-6 self-start rounded-lg border border-border/50 px-3 py-1.5 text-[0.68rem] font-bold text-muted opacity-60">Add later</button>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  )
}

export default function RaidPlannerWorkspace(): JSX.Element {
  const [activeTab, setActiveTab] = useState<PlannerTab>('roster')
  const [raidSize, setRaidSize] = useState<number>(40)

  return (
    <section
      className="w-full min-w-0 overflow-hidden rounded-2xl border border-border/35 bg-surface p-3 shadow-[0_22px_60px_rgba(0,0,0,0.3)] sm:p-5"
      aria-label="Raid planner workspace"
    >
      <div className="min-w-0 space-y-4">
        <RaidConfiguration raidSize={raidSize} onRaidSizeChange={setRaidSize} />
        <PlannerStats raidSize={raidSize} />

        <nav className="flex w-full min-w-0 max-w-full gap-1 overflow-x-auto rounded-xl border border-border/40 bg-background/35 p-1.5" aria-label="Raid planner sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex min-w-max items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${activeTab === tab.id ? 'bg-primary text-background shadow-sm' : 'text-muted hover:bg-surface-alt/55 hover:text-text'}`}
            >
              {tab.label}
              {tab.count ? <span className={`rounded-full px-1.5 py-0.5 text-[0.6rem] ${activeTab === tab.id ? 'bg-background/20' : 'bg-surface-alt'}`}>{tab.count}</span> : null}
            </button>
          ))}
        </nav>

        <div role="tabpanel">
          {activeTab === 'roster' ? (
            <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
              <RosterBoard raidSize={raidSize} />
              <aside className="grid content-start gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <RoleCoverage raidSize={raidSize} />
                <RaidBriefing />
              </aside>
            </div>
          ) : null}

          {activeTab === 'assignments' ? (
            <EmptyTabPanel
              icon={icons.sword}
              eyebrow="Encounter plan"
              title="Assignments without the spreadsheet"
              description="Boss-by-boss responsibilities will connect directly to the roster, keeping tanks, healers, interrupts, and special jobs visible."
              cards={['Tank duties', 'Healing coverage', 'Interrupt order', 'Special mechanics']}
            />
          ) : null}

          {activeTab === 'preparation' ? (
            <EmptyTabPanel
              icon={icons.wand}
              eyebrow="Raid readiness"
              title="Make preparation visible"
              description="Track the requirements your raid agrees on, then surface missing preparation before invites begin."
              cards={['Consumables', 'World buffs', 'Attunements', 'Required gear']}
            />
          ) : null}

          {activeTab === 'activity' ? (
            <EmptyTabPanel
              icon={icons.calendar}
              eyebrow="Plan history"
              title="A clear record of raid changes"
              description="Roster moves, assignment edits, confirmations, and leadership changes will appear in a readable timeline."
              cards={['Roster changes', 'Assignment edits', 'Confirmations', 'Leadership actions']}
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}
