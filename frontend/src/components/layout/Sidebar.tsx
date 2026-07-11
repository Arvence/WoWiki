import CategoriesSection from './sidebar/CategoriesSection'
import PopularCharactersSection from './sidebar/PopularCharactersSection'
import PopularPagesSection from './sidebar/PopularPagesSection'

const categories = ['Races', 'Classes', 'Dungeons', 'Raids', 'Lore', 'Factions', 'Professions', 'Quests']

const popular = [
  { title: 'Sylvanas Windrunner', views: 12543 },
  { title: 'Dragonflight: The Hidden Vale', views: 9842 },
  { title: 'Epic Plate of the Fallen', views: 7601 },
  { title: 'The Emerald Dream', views: 8530 },
  { title: 'Frostwolf Clan', views: 7148 },
  { title: 'Shamanism Guide', views: 6785 },
]

export default function Sidebar(): JSX.Element {
  return (
    <aside className="w-full lg:sticky lg:top-24 lg:self-start">
      <div className="space-y-6">
        <CategoriesSection categories={categories} />
        <PopularPagesSection popular={popular} />
        <PopularCharactersSection />
      </div>
    </aside>
  )
}
