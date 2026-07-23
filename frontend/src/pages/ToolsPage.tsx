import { Link } from 'react-router-dom'
import AppFooter from '../components/layout/AppFooter'
import AppHeader from '../components/layout/AppHeader'
import { tools } from '../features/tools/tools.config'

export default function ToolsPage(): JSX.Element {
  const toolClassName = 'group relative isolate flex h-full min-h-[30rem] w-60 shrink-0 flex-col justify-end overflow-hidden rounded-2xl bg-surface p-6 text-left shadow-[0_14px_38px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:bg-primary/[0.08] hover:shadow-[0_20px_46px_rgba(0,0,0,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex w-full flex-1 items-stretch px-4 py-8 sm:px-6 lg:py-10">
        <section className="mx-auto flex w-full max-w-[120rem] overflow-x-auto py-2" aria-label="WoWiki tools">
          <div className="mx-auto flex w-max min-w-full items-stretch justify-center gap-4 px-2">
            {tools.map((tool) => {
            const content = (
              <>
                {tool.image && (
                  <>
                    <img src={tool.image} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <span className="absolute inset-0 -z-10 bg-gradient-to-t from-background/95 via-background/25 to-transparent" aria-hidden="true" />
                  </>
                )}
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-lg font-black leading-6 text-text">{tool.title}</h2>
                  {tool.status && <span className="shrink-0 rounded-full bg-primary/[0.1] px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-primary">{tool.status}</span>}
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">{tool.description}</p>
              </>
            )

            return tool.href
              ? <Link key={tool.title} to={tool.href} className={toolClassName}>{content}</Link>
              : <button key={tool.title} type="button" className={toolClassName}>{content}</button>
            })}
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  )
}
