import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import AppHeader from '../../components/layout/AppHeader'
import AppFooter from '../../components/layout/AppFooter'
import { useAuth } from './AuthContext'

export default function ProfilePage(): JSX.Element {
  const { user, loading, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
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
        </aside>

        <section className="max-w-2xl">
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
        </section>
      </div>
    </main>
    <AppFooter />
  </div>
}
