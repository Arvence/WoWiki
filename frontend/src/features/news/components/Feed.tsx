import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchNews } from '../api/newsService'
import type { News } from '../types/news'
import FeaturedContent from '../../community/components/FeaturedContent'
import NewsList from './NewsList'
import RecentNews from './RecentNews'

const newsCategories = ['All', 'News', 'Patch Notes', 'Guide', 'Lore']

type FeedProps = {
  afterFeatured?: ReactNode
}

export default function Feed({ afterFeatured }: FeedProps): JSX.Element {
  const [news, setNews] = useState<News[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [newsColumns, setNewsColumns] = useState<1 | 2 | 3>(1)
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
    <div id="news" className="scroll-mt-24">
      <FeaturedContent />
      {afterFeatured}
      <RecentNews news={news} loading={loading} error={error} />

      {!loading && !error && news.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2" aria-label="Filter news by category">
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

          <div className="ml-auto hidden items-center gap-1 rounded-lg border border-border bg-surface/70 p-1 sm:flex" aria-label="Choose news grid columns">
            {([1, 2, 3] as const).map((columns) => (
              <button
                key={columns}
                type="button"
                onClick={() => setNewsColumns(columns)}
                aria-label={`${columns} column news view`}
                aria-pressed={newsColumns === columns}
                title={`${columns} column view`}
                className={`flex h-7 w-7 items-center justify-center rounded-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${newsColumns === columns ? 'bg-primary text-background' : 'text-muted hover:bg-primary/10 hover:text-primary'}`}
              >
                <svg className="h-4 w-4" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                  {Array.from({ length: columns }, (_, index) => {
                    const gap = 1.5
                    const width = (16 - gap * (columns - 1)) / columns
                    return <rect key={index} x={1 + index * (width + gap)} y="2" width={width} height="14" rx="1" />
                  })}
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
      <NewsList news={visibleNews} loading={loading} error={error} columns={newsColumns} />
    </div>
  )
}
