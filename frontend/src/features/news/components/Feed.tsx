import { useEffect, useMemo, useState } from 'react'
import { fetchNews } from '../api/newsService'
import type { News } from '../types/news'
import NewsList from './NewsList'

const newsCategories = ['All', 'News', 'Patch Notes', 'Guide', 'Lore']

export default function Feed(): JSX.Element {
  const [news, setNews] = useState<News[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadNews = async () => {
      try {
        setNews(await fetchNews())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    void loadNews()
  }, [])

  const visibleNews = useMemo(
    () => news
      .filter((article) => selectedCategory === 'All' || article.category === selectedCategory)
      .sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()),
    [news, selectedCategory],
  )

  return (
    <div>
      {!loading && !error && news.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2" aria-label="Filter news by category">
          {newsCategories.map((category) => {
            const selected = selectedCategory === category

            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                aria-pressed={selected}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selected ? 'border-primary bg-primary text-background' : 'border-border bg-surface/70 text-muted hover:border-primary/60 hover:text-primary'}`}
              >
                {category}
              </button>
            )
          })}
        </div>
      )}
      <NewsList news={visibleNews} loading={loading} error={error} />
    </div>
  )
}
