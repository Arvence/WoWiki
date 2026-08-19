import { useCallback, useRef, useState } from 'react'
import { HttpError } from '../../../../shared/api/http'
import { useAuth } from '../../../auth/AuthContext'
import { createRaidPlan, deleteRaidPlan, getRaidPlans, updateRaidPlan } from '../api/raidPlanService'
import { readLocalRaidPlan, removeLocalRaidPlan, writeLocalRaidPlan } from '../storage/localRaidPlanStorage'
import { createRaidPlanId, emptyRaidPlan, raidPlanFromApi, raidPlanToApiInput, sortRaidPlans, type RaidPlan } from '../types/raidPlan'

type LoadAccountPlansResult = {
  accountPlans: RaidPlan[]
  migratedPlan: RaidPlan | null
  migrationError: unknown
}

type SaveRaidPlanResult = {
  savedPlan: RaidPlan
  updatedExistingPlan: boolean
}

let localMigrationPromise: Promise<RaidPlan | null> | null = null

export function useRaidPlanLibrary() {
  const { user, loading: authLoading } = useAuth()
  const [plans, setPlans] = useState<RaidPlan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [busy, setBusy] = useState(false)
  const loadVersion = useRef(0)

  const clearAccountPlans = useCallback(() => {
    loadVersion.current += 1
    setPlans([])
    setLoadingPlans(false)
  }, [])

  const loadAccountPlans = useCallback(async (): Promise<LoadAccountPlansResult> => {
    if (!user) return { accountPlans: [], migratedPlan: null, migrationError: null }

    const version = loadVersion.current + 1
    loadVersion.current = version
    setLoadingPlans(true)
    try {
      const accountPlansPromise = getRaidPlans()
      const migrationPromise = migrateLocalRaidPlanOnce().then(
        (migratedPlan) => ({ migratedPlan, migrationError: null }),
        (migrationError: unknown) => ({ migratedPlan: null, migrationError }),
      )
      const [accountPlans, migrationResult] = await Promise.all([accountPlansPromise, migrationPromise])
      const mergedPlans = mergeRaidPlans(accountPlans.map(raidPlanFromApi), migrationResult.migratedPlan)
      if (loadVersion.current === version) setPlans(mergedPlans)
      return { accountPlans: mergedPlans, ...migrationResult }
    } catch (error) {
      handleAuthenticationError(error)
      throw error
    } finally {
      if (loadVersion.current === version) setLoadingPlans(false)
    }
  }, [user])

  const savePlan = useCallback(async (plan: RaidPlan): Promise<SaveRaidPlanResult> => {
    setBusy(true)
    try {
      const updatedExistingPlan = Boolean(user && plan.id && plans.some((savedPlan) => savedPlan.id === plan.id))
      if (!user) {
        const savedPlan = { ...plan, id: plan.id ?? createRaidPlanId(), updatedAt: new Date().toISOString() }
        writeLocalRaidPlan(savedPlan)
        return { savedPlan, updatedExistingPlan: Boolean(plan.id) }
      }

      const response = updatedExistingPlan && plan.id
        ? await updateRaidPlan(plan.id, raidPlanToApiInput(plan))
        : await createRaidPlan(raidPlanToApiInput(plan))
      const savedPlan = raidPlanFromApi(response)
      setPlans((currentPlans) => mergeRaidPlans(currentPlans, savedPlan))
      return { savedPlan, updatedExistingPlan }
    } catch (error) {
      handleAuthenticationError(error)
      throw error
    } finally {
      setBusy(false)
    }
  }, [plans, user])

  const removePlan = useCallback(async (plan: RaidPlan): Promise<RaidPlan> => {
    setBusy(true)
    try {
      if (!user || !plan.id || !plans.some((savedPlan) => savedPlan.id === plan.id)) {
        removeLocalRaidPlan()
        return emptyRaidPlan()
      }

      await deleteRaidPlan(plan.id)
      const remainingPlans = plans.filter((savedPlan) => savedPlan.id !== plan.id)
      setPlans(remainingPlans)
      return remainingPlans[0] ?? emptyRaidPlan()
    } catch (error) {
      handleAuthenticationError(error)
      throw error
    } finally {
      setBusy(false)
    }
  }, [plans, user])

  return {
    user,
    authLoading,
    plans,
    loadingPlans,
    busy,
    clearAccountPlans,
    loadAccountPlans,
    savePlan,
    removePlan,
  }
}

async function migrateLocalRaidPlan(): Promise<RaidPlan | null> {
  const localPlan = readLocalRaidPlan()
  if (!localPlan) return null

  if (!localPlan.raid || !localPlan.date || !localPlan.startTime) return null
  const migratedPlan = raidPlanFromApi(await createRaidPlan(raidPlanToApiInput({ ...localPlan, id: null })))
  removeLocalRaidPlan()
  return migratedPlan
}

function migrateLocalRaidPlanOnce(): Promise<RaidPlan | null> {
  if (!localMigrationPromise) {
    localMigrationPromise = migrateLocalRaidPlan().finally(() => {
      localMigrationPromise = null
    })
  }
  return localMigrationPromise
}

function mergeRaidPlans(plans: RaidPlan[], plan: RaidPlan | null): RaidPlan[] {
  if (!plan) return sortRaidPlans(plans)
  return sortRaidPlans([...plans.filter((savedPlan) => savedPlan.id !== plan.id), plan])
}

function handleAuthenticationError(error: unknown) {
  if (error instanceof HttpError && error.status === 401) {
    window.dispatchEvent(new Event('wowwiki:auth-expired'))
  }
}
