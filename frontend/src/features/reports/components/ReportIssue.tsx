import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { createReport, type ReportType } from '../api/reportService'
import { REPORT_DIALOG_EVENT, type ReportDialogRequest } from '../reportDialog'

const reportOptions: Array<{
  value: ReportType
  label: string
  description: string
  icon: JSX.Element
}> = [
  {
    value: 'bug',
    label: 'Something is broken',
    description: 'A feature or page is not working',
    icon: <><path d="M8 2h8l1 4H7l1-4Z" /><path d="M6 9h12v5a6 6 0 0 1-12 0V9Z" /><path d="M3 13h3M18 13h3M5 6l2 2M19 6l-2 2M5 20l2-2M19 20l-2-2M12 9v9" /></>,
  },
  {
    value: 'content',
    label: 'Content correction',
    description: 'Information is missing or inaccurate',
    icon: <><path d="M4 19.5V5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2.5" /><path d="M8 7h6M8 11h6" /></>,
  },
  {
    value: 'broken-link',
    label: 'Broken link',
    description: 'A link or resource cannot be opened',
    icon: <><path d="m10 13 4-4" /><path d="M7.5 16.5 5 19a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0" /><path d="m16.5 7.5 2.5-2.5a3.5 3.5 0 0 1 5 5l-4 4a3.5 3.5 0 0 1-5 0" /></>,
  },
  {
    value: 'other',
    label: 'Other feedback',
    description: 'Anything else the team should review',
    icon: <><path d="M4 5h16v12H8l-4 4V5Z" /><path d="M8 9h8M8 13h5" /></>,
  },
]

