import React, { useEffect, useState } from 'react'
import AppHeader from './components/layout/AppHeader'
import Sidebar from './components/layout/Sidebar'
import CharacterList from './features/characters/CharacterList'
import HeroArticle from './components/sections/HeroArticle'
import PopularContent from './components/sections/PopularContent'
import { fetchCharacters } from './api/characterService'
import type { Character } from './types/character'

const categories = ['Races', 'Classes', 'Dungeons', 'Raids', 'Items', 'Quests']

const popular = [
  { title: 'Sylvanas Windrunner', type: 'NPC', views: 12543 },
  { title: 'Dragonflight: The Hidden Vale', type: 'Zone', views: 9842 },
  { title: 'Epic Plate of the Fallen', type: 'Item', views: 7601 },
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
          <CharacterList characters={characters} loading={loading} error={error} />
          <PopularContent items={popular} />
        </section>

        <Sidebar categories={categories} popular={popular.map(({ title, views }) => ({ title, views }))} />
      </main>

      <footer className="mt-8 border-t border-border py-8 sm:mt-12">
        <div className="mx-auto max-w-6xl px-4 text-sm text-muted sm:px-6">© {new Date().getFullYear()} WoWiki — a community-driven World of Warcraft encyclopedia.</div>
      </footer>
    </div>
  )
}
