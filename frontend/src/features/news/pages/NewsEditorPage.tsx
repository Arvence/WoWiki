import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useBlocker } from 'react-router-dom'
import AppHeader from '../../../components/layout/AppHeader'
import CalendarPicker from '../../../components/ui/CalendarPicker'
import { HttpError } from '../../../shared/api/http'
import { formatDate } from '../../../shared/utils/date'
import { useAuth } from '../../auth/AuthContext'
import { deleteNewsArticle, fetchEditorArticle, fetchSchedulingAvailability, publishNewsNow, removeNewsSchedule, retryNewsSchedule, saveNewsContent, saveNewsSchedule, type SchedulingAvailability } from '../api/newsService'
import type { EditorNews, NewsContent } from '../types/news'
import NewsArticleDetails from '../components/NewsArticleDetails'
import NewsArticleList from '../components/NewsArticleList'

const inputStyle = 'w-full min-w-0 rounded-md border border-border bg-background/75 px-3 py-2.5 text-sm text-text outline-none placeholder:text-muted/65 hover:border-primary/35 focus:border-primary/70 focus:ring-2 focus:ring-primary/15'
const buttonStyle = 'inline-flex min-h-9 items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-semibold text-primary hover:border-primary/55 hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50'
const primaryButtonStyle = 'inline-flex min-h-9 items-center justify-center rounded-md bg-primary px-3.5 py-2 text-sm font-bold text-background hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50'
const discardMessage = 'Discard unsaved changes?'
const pastPublicationMessage = 'Choose a future publication date and time in EU (CET/CEST).'
const newsCategories = ['News', 'Lore', 'Patch Notes', 'Exploration', 'Guides', 'Events']
const availabilityMessages = {
  available: 'Scheduling system is online.',
  unavailable: 'Scheduling system is unavailable.',
  'not-configured': 'Scheduling system is not configured.',
  checking: 'Checking scheduling system...',
}

type ArticleFields = Omit<NewsContent, 'imageUrl'> & { imageUrl: string }

function contentFields(article: EditorNews | null): ArticleFields {
  const { title = '', summary = '', category = '', content = '', imageUrl = '' } = article ?? {}
  return { title, summary, category, content, imageUrl }
}

function scheduleInputValue(utc: string | undefined): string {
  if (!utc) return ''
  return formatDate(utc, {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }, 'sv-SE').replace(/\s+/, 'T')
}

function publicationFields(article: EditorNews | null) {
  const utc = article?.scheduledAtUtc ?? (article?.status === 'draft' ? new Date(Date.now() + 60 * 60 * 1000).toISOString() : undefined)
  const [date = '', time = ''] = scheduleInputValue(utc).split('T')
  return { date, time, deadline: article?.enforcePublicationDeadline ?? false }
}

export default function NewsEditorPage(): JSX.Element {
  const { user, loading } = useAuth()
  if (!loading && !user) return <Navigate to="/auth" state={{ from: '/news/editor' }} replace />
  const canEdit = user?.roles.some((role) => role === 'moderator' || role === 'admin')
  if (canEdit && user) return <NewsEditor key={user.id} />

  return (
    <NewsEditorLayout>
      {loading ? <p role="status" className="text-muted">Loading your session…</p>
        : <p role="alert" className="text-danger">You need a moderator or administrator account to edit News.</p>}
    </NewsEditorLayout>
  )
}

function NewsEditorLayout({ children, confirmSignOut }: { children: ReactNode; confirmSignOut?: () => boolean }): JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader confirmSignOut={confirmSignOut} />
      <main className="mx-auto max-w-[90rem] px-3 py-6 sm:px-5 sm:py-8 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-text">News Editor</h1>
          {confirmSignOut && <a href="#articles" className="text-sm font-semibold text-primary hover:text-primary-hover lg:hidden">Articles</a>}
        </div>
        {children}
      </main>
    </div>
  )
}

