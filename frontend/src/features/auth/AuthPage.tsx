import { useState, type FormEvent } from 'react'
import { Navigate, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function AuthPage(): JSX.Element {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destination = (location.state as { from?: string } | null)?.from || '/'
  if (auth.loading) return <main className="flex min-h-screen items-center justify-center bg-background text-muted">Checking your session…</main>
  if (!auth.loading && auth.user) return <Navigate to={destination} replace />
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); setSubmitting(true); setError(null)
    try {
      const credentials = { email: String(data.get('email')).trim(), password: String(data.get('password')) }
      if (mode === 'register' && credentials.password !== String(data.get('confirmPassword'))) throw new Error('Passwords do not match')
      if (mode === 'register') await auth.register({ ...credentials, displayName: String(data.get('displayName')) }); else await auth.login(credentials)
      navigate(destination, { replace: true })
    } catch (err) { setError(err instanceof Error ? err.message : 'Authentication failed') } finally { setSubmitting(false) }
  }
  return <main className="flex min-h-screen items-center justify-center bg-background p-4"><section className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl sm:p-8">
    <Link to="/" className="text-xl font-extrabold text-text"><span className="text-primary">Wo</span>Wiki</Link>
    <h1 className="mt-7 text-2xl font-bold text-text">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1><p className="mt-1 text-sm text-muted">Sign in to post and join discussions.</p>
    <form onSubmit={(event) => void submit(event)} className="mt-6 grid gap-4">
      {mode === 'register' && <label className="grid gap-1.5 text-sm font-medium text-text">Display name<input name="displayName" required minLength={3} maxLength={24} pattern="[a-zA-Z0-9_-]+" className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary" /></label>}
      <label className="grid gap-1.5 text-sm font-medium text-text">Email<input name="email" type="email" autoComplete="email" required className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary" /></label>
      <label className="grid gap-1.5 text-sm font-medium text-text">Password<input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'register' ? 10 : 1} className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary" />{mode === 'register' && <span className="text-xs font-normal text-muted">At least 10 characters with an uppercase letter, lowercase letter, and number.</span>}</label>
      {mode === 'register' && <label className="grid gap-1.5 text-sm font-medium text-text">Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" required minLength={10} className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary" /></label>}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}<button disabled={submitting} className="mt-1 rounded-lg bg-primary px-4 py-2.5 font-bold text-background hover:bg-primary-hover disabled:opacity-60">{submitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
    </form><button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }} className="mt-5 text-sm font-semibold text-primary hover:text-primary-hover">{mode === 'login' ? 'Need an account? Register' : 'Already registered? Sign in'}</button>
  </section></main>
}
