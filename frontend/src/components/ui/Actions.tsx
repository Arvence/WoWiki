import { useEffect, useRef, useState, type ReactNode } from 'react'
import TextTooltip from './TextTooltip'

const ACTION_TOOLTIP_DELAY_MS = 400

type ActionsProps = {
  target: { id: string; title: string; path: string }
  storageKey: string
  onLike?: (liked: boolean) => Promise<void>
  likeCount?: number
  likeOnce?: boolean
  showSave?: boolean
  showShare?: boolean
  showReport?: boolean
  showDownload?: boolean
  onDownload?: () => Promise<void>
  downloading?: boolean
  orientation?: 'horizontal' | 'vertical' | 'responsive'
  leadingAction?: ReactNode
}

export default function Actions({ target, storageKey, onLike, likeCount, likeOnce = false, showSave = true, showShare = true, showReport = true, showDownload = false, onDownload, downloading = false, orientation = 'horizontal', leadingAction }: ActionsProps): JSX.Element {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [updatingLike, setUpdatingLike] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [shareFeedback, setShareFeedback] = useState<string | null>(null)
  const shareFeedbackTimer = useRef<number | null>(null)

  useEffect(() => {
    setLiked(localStorage.getItem(`wowiki:liked-${storageKey}:${target.id}`) === 'true')
    setSaved(localStorage.getItem(`wowiki:saved-${storageKey}:${target.id}`) === 'true')
  }, [storageKey, target.id])

  useEffect(() => () => {
    if (shareFeedbackTimer.current !== null) window.clearTimeout(shareFeedbackTimer.current)
  }, [])

  const handleLike = async () => {
    if (updatingLike || (likeOnce && liked)) return

    const nextLiked = !liked
    setUpdatingLike(true)
    setActionMessage(null)

    try {
      await onLike?.(nextLiked)
      setLiked(nextLiked)
      localStorage.setItem(`wowiki:liked-${storageKey}:${target.id}`, String(nextLiked))
    } catch {
      setActionMessage('Could not update your like. Please try again.')
    } finally {
      setUpdatingLike(false)
    }
  }

  const handleSave = () => {
    const nextSaved = !saved
    setSaved(nextSaved)
    localStorage.setItem(`wowiki:saved-${storageKey}:${target.id}`, String(nextSaved))
    setActionMessage(nextSaved ? 'Article saved.' : 'Article removed from saved items.')
  }

  const handleShare = async () => {
    const articleUrl = new URL(target.path, window.location.origin).toString()

    try {
      await navigator.clipboard.writeText(articleUrl)
      setActionMessage('Link copied to clipboard.')
      setShareFeedback('Link copied!')
    } catch {
      setActionMessage('Could not share this article.')
      setShareFeedback('Copy failed')
    }

    if (shareFeedbackTimer.current !== null) window.clearTimeout(shareFeedbackTimer.current)
    shareFeedbackTimer.current = window.setTimeout(() => setShareFeedback(null), 2200)
  }

  const orientationClasses = orientation === 'vertical'
    ? 'flex-col gap-3 [&>*:not(:last-child)]:relative [&>*:not(:last-child)]:after:absolute [&>*:not(:last-child)]:after:-bottom-1.5 [&>*:not(:last-child)]:after:left-1/2 [&>*:not(:last-child)]:after:w-10 [&>*:not(:last-child)]:after:-translate-x-1/2 [&>*:not(:last-child)]:after:border-b [&>*:not(:last-child)]:after:border-border'
    : orientation === 'responsive'
      ? 'gap-2 [&>*:not(:last-child)]:relative [&>*:not(:last-child)]:after:absolute [&>*:not(:last-child)]:after:-right-1 [&>*:not(:last-child)]:after:top-1/2 [&>*:not(:last-child)]:after:h-6 [&>*:not(:last-child)]:after:-translate-y-1/2 [&>*:not(:last-child)]:after:border-r [&>*:not(:last-child)]:after:border-border md:flex-col md:gap-3 md:[&>*:not(:last-child)]:after:-bottom-1.5 md:[&>*:not(:last-child)]:after:left-1/2 md:[&>*:not(:last-child)]:after:right-auto md:[&>*:not(:last-child)]:after:top-auto md:[&>*:not(:last-child)]:after:h-auto md:[&>*:not(:last-child)]:after:w-10 md:[&>*:not(:last-child)]:after:-translate-x-1/2 md:[&>*:not(:last-child)]:after:translate-y-0 md:[&>*:not(:last-child)]:after:border-b md:[&>*:not(:last-child)]:after:border-r-0'
      : 'gap-1 sm:gap-2'

  return (
    <>
      <div className={`flex items-center ${orientationClasses}`}>
      {leadingAction}

      <TextTooltip text={liked ? `Unlike ${target.title}` : `Like ${target.title}`} onlyWhenTruncated={false} delayMs={ACTION_TOOLTIP_DELAY_MS}>
        <button
          type="button"
          onClick={() => void handleLike()}
          disabled={updatingLike || (likeOnce && liked)}
          aria-label={liked ? `Unlike ${target.title}` : `Like ${target.title}`}
          aria-pressed={liked}
          className={`inline-flex h-9 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60 ${likeCount === undefined ? 'w-9' : 'min-w-9 px-2'} ${liked ? 'bg-wow-blood/20 text-wow-blood' : 'text-muted hover:bg-wow-blood/15 hover:text-wow-blood'}`}
        >
          <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z" />
          </svg>
          {likeCount !== undefined && <span className="ml-1 text-xs tabular-nums">{likeCount}</span>}
        </button>
      </TextTooltip>

      {showSave && <TextTooltip text={saved ? 'Remove from saved items' : 'Save article'} onlyWhenTruncated={false} delayMs={ACTION_TOOLTIP_DELAY_MS}><button
        type="button"
        onClick={handleSave}
        aria-label={saved ? `Remove ${target.title} from saved items` : `Save ${target.title}`}
        aria-pressed={saved}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${saved ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-primary/10 hover:text-primary'}`}
      >
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
        </svg>
      </button></TextTooltip>}

      {showShare && <TextTooltip text="Copy article link" onlyWhenTruncated={false} delayMs={ACTION_TOOLTIP_DELAY_MS}><div className="relative">
        {shareFeedback && (
          <span role="status" className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap rounded-lg border border-primary/30 bg-surface px-3 py-1.5 text-xs font-semibold text-text shadow-xl shadow-black/30">
            {shareFeedback}
            <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-primary/30 bg-surface" aria-hidden="true" />
          </span>
        )}
        <button
          type="button"
          onClick={() => void handleShare()}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-primary/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Copy link to ${target.title}`}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="18" cy="5" r="2.5" />
            <circle cx="6" cy="12" r="2.5" />
            <circle cx="18" cy="19" r="2.5" />
            <path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" />
          </svg>
        </button>
      </div></TextTooltip>}

      {showDownload && <TextTooltip text="Download as PDF" onlyWhenTruncated={false} delayMs={ACTION_TOOLTIP_DELAY_MS}><button
        type="button"
        disabled={downloading}
        onClick={() => void onDownload?.()}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-primary/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-wait disabled:opacity-60"
        aria-label={`Download ${target.title} as PDF`}
      >
        <svg className="h-[22px] w-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" />
        </svg>
      </button></TextTooltip>}

      {showReport && <TextTooltip text="Report article" onlyWhenTruncated={false} delayMs={ACTION_TOOLTIP_DELAY_MS}><button
        type="button"
        onClick={() => setActionMessage('Report received.')}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-danger/10 hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-danger"
        aria-label={`Report ${target.title}`}
      >
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M5 21V4m0 0h11l-1.5 4L18 12H5" />
        </svg>
      </button></TextTooltip>}

      </div>
      {actionMessage && <span className="sr-only" role="status">{actionMessage}</span>}
    </>
  )
}
