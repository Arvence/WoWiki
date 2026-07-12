interface DropdownMenuProps {
  label: string
  items: string[]
  isOpen: boolean
  onToggle: () => void
  onOpen: () => void
  onClose: () => void
  variant?: 'default' | 'profile' | 'select'
  align?: 'left' | 'right'
  dividerBefore?: number
  onSelect?: (item: string) => void
}

export default function DropdownMenu({ label, items, isOpen, onToggle, onOpen, onClose, variant = 'default', align = 'left', dividerBefore, onSelect }: DropdownMenuProps): JSX.Element {
  const isProfile = variant === 'profile'
  const isSelect = variant === 'select'

  return (
    <div className={`relative ${isSelect ? 'w-full' : ''}`} onMouseEnter={isSelect ? undefined : onOpen} onMouseLeave={isSelect ? undefined : onClose}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={isProfile ? 'Open profile menu' : undefined}
        className={`inline-flex items-center rounded-md border text-sm font-medium text-text transition hover:border-primary hover:bg-background/90 ${isProfile ? 'h-10 w-10 justify-center rounded-full border-primary/40 bg-primary/10' : isSelect ? 'h-11 w-full justify-between border-border bg-background px-3' : 'justify-center gap-1 border-border bg-background/80 px-3 py-2'}`}
      >
        {isProfile && <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-bold text-background" aria-hidden="true">P</span>}
        {!isProfile && <span>{label}</span>}
        {!isProfile && <svg className={`h-3.5 w-3.5 text-muted transition ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.2 7.2a.75.75 0 0 1 1.1 0L10 11l3.7-3.8a.75.75 0 1 1 1.1 1L10.5 13a.75.75 0 0 1-1 0L5.2 8.3a.75.75 0 0 1 0-1.1Z" clipRule="evenodd" /></svg>}
      </button>

      <div className={`absolute top-full z-50 min-w-[14rem] overflow-visible transition duration-150 ${isSelect ? 'w-full' : ''} ${align === 'right' ? 'right-0' : 'left-0'} ${isOpen ? 'block' : 'hidden'}`}>
        <div className="pointer-events-none h-2" />
        <div className="overflow-hidden rounded-md border border-border bg-surface shadow-[0_12px_24px_rgba(0,0,0,0.35)]">
          <div className="space-y-1 p-2">
            {items.map((item, index) => (
              <div key={item} className={index === dividerBefore ? 'border-t border-border pt-2' : ''}>
                {isSelect ? <button type="button" onClick={() => onSelect?.(item)} className={`block w-full rounded-md px-3 py-2 text-left text-sm transition hover:bg-background/90 ${item === label ? 'bg-primary/10 font-semibold text-primary' : 'text-text'}`}>{item}</button> : <a href="#" className="block rounded-md px-3 py-2 text-sm text-text transition hover:bg-background/90">{item}</a>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
