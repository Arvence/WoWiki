import { Link } from 'react-router-dom'

export default function AppFooter(): JSX.Element {
  return (
    <footer className="mt-6 border-t border-border py-6 sm:mt-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-2">
          <p className="font-semibold text-text">WoWiki</p>
          <p>&copy; {new Date().getFullYear()} WoWiki. A community-driven World of Warcraft encyclopedia with reliable lore, guides, and character insights.</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 sm:gap-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Explore</p>
            <a className="block text-text transition hover:text-primary" href="#">About</a>
            <a className="block text-text transition hover:text-primary" href="#">Categories</a>
            <a className="block text-text transition hover:text-primary" href="#">Popular Pages</a>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Support</p>
            <Link className="block text-text transition hover:text-primary" to="/privacy">Privacy</Link>
            <Link className="block text-text transition hover:text-primary" to="/terms">Terms</Link>
            <Link className="block text-text transition hover:text-primary" to="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
