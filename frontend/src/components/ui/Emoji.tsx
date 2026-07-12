import { useEffect, useRef, useState } from 'react'

const EMOJIS = [
  '😀', '😂', '😊', '😍', '🤔', '😮', '😢', '😡',
  '👍', '👎', '👏', '🙌', '🙏', '💪', '🤝', '👀',
  '❤️', '🔥', '✨', '🎉', '💯', '✅', '⚔️', '🛡️',
  '🐉', '🧙', '🧝', '🧟', '💀', '👑', '🏆', '🎮',
]

type EmojiProps = {
  onSelect: (emoji: string) => void
  align?: 'left' | 'right'
}

export default function Emoji({ onSelect, align = 'left' }: EmojiProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label="Add emoji" title="Add emoji" className={`inline-flex h-10 w-10 items-center justify-center rounded text-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${open ? 'bg-primary/15' : 'text-muted hover:bg-primary/10'}`}>😊</button>
      {open && (
        <div className={`absolute bottom-full z-50 mb-2 w-64 rounded border border-border bg-surface p-2 shadow-xl shadow-black/30 ${align === 'right' ? 'right-0' : 'left-0'}`} role="dialog" aria-label="Choose an emoji">
          <div className="grid grid-cols-8 gap-1">
            {EMOJIS.map((emoji) => <button key={emoji} type="button" onClick={() => { onSelect(emoji); setOpen(false) }} className="flex h-7 w-7 items-center justify-center rounded text-lg hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={`Insert ${emoji}`}>{emoji}</button>)}
          </div>
        </div>
      )}
    </div>
  )
}
