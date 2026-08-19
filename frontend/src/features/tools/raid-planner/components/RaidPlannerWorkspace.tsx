import { useRaidPlannerController, type PlannerNotice } from '../hooks/useRaidPlannerController'
import RaidConfiguration from './configuration/RaidConfiguration'
import RosterBoard from './roster/RosterBoard'
import PlannerStats from './summary/PlannerStats'
import RaidSummary from './summary/RaidSummary'
import RoleCoverage from './summary/RoleCoverage'

export default function RaidPlannerWorkspace(): JSX.Element {
  const planner = useRaidPlannerController()

  return (
    <section
      className="w-full min-w-0 overflow-hidden rounded-2xl border border-border/35 bg-surface p-3 shadow-[0_22px_60px_rgba(0,0,0,0.3)] sm:p-5"
      aria-label="Raid planner workspace"
    >
      <div className="min-w-0 space-y-4">
        <RaidConfiguration
          plan={planner.plan}
          plans={planner.plans}
          dirty={planner.dirty}
          accountStorage={planner.accountStorage}
          loadingPlans={planner.loadingPlans}
          busy={planner.busy}
          onChange={planner.changeField}
          onRaidSizeChange={planner.changeRaidSize}
          onSave={() => { void planner.savePlan() }}
          onShare={() => { void planner.sharePlan() }}
          onNew={planner.newPlan}
          onSelect={planner.selectPlan}
          onDelete={() => { void planner.deletePlan() }}
        />

        {planner.notice && (
          <p
            role={planner.notice.tone === 'error' ? 'alert' : 'status'}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold ${getNoticeClasses(planner.notice)}`}
          >
            {planner.notice.text}
          </p>
        )}

        <PlannerStats plan={planner.plan} />

        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <RosterBoard
            plan={planner.plan}
            showAddRaider={planner.showAddRaider}
            addGroup={planner.addGroup}
            onShowAddRaider={planner.openAddRaider}
            onHideAddRaider={planner.closeAddRaider}
            onAddRaider={planner.addRaider}
            onMoveRaider={planner.moveRaider}
            onRemoveRaider={planner.removeRaider}
            onAutoBalance={planner.autoBalance}
          />
          <aside className="grid content-start gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <RoleCoverage plan={planner.plan} />
            <RaidSummary plan={planner.plan} dirty={planner.dirty} accountStorage={planner.accountStorage} />
          </aside>
        </div>
      </div>
    </section>
  )
}

function getNoticeClasses(notice: PlannerNotice): string {
  if (notice.tone === 'success') return 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
  if (notice.tone === 'error') return 'border-red-500/35 bg-red-500/10 text-red-200'
  return 'border-sky-500/35 bg-sky-500/10 text-sky-200'
}
