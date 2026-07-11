import { type FormEvent, useEffect, useState } from 'react'
import { createComment, fetchComments, likeComment } from '../../api/commentService'
import type { CommentData, CommentTargetType } from '../../types/comment'

type CommentsProps = {
  targetType: CommentTargetType
  targetId: string
}

function formatCommentDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export default function Comments({ targetType, targetId }: CommentsProps): JSX.Element {
  const [comments, setComments] = useState<CommentData[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)
  const [commentFormOpen, setCommentFormOpen] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyAuthor, setReplyAuthor] = useState('')
  const [replyContent, setReplyContent] = useState('')
  const [replySubmitting, setReplySubmitting] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadComments = async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const targetComments = await fetchComments(targetType, targetId)
        if (active) setComments(targetComments)
      } catch (err) {
        if (active) {
          setLoadError(err instanceof Error ? err.message : 'Could not load comments')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadComments()
    return () => {
      active = false
    }
  }, [targetId, targetType])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!author.trim() || !content.trim()) return

    setSubmitting(true)
    setCommentError(null)
    try {
      const comment = await createComment(targetType, targetId, {
        author: author.trim(),
        content: content.trim(),
      })
      setComments((current) => [...current, comment])
      setContent('')
      setCommentFormOpen(false)
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Could not post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (commentId: string) => {
    try {
      const likedComment = await likeComment(commentId)
      setComments((current) => current.map((comment) => (
        comment.id === commentId ? likedComment : comment
      )))
    } catch {
      setLoadError('Could not like comment')
    }
  }

  const handleReply = async (event: FormEvent<HTMLFormElement>, parentId: string) => {
    event.preventDefault()
    if (!replyAuthor.trim() || !replyContent.trim()) return

    setReplySubmitting(true)
    setReplyError(null)
    try {
      const reply = await createComment(targetType, targetId, {
        author: replyAuthor.trim(),
        content: replyContent.trim(),
        parentId,
      })
      setComments((current) => [...current, reply])
      setReplyContent('')
      setReplyingTo(null)
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : 'Could not post reply')
    } finally {
      setReplySubmitting(false)
    }
  }

  const topLevelComments = comments.filter((comment) => !comment.parentId)

  const renderComment = (comment: CommentData, depth = 0): JSX.Element => {
    const replies = comments.filter((reply) => reply.parentId === comment.id)

    return (
      <article key={comment.id} className={depth === 0 ? 'p-4 sm:p-5' : 'mt-4 border-l-2 border-border pl-3 sm:pl-4'}>
        <div className="flex gap-3 sm:gap-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-bold text-primary" aria-hidden="true">
            {comment.author.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-semibold text-text">{comment.author}</h3>
              <time dateTime={comment.createdAt} className="text-xs text-muted">{formatCommentDate(comment.createdAt)}</time>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap leading-6 text-muted">{comment.content}</p>
            <div className="mt-3 flex items-center gap-4">
              <button type="button" onClick={() => void handleLike(comment.id)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition hover:text-primary" aria-label={`Like comment by ${comment.author}`}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z" /></svg>
                {comment.likeCount}
              </button>
              <button type="button" onClick={() => { setReplyingTo((current) => current === comment.id ? null : comment.id); setReplyError(null) }} className="text-xs font-semibold text-muted transition hover:text-primary" aria-expanded={replyingTo === comment.id}>
                Reply
              </button>
            </div>

            {replyingTo === comment.id && (
              <form onSubmit={(event) => void handleReply(event, comment.id)} className="mt-4 grid gap-3 border-l-2 border-primary/30 pl-4">
                <input autoFocus value={replyAuthor} onChange={(event) => setReplyAuthor(event.target.value)} required maxLength={80} placeholder="Your name" aria-label="Your name" className="rounded border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                <textarea value={replyContent} onChange={(event) => setReplyContent(event.target.value)} required maxLength={1000} rows={3} placeholder={`Reply to ${comment.author}`} aria-label={`Reply to ${comment.author}`} className="resize-y rounded border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                {replyError && <p className="text-sm text-danger">{replyError}</p>}
                <button type="submit" disabled={replySubmitting} className="justify-self-start rounded bg-primary px-3 py-2 text-xs font-bold text-background disabled:opacity-50">
                  {replySubmitting ? 'Posting...' : 'Post reply'}
                </button>
              </form>
            )}

            {replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        </div>
      </article>
    )
  }

  return (
    <section id="comments" className="scroll-mt-24 border-t border-border py-8" aria-labelledby="comments-heading">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary" aria-hidden="true">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
            </svg>
          </span>
          <h2 id="comments-heading" className="text-2xl font-bold text-text">Comments</h2>
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-border bg-surface-alt px-2 text-xs font-bold tabular-nums text-text" aria-label={`${comments.length} comments`}>
            {comments.length}
          </span>
        </div>
        <button
          type="button"
          className="rounded border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary hover:text-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-expanded={commentFormOpen}
          aria-controls="comment-form"
          onClick={() => setCommentFormOpen((open) => !open)}
        >
          {commentFormOpen ? 'Cancel' : 'Add comment'}
        </button>
      </div>

      {commentFormOpen && (
        <form id="comment-form" onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-lg border border-primary/25 bg-surface/50 p-4 sm:p-5">
          <label className="grid gap-1.5 text-sm font-semibold text-text">
            Name
            <input autoFocus value={author} onChange={(event) => setAuthor(event.target.value)} required maxLength={80} className="rounded border border-border bg-background px-3 py-2 font-normal text-text outline-none focus:border-primary" />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-text">
            Comment
            <textarea value={content} onChange={(event) => setContent(event.target.value)} required maxLength={1000} rows={4} className="resize-y rounded border border-border bg-background px-3 py-2 font-normal text-text outline-none focus:border-primary" />
          </label>
          {commentError && <p className="text-sm text-danger">{commentError}</p>}
          <button type="submit" disabled={submitting} className="justify-self-start rounded bg-primary px-4 py-2 text-sm font-bold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? 'Posting...' : 'Post comment'}
          </button>
        </form>
      )}

      {loading && <p className="mt-6 rounded-lg border border-border bg-surface/30 py-10 text-center text-muted">Loading comments...</p>}
      {loadError && <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 p-4 text-danger">{loadError}</p>}

      {!loading && !loadError && (
        <div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface/25 divide-y divide-border">
          {topLevelComments.map((comment) => renderComment(comment))}
          {topLevelComments.length === 0 && <p className="py-10 text-center text-muted">No comments yet.</p>}
        </div>
      )}
    </section>
  )
}
