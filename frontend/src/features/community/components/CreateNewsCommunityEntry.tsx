import { useRef, useState, type FormEvent } from 'react'
import { createCommunityEntry } from '../api/communityService'
import DropdownMenu from '../../../components/ui/DropdownMenu'
import Emoji from '../../../components/ui/Emoji'

type CreateNewsCommunityEntryProps = {
  newsId?: string
  newsTitle?: string
  compact?: boolean
  plus?: boolean
}

export default function CreateNewsCommunityEntry({ newsId, newsTitle, compact = false, plus = false }: CreateNewsCommunityEntryProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState(false)
  const [category, setCategory] = useState('Discussion')
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const dialogId = `community-entry-title-${newsId ?? 'general'}`

  const insertEmoji = (emoji: string) => {
    const textarea = contentRef.current
    if (!textarea) return
    textarea.setRangeText(emoji, textarea.selectionStart, textarea.selectionEnd, 'end')
    textarea.focus()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSubmitting(true)
    setError(null)
    try {
      await createCommunityEntry({
        newsId,
        author: 'Guest',
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
        <button type="button" onClick={() => setOpen(true)} className={plus ? 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary transition hover:border-primary/40 hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary' : compact ? 'inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary-hover bg-primary text-background shadow-lg shadow-primary/20 transition-[background-color,box-shadow] duration-200 hover:bg-primary-hover hover:shadow-[0_0_0_3px_rgba(199,156,58,0.16),0_0_20px_rgba(199,156,58,0.38)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background' : 'inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-full border border-primary-hover bg-primary text-sm font-bold text-background shadow-lg shadow-primary/20 transition-[background-color,box-shadow] duration-200 hover:bg-primary-hover hover:shadow-[0_0_0_3px_rgba(199,156,58,0.16),0_0_20px_rgba(199,156,58,0.38)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-auto sm:px-4'} aria-label={newsTitle ? `Create a community entry about ${newsTitle}` : 'Create community entry'} title="Create community entry">
          {plus ? <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M8 12h8M12 8v8" /><circle cx="12" cy="12" r="9" /></svg> : <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /><path d="m14 6 3 3" /></svg>}
          {!compact && !plus && <span className="hidden whitespace-nowrap sm:inline">Create community entry</span>}
        </button>
        {created && <span role="status" className="absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md border border-success/40 bg-surface px-3 py-1.5 text-xs font-semibold text-success shadow-lg">Entry created</span>}
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby={dialogId} onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
          <form onSubmit={(event) => void handleSubmit(event)} className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{newsTitle ? 'Discuss this news' : 'From the community'}</p>
                <h2 id={dialogId} className="mt-1 text-xl font-bold text-text">Create community entry</h2>
                {newsTitle && <p className="mt-1 line-clamp-1 text-sm text-muted">{newsTitle}</p>}
              </div>
              <button type="button" onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-background hover:text-text" aria-label="Close">&times;</button>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-1.5 text-sm font-medium text-text">Title<input name="title" required defaultValue={newsTitle ? `Discussion: ${newsTitle}` : ''} placeholder="Give your entry a clear title" className="rounded-lg border border-border bg-background px-3 py-2.5 text-text outline-none focus:border-primary" /></label>
              <div className="grid gap-1.5 text-sm font-medium text-text">
                <span>Category</span>
                <input type="hidden" name="category" value={category} />
                <DropdownMenu label={category} items={['Discussion', 'Lore', 'Guide', 'Opinion']} isOpen={categoryMenuOpen} onToggle={() => setCategoryMenuOpen((current) => !current)} onOpen={() => setCategoryMenuOpen(true)} onClose={() => setCategoryMenuOpen(false)} onSelect={(item) => { setCategory(item); setCategoryMenuOpen(false) }} variant="select" />
              </div>
              <label className="grid gap-1.5 text-sm font-medium text-text">Your entry<textarea ref={contentRef} name="content" required rows={7} placeholder="Share your thoughts..." className="max-h-[clamp(8rem,calc(100dvh-24rem),24rem)] resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-text outline-none focus:border-primary" /></label>
            </div>

            {error && <p className="mt-4 text-sm text-danger" role="alert">{error}</p>}
            <div className="mt-4 flex min-h-10 items-center justify-between gap-3 border-t border-border pt-4">
              <Emoji onSelect={insertEmoji} />
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setOpen(false)} className="h-10 rounded-lg px-4 text-sm font-semibold text-muted hover:bg-background hover:text-text">Cancel</button>
                <button type="submit" disabled={submitting} className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-background transition hover:bg-primary-hover disabled:opacity-60" aria-label={submitting ? 'Publishing entry' : 'Publish entry'} title="Publish entry">
                  {submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-background/40 border-t-background" aria-hidden="true" /> : <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
