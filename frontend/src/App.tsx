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

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <HeroArticle />
          <CharacterList characters={characters} loading={loading} error={error} />
          <PopularContent items={popular} />
        </section>

        <Sidebar categories={categories} popular={popular.map(({ title, views }) => ({ title, views }))} />
      </main>

      <footer className="border-t border-slate-800 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-sm text-slate-400">© {new Date().getFullYear()} WoWiki — a community-driven World of Warcraft encyclopedia.</div>
      </footer>
    </div>
  )
}
