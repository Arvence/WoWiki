import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import AppHeader from '../../../components/layout/AppHeader'
import { formatDate } from '../../../shared/utils/date'
import { useAuth } from '../../auth/AuthContext'
import { fetchEditorNews, publishNewsNow, removeNewsSchedule, retryNewsSchedule, saveNewsContent, saveNewsSchedule } from '../api/newsService'
import type { EditorNews } from '../types/news'

const inputStyle = 'w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-text focus:border-primary focus:outline-none'
const buttonStyle = 'rounded-lg border border-primary/40 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/10 disabled:opacity-50'
const primaryButtonStyle = 'rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:bg-primary-hover disabled:opacity-50'
const statusLabels = { draft: 'Draft', scheduled: 'Scheduled', published: 'Published' }
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

export default function NewsEditorPage(): JSX.Element {
  const { user, loading } = useAuth()
  if (!loading && !user) return <Navigate to="/auth" state={{ from: '/news/editor' }} replace />
  const canEdit = user?.roles.some((role) => role === 'moderator' || role === 'admin')

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="mb-5 text-2xl font-bold text-text">News editor</h1>
        {loading ? <p role="status">Loading your session…</p>
          : canEdit && user ? <NewsEditor key={user.id} />
            : <p role="alert">You need a moderator or administrator account to edit News.</p>}
      </main>
    </div>
  )
}

function NewsEditor(): JSX.Element {
  const [articles, setArticles] = useState<EditorNews[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [contentDirty, setContentDirty] = useState(false)
  const selected = articles.find((article) => article.id === selectedId)

  useEffect(() => {
    const controller = new AbortController()
    void fetchEditorNews(controller.signal)
      .then((items) => { if (!controller.signal.aborted) setArticles(items) })
      .catch(() => { if (!controller.signal.aborted) setError('Could not load News. Reload the page to try again.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [])

  async function save(operation: () => Promise<EditorNews>, message: string, refreshOnError = false) {
    if (busy) return false
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const saved = await operation()
      setArticles((current) => current.some(({ id }) => id === saved.id)
        ? current.map((article) => article.id === saved.id ? saved : article)
        : [...current, saved])
      setSelectedId(saved.id)
      setNotice(saved.status === 'published' && refreshOnError ? 'Article published.' : message)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save News')
      if (refreshOnError) await fetchEditorNews().then(setArticles).catch(() => undefined)
      return false
    } finally {
      setBusy(false)
    }
  }

  async function submitContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const saved = await save(() => saveNewsContent(selected?.id, {
      title: String(data.get('title')).trim(),
      summary: String(data.get('summary')).trim(),
      category: String(data.get('category')).trim(),
      content: String(data.get('content')).trim(),
      imageUrl: String(data.get('imageUrl')).trim() || null,
    }), selected ? 'Changes saved.' : 'Draft saved.')
    if (saved) setContentDirty(false)
  }

  function submitSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected || contentDirty) return
    const data = new FormData(event.currentTarget)
    void save(() => saveNewsSchedule(selected.id, String(data.get('scheduledAtLocal')), data.has('deadline')), 'Publication scheduled.', true)
  }

  const registrationPending = selected?.status === 'draft' && Boolean(selected.scheduledAtUtc)

  return (
    <div className="grid gap-4">
      <label className="grid gap-1 text-sm font-semibold">
        Article
        <select className={inputStyle} value={selectedId} disabled={loading || busy} onChange={(event) => {
          setSelectedId(event.target.value)
          setContentDirty(false)
          setNotice('')
          setError('')
        }}>
          <option value="">New draft</option>
          {articles.map((article) => <option key={article.id} value={article.id}>{article.title} ({statusLabels[article.status]})</option>)}
        </select>
      </label>
      {loading && <p role="status">Loading News…</p>}
      {error && <p role="alert" className="text-danger">{error}</p>}
      {notice && <p role="status" className="text-success">{notice}</p>}
      {!loading && (
        <form key={selected?.id ?? 'new'} onSubmit={(event) => void submitContent(event)} onChange={() => setContentDirty(true)} className="rounded-xl border border-border bg-surface p-4 sm:p-6">
          <fieldset disabled={busy} className="grid gap-4">
            <label className="grid gap-1 text-sm font-semibold">Title<input className={inputStyle} name="title" required maxLength={160} defaultValue={selected?.title} /></label>
            <label className="grid gap-1 text-sm font-semibold">Summary<textarea className={inputStyle} name="summary" required maxLength={1000} rows={2} defaultValue={selected?.summary} /></label>
            <label className="grid gap-1 text-sm font-semibold">Category<input className={inputStyle} name="category" required maxLength={80} defaultValue={selected?.category} /></label>
            <label className="grid gap-1 text-sm font-semibold">Content<textarea className={inputStyle} name="content" required maxLength={50000} rows={8} defaultValue={selected?.content} /></label>
            <label className="grid gap-1 text-sm font-semibold">Image URL (optional)<input className={inputStyle} name="imageUrl" maxLength={2048} defaultValue={selected?.imageUrl} /></label>
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className={primaryButtonStyle}>{selected ? 'Save changes' : 'Save draft'}</button>
              {selected?.status === 'published' && <Link className={buttonStyle} to={`/news/${selected.id}`}>View article</Link>}
            </div>
          </fieldset>
        </form>
      )}
      {selected && selected.status !== 'published' && (
        <form key={`${selected.id}:${selected.scheduledAtUtc ?? ''}:${selected.enforcePublicationDeadline}`} onSubmit={submitSchedule} className="rounded-xl border border-border bg-surface p-4 sm:p-6">
          <h2 className="mb-2 text-lg font-bold">Publication</h2>
          {contentDirty && <p className="mb-4 text-sm text-muted">Save your content changes before scheduling or publishing.</p>}
          {registrationPending && <p className="mb-4 text-sm text-muted">Registration is pending. Retry to confirm the saved schedule.</p>}
          <fieldset disabled={busy} className="grid gap-4">
            <label className="grid gap-1 text-sm font-semibold">
              Publication time · EU (CET/CEST)
              <input className={inputStyle} name="scheduledAtLocal" type="datetime-local" required defaultValue={scheduleInputValue(selected.scheduledAtUtc)} />
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input className="mt-0.5 accent-primary" type="checkbox" name="deadline" defaultChecked={selected.enforcePublicationDeadline} />
              Skip automatic publication if it is more than 30 minutes late
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className={buttonStyle} disabled={contentDirty}>{selected.scheduledAtUtc ? 'Reschedule' : 'Save schedule'}</button>
              {registrationPending && <button type="button" className={buttonStyle} disabled={contentDirty} onClick={() => void save(() => retryNewsSchedule(selected.id), 'Publication scheduled.', true)}>Retry registration</button>}
              {selected.scheduledAtUtc && <button type="button" className={buttonStyle} onClick={() => void save(() => removeNewsSchedule(selected.id), 'Schedule removed.')}>Remove schedule</button>}
              <button type="button" className={primaryButtonStyle} disabled={contentDirty} onClick={() => void save(() => publishNewsNow(selected.id), 'Article published.')}>Publish now</button>
            </div>
          </fieldset>
        </form>
      )}
    </div>
  )
}
