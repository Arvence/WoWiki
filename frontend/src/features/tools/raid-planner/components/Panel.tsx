import type { ReactNode } from 'react'

export default function Panel({ children, className = '' }: { children: ReactNode; className?: string }): JSX.Element {
  return (
    <section className={`rounded-2xl border border-border/45 bg-background/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] ${className}`}>
      {children}
    </section>
  )
}
