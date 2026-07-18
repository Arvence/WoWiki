import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import DropdownMenu from "../ui/DropdownMenu"
import { useAuth } from "../../features/auth/AuthContext"

const navButtons = [
  { label: "Tools", items: ["Talent Calculator", "Item Comparator", "Item Finder"] },
  { label: "Guides", items: ["Class Builds", "Raids", "PvP"] },
]

const profileButton = {
  label: "Profile",
  items: ["Saved Articles", "Settings", "Sign Out", "About", "Support", "Privacy"],
  dividerBefore: 3,
}

export default function AppHeader(): JSX.Element {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const selectProfileItem = (item: string) => {
    const routes: Record<string, string> = { Profile: "/profile", "Saved Articles": "/profile", Settings: "/profile", About: "/about", Support: "/contact", Privacy: "/privacy" }
    if (item === "Sign Out") { logout(); navigate("/") } else if (routes[item]) navigate(routes[item])
    setOpenDropdown(null)
  }

  return (
    <header className="sticky top-2 z-40 rounded-2xl bg-surface/80 shadow-[0_12px_38px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" aria-hidden="true" />
      <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2.5 sm:grid-cols-[5rem_minmax(12rem,1fr)_5rem] sm:gap-3 sm:px-4 lg:grid-cols-[auto_minmax(12rem,1fr)_auto]">
        <div className="col-start-1 row-start-1 flex items-center">
          <Link to="/" className="group flex items-center gap-2 focus:outline-none focus-visible:text-primary-hover">
            <span className="text-xl font-extrabold tracking-tight text-text transition group-hover:text-primary"><span className="text-primary">Wo</span>Wiki</span>
          </Link>
        </div>

        <div className="col-span-2 row-start-2 flex w-full min-w-0 justify-center sm:col-span-1 sm:col-start-2 sm:row-start-1">
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

        <button
          type="button"
          className="col-start-2 row-start-1 inline-flex h-10 w-10 items-center justify-center justify-self-end rounded-xl bg-background/45 p-2.5 text-text transition hover:bg-primary/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:col-start-3 lg:hidden"
          aria-label="Toggle navigation"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="hidden items-center justify-end gap-2 lg:col-start-3 lg:row-start-1 lg:flex">
          <Link
            to="/community"
            className="group inline-flex items-center gap-2 rounded-xl border border-primary/45 bg-gradient-to-br from-primary/20 to-primary/[0.06] px-3.5 py-2 text-sm font-bold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-primary/70 hover:bg-primary/25 hover:text-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <svg className="h-4 w-4 transition group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            Community
          </Link>
          <Link
            to="/database"
            className="group inline-flex items-center gap-2 rounded-xl border border-primary/45 bg-gradient-to-br from-primary/20 to-primary/[0.06] px-3.5 py-2 text-sm font-bold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-primary/70 hover:bg-primary/25 hover:text-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <svg className="h-4 w-4 transition group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3" strokeWidth="1.8" /><path d="M4 5v7c0 1.66 3.58 3 8 3s8-1.34 8-3V5M4 12v7c0 1.66 3.58 3 8 3s8-1.34 8-3v-7" strokeWidth="1.8" /></svg>
            Database
          </Link>
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
            {user ? <DropdownMenu label={user.displayName} items={profileButton.items} isOpen={openDropdown === profileButton.label} onToggle={() => setOpenDropdown((current) => current === profileButton.label ? null : profileButton.label)} onOpen={() => setOpenDropdown(profileButton.label)} onClose={() => setOpenDropdown(null)} variant="profile" align="right" dividerBefore={profileButton.dividerBefore} onSelect={selectProfileItem} avatarText={user.displayName} profileSubtitle={user.email} /> : <Link to="/auth" className="rounded-xl bg-primary px-3.5 py-2 text-sm font-bold text-background hover:bg-primary-hover">Sign in</Link>}
          </div>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="px-3 pb-3 lg:hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <nav className="space-y-2 pt-2">
            <Link
              to="/community"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/20 hover:text-primary-hover"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              Community
            </Link>
            <Link
              to="/database"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/20 hover:text-primary-hover"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3" strokeWidth="1.8" /><path d="M4 5v7c0 1.66 3.58 3 8 3s8-1.34 8-3V5M4 12v7c0 1.66 3.58 3 8 3s8-1.34 8-3v-7" strokeWidth="1.8" /></svg>
              Database
            </Link>
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
            {user ? <details className="rounded-xl bg-primary/[0.07]">
              <summary className="flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium text-text transition hover:bg-primary/10">
                <span className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-bold uppercase text-background" aria-hidden="true">{user.displayName.charAt(0)}</span>
                  <span><span className="block">{user.displayName}</span><span className="block max-w-48 truncate text-xs font-normal text-muted">{user.email}</span></span>
                </span>
                <span className="text-muted">&#9662;</span>
              </summary>
              <div className="space-y-1 px-3 pb-2">
                {profileButton.items.map((item, index) => (
                  <div key={item} className={index === profileButton.dividerBefore ? 'border-t border-border pt-2' : ''}>
                    <button type="button" onClick={() => { selectProfileItem(item); setMobileMenuOpen(false) }} className={`block w-full rounded-md px-2 py-2 text-left text-sm transition hover:bg-background/90 ${item === 'Sign Out' ? 'text-danger' : 'text-text'}`}>{item}</button>
                  </div>
                ))}
              </div>
            </details> : <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl bg-primary px-3 py-2.5 text-center text-sm font-bold text-background">Sign in</Link>}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
