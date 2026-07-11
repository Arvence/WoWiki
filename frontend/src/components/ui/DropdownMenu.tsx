interface DropdownMenuProps {
  label: string
  items: string[]
  isOpen: boolean
  onToggle: () => void
  onOpen: () => void
  onClose: () => void
  variant?: 'default' | 'more' | 'profile'
  align?: 'left' | 'right'
  dividerBefore?: number
}

export default function DropdownMenu({ label, items, isOpen, onToggle, onOpen, onClose, variant = 'default', align = 'left', dividerBefore }: DropdownMenuProps): JSX.Element {
  const isProfile = variant === 'profile'
  const isMore = variant === 'more'
  const isIconOnly = isProfile || isMore

  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={isProfile ? 'Open profile menu' : isMore ? 'Open more menu' : undefined}
        className={`inline-flex items-center justify-center rounded-md border text-sm font-medium text-text transition hover:border-primary hover:bg-background/90 ${isProfile ? 'h-10 w-10 rounded-full border-primary/40 bg-primary/10' : isMore ? 'h-10 w-10 border-border bg-background/80' : 'gap-1 border-border bg-background/80 px-3 py-2'}`}
      >
        {isProfile && <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-bold text-background" aria-hidden="true">P</span>}
        {isMore && <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>}
        {!isIconOnly && <span>{label}</span>}
        {!isIconOnly && <svg className={`h-3.5 w-3.5 text-muted transition ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.2 7.2a.75.75 0 0 1 1.1 0L10 11l3.7-3.8a.75.75 0 1 1 1.1 1L10.5 13a.75.75 0 0 1-1 0L5.2 8.3a.75.75 0 0 1 0-1.1Z" clipRule="evenodd" /></svg>}
      </button>

      <div className={`absolute top-full z-50 min-w-[14rem] overflow-visible transition duration-150 ${align === 'right' ? 'right-0' : 'left-0'} ${isOpen ? 'block' : 'hidden'}`}>
        <div className="pointer-events-none h-2" />
        <div className="overflow-hidden rounded-md border border-border bg-surface shadow-[0_12px_24px_rgba(0,0,0,0.35)]">
          <div className="space-y-1 p-2">
            {items.map((item, index) => (
              <div key={item} className={index === dividerBefore ? 'border-t border-border pt-2' : ''}>
                <a href="#" className="block rounded-md px-3 py-2 text-sm text-text transition hover:bg-background/90">{item}</a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