function NewsEditor(): JSX.Element {
  const [selected, setSelected] = useState<EditorNews | null>(null)
  const [content, setContent] = useState(() => contentFields(null))
  const [publicationEdits, setPublicationEdits] = useState<ReturnType<typeof publicationFields> | null>(null)
  const [availability, setAvailability] = useState<SchedulingAvailability | 'checking'>('checking')
  const [availabilityAttempt, setAvailabilityAttempt] = useState(0)
  const [revision, setRevision] = useState(0)
  const [opening, setOpening] = useState(false)
  const [pending, setPending] = useState<'save' | 'delete' | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const confirmedSignOut = useRef(false)
  const savedContent = contentFields(selected)
  const savedPublication = useMemo(() => publicationFields(selected), [selected])
  const publication = publicationEdits ?? savedPublication
  const [todayInEurope, currentTimeInEurope] = scheduleInputValue(new Date().toISOString()).split('T')
  const legacyCategory = selected?.category && !newsCategories.includes(selected.category) ? selected.category : undefined
  const contentDirty = (Object.keys(content) as (keyof ArticleFields)[]).some((field) => content[field] !== savedContent[field])
  const canSchedule = selected !== null && selected.status !== 'published'
  const scheduleDirty = canSchedule && (
    publication.date !== savedPublication.date || publication.time !== savedPublication.time || publication.deadline !== savedPublication.deadline
  )
  const dirty = contentDirty || scheduleDirty
  const busy = pending !== null
  const locked = opening || busy
  const schedulingEnabled = availability === 'available'
  const registrationPending = selected?.status === 'draft' && Boolean(selected.scheduledAtUtc)
  const blocker = useBlocker(() => (dirty || busy) && !confirmedSignOut.current)

  useEffect(() => {
    const controller = new AbortController()
    void fetchSchedulingAvailability(controller.signal)
      .then((status) => { if (!controller.signal.aborted) setAvailability(status) })
      .catch(() => { if (!controller.signal.aborted) setAvailability('unavailable') })
    return () => controller.abort()
  }, [availabilityAttempt])

  function confirmSignOut() {
    if ((dirty || busy) && !window.confirm(discardMessage)) return false
    confirmedSignOut.current = true
    return true
  }

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    if (window.confirm(discardMessage)) blocker.proceed()
    else blocker.reset()
  }, [blocker])

  useEffect(() => {
    if (!dirty && !busy) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty, busy])

  async function openArticle(id?: string) {
    if (locked || (dirty && !window.confirm(discardMessage))) return
    setOpening(true)
    setError('')
    setNotice('')
    try {
      const article = id ? await fetchEditorArticle(id) : null
      setSelected(article)
      setContent(contentFields(article))
      setPublicationEdits(null)
      if (id && window.matchMedia?.('(max-width: 1023px)').matches) {
        const heading = document.getElementById('article-heading')
        heading?.focus({ preventScroll: true })
        heading?.scrollIntoView({ block: 'start' })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open the article.')
    } finally {
      setOpening(false)
    }
  }

  async function save(operation: () => Promise<EditorNews>, message: string, action?: 'schedule' | 'publish') {
    if (locked) return
    const publicationAction = action !== undefined
    setPending('save')
    setError('')
    setNotice('')
    try {
      const saved = await operation()
      setSelected(saved)
      setContent(contentFields(saved))
      if (publicationAction || !scheduleDirty) setPublicationEdits(null)
      setRevision((current) => current + 1)
      setNotice(publicationAction && saved.status === 'published' ? 'Article published.' : message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save News.')
      if (action === 'schedule' && err instanceof HttpError && (err.status === 0 || err.status >= 500)) {
        setAvailability('unavailable')
      }
      if (publicationAction && selected) {
        await fetchEditorArticle(selected.id).then(setSelected).catch(() => undefined)
        setRevision((current) => current + 1)
      }
    } finally {
      setPending(null)
    }
  }

  async function deleteSelected() {
    if (!selected || locked || !window.confirm(`Permanently delete “${selected.title}”?`)) return
    setPending('delete')
    setError('')
    setNotice('')
    try {
      await deleteNewsArticle(selected.id)
      setSelected(null)
      setContent(contentFields(null))
      setPublicationEdits(null)
      setRevision((current) => current + 1)
      setNotice('Article deleted.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the article.')
    } finally {
      setPending(null)
    }
  }

  function submitContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const { title, summary, category, content: body, imageUrl } = content
    if (![title, summary, category, body].every((value) => value.trim())) {
      setError('Enter a title, summary, category, and article content before saving.')
      return
    }
    void save(() => saveNewsContent(selected?.id, {
      title: title.trim(), summary: summary.trim(), category, content: body.trim(), imageUrl: imageUrl.trim() || null,
    }), selected ? 'Changes saved.' : 'Draft saved.')
  }

  function submitSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected || contentDirty || !schedulingEnabled) return
    const localTime = publication.date && publication.time ? `${publication.date}T${publication.time}` : ''
    if (!localTime || localTime <= scheduleInputValue(new Date().toISOString())) {
      setError(pastPublicationMessage)
      return
    }
    void save(() => saveNewsSchedule(selected.id, localTime, publication.deadline), 'Publication scheduled.', 'schedule')
  }

  const schedulingStatus = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      <p role="status" className={schedulingEnabled ? 'text-success' : 'text-muted'}>{availabilityMessages[availability]}</p>
      {selected?.status !== 'scheduled' && availability !== 'checking' && !schedulingEnabled && (
        <button type="button" className="rounded-sm font-semibold text-primary hover:text-primary-hover focus-visible:outline focus-visible:outline-primary" onClick={() => {
          setAvailability('checking')
          setAvailabilityAttempt((attempt) => attempt + 1)
        }}>Retry</button>
      )}
    </div>
  )

  return (
    <NewsEditorLayout confirmSignOut={confirmSignOut}>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,23rem)]">
        <div className={`grid min-w-0 ${selected ? 'xl:grid-cols-[16rem_minmax(0,1fr)]' : ''}`}>
          <section className={`min-w-0 rounded-md border border-border/70 bg-surface ${selected ? 'xl:col-start-2 xl:row-start-1' : ''}`} aria-labelledby="article-heading" aria-busy={locked}>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-md border-b border-border/55 bg-surface-alt/45 px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <h2 id="article-heading" tabIndex={-1} className="scroll-mt-32 break-words text-xl font-semibold text-text outline-none">{selected?.title ?? 'New Article'}</h2>
                {(dirty || opening) && <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                  {dirty && <span className="text-primary">Unsaved changes</span>}
                  {opening && <span role="status">Opening article…</span>}
                </div>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {canSchedule && <a href="#publication-heading" className="px-2 py-1 text-sm font-semibold text-primary hover:text-primary-hover">Publication</a>}
                <button type="button" className={buttonStyle} onClick={() => void openArticle()} disabled={locked || (!selected && !dirty)}>
                  <span aria-hidden="true" className="mr-1.5 text-base leading-none">+</span>New Article
                </button>
              </div>
            </div>

            {(error || notice) && (
              <div className="px-4 pt-4 sm:px-6">
                {error && <p role="alert" className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
                {notice && <p role="status" className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">{notice}</p>}
              </div>
            )}

            <form onSubmit={submitContent} className="px-4 py-5 sm:px-6">
              <fieldset disabled={locked} className="grid min-w-0 gap-4">
                <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                  <label className="grid gap-1.5 text-sm font-semibold">Title
                    <input className={inputStyle} name="title" required maxLength={160} placeholder="Article title"
                      value={content.title} onChange={(event) => setContent({ ...content, title: event.target.value })} />
                  </label>
                  <div className="grid gap-1.5 text-sm font-semibold">
                    <label htmlFor="news-category">Category</label>
                    <span className="relative">
                      <select id="news-category" className={`${inputStyle} appearance-none pr-9 [color-scheme:dark]`} name="category" required
                        value={content.category} onChange={(event) => setContent({ ...content, category: event.target.value })}>
                        <option value="" disabled>Choose a category</option>
                        {newsCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                        {legacyCategory && <option value={legacyCategory}>{legacyCategory} (existing)</option>}
                      </select>
                      <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" /></svg>
                    </span>
                  </div>
                </div>
                <label className="grid gap-1.5 text-sm font-semibold">Summary
                  <textarea className={inputStyle} name="summary" required maxLength={1000} rows={2} placeholder="A short description for the News listing"
                    value={content.summary} onChange={(event) => setContent({ ...content, summary: event.target.value })} />
                </label>
                <label className="grid gap-1.5 text-sm font-semibold">Content
                  <textarea className={`${inputStyle} resize-y leading-relaxed [scrollbar-color:rgb(var(--color-primary)/0.55)_rgb(var(--color-background))] [scrollbar-width:thin]`} name="content" required maxLength={50000} rows={9} placeholder="Write the article…"
                    value={content.content} onChange={(event) => setContent({ ...content, content: event.target.value })} />
                </label>
                <label className="grid gap-1.5 text-sm font-semibold">
                  <span>Image URL <span className="font-normal text-muted">(optional)</span></span>
                  <input className={inputStyle} name="imageUrl" maxLength={2048} placeholder="https://… or /images/…"
                    value={content.imageUrl} onChange={(event) => setContent({ ...content, imageUrl: event.target.value })} />
                </label>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button type="submit" className={primaryButtonStyle} disabled={Boolean(selected) && !contentDirty}>
                    {pending === 'save' ? 'Saving…' : selected ? 'Save changes' : 'Save draft'}
                  </button>
                  {selected?.status === 'published' && <Link className={buttonStyle} to={`/news/${selected.id}`}>View article</Link>}
                  {selected && <button type="button" onClick={() => void deleteSelected()}
                    className="ml-auto rounded-md px-3 py-2 text-sm font-semibold text-danger hover:bg-danger/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-danger disabled:opacity-50">
                    {pending === 'delete' ? 'Deleting…' : 'Delete'}
                  </button>}
                </div>
              </fieldset>
            </form>

            {!selected && <div className="px-4 pb-4 sm:px-6">{schedulingStatus}</div>}
            {canSchedule && selected && <section aria-labelledby="publication-heading" className="border-t border-border/55 bg-surface-alt/35 px-4 py-5 sm:px-6 xl:rounded-br-md">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 id="publication-heading" tabIndex={-1} className="scroll-mt-32 font-semibold text-text">Publication</h3>
                <span className="text-xs text-muted">EU (CET/CEST)</span>
              </div>
              <div className="mb-3">{schedulingStatus}</div>
              <form onSubmit={submitSchedule}>
                <fieldset disabled={locked} className="grid min-w-0 gap-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-1.5 text-sm font-semibold">
                      <span>Publication date</span>
                      <CalendarPicker ariaLabel="Publication date" value={publication.date} min={todayInEurope} todayValue={todayInEurope} disabled={locked || !schedulingEnabled}
                        onChange={(date) => setPublicationEdits({ ...publication, date })}
                        className="[&>button]:rounded-md [&>button]:bg-background/75 [&>div]:rounded-lg" />
                    </div>
                    <label className="grid gap-1.5 text-sm font-semibold">Publication time
                      <input className={`${inputStyle} h-11 [color-scheme:dark] disabled:cursor-not-allowed disabled:opacity-50`} name="publicationTime" type="time" required disabled={!schedulingEnabled}
                        min={publication.date === todayInEurope ? currentTimeInEurope : undefined}
                        onInvalid={(event) => {
                          if (event.currentTarget.validity.rangeUnderflow) setError(pastPublicationMessage)
                        }}
                        value={publication.time} onChange={(event) => setPublicationEdits({ ...publication, time: event.target.value })} />
                    </label>
                  </div>
                  <label className="flex items-start gap-2.5 text-sm">
                    <input className="mt-1 h-4 w-4 shrink-0 accent-primary disabled:opacity-50" type="checkbox" name="deadline" disabled={!schedulingEnabled}
                      checked={publication.deadline} onChange={(event) => setPublicationEdits({ ...publication, deadline: event.target.checked })} />
                    <span><span className="block font-semibold text-text">Enforce publication deadline</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted">Skip automatic publication if it is more than 30 minutes late.</span>
                    </span>
                  </label>
                  {contentDirty && <p className="text-sm text-muted">Save your article changes before changing publication.</p>}
                  <div className="flex flex-wrap gap-2">
                    <button type="submit" className={buttonStyle} disabled={contentDirty || !schedulingEnabled}>{selected.scheduledAtUtc ? 'Reschedule' : 'Save schedule'}</button>
                    {registrationPending && <button type="button" className={buttonStyle} disabled={contentDirty || scheduleDirty || !schedulingEnabled}
                      onClick={() => void save(() => retryNewsSchedule(selected.id), 'Publication scheduled.', 'schedule')}>Retry registration</button>}
                    {selected.scheduledAtUtc && <button type="button" className={buttonStyle} disabled={contentDirty || !schedulingEnabled}
                      onClick={() => {
                        if (!scheduleDirty || window.confirm(discardMessage)) void save(() => removeNewsSchedule(selected.id), 'Schedule removed.', 'schedule')
                      }}>Remove schedule</button>}
                    <button type="button" className={primaryButtonStyle} disabled={contentDirty}
                      onClick={() => {
                        if (!scheduleDirty || window.confirm('Publish now and discard the unsaved schedule?')) {
                        void save(() => publishNewsNow(selected.id), 'Article published.', 'publish')
                        }
                      }}>Publish Now</button>
                  </div>
                </fieldset>
              </form>
            </section>}
          </section>
          {selected && <NewsArticleDetails article={selected} />}
        </div>

        <NewsArticleList selectedId={selected?.id} revision={revision} disabled={locked} onSelect={(id) => void openArticle(id)} />
      </div>
    </NewsEditorLayout>
  )
}
