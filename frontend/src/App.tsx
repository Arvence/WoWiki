import AppFooter from './components/layout/AppFooter'
import AppHeader from './components/layout/AppHeader'
import Sidebar from './components/layout/Sidebar'
import Community from './components/layout/community/Community'
import Feed from './components/sections/Feed/Feed'

export default function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto grid max-w-[90rem] grid-cols-1 gap-6 px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,2fr)_320px] lg:gap-8 xl:grid-cols-[280px_minmax(0,2fr)_280px]">
        <Community />

        <section className="order-1 lg:col-span-1 xl:order-2">
          <Feed />
        </section>

        <div className="order-2 xl:order-3">
          <Sidebar />
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
