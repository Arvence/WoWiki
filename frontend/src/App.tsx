import AppFooter from './components/layout/AppFooter'
import AppHeader from './components/layout/AppHeader'
import Sidebar from './components/layout/Sidebar'
import Community from './features/community/components/Community'
import FeaturedContent from './features/community/components/FeaturedContent'
import Feed from './features/news/components/Feed'
import { useNews } from './features/news/hooks/useNews'
import ClassicUpdates from './features/updates/components/ClassicUpdates'
import { useMediaQuery } from './shared/hooks/useMediaQuery'

export default function App(): JSX.Element {
  const desktopLayout = useMediaQuery('(min-width: 1024px)')
  const { news, loading, error } = useNews()

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <Community />
      <FeaturedContent />

      <div className="xl:-mx-8">
        <main className="mx-auto grid max-w-[104rem] grid-cols-1 gap-6 px-0 py-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-4 lg:px-2 xl:max-w-[108rem] xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0 lg:col-span-2">
            <ClassicUpdates news={news} loading={loading} error={error} />
          </div>
          <section className="min-w-0">
            <Feed news={news} loading={loading} error={error} beforeNews={!desktopLayout ? <div className="mb-6"><Sidebar /></div> : undefined} />
          </section>

          {desktopLayout && <div><Sidebar /></div>}
        </main>
      </div>

      <AppFooter />
    </div>
  )
}
