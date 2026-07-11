import type { News } from '../types/news'

export async function fetchNews(): Promise<News[]> {
  const response = await fetch('/api/news')

  if (!response.ok) {
    throw new Error('Failed to load news')
  }

  return (await response.json()) as News[]
}
