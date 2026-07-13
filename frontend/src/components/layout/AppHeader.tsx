import { useState } from "react"
import DropdownMenu from "../ui/DropdownMenu"

const navButtons = [
  { label: "Database", items: ["Characters", "Items", "Zones"] },
  { label: "Tools", items: ["Talent Calculator", "Item Comparator", "Item Finder"] },
  { label: "Guides", items: ["Class Builds", "Raids", "PvP"] },
]

const profileButton = {
  label: "Profile",
  items: ["View Profile", "Saved Articles", "Settings", "Sign Out", "About", "Support", "Privacy"],
  dividerBefore: 4,
}

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
          <div className="ml-1 flex items-center gap-2 border-l border-border pl-3">
            <DropdownMenu
              label={profileButton.label}
              items={profileButton.items}
              isOpen={openDropdown === profileButton.label}
              onToggle={() => setOpenDropdown((current) => (current === profileButton.label ? null : profileButton.label))}
              onOpen={() => setOpenDropdown(profileButton.label)}
              onClose={() => setOpenDropdown(null)}
              variant="profile"
              align="right"
              dividerBefore={profileButton.dividerBefore}
            />
          </div>
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
            <div className="my-3 border-t border-border" />
              <details className="rounded-md border border-primary/40 bg-background/80">
                <summary className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-text hover:bg-background/90">
                  <span className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-bold text-background" aria-hidden="true">P</span>
                    {profileButton.label}
                  </span>
                  <span className="text-muted">&#9662;</span>
                </summary>
                <div className="space-y-1 border-t border-border px-3 py-2">
                  {profileButton.items.map((item, index) => (
                    <div key={item} className={index === profileButton.dividerBefore ? 'border-t border-border pt-2' : ''}>
                      <a href="#" className="block rounded-md px-2 py-2 text-sm text-text transition hover:bg-background/90">{item}</a>
                    </div>
                  ))}
                </div>
              </details>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
