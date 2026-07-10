import { useState } from "react"
import DropdownMenu from "../ui/DropdownMenu"

const navButtons = [
  { label: "News", items: ["Latest", "World Update", "Patch Notes"] },
  { label: "Database", items: ["Characters", "Items", "Zones"] },
  { label: "Tools", items: ["Map", "Auction House", "Calculator"] },
  { label: "Guides", items: ["Class Builds", "Raids", "PvP"] },
  { label: "Community", items: ["Forums", "Discord", "Events"] },
  { label: "More", items: ["About", "Support", "Privacy"] },
]

export default function AppHeader(): JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex w-full flex-col gap-1 px-0 py-2 sm:grid sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-3 sm:px-0 sm:py-2 lg:px-0">
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
              aria-label="Search WoWiki"
              placeholder="Search WoWiki"
              className="w-full min-w-0 rounded-full border border-border bg-surface py-2 pl-12 pr-4 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="hidden items-center justify-end gap-2 sm:flex">
          {navButtons.map((button) => (
            <DropdownMenu
              key={button.label}
              label={button.label}
              items={button.items}
              isOpen={openDropdown === button.label}
              onToggle={() => setOpenDropdown((current) => (current === button.label ? null : button.label))}
              onOpen={() => setOpenDropdown(button.label)}
              onClose={() => setOpenDropdown(null)}
            />
          ))}
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="sm:hidden border-t border-border bg-background/95 px-4 py-3">
          <nav className="space-y-2">
            {navButtons.map((button) => (
              <details key={button.label} className="rounded-md border border-border bg-background/80">
                <summary className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-text hover:bg-background/90">
                  {button.label}
                  <span className="text-muted">▾</span>
                </summary>
                <div className="space-y-1 border-t border-border px-3 py-2">
                  {button.items.map((item) => (
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
          </nav>
        </div>
      ) : null}
    </header>
  )
}
