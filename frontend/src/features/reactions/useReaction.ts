import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { getReaction, setReaction, type ReactionState, type ReactionTargetType } from './reactionService'

type LoadedReaction = { key: string; value: ReactionState | null; error: string | null }

export function useReaction(targetType: ReactionTargetType | null, targetId: string) {
  const { user, loading: authLoading } = useAuth()
  const key = JSON.stringify([user?.id, targetType, targetId])
  const activeKey = useRef(key)
  activeKey.current = key
  const pendingKey = useRef<string | null>(null)
  const [loaded, setLoaded] = useState<LoadedReaction | null>(null)
  const [updatingKey, setUpdatingKey] = useState<string | null>(null)
  const current = loaded?.key === key ? loaded : null

  useEffect(() => {
    if (authLoading || !user || !targetType) return
    const controller = new AbortController()
    setLoaded(null)
    getReaction(targetType, targetId, controller.signal).then(
      (value) => {
        if (!controller.signal.aborted) setLoaded({ key, value, error: null })
      },
      () => {
        if (!controller.signal.aborted) setLoaded({ key, value: null, error: 'Could not load your like. Click to retry.' })
      },
    )
    return () => controller.abort()
  }, [authLoading, user?.id, targetType, targetId, key])

  const toggle = async () => {
    if (!user || !targetType) throw new Error('Sign in to like content.')
    if (pendingKey.current === key) return
    pendingKey.current = key
    setUpdatingKey(key)
    try {
      const previous = current?.value ?? await getReaction(targetType, targetId)
      if (activeKey.current !== key) return
      const value = await setReaction(targetType, targetId, !previous.liked)
      if (activeKey.current === key) setLoaded({ key, value, error: null })
    } finally {
      if (pendingKey.current === key) pendingKey.current = null
      setUpdatingKey((currentKey) => currentKey === key ? null : currentKey)
    }
  }

  return {
    liked: Boolean(user && current?.value?.liked),
    likeCount: current?.value?.likeCount,
    busy: authLoading || Boolean(user && targetType && !current) || updatingKey === key,
    error: current?.error,
    toggle,
  }
}
