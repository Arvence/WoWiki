import { useState, type FormEvent } from 'react'
import { createCommunityEntry } from '../api/communityService'

type CreateNewsCommunityEntryProps = {
  newsId: string
  newsTitle: string
  compact?: boolean
}

export default function CreateNewsCommunityEntry({ newsId, newsTitle, compact = false }: CreateNewsCommunityEntryProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSubmitting(true)
    setError(null)
    try {
      await createCommunityEntry({
        newsId,
        author: String(form.get('author')),
        title: String(form.get('title')),
        excerpt: String(form.get('content')).slice(0, 180),
        content: String(form.get('content')),
        category: String(form.get('category')),
        publishedAt: new Date().toISOString(),
      })
      window.dispatchEvent(new Event('wowiki:community-entry-created'))
      setOpen(false)
      setCreated(true)
      window.setTimeout(() => setCreated(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create entry')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="relative">
        <button type="button" onClick={() => setOpen(true)} className={compact ? 'inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary-hover bg-primary text-background shadow-lg shadow-primary/20 transition-[background-color,box-shadow] duration-200 hover:bg-primary-hover hover:shadow-[0_0_0_3px_rgba(199,156,58,0.16),0_0_20px_rgba(199,156,58,0.38)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background' : 'inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-full border border-primary-hover bg-primary text-sm font-bold text-background shadow-lg shadow-primary/20 transition-[background-color,box-shadow] duration-200 hover:bg-primary-hover hover:shadow-[0_0_0_3px_rgba(199,156,58,0.16),0_0_20px_rgba(199,156,58,0.38)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-auto sm:px-4'} aria-label={`Create a community entry about ${newsTitle}`} title="Create community entry">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /><path d="m14 6 3 3" /></svg>
          {!compact && <span className="hidden whitespace-nowrap sm:inline">Create community entry</span>}
        </button>
        {created && <span role="status" className="absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md border border-success/40 bg-surface px-3 py-1.5 text-xs font-semibold text-success shadow-lg">Entry created</span>}
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby={`community-entry-title-${newsId}`} onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
          <form onSubmit={(event) => void handleSubmit(event)} className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Discuss this news</p>
                <h2 id={`community-entry-title-${newsId}`} className="mt-1 text-xl font-bold text-text">Create community entry</h2>
                <p className="mt-1 line-clamp-1 text-sm text-muted">{newsTitle}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-background hover:text-text" aria-label="Close">&times;</button>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-1.5 text-sm font-medium text-text">Author<input name="author" required placeholder="Your name" className="rounded-lg border border-border bg-background px-3 py-2.5 text-text outline-none focus:border-primary" /></label>
              <label className="grid gap-1.5 text-sm font-medium text-text">Title<input name="title" required defaultValue={`Discussion: ${newsTitle}`} className="rounded-lg border border-border bg-background px-3 py-2.5 text-text outline-none focus:border-primary" /></label>
              <label className="grid gap-1.5 text-sm font-medium text-text">Category<select name="category" defaultValue="Discussion" className="rounded-lg border border-border bg-background px-3 py-2.5 text-text outline-none focus:border-primary"><option>Discussion</option><option>Lore</option><option>Guide</option><option>Opinion</option></select></label>
              <label className="grid gap-1.5 text-sm font-medium text-text">Your entry<textarea name="content" required rows={7} placeholder="Share your thoughts..." className="resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-text outline-none focus:border-primary" /></label>
            </div>

            {error && <p className="mt-4 text-sm text-danger" role="alert">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-muted hover:bg-background">Cancel</button>
              <button type="submit" disabled={submitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background transition hover:bg-primary-hover disabled:opacity-60">{submitting ? 'Publishing...' : 'Publish entry'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
