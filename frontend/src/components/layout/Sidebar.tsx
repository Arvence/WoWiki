import CategoriesSection from './sidebar/CategoriesSection'
import EventsCalendar from './sidebar/EventsCalendar'

const categories = ['Races', 'Classes', 'Dungeons', 'Raids', 'Lore', 'Factions', 'Professions', 'Quests']

export default function Sidebar(): JSX.Element {
  return (
    <aside className="w-full lg:sticky lg:top-24 lg:self-start">
      <div className="space-y-4">
        <CategoriesSection categories={categories} />
        <EventsCalendar />
      </div>
    </aside>
  )
}
