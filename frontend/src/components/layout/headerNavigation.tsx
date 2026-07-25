import type { ReactNode } from 'react'

export type HeaderNavigationItem = {
  label: string
  to: string
  icon: ReactNode
}

const iconClassName = 'h-4 w-4 transition group-hover:scale-110'

export const headerNavigation: readonly HeaderNavigationItem[] = [
  {
    label: 'Community',
    to: '/community',
    icon: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  },
  {
    label: 'Database',
    to: '/database',
    icon: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v7c0 1.66 3.58 3 8 3s8-1.34 8-3V5M4 12v7c0 1.66 3.58 3 8 3s8-1.34 8-3v-7" /></svg>,
  },
  {
    label: 'Guides',
    to: '/guides',
    icon: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22V5.5Z" /></svg>,
  },
  {
    label: 'Tools',
    to: '/tools',
    icon: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m14.7 6.3 3-3a4.2 4.2 0 0 1-5.5 5.5L5.3 15.7a2.1 2.1 0 1 0 3 3l6.9-6.9a4.2 4.2 0 0 0 5.5-5.5l-3 3" /><circle cx="6.8" cy="17.2" r=".8" fill="currentColor" stroke="none" /></svg>,
  },
]
