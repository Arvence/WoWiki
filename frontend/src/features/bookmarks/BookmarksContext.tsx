import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { HttpError } from '../../shared/api/http'
import { useAuth } from '../auth/AuthContext'
import { deleteBookmark as deleteBookmarkRequest, getBookmarks, saveBookmark as saveBookmarkRequest } from './api/bookmarkService'
import type { Bookmark, BookmarkTargetType } from './types/bookmark'

type BookmarksContextValue = {
  bookmarks: Bookmark[]
  loading: boolean
  error: string | null
  isBookmarked(targetType: BookmarkTargetType, targetId: string): boolean
  saveBookmark(targetType: BookmarkTargetType, targetId: string): Promise<Bookmark>
  deleteBookmark(targetType: BookmarkTargetType, targetId: string): Promise<void>
  toggleBookmark(targetType: BookmarkTargetType, targetId: string): Promise<boolean>
}

type LegacyBookmarkTarget = Pick<Bookmark, 'targetType' | 'targetId'>

const BookmarksContext = createContext<BookmarksContextValue | null>(null)
let legacyMigrationPromise: Promise<Bookmark[]> | null = null

export function BookmarksProvider({ children }: { children: ReactNode }): JSX.Element {
  const { user, loading: authLoading } = useAuth()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setBookmarks([])
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setBookmarks([])
    setError(null)
    setLoading(true)

    Promise.all([getBookmarks(), migrateLegacyBookmarks()])
      .then(([storedBookmarks, migratedBookmarks]) => {
        if (!cancelled) setBookmarks(mergeBookmarks(storedBookmarks, migratedBookmarks))
      })
      .catch((loadError: unknown) => {
        handleAuthenticationError(loadError)
        if (!cancelled) setError('Could not load your bookmarks. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [authLoading, user?.id])

  const value = useMemo<BookmarksContextValue>(() => {
    const isBookmarked = (targetType: BookmarkTargetType, targetId: string): boolean => {
      return bookmarks.some((bookmark) => bookmark.targetType === targetType && bookmark.targetId === targetId)
    }

    const saveBookmark = async (targetType: BookmarkTargetType, targetId: string): Promise<Bookmark> => {
      if (!user) throw new Error('Sign in to save bookmarks.')
      const existingBookmark = bookmarks.find((bookmark) => bookmark.targetType === targetType && bookmark.targetId === targetId)
      if (existingBookmark) return existingBookmark

      const optimisticBookmark: Bookmark = {
        id: `pending:${targetType}:${targetId}`,
        userId: user.id,
        targetType,
        targetId,
        createdAtUtc: new Date().toISOString(),
      }
      setBookmarks((current) => mergeBookmarks(current, [optimisticBookmark]))

      try {
        const savedBookmark = await saveBookmarkRequest(targetType, targetId)
        setBookmarks((current) => mergeBookmarks(
          current.filter((bookmark) => bookmark.targetType !== targetType || bookmark.targetId !== targetId),
          [savedBookmark],
        ))
        return savedBookmark
      } catch (saveError: unknown) {
        handleAuthenticationError(saveError)
        setBookmarks((current) => current.filter((bookmark) => bookmark.targetType !== targetType || bookmark.targetId !== targetId))
        throw saveError
      }
    }

    const deleteBookmark = async (targetType: BookmarkTargetType, targetId: string): Promise<void> => {
      if (!user) throw new Error('Sign in to manage bookmarks.')
      const existingBookmark = bookmarks.find((bookmark) => bookmark.targetType === targetType && bookmark.targetId === targetId)
      if (!existingBookmark) return

      setBookmarks((current) => current.filter((bookmark) => bookmark.targetType !== targetType || bookmark.targetId !== targetId))
      try {
        await deleteBookmarkRequest(targetType, targetId)
      } catch (deleteError: unknown) {
        handleAuthenticationError(deleteError)
        setBookmarks((current) => mergeBookmarks(current, [existingBookmark]))
        throw deleteError
      }
    }

    return {
      bookmarks,
      loading,
      error,
      isBookmarked,
      saveBookmark,
      deleteBookmark,
      async toggleBookmark(targetType, targetId) {
        if (isBookmarked(targetType, targetId)) {
          await deleteBookmark(targetType, targetId)
          return false
        }
        await saveBookmark(targetType, targetId)
        return true
      },
    }
  }, [bookmarks, error, loading, user])

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>
}

export function useBookmarks(): BookmarksContextValue {
  const value = useContext(BookmarksContext)
  if (!value) throw new Error('useBookmarks must be used within BookmarksProvider')
  return value
}

function mergeBookmarks(...groups: Bookmark[][]): Bookmark[] {
  const bookmarks = new Map<string, Bookmark>()
  for (const group of groups) {
    for (const bookmark of group) bookmarks.set(bookmarkKey(bookmark.targetType, bookmark.targetId), bookmark)
  }
  return [...bookmarks.values()]
}

function bookmarkKey(targetType: BookmarkTargetType, targetId: string): string {
  return `${targetType}:${targetId}`
}

function migrateLegacyBookmarks(): Promise<Bookmark[]> {
  if (legacyMigrationPromise) return legacyMigrationPromise

  legacyMigrationPromise = migrateLegacyBookmarksOnce().finally(() => {
    legacyMigrationPromise = null
  })
  return legacyMigrationPromise
}

async function migrateLegacyBookmarksOnce(): Promise<Bookmark[]> {
  const targets = readLegacyBookmarkTargets()
  const migrated: Bookmark[] = []

  for (const target of targets) {
    try {
      migrated.push(await saveBookmarkRequest(target.targetType, target.targetId))
      window.localStorage.removeItem(`wowiki:saved-${target.targetType}:${target.targetId}`)
    } catch {
      continue
    }
  }

  return migrated
}

function readLegacyBookmarkTargets(): LegacyBookmarkTarget[] {
  const targets: LegacyBookmarkTarget[] = []
  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index)
      if (!key) continue
      const match = key.match(/^wowiki:saved-(news|community):(.+)$/)
      if (match && window.localStorage.getItem(key) === 'true') {
        targets.push({ targetType: match[1] as BookmarkTargetType, targetId: match[2] })
      }
    }
  } catch {
    return []
  }
  return targets
}

function handleAuthenticationError(error: unknown): void {
  if (error instanceof HttpError && error.status === 401) window.dispatchEvent(new Event('wowiki:auth-expired'))
}
