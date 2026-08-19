import { useState } from 'react'
import { Link } from 'react-router-dom'
import CalendarPicker from '../../../../../components/ui/CalendarPicker'
import DropdownMenu from '../../../../../components/ui/DropdownMenu'
import TimePicker from '../../../../../components/ui/TimePicker'
import { RAID_OPTIONS, RAID_SIZES, type RaidPlan } from '../../types/raidPlan'
import { buildRaidCalendarUrl } from '../../utils/raidPlanCalendar'
import Panel from '../Panel'
import { raidPlannerIcons } from '../raidPlannerIcons'

type RaidConfigurationProps = {
  plan: RaidPlan
  plans: RaidPlan[]
  dirty: boolean
  accountStorage: boolean
  loadingPlans: boolean
  busy: boolean
  onChange: (field: 'raid' | 'date' | 'startTime' | 'notes', value: string) => void
  onRaidSizeChange: (size: number) => void
  onSave: () => void
  onShare: () => void
  onNew: () => void
  onSelect: (id: string) => void
  onDelete: () => void
}

const newRaidButtonClasses = [
  'rounded-xl border border-border bg-background/45 px-3.5 py-2 text-xs font-bold text-muted transition',
  'hover:border-border/80 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
  'disabled:cursor-not-allowed disabled:opacity-45',
].join(' ')
const deleteButtonClasses = [
  'inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/[0.06]',
  'px-3.5 py-2 text-xs font-bold text-red-300 transition hover:border-red-500/55 hover:bg-red-500/[0.12]',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 disabled:cursor-not-allowed disabled:opacity-45',
].join(' ')
const shareButtonClasses = [
  'inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/45',
  'px-3.5 py-2 text-xs font-bold text-muted transition hover:border-primary/45 hover:text-primary',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-45',
  'disabled:hover:border-border disabled:hover:text-muted',
].join(' ')
const calendarLinkClasses = [
  'inline-flex items-center justify-center gap-2 rounded-xl border border-primary/35 bg-primary/[0.08]',
  'px-3.5 py-2 text-xs font-bold text-primary transition hover:border-primary/60 hover:bg-primary/[0.14]',
  'hover:text-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
].join(' ')
const saveButtonClasses = [
  'inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-black text-background',
  'shadow-[0_8px_24px_rgba(199,156,58,0.16)] transition hover:bg-primary-hover',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-default disabled:opacity-55',
].join(' ')
const savedPlanSelectClasses = [
  'h-10 min-w-0 rounded-lg border border-border/55 bg-background/65 px-3 text-sm font-semibold text-text',
  'outline-none transition focus:border-primary/65 disabled:cursor-wait disabled:opacity-60',
].join(' ')
const notesClasses = [
  'resize-y rounded-xl border border-border/55 bg-surface-alt/70 px-3 py-2.5 text-sm leading-6 text-text outline-none',
  'placeholder:text-muted/55 focus:border-primary/65 focus:ring-2 focus:ring-primary/15',
].join(' ')

