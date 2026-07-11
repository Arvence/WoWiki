import { useEffect, useState } from 'react'
import { fetchNews } from '../../../api/newsService'
import type { News } from '../../../types/news'
import NewsList from './NewsList'

export default function Feed(): JSX.Element {
  const [news, setNews] = useState<News[]>([])
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

  return <NewsList news={news} loading={loading} error={error} />
}
