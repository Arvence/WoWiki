import type { News } from '../types/news'
import { http } from '../../../shared/api/http'

export async function fetchNews(): Promise<News[]> {
  return http.get<News[]>('/api/news', { errorMessage: 'Failed to load news' })
}

export async function fetchNewsById(newsId: string): Promise<News> {
  return http.get<News>(`/api/news/${newsId}`, {
    errorMessage: 'Failed to load news article',
    notFoundMessage: 'News article not found',
  })
}

export async function setNewsLiked(newsId: string, liked: boolean): Promise<News> {
  return http.post<News>(`/api/news/${newsId}/like`, { liked }, { errorMessage: 'Failed to update like' })
}

export async function downloadNewsPdf(article: News): Promise<void> {
  const response = await fetch('/api/pdf/news', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article),
  })

  if (!response.ok) throw new Error('Failed to create PDF')

  const blobUrl = URL.createObjectURL(await response.blob())
  const disposition = response.headers.get('content-disposition') ?? ''
  const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  const fileName = encodedName ? decodeURIComponent(encodedName) : 'wowiki-news.pdf'
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(blobUrl)
}
