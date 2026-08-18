import { useEffect, useId, useMemo, useRef, useState } from 'react'

export type CalendarPickerProps = {
  value: string
  onChange: (value: string) => void
  ariaLabel?: string
  disabled?: boolean
  min?: string
  max?: string
  className?: string
}

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
const valueFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
const accessibleDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const triggerClasses = [
  'flex h-11 w-full min-w-0 items-center gap-3 rounded-xl border border-border/55',
  'bg-surface-alt/70 px-3 text-left text-sm font-semibold text-text outline-none transition',
  'hover:border-primary/45 focus:border-primary/65 focus:ring-2 focus:ring-primary/15',
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ')
const popoverClasses = [
  'absolute left-0 top-full z-[70] mt-2 w-[20rem] max-w-[calc(100vw-2rem)] rounded-2xl',
  'border border-border/55 bg-surface/95 p-3 shadow-[0_20px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl',
].join(' ')
const monthButtonClasses = [
  'flex h-8 w-8 items-center justify-center rounded-lg text-muted transition',
  'hover:bg-primary/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
].join(' ')
const clearButtonClasses = [
  'rounded-lg px-2.5 py-1.5 text-xs font-bold text-muted transition',
  'hover:bg-background/70 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
].join(' ')
const todayButtonClasses = [
  'rounded-lg border border-primary/35 bg-primary/10 px-3 py-1.5 text-xs font-black text-primary transition',
  'hover:border-primary/60 hover:bg-primary/15 focus:outline-none focus-visible:ring-2',
  'focus-visible:ring-primary/50 disabled:opacity-40',
].join(' ')

export default function CalendarPicker({ value, onChange, ariaLabel = 'Select date', disabled = false, min, max, className = '' }: CalendarPickerProps): JSX.Element {
  const selectedDate = useMemo(() => parseDateValue(value), [value])
  const today = useMemo(startOfToday, [])
  const [open, setOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(selectedDate ?? today))
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogId = useId()
  const minimumDate = useMemo(() => parseDateValue(min ?? ''), [min])
  const maximumDate = useMemo(() => parseDateValue(max ?? ''), [max])

  useEffect(() => {
    if (selectedDate) setVisibleMonth(startOfMonth(selectedDate))
  }, [selectedDate])

  useEffect(() => {
    if (!open) return undefined

    const dismissOnPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', dismissOnPointerDown)
    document.addEventListener('keydown', dismissOnEscape)
    return () => {
      document.removeEventListener('pointerdown', dismissOnPointerDown)
      document.removeEventListener('keydown', dismissOnEscape)
    }
  }, [open])

  const calendarDays = useMemo(() => {
    const firstDay = startOfMonth(visibleMonth)
    const gridStart = new Date(
      firstDay.getFullYear(),
      firstDay.getMonth(),
      1 - firstDay.getDay(),
    )

    return Array.from(
      { length: 42 },
      (_, index) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index),
    )
  }, [visibleMonth])

  const chooseDate = (date: Date) => {
    if (dateIsDisabled(date, minimumDate, maximumDate)) return
    onChange(formatDateValue(date))
    setOpen(false)
    triggerRef.current?.focus()
  }

  const moveMonth = (amount: number) => {
    setVisibleMonth((currentMonth) => (
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + amount, 1)
    ))
  }

  const clearDate = () => {
    onChange('')
    setOpen(false)
  }

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        className={triggerClasses}
      >
        <svg
          className="h-4 w-4 shrink-0 text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M7 3v4M17 3v4M3 10h18" />
        </svg>
        <span className={`min-w-0 flex-1 truncate ${selectedDate ? 'text-text' : 'text-muted/70'}`}>
          {selectedDate ? valueFormatter.format(selectedDate) : 'Choose date'}
        </span>
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-muted transition ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.2 7.2a.75.75 0 0 1 1.1 0L10 11l3.7-3.8a.75.75 0 1 1 1.1 1L10.5 13a.75.75 0 0 1-1 0L5.2 8.3a.75.75 0 0 1 0-1.1Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          id={dialogId}
          role="dialog"
          aria-label="Choose a calendar date"
          className={popoverClasses}
        >
          <div className="flex items-center justify-between rounded-xl border border-border/35 bg-background/45 p-1">
            <MonthButton direction="previous" onClick={() => moveMonth(-1)} />
            <strong className="text-sm font-black tracking-wide text-text" aria-live="polite">
              {monthFormatter.format(visibleMonth)}
            </strong>
            <MonthButton direction="next" onClick={() => moveMonth(1)} />
          </div>

          <div className="mt-3 grid grid-cols-7 text-center" aria-hidden="true">
            {weekDays.map((day) => (
              <span key={day} className="py-1 text-[0.58rem] font-black uppercase tracking-[0.12em] text-muted/70">
                {day}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1" role="grid" aria-label={monthFormatter.format(visibleMonth)}>
            {calendarDays.map((date) => {
              const inMonth = date.getMonth() === visibleMonth.getMonth()
              const selected = selectedDate ? sameDay(date, selectedDate) : false
              const isToday = sameDay(date, today)
              const dateDisabled = dateIsDisabled(date, minimumDate, maximumDate)

              return (
                <button
                  key={formatDateValue(date)}
                  type="button"
                  disabled={dateDisabled}
                  onClick={() => chooseDate(date)}
                  aria-label={accessibleDateFormatter.format(date)}
                  aria-pressed={selected}
                  aria-current={isToday ? 'date' : undefined}
                  className={getDayClasses(selected, inMonth, isToday)}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border/35 pt-3">
            <button
              type="button"
              onClick={clearDate}
              className={clearButtonClasses}
            >
              Clear
            </button>
            <button
              type="button"
              disabled={dateIsDisabled(today, minimumDate, maximumDate)}
              onClick={() => chooseDate(today)}
              className={todayButtonClasses}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MonthButton({ direction, onClick }: { direction: 'previous' | 'next'; onClick: () => void }): JSX.Element {
  const previous = direction === 'previous'

  return (
    <button
      type="button"
      onClick={onClick}
      className={monthButtonClasses}
      aria-label={previous ? 'Previous month' : 'Next month'}
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d={previous ? 'm12 4-6 6 6 6' : 'm8 4 6 6-6 6'} />
      </svg>
    </button>
  )
}

function getDayClasses(selected: boolean, inMonth: boolean, isToday: boolean): string {
  const stateClasses = selected
    ? 'bg-primary font-black text-background shadow-[0_5px_16px_rgba(199,156,58,0.28)]'
    : inMonth
      ? 'text-text hover:bg-primary/10 hover:text-primary'
      : 'text-muted/35 hover:bg-background/60 hover:text-muted'
  const todayClasses = isToday && !selected ? 'ring-1 ring-inset ring-primary/60 text-primary' : ''

  return [
    'flex aspect-square items-center justify-center rounded-lg text-xs font-semibold tabular-nums transition',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
    'disabled:cursor-not-allowed disabled:opacity-20',
    stateClasses,
    todayClasses,
  ].join(' ')
}

function parseDateValue(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return formatDateValue(date) === value ? date : null
}

function formatDateValue(date: Date): string {
  return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`
}

function startOfToday(): Date {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function sameDay(first: Date, second: Date): boolean {
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate()
}

function dateIsDisabled(date: Date, minimumDate: Date | null, maximumDate: Date | null): boolean {
  return Boolean((minimumDate && date < minimumDate) || (maximumDate && date > maximumDate))
}

function twoDigits(value: number): string {
  return String(value).padStart(2, '0')
}
