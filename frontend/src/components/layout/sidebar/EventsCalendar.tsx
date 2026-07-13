import { useMemo, useState } from 'react'
import TextTooltip from '../../ui/TextTooltip'
import { dateFormatter, eventForDate, monthFormatter, sameDay, weekDays } from './calendarEvents'

export default function EventsCalendar(): JSX.Element {
  const today = useMemo(() => new Date(), [])
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(today)

  const calendarDays = useMemo(() => {
    const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1)
    const start = new Date(firstDay)
    start.setDate(1 - firstDay.getDay())
    return Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index))
  }, [visibleMonth])

  const selectedEvent = eventForDate(selectedDate)
  const moveMonth = (amount: number) => {
    const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + amount, 1)
    setVisibleMonth(nextMonth)
    setSelectedDate(nextMonth)
  }

  return (
    <section className="relative isolate overflow-hidden rounded-2xl bg-surface/75 shadow-[0_14px_40px_rgba(0,0,0,0.14)]" aria-labelledby="classic-events-title">
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />

      <div className="relative isolate overflow-hidden px-4 pb-4 pt-4">
        <img
          src="/images/calendar-undead-casting-bg.png"
          alt=""
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-[42%_center] opacity-50"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, rgba(0, 0, 0, 0.7) 45%, transparent 88%)',
            maskImage: 'linear-gradient(to bottom, black 0%, rgba(0, 0, 0, 0.7) 45%, transparent 88%)',
          }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-surface/10 via-surface/35 to-surface/90" aria-hidden="true" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-primary">Community schedule</p>
            <h4 id="classic-events-title" className="mt-1 text-base font-semibold text-text">WoW Classic Events</h4>
          </div>
          <TextTooltip text="If you want to share your event, please contact us." onlyWhenTruncated={false}>
            <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full bg-background/45 text-xs font-bold text-muted shadow-sm transition hover:bg-primary hover:text-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" aria-label="How to share an event">?</button>
          </TextTooltip>
        </div>

        <div className="relative z-10 mt-4 flex items-center justify-between rounded-xl bg-background/35 p-1 shadow-inner shadow-black/5">
          <button type="button" onClick={() => moveMonth(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-surface hover:text-primary" aria-label="Previous month">&larr;</button>
          <p className="text-sm font-semibold tracking-wide text-text" aria-live="polite">{monthFormatter.format(visibleMonth)}</p>
          <button type="button" onClick={() => moveMonth(1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-surface hover:text-primary" aria-label="Next month">&rarr;</button>
        </div>

        <div className="relative z-10 mt-3 grid grid-cols-7 text-center" aria-hidden="true">
          {weekDays.map((day) => <span key={day} className="py-1.5 text-[0.58rem] font-bold uppercase tracking-wider text-muted/75">{day}</span>)}
        </div>
        <div className="relative z-10 grid grid-cols-7 gap-1" role="grid" aria-label={monthFormatter.format(visibleMonth)}>
          {calendarDays.map((date) => {
            const inMonth = date.getMonth() === visibleMonth.getMonth()
            const selected = sameDay(date, selectedDate)
            const isToday = sameDay(date, today)
            const event = eventForDate(date)

            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={`relative flex aspect-square items-center justify-center rounded-full text-xs transition duration-200 ${selected ? 'scale-105 bg-primary font-bold text-background shadow-[0_5px_14px_rgba(212,160,74,0.28)]' : inMonth ? 'text-text hover:bg-background/65 hover:text-primary' : 'text-muted/30 hover:bg-background/35'} ${isToday && !selected ? 'font-bold text-primary ring-1 ring-inset ring-primary/60' : ''}`}
                aria-label={`${dateFormatter.format(date)}: ${event ? event.title : 'No event scheduled'}`}
                aria-pressed={selected}
              >
                {date.getDate()}
                {event && !selected && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-primary shadow-[0_0_6px_currentColor]" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      </div>

      <article className="relative mx-3 mb-3 rounded-2xl bg-background/40 p-4 shadow-inner shadow-black/5" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[0.68rem] font-bold uppercase tracking-wide text-primary">{dateFormatter.format(selectedDate)}</p>
          {selectedEvent && <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[0.62rem] font-semibold text-primary">{selectedEvent.category}</span>}
        </div>
        {selectedEvent ? <>
          <h5 className="mt-2 font-semibold text-text">{selectedEvent.title}</h5>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div><dt className="text-[0.62rem] uppercase tracking-wide text-muted">Time</dt><dd className="mt-1 font-medium text-text">{selectedEvent.time}</dd></div>
            <div><dt className="text-[0.62rem] uppercase tracking-wide text-muted">Location</dt><dd className="mt-1 font-medium text-text">{selectedEvent.location}</dd></div>
          </dl>
          <p className="mt-3 text-xs leading-5 text-muted">{selectedEvent.description}</p>
          <div className="mt-3 rounded-xl bg-surface/55 p-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-primary">Event notes</p>
            <p className="mt-1 text-xs leading-5 text-muted">{selectedEvent.preparation}</p>
          </div>
        </> : <div className="mt-3 rounded-xl bg-surface/45 px-3 py-4 text-center"><p className="text-sm font-medium text-text">No event scheduled</p><p className="mt-1 text-xs leading-5 text-muted">Select a marked date to view a community event.</p></div>}
      </article>
    </section>
  )
}
