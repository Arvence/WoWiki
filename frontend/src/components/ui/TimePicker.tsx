import { useEffect, useId, useMemo, useRef, useState } from 'react'

export type TimePickerProps = {
  value: string
  onChange: (value: string) => void
  ariaLabel?: string
  disabled?: boolean
  minuteStep?: number
  className?: string
}

type TimeParts = {
  hour: number
  minute: number
}

const triggerClasses = [
  'flex h-11 w-full min-w-0 items-center gap-3 rounded-xl border border-border/55',
  'bg-surface-alt/70 px-3 text-left text-sm font-semibold text-text outline-none transition',
  'hover:border-primary/45 focus:border-primary/65 focus:ring-2 focus:ring-primary/15',
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ')
const popoverClasses = [
  'absolute left-0 top-full z-[70] mt-2 w-[19rem] max-w-[calc(100vw-2rem)] rounded-2xl',
  'border border-border/55 bg-surface/95 p-3 shadow-[0_20px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl',
].join(' ')
const clearButtonClasses = [
  'rounded-lg px-2.5 py-1.5 text-xs font-bold text-muted transition',
  'hover:bg-background/70 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
].join(' ')
const doneButtonClasses = [
  'rounded-lg border border-primary/35 bg-primary/10 px-3 py-1.5 text-xs font-black text-primary transition',
  'hover:border-primary/60 hover:bg-primary/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
].join(' ')

export default function TimePicker({ value, onChange, ariaLabel = 'Select time', disabled = false, minuteStep = 15, className = '' }: TimePickerProps): JSX.Element {
  const time = parseTimeValue(value) ?? { hour: 12, minute: 0 }
  const period = time.hour >= 12 ? 'PM' : 'AM'
  const hour12 = time.hour % 12 || 12
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogId = useId()
  const normalizedMinuteStep = Math.min(30, Math.max(1, Math.floor(minuteStep)))
  const minuteOptions = useMemo(() => {
    const options = Array.from(
      { length: Math.ceil(60 / normalizedMinuteStep) },
      (_, index) => index * normalizedMinuteStep,
    ).filter((minute) => minute < 60)

    if (!options.includes(time.minute)) options.push(time.minute)
    return options.sort((first, second) => first - second)
  }, [normalizedMinuteStep, time.minute])

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

  const updateHour = (nextHour12: number) => {
    onChange(formatTimeValue({
      hour: toTwentyFourHour(nextHour12, period),
      minute: time.minute,
    }))
  }

  const updateMinute = (minute: number) => {
    onChange(formatTimeValue({ hour: time.hour, minute }))
  }

  const updatePeriod = (nextPeriod: 'AM' | 'PM') => {
    onChange(formatTimeValue({
      hour: toTwentyFourHour(hour12, nextPeriod),
      minute: time.minute,
    }))
  }

  const clearTime = () => {
    onChange('')
    setOpen(false)
  }

  const finishSelection = () => {
    setOpen(false)
    triggerRef.current?.focus()
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
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
        <span className={`min-w-0 flex-1 truncate tabular-nums ${value ? 'text-text' : 'text-muted/70'}`}>
          {value ? formatDisplayTime(time) : 'Choose time'}
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
          aria-label="Choose a start time"
          className={popoverClasses}
        >
          <div className="flex items-center justify-between rounded-xl border border-border/35 bg-background/45 px-3 py-2.5">
            <span className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-muted">Raid start</span>
            <strong className="text-base font-black tabular-nums text-primary" aria-live="polite">
              {formatDisplayTime(time)}
            </strong>
          </div>

          <fieldset className="mt-3">
            <legend className="mb-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-muted">
              Hour
            </legend>
            <div className="grid grid-cols-6 gap-1">
              {Array.from({ length: 12 }, (_, index) => index + 1).map((hour) => (
                <button
                  key={hour}
                  type="button"
                  onClick={() => updateHour(hour)}
                  aria-pressed={hour12 === hour}
                  className={getTimeOptionClasses(hour12 === hour)}
                >
                  {twoDigits(hour)}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-3">
            <legend className="mb-2 text-[0.62rem] font-black uppercase tracking-[0.14em] text-muted">
              Minute
            </legend>
            <div className="grid grid-cols-4 gap-1">
              {minuteOptions.map((minute) => (
                <button
                  key={minute}
                  type="button"
                  onClick={() => updateMinute(minute)}
                  aria-pressed={time.minute === minute}
                  className={getTimeOptionClasses(time.minute === minute)}
                >
                  {twoDigits(minute)}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-3">
            <legend className="sr-only">Period</legend>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-background/35 p-1">
              {(['AM', 'PM'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updatePeriod(option)}
                  aria-pressed={period === option}
                  className={getPeriodOptionClasses(period === option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-3 flex items-center justify-between border-t border-border/35 pt-3">
            <button
              type="button"
              onClick={clearTime}
              className={clearButtonClasses}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={finishSelection}
              className={doneButtonClasses}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function getTimeOptionClasses(selected: boolean): string {
  const stateClasses = selected
    ? 'bg-primary text-background shadow-sm'
    : 'bg-background/35 text-text hover:bg-primary/10 hover:text-primary'

  return [
    'flex h-8 items-center justify-center rounded-lg text-xs font-bold tabular-nums transition',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
    stateClasses,
  ].join(' ')
}

function getPeriodOptionClasses(selected: boolean): string {
  const stateClasses = selected
    ? 'bg-primary text-background shadow-sm'
    : 'text-muted hover:bg-surface hover:text-text'

  return [
    'h-9 rounded-lg text-xs font-black transition',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
    stateClasses,
  ].join(' ')
}

function parseTimeValue(value: string): TimeParts | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null

  const hour = Number(match[1])
  const minute = Number(match[2])
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59
    ? { hour, minute }
    : null
}

function formatTimeValue(time: TimeParts): string {
  return `${twoDigits(time.hour)}:${twoDigits(time.minute)}`
}

function formatDisplayTime(time: TimeParts): string {
  const hour = time.hour % 12 || 12
  return `${twoDigits(hour)}:${twoDigits(time.minute)} ${time.hour >= 12 ? 'PM' : 'AM'}`
}

function toTwentyFourHour(hour: number, period: 'AM' | 'PM'): number {
  return hour % 12 + (period === 'PM' ? 12 : 0)
}

function twoDigits(value: number): string {
  return String(value).padStart(2, '0')
}
