import { Link } from 'react-router-dom'
import type { CommunityEntryData } from '../types/community'
import ViewerCount from '../../../components/ui/ViewerCount'
import Actions from '../../../components/ui/Actions'
import { formatDate } from '../../../shared/utils/date'

export default function CommunityEntry({ entry, variant = 'detail' }: { entry: CommunityEntryData; variant?: 'detail' | 'card' }): JSX.Element {
  const publishedAt = formatDate(entry.publishedAt, { month: 'short', day: 'numeric' })

  if (variant === 'card') return <article className="group relative min-w-0 overflow-hidden rounded-xl border border-border bg-surface transition hover:border-muted/60">
    <Link to={`/community/${entry.id}`} className="absolute inset-0 z-0" aria-label={entry.title}><span className="sr-only">{entry.title}</span></Link>
    {entry.image ? <div className="pointer-events-none relative z-[1] aspect-square w-full bg-background"><img src={entry.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /></div> : <div className="pointer-events-none relative z-[1] flex aspect-square w-full items-center justify-center bg-background text-sm font-semibold uppercase tracking-wider text-muted">{entry.category}</div>}
    <div className="pointer-events-none relative z-[1] px-4 pb-3 pt-4">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold uppercase text-primary">{entry.author.charAt(0)}</span>
        <div className="min-w-0 text-xs"><p className="truncate font-semibold text-text">{entry.category}</p><p className="truncate text-muted">{entry.author} <span aria-hidden="true">·</span> <time dateTime={entry.publishedAt}>{publishedAt}</time></p></div>
      </div>
      <h2 className="mt-3 text-lg font-semibold leading-6 text-text">{entry.title}</h2>
      {entry.hashtags && entry.hashtags.length > 0 && <div className="mt-2 flex flex-wrap gap-x-2 text-xs text-primary">{entry.hashtags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}
    </div>
    <div className="relative z-10 flex items-center gap-1 border-t border-border px-3 py-2 text-xs text-muted">
      <Link to={`/community/${entry.id}#comments-heading`} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-background px-3 hover:text-text" aria-label={`${entry.commentCount} comments`}><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /></svg>{entry.commentCount}</Link>
      <ViewerCount count={entry.viewerCount} compact className="h-8 rounded-full bg-background px-3" />
      <Actions target={{ id: entry.id, title: entry.title, path: `/community/${entry.id}` }} storageKey="community" showLike={false} showReport={false} />
    </div>
  </article>

  return <article className="flex min-w-0 overflow-hidden rounded-lg bg-surface transition hover:bg-surface-alt/60">
    <Link to={`/community/${entry.id}`} className="flex h-28 w-36 shrink-0 items-center justify-center overflow-hidden bg-background sm:h-32 sm:w-44" aria-label={`Open ${entry.title}`}>
      {entry.image ? <img src={entry.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <span className="px-3 text-center text-xs font-semibold uppercase tracking-wider text-muted">{entry.category}</span>}
    </Link>

    <div className="flex min-w-0 flex-1 flex-col px-4 py-3">
      <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted">
        <span className="font-medium text-text">{entry.author}</span><span aria-hidden="true">·</span><time dateTime={entry.publishedAt}>{publishedAt}</time><span aria-hidden="true">·</span><span>{entry.category}</span>
      </div>
      <h2 className="mt-1 line-clamp-2 text-base font-semibold leading-6 text-text sm:text-lg"><Link to={`/community/${entry.id}`} className="hover:text-primary">{entry.title}</Link></h2>
      {entry.hashtags && entry.hashtags.length > 0 && <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-primary">{entry.hashtags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}

      <div className="mt-auto flex min-w-0 items-center gap-1 pt-2 text-xs text-muted">
        <Link to={`/community/${entry.id}#comments-heading`} className="inline-flex h-8 items-center gap-1.5 rounded px-2 hover:bg-background hover:text-text" aria-label={`${entry.commentCount} comments`}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /></svg>{entry.commentCount}
        </Link>
        <ViewerCount count={entry.viewerCount} compact className="h-8 rounded px-2 hover:bg-background" />
        <Actions target={{ id: entry.id, title: entry.title, path: `/community/${entry.id}` }} storageKey="community" showLike={false} showReport={false} />
      </div>
    </div>
  </article>
}
