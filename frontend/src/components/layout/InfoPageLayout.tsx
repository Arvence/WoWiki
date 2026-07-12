import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import AppFooter from './AppFooter'
import AppHeader from './AppHeader'

export type InfoSection = {
  id: string
  title: string
  content: ReactNode
}

type InfoPageLayoutProps = {
  eyebrow: string
  title: string
  summary: string
  updated?: string
  sections: InfoSection[]
  children?: ReactNode
}

export default function InfoPageLayout({ eyebrow, title, summary, updated, sections, children }: InfoPageLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-text"><span aria-hidden="true">&larr;</span> Back to WoWiki</Link>

        <header className="mt-6 border-y border-border py-7 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-text sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">{summary}</p>
          {updated && <p className="mt-4 text-sm text-muted">Last updated: <time>{updated}</time></p>}
        </header>

        {children ?? (
          <div className="grid items-start gap-8 py-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
            <nav className="border-y border-border py-4 lg:sticky lg:top-24" aria-label={`${title} contents`}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">On this page</p>
              <ol className="mt-3 space-y-1">
                {sections.map((section, index) => <li key={section.id}><a href={`#${section.id}`} className="block py-1.5 text-sm text-muted hover:text-text"><span className="mr-2 tabular-nums text-primary">{String(index + 1).padStart(2, '0')}</span>{section.title}</a></li>)}
              </ol>
            </nav>
            <div className="min-w-0 divide-y divide-border">
              {sections.map((section) => <section key={section.id} id={section.id} className="scroll-mt-24 py-7 first:pt-0"><h2 className="text-xl font-bold text-text sm:text-2xl">{section.title}</h2><div className="mt-4 space-y-4 leading-7 text-muted">{section.content}</div></section>)}
            </div>
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  )
}
