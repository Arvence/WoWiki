import { useCallback, useEffect, useRef, useState } from 'react'
import { readLocalRaidPlan } from '../storage/localRaidPlanStorage'
import { emptyRaidPlan, type PlayerClass, type RaiderRole, type RaidPlan } from '../types/raidPlan'
import { encodeRaidPlan, readSharedRaidPlan } from '../utils/raidPlanShare'
import { useRaidPlanDraft } from './useRaidPlanDraft'
import { useRaidPlanLibrary } from './useRaidPlanLibrary'

export type PlannerNotice = {
  text: string
  tone: 'success' | 'error' | 'info'
}

type InitialPlannerState = {
  plan: RaidPlan
  notice: PlannerNotice | null
  source: 'shared' | 'local' | 'empty'
}

export function useRaidPlannerController() {
  const [initialState] = useState(readInitialPlannerState)
  const initialSource = useRef(initialState.source)
  const previousUserId = useRef<string | null>(null)
  const draft = useRaidPlanDraft(initialState.plan)
  const library = useRaidPlanLibrary()
  const [notice, setNotice] = useState<PlannerNotice | null>(initialState.notice)
  const [showAddRaider, setShowAddRaider] = useState(false)
  const [addGroup, setAddGroup] = useState(1)

  useEffect(() => {
    if (library.authLoading) return

    if (!library.user) {
      const signedOutFromAccount = previousUserId.current !== null
      previousUserId.current = null
      library.clearAccountPlans()
      if (signedOutFromAccount) {
        const browserState = readInitialPlannerState()
        initialSource.current = browserState.source
        draft.loadPlan(browserState.plan)
        setNotice(browserState.notice)
        setShowAddRaider(false)
      }
      return
    }

    previousUserId.current = library.user.id
    let cancelled = false

    void library.loadAccountPlans().then(({ accountPlans, migratedPlan, migrationError }) => {
      if (cancelled) return

      if (initialSource.current === 'shared') {
        if (migrationError) setNotice({ text: 'Your account raids loaded, but the locally saved raid could not be migrated.', tone: 'error' })
        return
      }

      if (initialSource.current === 'local' && migrationError) {
        setNotice({ text: 'Your account raids loaded, but this local raid could not be migrated. Save it again to retry.', tone: 'error' })
        return
      }

      const selectedPlan = migratedPlan ?? accountPlans[0] ?? emptyRaidPlan()
      draft.loadPlan(selectedPlan)
      setNotice(migratedPlan ? { text: 'Your locally saved raid was moved to your account.', tone: 'success' } : null)
      initialSource.current = 'empty'
    }).catch((error: unknown) => {
      if (!cancelled) {
        setNotice({
          text: getErrorMessage(error, 'Could not load your account raids. Your current plan has not been changed.'),
          tone: 'error',
        })
      }
    })

    return () => {
      cancelled = true
    }
  }, [draft.loadPlan, library.authLoading, library.clearAccountPlans, library.loadAccountPlans, library.user])

  const changeField = useCallback((field: 'raid' | 'date' | 'startTime' | 'notes', value: string) => {
    draft.updateField(field, value)
    setNotice(null)
  }, [draft.updateField])

  const changeRaidSize = useCallback((raidSize: number) => {
    draft.changeRaidSize(raidSize)
    setNotice(null)
  }, [draft.changeRaidSize])

  const savePlan = useCallback(async () => {
    if (!draft.plan.raid || !draft.plan.date || !draft.plan.startTime) {
      setNotice({ text: 'Choose a raid, date, and start time first.', tone: 'error' })
      return
    }

    try {
      const { savedPlan, updatedExistingPlan } = await library.savePlan(draft.plan)
      draft.loadPlan(savedPlan)
      initialSource.current = 'empty'
      window.history.replaceState(null, '', window.location.pathname)
      setNotice({
        text: updatedExistingPlan || draft.plan.id
          ? 'Raid changes saved.'
          : library.user ? 'Raid saved to your account. You can add raiders now.' : 'Raid saved in this browser. You can add raiders now.',
        tone: 'success',
      })
    } catch (error) {
      const fallbackMessage = library.user
        ? 'Could not save the raid to your account.'
        : 'This browser could not save the raid locally.'
      setNotice({ text: getErrorMessage(error, fallbackMessage), tone: 'error' })
    }
  }, [draft.loadPlan, draft.plan, library.savePlan, library.user])

  const sharePlan = useCallback(async () => {
    if (!draft.plan.id || draft.dirty || draft.plan.raiders.length === 0) return

    const url = `${window.location.origin}${window.location.pathname}#plan=${encodeRaidPlan(draft.plan)}`
    try {
      await navigator.clipboard.writeText(url)
      setNotice({ text: 'Share link copied to your clipboard.', tone: 'success' })
    } catch {
      setNotice({ text: 'Could not copy the link. Try sharing from your browser menu.', tone: 'error' })
    }
  }, [draft.dirty, draft.plan])

  const newPlan = useCallback(() => {
    if (draft.dirty && !window.confirm('Discard the unsaved changes to this raid?')) return
    draft.resetPlan()
    initialSource.current = 'empty'
    const message = library.user
      ? 'New raid started. Your account raids remain available above.'
      : 'New raid started. Your previous local raid remains until you save this one.'
    setNotice({ text: message, tone: 'info' })
    setShowAddRaider(false)
    window.history.replaceState(null, '', window.location.pathname)
  }, [draft.dirty, draft.resetPlan, library.user])

  const selectPlan = useCallback((id: string) => {
    if (!id) {
      newPlan()
      return
    }
    if (draft.dirty && !window.confirm('Discard the unsaved changes and load another raid?')) return
    const selectedPlan = library.plans.find((savedPlan) => savedPlan.id === id)
    if (!selectedPlan) return
    draft.loadPlan(selectedPlan)
    initialSource.current = 'empty'
    setNotice({ text: `${selectedPlan.raid} loaded from your account.`, tone: 'info' })
    setShowAddRaider(false)
    window.history.replaceState(null, '', window.location.pathname)
  }, [draft.dirty, draft.loadPlan, library.plans, newPlan])

  const deletePlan = useCallback(async () => {
    if (!draft.plan.id || !window.confirm(`Delete ${draft.plan.raid || 'this raid'}? This cannot be undone.`)) return

    try {
      const nextPlan = await library.removePlan(draft.plan)
      draft.loadPlan(nextPlan)
      setShowAddRaider(false)
      initialSource.current = 'empty'
      window.history.replaceState(null, '', window.location.pathname)
      setNotice({ text: 'Raid deleted.', tone: 'success' })
    } catch (error) {
      setNotice({ text: getErrorMessage(error, 'Could not delete the raid.'), tone: 'error' })
    }
  }, [draft.loadPlan, draft.plan, library.removePlan])

  const addRaider = useCallback((name: string, playerClass: PlayerClass, role: RaiderRole, group: number) => {
    const error = draft.addRaider(name, playerClass, role, group)
    if (error) {
      setNotice({ text: error, tone: 'error' })
      return
    }
    setNotice({ text: `${name.trim()} added to Group ${group}. Save when the roster is ready.`, tone: 'success' })
  }, [draft.addRaider])

  const moveRaider = useCallback((raiderId: string, group: number) => {
    const error = draft.moveRaider(raiderId, group)
    setNotice(error ? { text: error, tone: 'error' } : null)
  }, [draft.moveRaider])

  const removeRaider = useCallback((raiderId: string) => {
    draft.removeRaider(raiderId)
    setNotice(null)
  }, [draft.removeRaider])

  const autoBalance = useCallback(() => {
    draft.autoBalance()
    setNotice({ text: 'Raiders distributed evenly across the available groups.', tone: 'success' })
  }, [draft.autoBalance])

  const openAddRaider = useCallback((group = 1) => {
    setAddGroup(group)
    setShowAddRaider(true)
  }, [])

  const closeAddRaider = useCallback(() => {
    setShowAddRaider(false)
  }, [])

  return {
    plan: draft.plan,
    plans: library.plans,
    dirty: draft.dirty,
    accountStorage: Boolean(library.user),
    loadingPlans: library.loadingPlans,
    busy: library.busy,
    notice,
    showAddRaider,
    addGroup,
    changeField,
    changeRaidSize,
    savePlan,
    sharePlan,
    newPlan,
    selectPlan,
    deletePlan,
    addRaider,
    moveRaider,
    removeRaider,
    autoBalance,
    openAddRaider,
    closeAddRaider,
  }
}

function readInitialPlannerState(): InitialPlannerState {
  try {
    const sharedPlan = readSharedRaidPlan(window.location.hash)
    if (sharedPlan) {
      return {
        plan: sharedPlan,
        notice: { text: 'Shared raid loaded. Save it to keep your own copy.', tone: 'info' },
        source: 'shared',
      }
    }
  } catch {
    return {
      plan: emptyRaidPlan(),
      notice: { text: 'That share link could not be opened.', tone: 'error' },
      source: 'empty',
    }
  }

  const localPlan = readLocalRaidPlan()
  if (localPlan) {
    return {
      plan: localPlan,
      notice: { text: 'Your locally saved raid has been restored.', tone: 'info' },
      source: 'local',
    }
  }

  return { plan: emptyRaidPlan(), notice: null, source: 'empty' }
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}
