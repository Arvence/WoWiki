import type { RaidPlan } from '../../types/raidPlan'
import Panel from '../Panel'
import { raidPlannerIcons } from '../raidPlannerIcons'

export default function RaidSummary({ plan, dirty, accountStorage }: { plan: RaidPlan; dirty: boolean; accountStorage: boolean }): JSX.Element {
  const checklist = [
    { done: Boolean(plan.id), label: 'Raid created' },
    { done: plan.raiders.length > 0, label: 'Raiders added and grouped' },
    { done: Boolean(plan.id && !dirty), label: 'Latest changes saved' },
  ]
  const storageMessage = accountStorage
    ? 'Saved raids follow your account across browsers.'
    : 'Saved raids stay in this browser until you sign in.'

  return (
    <Panel className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-text">Share checklist</h3>
          <p className="mt-1 text-xs text-muted">Everything needed for a clean handoff.</p>
        </div>
        <span className="text-primary">{raidPlannerIcons.link}</span>
      </div>

      <ol className="mt-4 space-y-3 text-xs">
        {checklist.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2.5">
            <span
              className={getMarkerClasses(item.done)}
            >
              {item.done ? '\u2713' : index + 1}
            </span>
            <span className={item.done ? 'text-text' : 'text-muted'}>{item.label}</span>
          </li>
        ))}
      </ol>

      <p className="mt-4 rounded-xl border border-border/40 bg-surface/35 px-3 py-2.5 text-[0.68rem] leading-5 text-muted">
        {storageMessage} Share links carry a copy that another player can open and save.
      </p>
    </Panel>
  )
}

function getMarkerClasses(done: boolean): string {
  const stateClasses = done
    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
    : 'border-border bg-background/45 text-muted'

  return `flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[0.65rem] font-black ${stateClasses}`
}
