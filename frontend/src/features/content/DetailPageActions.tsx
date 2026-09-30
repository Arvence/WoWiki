import type { ReactNode } from 'react'
import Actions from '../../components/ui/Actions'

type DetailPageActionsProps = {
  target: { id: string; title: string; path: string }
  storageKey: string
  orientation?: 'horizontal' | 'vertical' | 'responsive'
  leadingAction?: ReactNode
  onLike?: (liked: boolean) => Promise<void>
  showDownload?: boolean
  downloading?: boolean
  onDownload?: () => Promise<void>
}

export default function DetailPageActions({ target, storageKey, orientation, leadingAction, onLike, showDownload, downloading, onDownload }: DetailPageActionsProps): JSX.Element {
  return (
    <Actions
      target={target}
      storageKey={storageKey}
      orientation={orientation}
      leadingAction={leadingAction}
      onLike={onLike}
      showDownload={showDownload}
      downloading={downloading}
      onDownload={onDownload}
    />
  )
}
