import { useState } from "react"
import { Link } from "react-router-dom"
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
    <header className="sticky top-2 z-40 rounded-2xl bg-surface/80 shadow-[0_12px_38px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" aria-hidden="true" />
      <div className="flex w-full flex-col gap-2 px-3 py-2.5 sm:grid sm:grid-cols-[auto_minmax(12rem,1fr)] sm:items-center sm:gap-3 sm:px-4 lg:grid-cols-[auto_minmax(12rem,1fr)_auto]">
        <div className="flex w-full items-center justify-between sm:w-auto">
          <Link to="/" className="group flex items-center gap-2 focus:outline-none focus-visible:text-primary-hover">
            <span className="text-xl font-extrabold tracking-tight text-text transition group-hover:text-primary"><span className="text-primary">Wo</span>Wiki</span>
          </Link>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-background/45 text-text transition hover:bg-primary/10 hover:text-primary lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="flex w-full min-w-0 justify-center sm:col-start-2 sm:col-end-3">
          <div className="relative w-full min-w-0 max-w-none sm:max-w-[48rem] lg:max-w-[72rem]">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35" />
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth={2} />
            </svg>
            <input
              aria-label="Search WoWiki"
              placeholder="Search articles, guides, and lore..."
              className="w-full min-w-0 rounded-xl bg-background/45 py-2.5 pl-10 pr-4 text-sm text-text shadow-inner shadow-black/10 placeholder:text-muted/75 transition hover:bg-background/60 focus:bg-background/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="hidden items-center justify-end gap-2 lg:flex">
          {navButtons.map((button) => (
            <DropdownMenu
              key={button.label}
              label={button.label}
              items={button.items}
              isOpen={openDropdown === button.label}
              onToggle={() => setOpenDropdown((current) => (current === button.label ? null : button.label))}
              onOpen={() => setOpenDropdown(button.label)}
              onClose={() => setOpenDropdown(null)}
              align="right"
            />
          ))}
          <div className="ml-1 flex items-center gap-2 pl-1">
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
        <div className="px-3 pb-3 lg:hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <nav className="space-y-2 pt-2">
            {navButtons.map((button) => (
              <details key={button.label} className="rounded-xl bg-background/35">
                <summary className="flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium text-text transition hover:bg-primary/10 hover:text-primary">
                  {button.label}
                  <span className="text-muted">&#9662;</span>
                </summary>
                <div className="space-y-1 px-3 pb-2">
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
            <details className="rounded-xl bg-primary/[0.07]">
              <summary className="flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium text-text transition hover:bg-primary/10">
                <span className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-bold text-background" aria-hidden="true">P</span>
                  {profileButton.label}
                </span>
                <span className="text-muted">&#9662;</span>
              </summary>
              <div className="space-y-1 px-3 pb-2">
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
