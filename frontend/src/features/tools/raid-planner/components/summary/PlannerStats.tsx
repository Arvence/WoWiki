import type { RaidPlan } from '../../types/raidPlan'
import { raidPlannerIcons } from '../raidPlannerIcons'

export default function PlannerStats({ plan }: { plan: RaidPlan }): JSX.Element {
  const groups = Math.ceil(plan.raidSize / 5)
  const assignedGroups = new Set(plan.raiders.map((raider) => raider.group)).size
  const readiness = Math.round((plan.raiders.length / plan.raidSize) * 100)
  const stats = [
    {
      label: 'Raiders',
      value: `${plan.raiders.length} / ${plan.raidSize}`,
      note: `${plan.raidSize - plan.raiders.length} open slots`,
      icon: raidPlannerIcons.users,
    },
    {
      label: 'Groups',
      value: `${assignedGroups} / ${groups}`,
      note: 'Five raiders per group',
      icon: raidPlannerIcons.shield,
    },
    {
      label: 'Saved',
      value: plan.id && plan.updatedAt ? 'Yes' : 'No',
      note: plan.updatedAt
        ? `Updated ${new Date(plan.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : 'Create the raid to begin',
      icon: raidPlannerIcons.spark,
    },
    {
      label: 'Readiness',
      value: `${readiness}%`,
      note: plan.raiders.length ? 'Based on filled roster slots' : 'Waiting for roster',
      icon: raidPlannerIcons.wand,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="min-w-0 rounded-2xl border border-border/40 bg-background/28 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">
              {stat.label}
            </span>
            <span className="text-primary/80">{stat.icon}</span>
          </div>
          <strong className="mt-3 block text-2xl font-black text-text">{stat.value}</strong>
          <span className="mt-1 block truncate text-xs text-muted" title={stat.note}>
            {stat.note}
          </span>
        </div>
      ))}
    </div>
  )
}