export default function RaidConfiguration({ plan, plans, dirty, accountStorage, loadingPlans, busy, onChange, onRaidSizeChange, onSave, onShare, onNew, onSelect, onDelete }: RaidConfigurationProps): JSX.Element {
  const [raidMenuOpen, setRaidMenuOpen] = useState(false)
  const storedPlan = Boolean(
    plan.id && (!accountStorage || plans.some((savedPlan) => savedPlan.id === plan.id)),
  )
  const shareReady = Boolean(storedPlan && plan.raiders.length > 0 && !dirty)
  const status = getPlanStatus(storedPlan, dirty, accountStorage, loadingPlans)
  const saveLabel = getSaveLabel(storedPlan, dirty, busy)

  return (
    <Panel className="min-w-0 overflow-visible p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-black text-text">Raid setup</h2>
            <span
              className={getStatusClasses(storedPlan && !dirty)}
            >
              {status}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Create the raid, build the roster, then save and share one link.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {storedPlan && (
            <button
              type="button"
              onClick={onNew}
              disabled={busy}
              className={newRaidButtonClasses}
            >
              New raid
            </button>
          )}
          {storedPlan && (
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              className={deleteButtonClasses}
            >
              {raidPlannerIcons.trash} Delete
            </button>
          )}
          <button
            type="button"
            onClick={onShare}
            disabled={!shareReady || busy}
            title={shareReady ? 'Copy a shareable raid link' : 'Save a raid with at least one raider before sharing'}
            className={shareButtonClasses}
          >
            {raidPlannerIcons.link} Share raid
          </button>
          <a
            href={buildRaidCalendarUrl(plan)}
            target="_blank"
            rel="noreferrer"
            className={calendarLinkClasses}
          >
            {raidPlannerIcons.calendar} Calendar
          </a>
          <button
            type="button"
            onClick={onSave}
            disabled={busy || loadingPlans || Boolean(storedPlan && !dirty)}
            className={saveButtonClasses}
          >
            {raidPlannerIcons.spark} {saveLabel}
          </button>
        </div>
      </div>

      {accountStorage ? (
        <div className="mb-4 grid gap-2 rounded-xl border border-border/40 bg-surface/30 p-3 sm:grid-cols-[minmax(12rem,1fr)_auto] sm:items-end">
          <label className="grid min-w-0 gap-1.5">
            <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">
              Your saved raids
            </span>
            <select
              value={storedPlan ? plan.id ?? '' : ''}
              onChange={(event) => onSelect(event.target.value)}
              disabled={loadingPlans || busy}
              className={savedPlanSelectClasses}
            >
              <option value="">
                {loadingPlans ? 'Loading raids...' : plans.length ? 'New unsaved raid' : 'No saved raids yet'}
              </option>
              {plans.map((savedPlan) => (
                <option key={savedPlan.id ?? savedPlan.updatedAt} value={savedPlan.id ?? ''}>
                  {formatPlanLabel(savedPlan)}
                </option>
              ))}
            </select>
          </label>
          <span className="pb-2 text-xs text-muted">{plans.length} saved to your account</span>
        </div>
      ) : (
        <p className="mb-4 rounded-xl border border-primary/25 bg-primary/[0.045] px-3 py-2.5 text-xs leading-5 text-muted">
          This raid will be saved in this browser.{' '}
          <Link to="/auth" className="font-bold text-primary hover:text-primary-hover">Sign in</Link>
          {' '}to keep multiple raids on your account.
        </p>
      )}

      <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(13rem,1.4fr)_minmax(10rem,1fr)_minmax(8rem,.7fr)_auto]">
        <div className="grid min-w-0 gap-1.5">
          <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">Raid</span>
          <DropdownMenu
            label={plan.raid || 'Select a raid'}
            items={RAID_OPTIONS}
            value={plan.raid}
            isOpen={raidMenuOpen}
            onToggle={() => setRaidMenuOpen((current) => !current)}
            onOpen={() => setRaidMenuOpen(true)}
            onClose={() => setRaidMenuOpen(false)}
            onSelect={(raid) => onChange('raid', raid)}
            variant="select"
            ariaLabel="Select raid"
          />
        </div>

        <div className="grid min-w-0 gap-1.5">
          <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">Date</span>
          <CalendarPicker
            value={plan.date}
            onChange={(value) => onChange('date', value)}
            ariaLabel="Select raid date"
          />
        </div>

        <div className="grid min-w-0 gap-1.5">
          <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">Start time</span>
          <TimePicker
            value={plan.startTime}
            onChange={(value) => onChange('startTime', value)}
            ariaLabel="Select raid start time"
            minuteStep={15}
          />
        </div>

        <div className="grid min-w-0 gap-1.5">
          <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">Raid size</span>
          <div className="flex h-11 w-full items-center rounded-xl border border-border/55 bg-surface-alt/70 p-1">
            {RAID_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={plan.raidSize === size}
                disabled={plan.raiders.length > size}
                onClick={() => onRaidSizeChange(size)}
                className={getRaidSizeClasses(plan.raidSize === size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      <label className="mt-3 grid gap-1.5">
        <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">
          Raid briefing <span className="font-semibold normal-case tracking-normal">(optional)</span>
        </span>
        <textarea
          value={plan.notes}
          onChange={(event) => onChange('notes', event.target.value)}
          maxLength={500}
          rows={2}
          placeholder="Loot rules, voice channel, invites, or leader notes..."
          className={notesClasses}
        />
      </label>
    </Panel>
  )
}

function getPlanStatus(storedPlan: boolean, dirty: boolean, accountStorage: boolean, loadingPlans: boolean): string {
  if (loadingPlans) return 'Loading raids'
  if (!storedPlan) return 'Not created'
  if (dirty) return 'Unsaved changes'
  return accountStorage ? 'Saved to account' : 'Saved locally'
}

function getStatusClasses(saved: boolean): string {
  const stateClasses = saved
    ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300'
    : 'border-border/60 bg-surface-alt/60 text-muted'

  return `rounded-full border px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] ${stateClasses}`
}

function getRaidSizeClasses(selected: boolean): string {
  const stateClasses = selected
    ? 'bg-primary text-background shadow-sm'
    : 'text-muted hover:bg-background/50 hover:text-text'

  return [
    'h-full min-w-0 flex-1 rounded-lg px-2 text-xs font-black transition',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
    'disabled:cursor-not-allowed disabled:opacity-30',
    stateClasses,
  ].join(' ')
}

function getSaveLabel(storedPlan: boolean, dirty: boolean, busy: boolean): string {
  if (busy) return 'Working...'
  if (!storedPlan) return 'Create raid'
  return dirty ? 'Save changes' : 'Saved'
}

function formatPlanLabel(plan: RaidPlan): string {
  return `${plan.raid || 'Untitled raid'}${plan.date ? ` — ${plan.date}` : ''}`
}
