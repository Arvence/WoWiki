import { http } from '../../shared/api/http'

export type ReactionTargetType = 'news' | 'comments'
export type ReactionState = { liked: boolean; likeCount: number }

export function getReaction(targetType: ReactionTargetType, targetId: string, signal?: AbortSignal): Promise<ReactionState> {
  return http.get<ReactionState>(`/api/${targetType}/${encodeURIComponent(targetId)}/like`, { signal, errorMessage: 'Could not load your like.' })
}

export async function setReaction(targetType: ReactionTargetType, targetId: string, liked: boolean): Promise<ReactionState> {
  const response = await http.post<{ likeCount: number }>(
    `/api/${targetType}/${encodeURIComponent(targetId)}/like`, { liked }, { errorMessage: 'Could not update your like. Please try again.' },
  )
  return { liked, likeCount: response.likeCount }
}
