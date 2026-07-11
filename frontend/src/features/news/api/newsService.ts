import type { News } from '../types/news'

export async function fetchNews(): Promise<News[]> {
  const response = await fetch('/api/news')

  if (!response.ok) {
    throw new Error('Failed to load news')
  }

  return (await response.json()) as News[]
}

export async function fetchNewsById(newsId: string): Promise<News> {
  const response = await fetch(`/api/news/${newsId}`)

  if (!response.ok) {
    throw new Error(response.status === 404 ? 'News article not found' : 'Failed to load news article')
  }

  return (await response.json()) as News
}

export async function setNewsLiked(newsId: string, liked: boolean): Promise<News> {
  const response = await fetch(`/api/news/${newsId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ liked }),
  })

  if (!response.ok) {
    throw new Error('Failed to update like')
  }

  return (await response.json()) as News
}
