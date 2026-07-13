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
