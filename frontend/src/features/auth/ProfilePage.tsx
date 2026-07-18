import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, Link } from 'react-router-dom'
import AppHeader from '../../components/layout/AppHeader'
import AppFooter from '../../components/layout/AppFooter'
import { useAuth } from './AuthContext'
import { fetchCommunityComments, fetchCommunityEntries } from '../community/api/communityService'
import type { CommunityCommentData, CommunityEntryData } from '../community/types/community'

export default function ProfilePage(): JSX.Element {
  const { user, loading, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [section, setSection] = useState<'profile' | 'community'>('profile')
  const [entries, setEntries] = useState<CommunityEntryData[]>([])
  const [comments, setComments] = useState<Array<CommunityCommentData & { entryId: string; entryTitle: string }>>([])
  const [communityLoading, setCommunityLoading] = useState(false)

  useEffect(() => {
    if (section !== 'community' || !user || entries.length > 0 || comments.length > 0) return
    const loadCommunity = async () => {
      setCommunityLoading(true); setError(null)
      try {
        const allEntries = await fetchCommunityEntries()
        const ownEntries = allEntries.filter((entry) => entry.author.toLowerCase() === user.displayName.toLowerCase())
        const commentGroups = await Promise.all(allEntries.map(async (entry) => ({ entry, comments: await fetchCommunityComments(entry.id) })))
        const ownComments = commentGroups.flatMap(({ entry, comments: items }) => items.filter((comment) => comment.author.toLowerCase() === user.displayName.toLowerCase()).map((comment) => ({ ...comment, entryId: entry.id, entryTitle: entry.title })))
        setEntries(ownEntries); setComments(ownComments)
      } catch (err) { setError(err instanceof Error ? err.message : 'Could not load community activity') } finally { setCommunityLoading(false) }
    }
    void loadCommunity()
  }, [section, user, entries.length, comments.length])

  if (loading) return <div className="min-h-screen bg-background p-10 text-center text-muted">Loading account...</div>
  if (!user) return <Navigate to="/auth" state={{ from: '/profile' }} replace />

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setSaving(true); setError(null); setMessage(null)
    try {
      await updateProfile({ displayName: String(data.get('displayName')), email: String(data.get('email')) })
      setEditing(false); setMessage('Profile updated')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update profile')
    } finally { setSaving(false) }
  }

  return <div className="min-h-screen bg-background">
    <AppHeader />
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 flex items-end justify-between gap-4 border-b border-border pb-6">
        <div><p className="text-sm text-muted">Account</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-text">Profile</h1></div>
        {!editing && <button type="button" onClick={() => { setEditing(true); setMessage(null) }} className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-text hover:border-primary/60">Edit profile</button>}
      </div>

      <div className="grid gap-10 md:grid-cols-[13rem_minmax(0,1fr)]">
        <aside>
          <div className="flex items-center gap-3 md:block">
            <span className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-surface text-2xl font-semibold text-primary md:h-24 md:w-24">{user.displayName.charAt(0).toUpperCase()}</span>
            <div className="min-w-0 md:mt-4"><p className="truncate text-lg font-semibold text-text">{user.displayName}</p><p className="truncate text-sm text-muted">{user.email}</p></div>
          </div>
          <nav className="mt-6 border-t border-border pt-4 text-sm"><button type="button" onClick={() => setSection('profile')} className={`block w-full border-l-2 py-1 pl-3 text-left ${section === 'profile' ? 'border-primary font-semibold text-text' : 'border-transparent text-muted hover:text-text'}`}>Profile</button><button type="button" onClick={() => setSection('community')} className={`mt-2 block w-full border-l-2 py-1 pl-3 text-left ${section === 'community' ? 'border-primary font-semibold text-text' : 'border-transparent text-muted hover:text-text'}`}>Community</button></nav>
        </aside>

        {section === 'profile' ? <section className="max-w-2xl">
          <div className="flex items-center justify-between border-b border-border pb-3"><h2 className="text-lg font-semibold text-text">Personal information</h2></div>
          {editing ? <form onSubmit={(event) => void save(event)} className="mt-6 grid max-w-lg gap-5">
            <label className="grid gap-2 text-sm font-medium text-text">Display name<input name="displayName" defaultValue={user.displayName} required minLength={3} maxLength={24} pattern="[a-zA-Z0-9_-]+" className="h-10 rounded-md border border-border bg-surface px-3 text-text outline-none focus:border-primary" /><span className="text-xs font-normal text-muted">Letters, numbers, underscores, and hyphens.</span></label>
            <label className="grid gap-2 text-sm font-medium text-text">Email address<input name="email" type="email" defaultValue={user.email} required className="h-10 rounded-md border border-border bg-surface px-3 text-text outline-none focus:border-primary" /></label>
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            <div className="flex gap-3 border-t border-border pt-5"><button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-background hover:bg-primary-hover disabled:opacity-60">{saving ? 'Saving...' : 'Save changes'}</button><button type="button" onClick={() => { setEditing(false); setError(null) }} className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text hover:bg-surface">Cancel</button></div>
          </form> : <dl className="mt-2 divide-y divide-border">
            <div className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr]"><dt className="text-sm text-muted">Display name</dt><dd className="text-sm font-medium text-text">{user.displayName}</dd></div>
            <div className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr]"><dt className="text-sm text-muted">Email</dt><dd className="text-sm font-medium text-text">{user.email}</dd></div>
            <div className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr]"><dt className="text-sm text-muted">Member since</dt><dd className="text-sm font-medium text-text">{new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(user.createdAtUtc))}</dd></div>
          </dl>}
          {message && <p role="status" className="mt-5 text-sm text-success">{message}</p>}
        </section> : <CommunityProfile entries={entries} comments={comments} loading={communityLoading} error={error} />}
      </div>
    </main>
    <AppFooter />
  </div>
}

