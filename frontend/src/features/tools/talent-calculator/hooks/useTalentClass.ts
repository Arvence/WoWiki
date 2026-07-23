import { useEffect, useState } from 'react'
import { fetchTalentClass } from '../api/talentCalculatorService'
import type { TalentClass } from '../types/talent'

type TalentClassState = {
  talentClass: TalentClass | null
  loading: boolean
  error: string | null
}

export function useTalentClass(classId: string): TalentClassState {
  const [state, setState] = useState<TalentClassState>({ talentClass: null, loading: true, error: null })

  useEffect(() => {
    const controller = new AbortController()
    setState({ talentClass: null, loading: true, error: null })

    fetchTalentClass(classId, controller.signal)
      .then((talentClass) => setState({ talentClass, loading: false, error: null }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setState({ talentClass: null, loading: false, error: error instanceof Error ? error.message : 'Failed to load talents' })
      })

    return () => controller.abort()
  }, [classId])

  return state
}
