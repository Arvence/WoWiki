export type BookmarkKind = 'news' | 'community'

export const BOOKMARK_CHANGE_EVENT = 'wowiki:bookmark-change'

function bookmarkKey(kind: BookmarkKind, id: string): string {
  return `wowiki:saved-${kind}:${id}`
}

export function isBookmarked(kind: BookmarkKind, id: string): boolean {
  try {
    return window.localStorage.getItem(bookmarkKey(kind, id)) === 'true'
  } catch {
    return false
  }
}

export function setBookmarked(kind: BookmarkKind, id: string, saved: boolean): void {
  try {
    const key = bookmarkKey(kind, id)
    if (saved) window.localStorage.setItem(key, 'true')
    else window.localStorage.removeItem(key)
    window.dispatchEvent(new CustomEvent(BOOKMARK_CHANGE_EVENT, { detail: { kind, id, saved } }))
  } catch {
    return
  }
}
