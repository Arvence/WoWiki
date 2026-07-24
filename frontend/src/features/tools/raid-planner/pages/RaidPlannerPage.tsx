import { Link } from 'react-router-dom'
import AppFooter from '../../../../components/layout/AppFooter'
import AppHeader from '../../../../components/layout/AppHeader'
import RaidPlannerWorkspace from '../components/RaidPlannerWorkspace'

export default function RaidPlannerPage(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="mx-auto w-full min-w-0 max-w-[120rem] flex-1 overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
        <nav className="mb-4 flex items-center gap-2 text-xs font-semibold text-muted" aria-label="Breadcrumb">
          <Link to="/tools" className="transition hover:text-primary">Tools</Link>
          <span aria-hidden="true">/</span>
          <span className="text-text">Raid Planner</span>
        </nav>
        <RaidPlannerWorkspace />
      </main>
      <AppFooter />
    </div>
  )
}
