import type { EditorNews, News, NewsContent } from '../types/news'
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

export function fetchEditorNews(signal?: AbortSignal): Promise<EditorNews[]> {
  return http.get<EditorNews[]>('/api/news/editor', { signal })
}

export function saveNewsContent(newsId: string | undefined, content: NewsContent): Promise<EditorNews> {
  return newsId ? http.patch<EditorNews>(`/api/news/${newsId}`, content) : http.post<EditorNews>('/api/news/drafts', content)
}

export function saveNewsSchedule(newsId: string, scheduledAtLocal: string, enforcePublicationDeadline: boolean): Promise<EditorNews> {
  return http.put<EditorNews>(`/api/news/${newsId}/schedule`, { scheduledAtLocal, enforcePublicationDeadline })
}

export function retryNewsSchedule(newsId: string): Promise<EditorNews> {
  return http.post<EditorNews>(`/api/news/${newsId}/schedule/retry`)
}

export function removeNewsSchedule(newsId: string): Promise<EditorNews> {
  return http.post<EditorNews>(`/api/news/${newsId}/unschedule`)
}

export function publishNewsNow(newsId: string): Promise<EditorNews> {
  return http.post<EditorNews>(`/api/news/${newsId}/publish`)
}

export async function downloadNewsPdf(article: News): Promise<void> {
  const response = await http.postForResponse('/api/pdf/news', article, {
    errorMessage: 'Failed to create PDF',
  })

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