function CommunityProfile({ entries, comments, loading, error }: { entries: CommunityEntryData[]; comments: Array<CommunityCommentData & { entryId: string; entryTitle: string }>; loading: boolean; error: string | null }): JSX.Element {
  const achievements = [
    { name: 'First contribution', description: 'Published a community entry', earned: entries.length >= 1 },
    { name: 'In the discussion', description: 'Posted five comments or replies', earned: comments.length >= 5 },
    { name: 'Regular contributor', description: 'Published five community entries', earned: entries.length >= 5 },
  ]
  const activity = [
    ...entries.map((entry) => ({ id: `entry-${entry.id}`, date: entry.publishedAt, label: 'Published', title: entry.title, path: `/community/${entry.id}` })),
    ...comments.map((comment) => ({ id: `comment-${comment.id}`, date: comment.createdAt, label: 'Commented on', title: comment.entryTitle, path: `/community/${comment.entryId}#comment-${comment.id}` })),
  ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))

  return <section className="max-w-2xl">
    {loading ? <p className="py-8 text-sm text-muted">Loading activity...</p> : <>
      {error && <p className="py-5 text-sm text-danger">{error}</p>}
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3"><div className="rounded-md bg-surface px-4 py-3"><dt className="text-sm text-muted">Entries</dt><dd className="mt-1 text-2xl font-semibold text-text">{entries.length}</dd></div><div className="rounded-md bg-surface px-4 py-3"><dt className="text-sm text-muted">Comments</dt><dd className="mt-1 text-2xl font-semibold text-text">{comments.length}</dd></div><div className="rounded-md bg-surface px-4 py-3"><dt className="text-sm text-muted">Achievements</dt><dd className="mt-1 text-2xl font-semibold text-text">{achievements.filter((item) => item.earned).length}</dd></div></dl>
      <div className="mt-8"><h3 className="text-sm font-semibold text-text">Achievements</h3><ul className="mt-4 space-y-4">{achievements.map((item) => <li key={item.name} className="flex items-center gap-3"><span className={`h-2.5 w-2.5 rounded-full ${item.earned ? 'bg-primary' : 'bg-border'}`} /><div><p className={`text-sm font-medium ${item.earned ? 'text-text' : 'text-muted'}`}>{item.name}</p><p className="text-xs text-muted">{item.description}</p></div><span className="ml-auto text-xs text-muted">{item.earned ? 'Earned' : 'Locked'}</span></li>)}</ul></div>
      <div className="mt-10"><h3 className="text-sm font-semibold text-text">Recent interactions</h3>{activity.length === 0 ? <p className="mt-4 text-sm text-muted">No community activity yet. <Link to="/community" className="text-primary hover:text-primary-hover">Join a discussion</Link>.</p> : <ul className="mt-4 space-y-5">{activity.slice(0, 10).map((item) => <li key={item.id}><Link to={item.path} className="group block"><p className="text-xs text-muted">{item.label} · {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(item.date))}</p><p className="mt-1 text-sm font-medium text-text group-hover:text-primary">{item.title}</p></Link></li>)}</ul>}</div>
    </>}
  </section>
}
