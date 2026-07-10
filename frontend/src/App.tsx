import React, { useEffect, useState } from 'react'
import AppHeader from './components/layout/AppHeader'
import Sidebar from './components/layout/Sidebar'
import HeroArticle from './components/sections/HeroArticle'
import PopularContent from './components/sections/PopularContent'
import { fetchCharacters } from './api/characterService'
import type { Character } from './types/character'

const categories = ['Races', 'Classes', 'Dungeons', 'Raids', 'Lore', 'Factions', 'Professions', 'Quests']

const popular = [
  { title: 'Sylvanas Windrunner', type: 'NPC', views: 12543 },
  { title: 'Dragonflight: The Hidden Vale', type: 'Zone', views: 9842 },
  { title: 'Epic Plate of the Fallen', type: 'Item', views: 7601 },
  { title: 'The Emerald Dream', type: 'Lore', views: 8530 },
  { title: 'Frostwolf Clan', type: 'Faction', views: 7148 },
  { title: 'Shamanism Guide', type: 'Guide', views: 6785 },
]

export default function App(): JSX.Element {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const data = await fetchCharacters()
        setCharacters(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    void loadCharacters()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,2fr)_320px] lg:gap-8">
        <section className="lg:col-span-1">
          <HeroArticle />
          <PopularContent items={popular} />
        </section>

        <Sidebar
          categories={categories}
          popular={popular.map(({ title, views }) => ({ title, views }))}
          characters={characters}
          loading={loading}
          error={error}
        />
      </main>

      <footer className="mt-6 border-t border-border py-6 sm:mt-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="space-y-2">
            <p className="text-text font-semibold">WoWiki</p>
            <p>© {new Date().getFullYear()} WoWiki. A community-driven World of Warcraft encyclopedia with reliable lore, guides, and character insights.</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-6">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Explore</p>
              <a className="block text-text transition hover:text-primary" href="#">About</a>
              <a className="block text-text transition hover:text-primary" href="#">Categories</a>
              <a className="block text-text transition hover:text-primary" href="#">Popular Pages</a>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Support</p>
              <a className="block text-text transition hover:text-primary" href="#">Privacy</a>
              <a className="block text-text transition hover:text-primary" href="#">Terms</a>
              <a className="block text-text transition hover:text-primary" href="#">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
