import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type TextTooltipProps = {
  text: string
  children: ReactNode
  className?: string
  onlyWhenTruncated?: boolean
  delayMs?: number
}

const VIEWPORT_GAP = 8
const TRIGGER_GAP = 8

export default function TextTooltip({ text, children, className = '', onlyWhenTruncated = true, delayMs = 250 }: TextTooltipProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ left: -9999, top: -9999 })
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLSpanElement>(null)
  const openTimerRef = useRef<number | null>(null)
  const tooltipId = useId()

  const clearOpenTimer = () => {
    if (openTimerRef.current === null) return
    window.clearTimeout(openTimerRef.current)
    openTimerRef.current = null
  }

  const showTooltip = () => {
    const content = triggerRef.current?.firstElementChild as HTMLElement | null
    const isTruncated = content
      ? content.scrollWidth > content.clientWidth + 1 || content.scrollHeight > content.clientHeight + 1
      : false

    if (!onlyWhenTruncated || isTruncated) {
      clearOpenTimer()
      openTimerRef.current = window.setTimeout(() => {
        setOpen(true)
        openTimerRef.current = null
      }, delayMs)
    }
  }

  const hideTooltip = () => {
    clearOpenTimer()
    setOpen(false)
  }

  useEffect(() => () => clearOpenTimer(), [])

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current
    const tooltip = tooltipRef.current
    if (!trigger || !tooltip) return

    const triggerRect = trigger.getBoundingClientRect()
    const tooltipRect = tooltip.getBoundingClientRect()
    const centeredLeft = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
    const left = Math.min(
      Math.max(centeredLeft, VIEWPORT_GAP),
      window.innerWidth - tooltipRect.width - VIEWPORT_GAP,
    )
    const spaceAbove = triggerRect.top - tooltipRect.height - TRIGGER_GAP
    const top = spaceAbove >= VIEWPORT_GAP
      ? spaceAbove
      : triggerRect.bottom + TRIGGER_GAP

    setPosition({ left, top })
  }, [])

  useLayoutEffect(() => {
    if (!open) return undefined

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, text, updatePosition])

  return (
    <span
      ref={triggerRef}
      className={`inline-flex min-w-0 ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocusCapture={showTooltip}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) hideTooltip()
      }}
      aria-describedby={open ? tooltipId : undefined}
    >
      {children}
      {open && createPortal(
        <span
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          style={{ left: position.left, top: position.top }}
          className="pointer-events-none fixed z-[100] w-max max-w-[min(22rem,calc(100vw-1rem))] rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium leading-5 text-text shadow-xl"
        >
          {text}
        </span>,
        document.body,
      )}
    </span>
  )
}
