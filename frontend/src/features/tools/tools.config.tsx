import type { ReactNode } from 'react'

export type ToolDefinition = {
  title: string
  status?: string
  description: string
  href?: string
  image?: string
  icon: ReactNode
}

const iconClassName = 'h-5 w-5'

export const tools: readonly ToolDefinition[] = [
  {
    title: 'Raid Planner',
    status: 'Soon',
    description: 'Organize roles, groups, buffs, and preparation lists for your next raid night.',
    image: '/images/tools/raid-planner-dragon.png',
    icon: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16M8 14h3M13 14h3M8 17h3" /></svg>,
  },
  {
    title: 'Talent Calculator',
    description: 'Build, compare, and share Classic talent specializations before spending a point in game.',
    href: '/tools/talent-calculator',
    image: '/images/tools/talent-calculator-classes.png',
    icon: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /><circle cx="12" cy="12" r="4" /></svg>,
  },
  {
    title: 'Item Finder',
    status: 'Database ready',
    description: 'Search weapons, armor, and rewards by name, type, source, or useful attributes.',
    href: '/database/items',
    image: '/images/tools/item-finder-thunderfury.png',
    icon: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></svg>,
  },
  {
    title: 'Item Comparator',
    status: 'Soon',
    description: 'Compare equipment side by side and see the stat differences that matter for your build.',
    icon: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 4h8M9 4 5 20M15 4l4 16M3 14h6M15 14h6" /><path d="M3 14a3 3 0 0 0 6 0M15 14a3 3 0 0 0 6 0" /></svg>,
  },
  {
    title: 'Quest Route Builder',
    status: 'Soon',
    description: 'Arrange objectives into a clean route for more efficient leveling and zone completion.',
    icon: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M7.5 16.5 16.5 7.5M6 6h5l2 2" /></svg>,
  },
  {
    title: 'Character Lookup',
    status: 'Soon',
    description: 'Review character information and keep important progression details in one place.',
    icon: <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="10" cy="8" r="4" /><path d="M3 21a7 7 0 0 1 12.5-4.3M17 17l4 4M21 17l-4 4" /></svg>,
  },
]
