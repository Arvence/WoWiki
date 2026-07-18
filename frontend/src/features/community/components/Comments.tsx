import { useRef, useState, type FormEvent } from 'react'
import Actions from '../../../components/ui/Actions'
import Emoji from '../../../components/ui/Emoji'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

export type CommentItem = {
  id: string
  parentId?: string
  author: string
  content: string
  createdAt: string
  likeCount: number
}

type CreateCommentInput = {
  content: string
  parentId?: string
}

type CommentsProps = {
  comments: CommentItem[]
  onCreate: (input: CreateCommentInput) => Promise<void>
  onLike: (commentId: string) => Promise<void>
  formatDate: (value: string) => string
  formatDateTitle?: (value: string) => string
}

type ComposerProps = {
  parentId?: string
  compact?: boolean
  onCancel: () => void
  onCreate: (input: CreateCommentInput) => Promise<void>
}

function CommentComposer({ parentId, compact = false, onCancel, onCreate }: ComposerProps): JSX.Element {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    textarea.setRangeText(emoji, start, end, 'end')
    textarea.focus()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const content = String(new FormData(form).get('content')).trim()
    setSubmitting(true)
    setError(null)
    try {
      await onCreate({ content, parentId })
      form.reset()
      onCancel()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className={`grid gap-2 border-b border-border bg-background/25 px-4 pb-2 ${compact ? 'mt-3' : 'mt-5'}`}>
      <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
        {parentId ? 'Reply' : 'Comment'}
        <textarea ref={textareaRef} name="content" required maxLength={1000} rows={compact ? 2 : 3} placeholder={parentId ? 'Write a reply...' : 'Join the discussion...'} className="resize-y rounded border border-border bg-background px-3 py-2 text-sm font-normal normal-case text-text outline-none focus:border-primary" />
      </label>
      <div className="flex items-center justify-between gap-3">
        <Emoji onSelect={insertEmoji} align="right" />
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCancel} className="h-9 rounded px-3 text-sm font-semibold text-muted hover:bg-surface-alt hover:text-text">Cancel</button>
          <button type="submit" disabled={submitting} className="inline-flex h-9 w-9 items-center justify-center rounded bg-primary text-background hover:bg-primary-hover disabled:opacity-60" aria-label={parentId ? 'Send reply' : 'Send comment'} title={parentId ? 'Send reply' : 'Send comment'}>
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
          </button>
        </div>
      </div>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </form>
  )
}

export default function Comments({ comments, onCreate, onLike, formatDate, formatDateTitle = formatDate }: CommentsProps): JSX.Element {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [composerOpen, setComposerOpen] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [collapsedComments, setCollapsedComments] = useState<Set<string>>(() => new Set())

  const countDescendants = (commentId: string): number => {
    const directReplies = comments.filter((item) => item.parentId === commentId)
    return directReplies.length + directReplies.reduce((total, reply) => total + countDescendants(reply.id), 0)
  }

  const renderComment = (comment: CommentItem, depth = 0): JSX.Element => {
    const collapsed = collapsedComments.has(comment.id)
    const replies = comments.filter((item) => item.parentId === comment.id)
    const replyCount = countDescendants(comment.id)

    return (
      <li key={comment.id} className="border-t border-border first:border-t-0">
        <div className="flex gap-2.5 py-3.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-alt text-xs font-bold text-primary" aria-hidden="true">{comment.author.charAt(0).toUpperCase()}</span>
          <div className="min-w-0 flex-1">
            <div className="flex min-h-7 flex-wrap items-center gap-x-2 gap-y-0.5">
              <p className="text-sm font-semibold text-text">{comment.author}</p>
              <time className="text-xs text-muted" dateTime={comment.createdAt} title={formatDateTitle(comment.createdAt)}>{formatDate(comment.createdAt)}</time>
              {replies.length > 0 && <>
                <button type="button" onClick={() => setCollapsedComments((current) => { const next = new Set(current); next.has(comment.id) ? next.delete(comment.id) : next.add(comment.id); return next })} aria-expanded={!collapsed} className="inline-flex h-8 w-8 items-center justify-center rounded text-muted hover:bg-primary/10 hover:text-primary" aria-label={collapsed ? `Expand ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}` : `Minimize ${comment.author}'s thread`} title={collapsed ? 'Expand replies' : 'Minimize thread'}>
                  <svg className={`h-4 w-4 transition-transform ${collapsed ? '-rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                </button>
                {collapsed && <span className="text-xs font-medium text-primary">{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>}
              </>}
            </div>
            {!collapsed && <>
              <p className="mt-1 whitespace-pre-line text-sm leading-6 text-text/90">{comment.content}</p>
              <div className="mt-2 flex items-center gap-1">
                <Actions target={{ id: comment.id, title: `${comment.author}'s comment`, path: `#comment-${comment.id}` }} storageKey="comment" onLike={async () => onLike(comment.id)} likeCount={comment.likeCount} likeOnce showSave={false} showShare={false} showReport={false} />
                <button type="button" onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="inline-flex h-8 w-8 items-center justify-center rounded text-muted hover:bg-primary/10 hover:text-primary" aria-label={`Reply to ${comment.author}`} title="Reply">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m9 17-5-5 5-5" /><path d="M4 12h10a6 6 0 0 1 6 6v1" /></svg>
                </button>
              </div>
              {replyingTo === comment.id && <CommentComposer parentId={comment.id} compact onCreate={onCreate} onCancel={() => setReplyingTo(null)} />}
            </>}
          </div>
        </div>
        {!collapsed && replies.length > 0 && (
          <ol className={`mb-2 border-l border-border pl-2 sm:pl-3 ${depth < 2 ? 'ml-3 sm:ml-7' : 'ml-0'}`}>
            {replies.map((reply) => renderComment(reply, depth + 1))}
          </ol>
        )}
      </li>
    )
  }

  const commentIds = new Set(comments.map((comment) => comment.id))
  const rootComments = comments.filter((comment) => !comment.parentId || !commentIds.has(comment.parentId))

  return (
    <section onClickCapture={(event) => {
      if (user) return
      const button = (event.target as HTMLElement).closest('button')
      const label = button?.getAttribute('aria-label') ?? ''
      if (label === 'Create comment' || label.startsWith('Reply to') || label.startsWith('Like ')) {
        event.preventDefault()
        event.stopPropagation()
        navigate('/auth', { state: { from: window.location.pathname } })
      }
    }} className="border-t border-border px-5 py-6 sm:px-7 sm:py-7" aria-labelledby="comments-heading">
      <div className="flex min-h-11 items-center justify-between gap-4 border-b border-border pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <h2 id="comments-heading" className="text-xl font-bold text-text">Comments</h2>
          <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-surface-alt px-2 py-1 text-xs font-bold tabular-nums text-primary" aria-label={`${comments.length} comments`}>{comments.length}</span>
        </div>
        <button type="button" onClick={() => setComposerOpen((open) => !open)} aria-expanded={composerOpen} className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${composerOpen ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-primary/10 hover:text-primary'}`} aria-label={composerOpen ? 'Close comment form' : 'Create comment'} title="Create comment">
          <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" /><path d="M12 8v6m-3-3h6" /></svg>
        </button>
      </div>

      {composerOpen && <CommentComposer onCreate={onCreate} onCancel={() => setComposerOpen(false)} />}

      {comments.length === 0 ? <p className="py-8 text-center text-muted">No comments yet. Start the discussion.</p> : (
        <ol>
          {rootComments.map(renderComment)}
        </ol>
      )}

    </section>
  )
}
