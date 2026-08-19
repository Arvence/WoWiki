import { RAID_ROLES, type RaiderRole, type RaidPlan } from '../../types/raidPlan'
import Panel from '../Panel'
import { raidPlannerIcons } from '../raidPlannerIcons'

export default function RoleCoverage({ plan }: { plan: RaidPlan }): JSX.Element {
  const healerTarget = plan.raidSize === 40
    ? 10
    : plan.raidSize <= 10
      ? 3
      : Math.max(4, Math.round(plan.raidSize * 0.24))
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
        <span className="text-primary">{raidPlannerIcons.shield}</span>
      </div>

      <div className="mt-5 space-y-4">
        {RAID_ROLES.map((role) => {
          const count = plan.raiders.filter((raider) => raider.role === role.id).length
          const percentage = Math.min(100, Math.round((count / targets[role.id]) * 100))

          return (
            <div key={role.id}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-bold text-text">{role.label}</span>
                <span className="text-muted">
                  {count} / {targets[role.id]}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-alt">
                <span
                  className={`block h-full rounded-full transition-[width] ${role.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}
