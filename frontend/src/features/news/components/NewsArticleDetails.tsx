import type { ReactNode } from 'react'
import { formatDate } from '../../../shared/utils/date'
import type { EditorNews } from '../types/news'
import { NewsStatusLabel } from './NewsArticleList'

const dateOptions = { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin' } as const

export default function NewsArticleDetails({ article }: { article: EditorNews }): JSX.Element {
  return (
    <aside aria-label="Article details" className="min-w-0 self-start border-l-2 border-primary/75 bg-background/55 px-4 py-3 xl:col-start-1 xl:row-start-1">
        <dl className="grid gap-2.5">
          <Detail label="Status"><NewsStatusLabel status={article.status} /></Detail>
          <Detail label="Article ID"><code className="select-all text-xs">{article.id}</code></Detail>
          <Detail label="Author">{article.author}</Detail>
          <Detail label="Last updated (EU)">
            <time dateTime={article.updatedAt}>{formatDate(article.updatedAt, dateOptions)}</time>
          </Detail>
          {article.scheduledAtUtc ? <>
            <Detail label="Scheduled for (EU)">
              <time dateTime={article.scheduledAtUtc}>{formatDate(article.scheduledAtUtc, dateOptions)}</time>
            </Detail>
            {article.status === 'draft' && <Detail label="Registration">Pending</Detail>}
            <Detail label="Deadline enforcement">{article.enforcePublicationDeadline ? 'On' : 'Off'}</Detail>
          </> : <Detail label="Schedule">No saved schedule.</Detail>}
          {article.scheduleId && <Detail label="Schedule ID"><code className="select-all text-xs">{article.scheduleId}</code></Detail>}
          {article.taskForgeJobId && <Detail label="Job ID"><code className="select-all text-xs">{article.taskForgeJobId}</code></Detail>}
          {article.viewerCount !== undefined && <Detail label="Views">{article.viewerCount.toLocaleString('en')}</Detail>}
          {article.likeCount !== undefined && <Detail label="Likes">{article.likeCount.toLocaleString('en')}</Detail>}
        </dl>
      {article.status !== 'published' && <a href="#publication-heading"
        className="mt-3 inline-block text-xs font-semibold text-primary hover:text-primary-hover">Edit schedule</a>}
    </aside>
  )
}

function Detail({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,7rem)_minmax(0,1fr)] items-start gap-2">
      <dt className="pt-0.5 text-xs font-semibold text-muted">{label}</dt>
      <dd className="min-w-0 text-sm text-text [overflow-wrap:anywhere]">{children}</dd>
    </div>
  )
}
