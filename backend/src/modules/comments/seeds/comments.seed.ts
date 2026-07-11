import { Comment } from '../models/comment.model'

export const COMMENTS: Comment[] = [
  {
    id: '4',
    targetType: 'community',
    targetId: '1',
    author: 'Valeera',
    content: 'This route made our first Deadmines run much smoother.',
    createdAt: '2026-07-10T17:30:00.000Z',
    likeCount: 5,
  },
  {
    id: '5',
    targetType: 'community',
    targetId: '2',
    author: 'Cenarius',
    content: 'The connection to the world trees is especially interesting.',
    createdAt: '2026-07-09T11:10:00.000Z',
    likeCount: 9,
  },
  {
    id: '6',
    targetType: 'community',
    targetId: '3',
    author: 'Throm-Ka',
    content: 'Clear role assignments helped our group more than extra gear.',
    createdAt: '2026-07-06T19:05:00.000Z',
    likeCount: 4,
  },
]
