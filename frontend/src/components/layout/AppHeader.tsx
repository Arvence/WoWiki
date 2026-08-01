import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import DropdownMenu from "../ui/DropdownMenu"
import { useAuth } from "../../features/auth/AuthContext"
import { headerNavigation } from "./headerNavigation"

const profileButton = {
  label: "Profile",
  items: ["Saved Articles", "Settings", "Sign Out", "About", "Support", "Privacy"],
  dividerBefore: 3,
}

export default function AppHeader(): JSX.Element {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  useEffect(() => {
    setSearchQuery(location.pathname === "/search" ? new URLSearchParams(location.search).get("q") ?? "" : "")
  }, [location.pathname, location.search])

  useEffect(() => {
    const focusSearch = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        searchInputRef.current?.focus()
        searchInputRef.current?.select()
      }
    }
    window.addEventListener("keydown", focusSearch)
    return () => window.removeEventListener("keydown", focusSearch)
  }, [])

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = searchQuery.trim()
    if (query) navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  const clearSearch = () => {
    setSearchQuery("")
    if (location.pathname === "/search") navigate("/search")
    searchInputRef.current?.focus()
  }

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Escape") return
    if (searchQuery) clearSearch()
    else event.currentTarget.blur()
  }
  const selectProfileItem = (item: string) => {
    const routes: Record<string, string> = { Profile: "/profile", "Saved Articles": "/profile", Settings: "/profile", About: "/about", Support: "/contact", Privacy: "/privacy" }
    if (item === "Sign Out") { logout(); navigate("/") } else if (routes[item]) navigate(routes[item])
    setOpenDropdown(null)
  }

  return (
    <header className="sticky top-2 z-40 rounded-2xl bg-surface/80 shadow-[0_12px_38px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" aria-hidden="true" />
      <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2.5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-3 sm:px-4 lg:grid-cols-[auto_minmax(12rem,1fr)_auto]">
        <div className="col-start-1 row-start-1 flex items-center">
          <Link to="/" className="group flex items-center gap-2 focus:outline-none focus-visible:text-primary-hover">
            <img
              src="/wowiki-header-logo.png"
              alt="WoWiki"
              className="h-9 w-auto shrink-0 object-contain drop-shadow-[0_3px_8px_rgba(0,0,0,0.35)] transition duration-200 group-hover:scale-[1.03] sm:h-10"
            />
          </Link>
        </div>

        <div className="col-span-2 row-start-2 flex w-full min-w-0 justify-center sm:col-span-1 sm:col-start-2 sm:row-start-1">
          <form className="group/search relative w-full min-w-0 max-w-none lg:max-w-[72rem]" role="search" onSubmit={submitSearch}>
            <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35" />
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth={2} />
            </svg>
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              aria-label="Search WoWiki"
              aria-keyshortcuts="Control+K Meta+K"
              autoComplete="off"
              placeholder="Search news, discussions, and database..."
              className="w-full min-w-0 rounded-xl border border-border/45 bg-background/45 py-2.5 pl-10 pr-[5.5rem] text-sm text-text shadow-inner shadow-black/10 outline-none transition placeholder:text-muted/70 hover:border-border/80 hover:bg-background/60 focus:border-primary/55 focus:bg-background/70 focus:ring-2 focus:ring-primary/20 [&::-webkit-search-cancel-button]:hidden"
            />
            <div className="absolute inset-y-0 right-1 flex items-center gap-1">
              {searchQuery ? (
                <button type="button" onClick={clearSearch} aria-label="Clear search" className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-surface-alt hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" d="m7 7 10 10M17 7 7 17" /></svg>
                </button>
              ) : <kbd className="hidden rounded-md border border-border/50 bg-surface/70 px-1.5 py-0.5 text-[0.6rem] font-bold text-muted xl:block">Ctrl K</kbd>}
              <button type="submit" disabled={!searchQuery.trim()} aria-label="Submit search" title="Search" className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-background shadow-sm transition hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-default disabled:bg-surface-alt disabled:text-muted/60 disabled:shadow-none">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" /></svg>
              </button>
            </div>
          </form>
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
          {headerNavigation.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group inline-flex items-center gap-2 rounded-xl border border-primary/45 bg-gradient-to-br from-primary/20 to-primary/[0.06] px-3.5 py-2 text-sm font-bold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-primary/70 hover:bg-primary/25 hover:text-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <div className="ml-1 flex items-center gap-2 border-l border-border/70 pl-3">
            {user ? <DropdownMenu label={user.displayName} items={profileButton.items} isOpen={openDropdown === profileButton.label} onToggle={() => setOpenDropdown((current) => current === profileButton.label ? null : profileButton.label)} onOpen={() => setOpenDropdown(profileButton.label)} onClose={() => setOpenDropdown(null)} variant="profile" align="right" dividerBefore={profileButton.dividerBefore} onSelect={selectProfileItem} avatarText={user.displayName} profileSubtitle={user.email} /> : (
              <Link
                to="/auth"
                className="group/signin inline-flex items-center gap-2 rounded-xl border border-primary-hover/70 bg-gradient-to-br from-primary-hover to-primary px-4 py-2 text-sm font-black text-background shadow-[0_6px_18px_rgba(199,156,58,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_9px_24px_rgba(199,156,58,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <svg className="h-4 w-4 transition group-hover/signin:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 17l5-5-5-5M15 12H3M14 4h4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-4" />
                </svg>
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="px-3 pb-3 lg:hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <nav className="space-y-2 pt-2">
            {headerNavigation.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="group flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/20 hover:text-primary-hover"
              >
                {item.icon}
                {item.label}
              </Link>
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
