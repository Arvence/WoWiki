export default function AppHeader(): JSX.Element {
  return (
    <header className="bg-slate-900/72 backdrop-blur sticky top-0 z-40 border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-3 grid grid-cols-3 items-center gap-4">
        <div className="flex items-center">
          <a href="/" className="text-2xl font-extrabold text-primary hover:opacity-90">WoWiki</a>
        </div>

        <div className="flex justify-center">
          <div className="relative w-full max-w-2xl">
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35" />
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth={2} />
            </svg>
            <input
              aria-label="Search WoW Wiki"
              placeholder="Search WoW Wiki"
              className="pl-12 pr-4 py-2 rounded-full border border-border bg-surface text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-slate-400 text-slate-200"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <a href="/guides" aria-label="Guides" className="p-2 rounded hover:bg-slate-800/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 20h9" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h8" />
            </svg>
          </a>

          <a href="/news" aria-label="News" className="p-2 rounded hover:bg-slate-800/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="14" rx="2" ry="2" strokeWidth={1.5} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h5" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  )
}
