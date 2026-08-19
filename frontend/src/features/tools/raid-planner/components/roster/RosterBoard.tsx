import { PLAYER_CLASSES, RAID_ROLES, type PlayerClass, type RaiderRole, type RaidPlan } from '../../types/raidPlan'
import Panel from '../Panel'
import { raidPlannerIcons } from '../raidPlannerIcons'
import AddRaiderForm from './AddRaiderForm'

type RosterBoardProps = {
  plan: RaidPlan
  showAddRaider: boolean
  addGroup: number
  onShowAddRaider: (group?: number) => void
  onHideAddRaider: () => void
  onAddRaider: (name: string, playerClass: PlayerClass, role: RaiderRole, group: number) => void
  onMoveRaider: (raiderId: string, group: number) => void
  onRemoveRaider: (raiderId: string) => void
  onAutoBalance: () => void
}

const autoBalanceButtonClasses = [
  'rounded-lg border border-border/55 px-3 py-2 text-xs font-bold text-muted transition',
  'hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-45',
].join(' ')
const addRaiderButtonClasses = [
  'inline-flex items-center gap-1.5 rounded-lg border border-primary/35 bg-primary/[0.08]',
  'px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary/[0.14]',
  'disabled:cursor-not-allowed disabled:opacity-45',
].join(' ')
const removeRaiderButtonClasses = [
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition',
  'hover:bg-red-500/10 hover:text-red-300 focus:outline-none',
  'focus-visible:ring-2 focus-visible:ring-red-400/45',
].join(' ')
const emptySlotButtonClasses = [
  'group flex min-h-11 w-full items-center gap-2.5 px-3 py-2 text-left transition',
  'hover:bg-primary/[0.045] focus:outline-none focus-visible:bg-primary/[0.08]',
  'disabled:cursor-not-allowed disabled:hover:bg-transparent',
].join(' ')
const emptySlotIconClasses = [
  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-dashed',
  'border-border/70 bg-background/30 text-muted/50 transition',
  'group-hover:border-primary/45 group-hover:text-primary',
  'group-disabled:group-hover:border-border/70 group-disabled:group-hover:text-muted/50',
].join(' ')

export default function RosterBoard({ plan, showAddRaider, addGroup, onShowAddRaider, onHideAddRaider, onAddRaider, onMoveRaider, onRemoveRaider, onAutoBalance }: RosterBoardProps): JSX.Element {
  const groupCount = Math.ceil(plan.raidSize / 5)
  const groupSizes = Array.from(
    { length: groupCount },
    (_, index) => plan.raiders.filter((raider) => raider.group === index + 1).length,
  )
  const canAdd = Boolean(plan.id && plan.raiders.length < plan.raidSize)

  return (
    <Panel className="min-w-0 overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="font-black text-text">Raid roster</h2>
          <p className="mt-1 text-xs text-muted">Add each player to a group, or move them with the group menu.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAutoBalance}
            disabled={plan.raiders.length < 2}
            className={autoBalanceButtonClasses}
          >
            Auto-balance
          </button>
          <button
            type="button"
            onClick={() => onShowAddRaider()}
            disabled={!canAdd}
            title={!plan.id ? 'Create the raid before adding raiders' : undefined}
            className={addRaiderButtonClasses}
          >
            {raidPlannerIcons.plus} Add raider
          </button>
        </div>
      </div>

      {showAddRaider && (
        <AddRaiderForm
          groupCount={groupCount}
          groupSizes={groupSizes}
          initialGroup={addGroup}
          onAdd={onAddRaider}
          onCancel={onHideAddRaider}
        />
      )}

      <div className="grid gap-3 p-4 sm:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: groupCount }, (_, groupIndex) => {
          const groupNumber = groupIndex + 1
          const groupRaiders = plan.raiders.filter((raider) => raider.group === groupNumber)
          const emptySlots = Math.max(0, 5 - groupRaiders.length)

          return (
            <article key={groupNumber} className="overflow-hidden rounded-xl border border-border/45 bg-surface/55">
              <header className="flex items-center justify-between border-b border-border/35 bg-surface-alt/55 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[0.65rem] font-black text-primary">
                    {groupNumber}
                  </span>
                  <h3 className="text-xs font-black uppercase tracking-[0.1em] text-text">Group {groupNumber}</h3>
                </div>
                <span className="text-[0.65rem] font-semibold text-muted">{groupRaiders.length} / 5</span>
              </header>

              <div className="divide-y divide-border/25">
                {groupRaiders.map((raider) => {
                  const classInfo = PLAYER_CLASSES.find((option) => option.id === raider.playerClass) ?? PLAYER_CLASSES[0]
                  const roleInfo = RAID_ROLES.find((option) => option.id === raider.role) ?? RAID_ROLES[2]

                  return (
                    <div key={raider.id} className="flex min-h-14 items-center gap-2 px-2.5 py-2">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[0.68rem] font-black ${classInfo.color}`}>
                        {raider.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-black text-text">{raider.name}</span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[0.62rem] text-muted">
                          <span className={`h-1.5 w-1.5 rounded-full ${roleInfo.color}`} />
                          {classInfo.label} &middot; {roleInfo.label}
                        </span>
                      </span>
                      <select
                        value={raider.group}
                        onChange={(event) => onMoveRaider(raider.id, Number(event.target.value))}
                        aria-label={`Move ${raider.name} to group`}
                        className="h-8 w-12 rounded-md border border-border/45 bg-background/65 px-1 text-[0.68rem] font-bold text-text outline-none focus:border-primary"
                      >
                        {Array.from({ length: groupCount }, (_, index) => index + 1).map((destination) => (
                          <option
                            key={destination}
                            value={destination}
                            disabled={destination !== raider.group && groupSizes[destination - 1] >= 5}
                          >
                            {destination}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => onRemoveRaider(raider.id)}
                        aria-label={`Remove ${raider.name}`}
                        className={removeRaiderButtonClasses}
                      >
                        {raidPlannerIcons.trash}
                      </button>
                    </div>
                  )
                })}

                {Array.from({ length: emptySlots }, (_, slotIndex) => (
                  <button
                    key={slotIndex}
                    type="button"
                    onClick={() => onShowAddRaider(groupNumber)}
                    disabled={!canAdd}
                    className={emptySlotButtonClasses}
                  >
                    <span className={emptySlotIconClasses}>
                      {raidPlannerIcons.plus}
                    </span>
                    <span>
                      <span className="block text-xs font-bold text-muted/80 transition group-hover:text-text group-disabled:group-hover:text-muted/80">
                        Empty slot
                      </span>
                      <span className="block text-[0.62rem] text-muted/45">
                        {plan.id ? 'Add to this group' : 'Create raid first'}
                      </span>
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
