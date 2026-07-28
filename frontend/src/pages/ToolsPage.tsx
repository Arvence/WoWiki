import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppFooter from '../components/layout/AppFooter'
import AppHeader from '../components/layout/AppHeader'
import { tools } from '../features/tools/tools.config'

const TOOL_IMAGE_SOURCES = [...new Set(
  tools.flatMap((tool) => tool.image ? [tool.image] : []),
)]

function preloadImage(source: string): Promise<boolean> {
  return new Promise((resolve) => {
    const image = new Image()

    image.onload = () => {
      image.decode()
        .then(() => resolve(true))
        .catch(() => resolve(true))
    }
    image.onerror = () => resolve(false)
    image.src = source
  })
}

export default function ToolsPage(): JSX.Element {
  const [imagesReady, setImagesReady] = useState(TOOL_IMAGE_SOURCES.length === 0)
  const [unavailableImages, setUnavailableImages] = useState<ReadonlySet<string>>(new Set())
  const toolClassName = 'group relative isolate flex min-h-[22rem] min-w-0 flex-col justify-end overflow-hidden rounded-2xl bg-surface p-5 text-left shadow-[0_14px_38px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:bg-primary/[0.08] hover:shadow-[0_20px_46px_rgba(0,0,0,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:min-h-[26rem] sm:p-6 lg:min-h-[30rem]'

  useEffect(() => {
    let active = true

    Promise.all(TOOL_IMAGE_SOURCES.map(async (source) => ({
      source,
      loaded: await preloadImage(source),
    }))).then((results) => {
      if (!active) return

      setUnavailableImages(new Set(
        results.filter((result) => !result.loaded).map((result) => result.source),
      ))
      setImagesReady(true)
    })

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      {!imagesReady ? (
        <main className="flex flex-1 items-center justify-center px-4" aria-busy="true">
          <div className="flex items-center gap-3 text-sm font-semibold text-muted" role="status">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/25 border-t-primary" aria-hidden="true" />
            Loading tools...
          </div>
        </main>
      ) : (
        <main className="w-full min-w-0 flex-1 px-2 py-6 sm:px-6 sm:py-8 lg:py-10">
          <section className="mx-auto w-full min-w-0 max-w-[120rem] py-2" aria-label="WoWiki tools">
            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
              {tools.map((tool) => {
                const showImage = tool.image && !unavailableImages.has(tool.image)
                const content = (
                  <>
                    {showImage && (
                      <>
                        <img
                          src={tool.image}
                          alt=""
                          decoding="sync"
                          fetchPriority="high"
                          className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
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
      )}
      <AppFooter />
    </div>
  )
}
