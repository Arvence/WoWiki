import { useState, type FormEvent } from 'react'
import { PLAYER_CLASSES, RAID_ROLES, type PlayerClass, type RaiderRole } from '../../types/raidPlan'
import { raidPlannerIcons } from '../raidPlannerIcons'

type AddRaiderFormProps = {
  groupCount: number
  groupSizes: readonly number[]
  initialGroup: number
  onAdd: (name: string, playerClass: PlayerClass, role: RaiderRole, group: number) => void
  onCancel: () => void
}

const formClasses = [
  'grid gap-3 border-b border-border/40 bg-primary/[0.035] p-4 sm:p-5',
  'md:grid-cols-[minmax(10rem,1.2fr)_minmax(8rem,.8fr)_minmax(8rem,.8fr)_minmax(7rem,.6fr)_auto]',
  'md:items-end',
].join(' ')
const nameInputClasses = [
  'h-10 rounded-lg border border-border/55 bg-background/70 px-3 text-sm text-text outline-none',
  'placeholder:text-muted/55 focus:border-primary/65 focus:ring-2 focus:ring-primary/15',
].join(' ')

export default function AddRaiderForm({ groupCount, groupSizes, initialGroup, onAdd, onCancel }: AddRaiderFormProps): JSX.Element {
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
    <form
      onSubmit={submit}
      className={formClasses}
    >
      <label className="grid gap-1.5">
        <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">Raider name</span>
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={32}
          placeholder="Character name"
          className={nameInputClasses}
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">Class</span>
        <select
          value={playerClass}
          onChange={(event) => setPlayerClass(event.target.value as PlayerClass)}
          className="h-10 rounded-lg border border-border/55 bg-background/70 px-3 text-sm text-text outline-none focus:border-primary/65"
        >
          {PLAYER_CLASSES.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5">
        <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">Role</span>
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as RaiderRole)}
          className="h-10 rounded-lg border border-border/55 bg-background/70 px-3 text-sm text-text outline-none focus:border-primary/65"
        >
          {RAID_ROLES.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5">
        <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">Group</span>
        <select
          value={group}
          onChange={(event) => setGroup(Number(event.target.value))}
          className="h-10 rounded-lg border border-border/55 bg-background/70 px-3 text-sm text-text outline-none focus:border-primary/65"
        >
          {Array.from({ length: groupCount }, (_, index) => index + 1).map((groupNumber) => (
            <option key={groupNumber} value={groupNumber} disabled={groupSizes[groupNumber - 1] >= 5}>
              Group {groupNumber}{groupSizes[groupNumber - 1] >= 5 ? ' (full)' : ''}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-lg border border-border px-3 text-xs font-bold text-muted transition hover:text-text"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-black text-background transition hover:bg-primary-hover"
        >
          {raidPlannerIcons.plus} Add
        </button>
      </div>
    </form>
  )
}
