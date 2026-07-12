import EventsCalendar from './sidebar/EventsCalendar'

export default function Sidebar(): JSX.Element {
  return (
    <aside className="w-full lg:sticky lg:top-24 lg:self-start">
      <EventsCalendar />
    </aside>
  )
}
