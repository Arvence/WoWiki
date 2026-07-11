import type {
  CommentData,
  CommentTargetType,
  CreateCommentData,
} from '../types/comment'

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error('Comment request failed')
  }
  return (await response.json()) as T
}

export async function fetchComments(
  targetType: CommentTargetType,
  targetId: string,
): Promise<CommentData[]> {
  const response = await fetch(`/api/${targetType}/${targetId}/comments`)
  return parseResponse<CommentData[]>(response)
}

export async function createComment(
  targetType: CommentTargetType,
  targetId: string,
  comment: CreateCommentData,
): Promise<CommentData> {
  const response = await fetch(`/api/${targetType}/${targetId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comment),
  })
  return parseResponse<CommentData>(response)
}

export async function updateComment(
  commentId: string,
  comment: Partial<CreateCommentData>,
): Promise<CommentData> {
  const response = await fetch(`/api/comments/${commentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comment),
  })
  return parseResponse<CommentData>(response)
}

export async function likeComment(commentId: string): Promise<CommentData> {
  const response = await fetch(`/api/comments/${commentId}/like`, { method: 'POST' })
  return parseResponse<CommentData>(response)
}

export async function deleteComment(commentId: string): Promise<void> {
  const response = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error('Failed to delete comment')
  }
}
