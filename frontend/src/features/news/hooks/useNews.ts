import { useEffect, useState } from 'react'
import { fetchNews } from '../api/newsService'
import type { News } from '../types/news'

export function useNews(): { news: News[]; loading: boolean; error: string | null } {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void fetchNews()
      .then((items) => { if (active) setNews(items) })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'An unexpected error occurred') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return { news, loading, error }
}
