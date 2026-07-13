import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppFooter from '../../../components/layout/AppFooter'
import AppHeader from '../../../components/layout/AppHeader'
import Actions from '../../../components/ui/Actions'
import Comments from '../components/Comments'
import ViewerCount from '../../../components/ui/ViewerCount'
import { formatDate, formatRelativeDate } from '../../../shared/utils/date'
import { createCommunityComment, fetchCommunityComments, fetchCommunityEntries, fetchCommunityEntryById, likeCommunityComment } from '../api/communityService'
import type { CommunityCommentData, CommunityEntryData } from '../types/community'

function formatPublishedAt(value: string): string {
  return formatDate(value, { dateStyle: 'long' })
}

export default function CommunityEntryDetailPage(): JSX.Element {
  const { entryId } = useParams<{ entryId: string }>()
  const [entry, setEntry] = useState<CommunityEntryData | null>(null)
  const [comments, setComments] = useState<CommunityCommentData[]>([])
  const [relatedEntries, setRelatedEntries] = useState<CommunityEntryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!entryId) {
      setError('Community entry not found')
      setLoading(false)
      return
    }

    const loadEntry = async () => {
      try {
        const [communityEntry, communityComments, allEntries] = await Promise.all([
          fetchCommunityEntryById(entryId),
          fetchCommunityComments(entryId),
          fetchCommunityEntries(),
        ])
        setEntry(communityEntry)
        setComments(communityComments)
        setRelatedEntries(allEntries.filter((item) => item.id !== entryId).slice(0, 3))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    void loadEntry()
  }, [entryId])

  const createComment = async (input: { content: string; parentId?: string }) => {
    if (!entryId) throw new Error('Community entry not found')
    const created = await createCommunityComment(entryId, { ...input, author: 'Guest' })
    setComments((current) => [...current, created])
  }

  const likeComment = async (commentId: string) => {
    const updated = await likeCommunityComment(commentId)
    setComments((current) => current.map((comment) => comment.id === commentId ? updated : comment))
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-text">
          <span aria-hidden="true">&larr;</span> Back to community entries
        </Link>

        {loading && <p className="mt-6 border-y border-border py-10 text-center text-muted">Loading community entry...</p>}
        {error && <p className="mt-6 border border-danger/30 bg-danger/10 p-5 text-danger">{error}</p>}

        {entry && (
          <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-7">
            <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface/70 shadow-xl">
              <article>
                <header className="border-b border-border bg-background/40 px-5 py-6 sm:px-7 sm:py-7">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-bold text-primary" aria-hidden="true">{entry.author.charAt(0).toUpperCase()}</span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-text">{entry.author}</p>
                      <p className="text-sm text-muted">Published <time dateTime={entry.publishedAt} title={formatPublishedAt(entry.publishedAt)}>{formatRelativeDate(entry.publishedAt)}</time></p>
                    </div>
                  </div>
                  <span className="mt-5 inline-flex rounded bg-primary/10 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-primary">{entry.category}</span>
                  <h1 className="mt-3 text-3xl font-bold leading-tight text-text sm:text-4xl">{entry.title}</h1>
                  <p className="mt-3 text-lg leading-8 text-muted">{entry.excerpt}</p>
                </header>

                <div className="px-5 py-7 sm:px-7 sm:py-8">
                  <div className="space-y-5 text-[17px] leading-8 text-text/90">
                    {entry.content.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                  </div>
                  {entry.newsId && <Link to={`/news/${entry.newsId}`} className="mt-7 inline-flex items-center gap-2 border-b border-primary/50 pb-1 text-sm font-semibold text-primary hover:text-primary-hover">Read related news <span aria-hidden="true">&rarr;</span></Link>}
                </div>
              </article>

              <div className="flex items-center border-t border-border bg-background/30 px-5 py-3 sm:px-7" aria-label="Entry actions">
                <Actions target={{ id: entry.id, title: entry.title, path: `/community/${entry.id}` }} storageKey="community" />
              </div>

              <Comments comments={comments} onCreate={createComment} onLike={likeComment} formatDate={formatRelativeDate} formatDateTitle={formatPublishedAt} />
            </div>

            <aside className="space-y-6 lg:sticky lg:top-6" aria-label="Entry details">
              <section className="pb-5">
                <h2 className="border-b border-border/70 pb-2 text-xs font-semibold uppercase tracking-wider text-primary">About this post</h2>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                  <div><dt className="text-muted">Category</dt><dd className="mt-1 font-semibold text-text">{entry.category}</dd></div>
                  <div><dt className="text-muted">Discussion</dt><dd className="mt-1 font-semibold text-text">{comments.length} comments</dd></div>
                  <div><dt className="text-muted">Views</dt><dd className="mt-1 font-semibold text-text"><ViewerCount count={entry.viewerCount} compact className="text-text" /></dd></div>
                  <div><dt className="text-muted">Published</dt><dd className="mt-1 font-semibold text-text">{formatPublishedAt(entry.publishedAt)}</dd></div>
                </dl>
              </section>

              {relatedEntries.length > 0 && (
                <section>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">More from the community</h2>
                  <ol className="mt-3 divide-y divide-border border-y border-border">
                    {relatedEntries.map((related) => (
                      <li key={related.id} className="py-4">
                        <Link to={`/community/${related.id}`} className="group block">
                          <span className="text-xs text-muted">{related.category}</span>
                          <h3 className="mt-1 font-semibold leading-6 text-text transition group-hover:text-primary">{related.title}</h3>
                          <span className="mt-2 block text-xs text-muted">{related.commentCount} comments</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </aside>
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  )
}
