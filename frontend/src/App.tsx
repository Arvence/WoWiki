import AppFooter from './components/layout/AppFooter'
import AppHeader from './components/layout/AppHeader'
import Sidebar from './components/layout/Sidebar'
import Community from './features/community/components/Community'
import Feed from './features/news/components/Feed'

export default function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <Community />

      <main className="mx-auto grid max-w-[104rem] grid-cols-1 gap-6 px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
        <section>
          <Feed />
        </section>

        <div>
          <Sidebar />
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
