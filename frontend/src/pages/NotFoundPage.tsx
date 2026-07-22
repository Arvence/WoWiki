import { Link } from 'react-router-dom'
import AppFooter from '../components/layout/AppFooter'
import AppHeader from '../components/layout/AppHeader'

export default function NotFoundPage(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-16 text-center sm:px-6">
        <section className="w-full rounded-2xl border border-border bg-surface/70 px-6 py-14 shadow-xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-primary">404</p>
          <h1 className="mt-3 text-3xl font-black text-text sm:text-4xl">This path is unexplored</h1>
          <p className="mx-auto mt-3 max-w-lg text-muted">The page may have moved, or the link may no longer be available.</p>
          <Link to="/" className="mt-7 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-background transition hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
            Return to WoWiki
          </Link>
        </section>
      </main>
      <AppFooter />
    </div>
  )
}
