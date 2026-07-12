import { useMemo, useState } from 'react'

type ClassicEvent = {
  title: string
  category: string
  time: string
  location: string
  description: string
  preparation: string
}

const eventRotation: ClassicEvent[] = [
  { title: 'Classic Community Cup', category: 'Tournament', time: '20:00 realm time', location: 'Live on community streams', description: 'Community teams compete in a bracketed PvP tournament with live commentary, standings, and post-match interviews.', preparation: 'Check the published bracket, stream links, ruleset, and start time before the broadcast begins.' },
  { title: 'Patch Notes Watch Party', category: 'Game update', time: '19:00 realm time', location: 'WoWiki Discord stage', description: 'Players read through the latest Classic update together and discuss changes to classes, professions, PvP, and the economy.', preparation: 'Bring questions and verify any claims against the official patch notes linked by the hosts.' },
  { title: 'Creator Spotlight Stream', category: 'Streamer', time: '21:00 realm time', location: 'Featured creator channel', description: 'A featured Classic creator hosts a live discussion, answers community questions, and showcases their current project.', preparation: 'Follow the creator link when it is published and submit respectful questions before the stream.' },
  { title: 'Hardcore Leveling Race', category: 'Community race', time: '17:00 realm time', location: 'Community Hardcore realm', description: 'Players begin fresh characters together and compete for progress milestones under a shared community ruleset.', preparation: 'Review the race rules, register your character name, and install only the addons permitted by organizers.' },
  { title: 'Classic Transmog Showcase', category: 'Contest', time: '18:30 realm time', location: 'Orgrimmar and Stormwind', description: 'Players present themed outfits to a community judging panel, with separate faction showcases and audience voting.', preparation: 'Prepare one outfit, a short theme description, and arrive at the announced gathering point early.' },
  { title: 'Economy Roundtable', category: 'Live discussion', time: '20:30 realm time', location: 'WoWiki community stream', description: 'Crafters, gatherers, and auction-house specialists discuss market movement and answer questions from viewers.', preparation: 'Bring realm-specific observations, screenshots, or questions without sharing private player information.' },
  { title: 'Lore Quiz Night', category: 'Community game', time: '19:30 realm time', location: 'WoWiki Discord', description: 'Teams answer Classic-era lore questions across characters, zones, factions, quests, and historic game events.', preparation: 'Join a team before check-in or arrive early to be matched with other players.' },
]

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
const dateFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function eventForDate(date: Date): ClassicEvent | null {
  const dayIndex = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000)
  const scheduled = [2, 6, 10, 14, 18, 22, 26].includes(date.getDate())
  if (!scheduled) return null
  return eventRotation[Math.abs(dayIndex) % eventRotation.length]
}

function sameDay(first: Date, second: Date): boolean {
  return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth() && first.getDate() === second.getDate()
}

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
    <section className="rounded-lg border border-border bg-surface/80 p-4 shadow-sm" aria-labelledby="classic-events-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary">Community schedule</p>
          <h4 id="classic-events-title" className="mt-1 font-semibold text-text">WoW Classic Events</h4>
        </div>
        <span className="group relative inline-flex">
          <button type="button" className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs font-bold text-muted transition hover:border-primary hover:text-primary focus:outline-none focus-visible:border-primary focus-visible:text-primary focus-visible:ring-2 focus-visible:ring-primary/40" aria-label="How to share an event" aria-describedby="event-help-tooltip">?</button>
          <span id="event-help-tooltip" role="tooltip" className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 w-48 rounded border border-border bg-background px-3 py-2 text-center text-xs font-normal leading-5 text-text opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            If you want to share your event, please contact us.
            <span className="absolute right-2 top-full h-2 w-2 -translate-y-1/2 rotate-45 border-b border-r border-border bg-background" aria-hidden="true" />
          </span>
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button type="button" onClick={() => moveMonth(-1)} className="flex h-8 w-8 items-center justify-center rounded text-muted hover:bg-background hover:text-primary" aria-label="Previous month">&larr;</button>
        <p className="text-sm font-semibold text-text" aria-live="polite">{monthFormatter.format(visibleMonth)}</p>
        <button type="button" onClick={() => moveMonth(1)} className="flex h-8 w-8 items-center justify-center rounded text-muted hover:bg-background hover:text-primary" aria-label="Next month">&rarr;</button>
      </div>

      <div className="mt-3 grid grid-cols-7 text-center" aria-hidden="true">
        {weekDays.map((day) => <span key={day} className="py-1 text-[0.6rem] font-semibold uppercase text-muted">{day}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label={monthFormatter.format(visibleMonth)}>
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
              className={`relative flex aspect-square items-center justify-center rounded text-xs transition ${selected ? 'bg-primary font-bold text-background' : inMonth ? 'text-text hover:bg-background' : 'text-muted/40 hover:bg-background/50'} ${isToday && !selected ? 'ring-1 ring-primary' : ''}`}
              aria-label={`${dateFormatter.format(date)}: ${event ? event.title : 'No event scheduled'}`}
              aria-pressed={selected}
            >
              {date.getDate()}
              {event && !selected && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" aria-hidden="true" />}
            </button>
          )
        })}
      </div>

      <article className="mt-4 border-t border-border pt-4" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-primary">{dateFormatter.format(selectedDate)}</p>
          {selectedEvent && <span className="rounded bg-background px-2 py-1 text-[0.65rem] font-semibold text-muted">{selectedEvent.category}</span>}
        </div>
        {selectedEvent ? <>
          <h5 className="mt-2 font-semibold text-text">{selectedEvent.title}</h5>
          <dl className="mt-3 grid gap-2 text-xs">
            <div><dt className="text-muted">Time</dt><dd className="mt-0.5 font-medium text-text">{selectedEvent.time}</dd></div>
            <div><dt className="text-muted">Location</dt><dd className="mt-0.5 font-medium text-text">{selectedEvent.location}</dd></div>
          </dl>
          <p className="mt-3 text-xs leading-5 text-muted">{selectedEvent.description}</p>
          <div className="mt-3 rounded bg-background/60 p-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-primary">Event notes</p>
            <p className="mt-1 text-xs leading-5 text-muted">{selectedEvent.preparation}</p>
          </div>
        </> : <div className="mt-3 rounded bg-background/60 px-3 py-4 text-center"><p className="text-sm font-medium text-text">No event scheduled</p><p className="mt-1 text-xs leading-5 text-muted">Select a marked date to view a community event.</p></div>}
      </article>
    </section>
  )
}