export default function ReportIssue(): JSX.Element {
  const dialogTitleId = useId()
  const dialogRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<ReportType>('bug')
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState<ReportDialogRequest['target']>()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdId, setCreatedId] = useState<string | null>(null)
  const [pagePath, setPagePath] = useState('/')

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => titleRef.current?.focus(), 0)
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) {
        setOpen(false)
        openerRef.current?.focus()
      }
      if (event.key !== 'Tab') return

      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ) ?? [])
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!dialogRef.current?.contains(document.activeElement)) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      window.clearTimeout(focusTimer)
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open, submitting])

  const openDialog = useCallback((request: ReportDialogRequest = {}) => {
    openerRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : triggerRef.current
    setError(null)
    setCreatedId(null)
    setType(request.type ?? 'bug')
    setTitle((request.title ?? '').slice(0, 120))
    setTarget(request.target)
    setPagePath(request.pagePath ?? `${window.location.pathname}${window.location.search}${window.location.hash}`)
    setOpen(true)
  }, [])

  useEffect(() => {
    const handleOpenRequest = (event: Event) => {
      openDialog((event as CustomEvent<ReportDialogRequest>).detail)
    }
    window.addEventListener(REPORT_DIALOG_EVENT, handleOpenRequest)
    return () => window.removeEventListener(REPORT_DIALOG_EVENT, handleOpenRequest)
  }, [openDialog])

  const closeDialog = () => {
    if (submitting) return
    setOpen(false)
    window.setTimeout(() => openerRef.current?.focus(), 0)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSubmitting(true)
    setError(null)

    try {
      const report = await createReport({
        type,
        title: String(form.get('title')).trim(),
        description: String(form.get('description')).trim(),
        pagePath,
        targetType: target?.type,
        targetId: target?.id,
        targetTitle: target?.title,
      })
      setCreatedId(report.id)
      event.currentTarget.reset()
      setType('bug')
      setTitle('')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not send your report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => openDialog()}
        aria-haspopup="dialog"
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-primary/45 bg-primary/[0.08] px-3.5 text-xs font-bold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:border-primary/70 hover:bg-primary/15 hover:text-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-sm"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 3 3.5 7v5.5c0 4.7 3.6 7.5 8.5 8.5 4.9-1 8.5-3.8 8.5-8.5V7L12 3Z" />
          <path d="M12 8v5M12 16.5v.01" />
        </svg>
        Report issue
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto bg-black/75 backdrop-blur-sm sm:items-center sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog()
          }}
        >
          <section ref={dialogRef} className="relative max-h-[94dvh] w-full overflow-y-auto rounded-t-3xl border-x border-t border-primary/30 bg-surface shadow-[0_30px_90px_rgba(0,0,0,0.65)] sm:max-w-2xl sm:rounded-3xl sm:border">
            <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" aria-hidden="true" />
            <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 bg-[radial-gradient(circle_at_top_right,rgba(199,156,58,0.12),transparent_68%)]" aria-hidden="true" />

            <header className="relative flex items-start justify-between gap-4 border-b border-border/70 px-5 py-5 sm:px-7 sm:py-6">
              <div className="flex min-w-0 items-start gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/35 bg-primary/10 text-primary shadow-inner shadow-primary/10">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 3 3.5 7v5.5c0 4.7 3.6 7.5 8.5 8.5 4.9-1 8.5-3.8 8.5-8.5V7L12 3Z" />
                    <path d="M12 8v5M12 16.5v.01" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-primary">Help improve WoWiki</p>
                  <h2 id={dialogTitleId} className="mt-1 text-xl font-black text-text sm:text-2xl">Report an issue</h2>
                  <p className="mt-1 text-sm leading-5 text-muted">Tell us what needs attention. The current page is included automatically.</p>
                </div>
              </div>
              <button type="button" onClick={closeDialog} disabled={submitting} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-muted transition hover:bg-background hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50" aria-label="Close report dialog">&times;</button>
            </header>

            {createdId ? (
              <div className="px-5 py-10 text-center sm:px-7 sm:py-12" role="status">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-success/40 bg-success/10 text-success">
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
                </span>
                <h3 className="mt-5 text-xl font-black text-text">Report received</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">Thank you. Your report is saved and ready for the WoWiki team to review.</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-primary">Reference WOW-{createdId}</p>
                <button type="button" onClick={closeDialog} className="mt-7 rounded-xl bg-primary px-6 py-2.5 text-sm font-black text-background shadow-lg shadow-primary/15 transition hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface">Done</button>
              </div>
            ) : (
              <form onSubmit={(event) => void submit(event)}>
                <div className="grid gap-5 px-5 py-5 sm:px-7 sm:py-6">
                  <fieldset>
                    <legend className="text-xs font-black uppercase tracking-[0.14em] text-text">What should we review?</legend>
                    <div className="mt-3 grid grid-cols-2 gap-2.5">
                      {reportOptions.map((option) => {
                        const selected = type === option.value
                        return (
                          <button
                            key={option.value}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => setType(option.value)}
                            className={`group flex min-h-24 items-start gap-3 rounded-xl border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selected ? 'border-primary/70 bg-primary/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'border-border bg-background/45 hover:border-primary/35 hover:bg-background/70'}`}
                          >
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${selected ? 'bg-primary text-background' : 'bg-surface-alt text-muted group-hover:text-primary'}`}>
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{option.icon}</svg>
                            </span>
                            <span className="min-w-0">
                              <span className={`block text-sm font-bold ${selected ? 'text-primary' : 'text-text'}`}>{option.label}</span>
                              <span className="mt-1 block text-xs leading-4 text-muted">{option.description}</span>
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </fieldset>

                  <label className="grid gap-1.5 text-sm font-bold text-text">
                    Short title
                    <input ref={titleRef} name="title" value={title} onChange={(event) => setTitle(event.target.value)} required minLength={5} maxLength={120} placeholder="Example: Talent build does not save" className="h-11 rounded-xl border border-border bg-background/70 px-3.5 font-normal text-text outline-none placeholder:text-muted/60 transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
                  </label>

                  <label className="grid gap-1.5 text-sm font-bold text-text">
                    What happened?
                    <textarea name="description" required minLength={20} maxLength={2000} rows={5} placeholder="Describe what you saw, what you expected, and how we can reproduce it..." className="max-h-56 resize-y rounded-xl border border-border bg-background/70 px-3.5 py-3 font-normal leading-6 text-text outline-none placeholder:text-muted/60 transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
                    <span className="text-xs font-normal text-muted">Please do not include passwords or other private information.</span>
                  </label>

                  <div className="flex items-start gap-2 rounded-xl border border-border/70 bg-background/40 px-3.5 py-3 text-xs text-muted">
                    <svg className="h-4 w-4 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" /></svg>
                    <span className="min-w-0">
                      {target && <span className="block truncate"><span className="font-bold capitalize text-text/80">{target.type}:</span> {target.title}</span>}
                      <span className="block truncate"><span className="font-bold text-text/80">Attached page:</span> {pagePath}</span>
                    </span>
                  </div>

                  {error && <p className="rounded-xl border border-danger/35 bg-danger/10 px-3.5 py-3 text-sm text-danger" role="alert">{error}</p>}
                </div>

                <footer className="flex items-center justify-end gap-2 border-t border-border/70 bg-background/25 px-5 py-4 sm:px-7">
                  <button type="button" onClick={closeDialog} disabled={submitting} className="h-10 rounded-xl px-4 text-sm font-bold text-muted transition hover:bg-background hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50">Cancel</button>
                  <button type="submit" disabled={submitting} className="inline-flex h-10 min-w-32 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-background shadow-lg shadow-primary/15 transition hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-wait disabled:opacity-60">
                    {submitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-background/35 border-t-background" aria-hidden="true" />Sending...</> : <>Send report<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg></>}
                  </button>
                </footer>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  )
}
