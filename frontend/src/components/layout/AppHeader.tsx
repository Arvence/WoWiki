import { useEffect, useState } from "react"

const dropdownItems = {
  factions: ["Alliance", "Horde", "Neutral"],
  classes: ["Warrior", "Mage", "Rogue"],
  lore: ["History", "Myths", "Legends"],
  tools: ["Map", "Auction House", "Calculator"],
}

export default function AppHeader(): JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
  }, [isDarkMode])

  const toggleDropdown = (key: string) => {
    setOpenDropdown((current) => (current === key ? null : key))
  }

  const toggleTheme = () => {
    setIsDarkMode((current) => !current)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex w-full flex-col gap-2 px-4 py-2 sm:grid sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-5 sm:px-6 sm:py-3 lg:px-8">
        <div className="flex items-center justify-between">
          <a href="/" className="text-2xl font-extrabold text-primary hover:opacity-90">WoWiki</a>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background/80 p-2 text-text hover:bg-background/90 sm:hidden"
            aria-label="Toggle navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="flex w-full min-w-0 justify-center sm:col-start-2 sm:col-end-3">
          <div className="relative w-full min-w-0 max-w-none sm:max-w-[48rem] lg:max-w-[72rem]">
            <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35" />
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth={2} />
            </svg>
            <input
              aria-label="Search WoW Wiki"
              placeholder="Search WoW Wiki"
              className="w-full min-w-0 rounded-full border border-border bg-surface py-2 pl-12 pr-4 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="hidden items-center justify-end gap-2 sm:flex">
          {(["factions", "classes", "lore", "tools"] as const).map((key) => (
            <div
              key={key}
              className="relative"
              onMouseEnter={() => setOpenDropdown(key)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                onClick={() => toggleDropdown(key)}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background/80 px-3 py-2 text-sm font-medium text-text transition hover:border-primary hover:bg-background/90"
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
                <span className="text-muted">▾</span>
              </button>

              <div
                className={`absolute left-0 top-full z-50 min-w-[14rem] overflow-visible transition duration-150 ${openDropdown === key ? "block" : "hidden"}`}
              >
                <div className="pointer-events-none h-2" />
                <div className="overflow-hidden rounded-md border border-border bg-surface shadow-[0_12px_24px_rgba(0,0,0,0.35)]">
                  <div className="space-y-1 p-2">
                    {dropdownItems[key].map((item) => (
                      <a
                        key={item}
                        href="#"
                        className="block rounded-md px-3 py-2 text-sm text-text transition hover:bg-background/90"
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <a
            href="/database"
            className="rounded-md border border-border bg-background/80 px-3 py-2 text-sm font-medium text-text transition hover:border-primary hover:bg-background/90"
          >
            Database
          </a>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background/80 text-text transition hover:bg-background/90"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            aria-pressed={isDarkMode}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414M18.364 18.364l-1.414-1.414M7.05 7.05L5.636 5.636" />
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="sm:hidden border-t border-border bg-background/95 px-4 py-3">
          <nav className="space-y-2">
            {(["factions", "classes", "lore", "tools"] as const).map((key) => (
              <details key={key} className="rounded-md border border-border bg-background/80">
                <summary className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-text hover:bg-background/90">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  <span className="text-muted">▾</span>
                </summary>
                <div className="space-y-1 border-t border-border px-3 py-2">
                  {dropdownItems[key].map((item) => (
                    <a
                      key={item}
                      href="#"
                      className="block rounded-md px-2 py-2 text-sm text-text transition hover:bg-background/90"
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </details>
            ))}

            <a
              href="/database"
              className="block rounded-md border border-border bg-background/80 px-3 py-2 text-sm font-medium text-text transition hover:border-primary hover:bg-background/90"
            >
              Database
            </a>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-border bg-background/80 px-3 py-2 text-sm text-text transition hover:bg-background/90"
              onClick={() => {
                // Placeholder for theme toggle logic
              }}
            >
              Theme Toggle
            </button>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
