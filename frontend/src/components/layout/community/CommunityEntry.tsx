export type CommunityEntryData = {
  id: number
  author: string
  title: string
  excerpt: string
  category: string
  publishedAt: string
  comments: number
}

type CommunityEntryProps = {
  entry: CommunityEntryData
}

export default function CommunityEntry({ entry }: CommunityEntryProps): JSX.Element {
  const authorInitial = entry.author.charAt(0).toUpperCase()

  return (
    <article className="rounded-lg border border-border bg-surface/80 p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary"
          aria-hidden="true"
        >
          {authorInitial}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-text">{entry.author}</p>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {entry.category}
            </span>
          </div>

          <h3 className="mt-2 text-lg font-semibold text-text">
            <a href="#" className="transition hover:text-primary">{entry.title}</a>
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted">{entry.excerpt}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <time>{entry.publishedAt}</time>
            <span aria-hidden="true">·</span>
            <span>{entry.comments} comments</span>
          </div>
        </div>
      </div>
    </article>
  )
}
