import { useCallback, useState } from 'react'
import { createRaidPlanId, emptyRaidPlan, type PlayerClass, type RaiderRole, type RaidPlan } from '../types/raidPlan'

export function useRaidPlanDraft(initialPlan: RaidPlan) {
  const [plan, setPlan] = useState(initialPlan)
  const [dirty, setDirty] = useState(false)

  const updatePlan = useCallback((updater: (currentPlan: RaidPlan) => RaidPlan) => {
    setPlan((currentPlan) => updater(currentPlan))
    setDirty(true)
  }, [])

  const loadPlan = useCallback((nextPlan: RaidPlan) => {
    setPlan(nextPlan)
    setDirty(false)
  }, [])

  const updateField = useCallback(<Field extends keyof RaidPlan>(field: Field, value: RaidPlan[Field]) => {
    updatePlan((currentPlan) => ({ ...currentPlan, [field]: value }))
  }, [updatePlan])

  const changeRaidSize = useCallback((raidSize: number) => {
    updatePlan((currentPlan) => ({
      ...currentPlan,
      raidSize,
      raiders: currentPlan.raiders.map((raider) => ({ ...raider, group: Math.min(raider.group, Math.ceil(raidSize / 5)) })),
    }))
  }, [updatePlan])

  const addRaider = useCallback((name: string, playerClass: PlayerClass, role: RaiderRole, group: number): string | null => {
    const trimmedName = name.trim()
    if (!trimmedName) return 'Enter a character name.'
    const duplicateRaider = plan.raiders.some(
      (raider) => raider.name.toLocaleLowerCase() === trimmedName.toLocaleLowerCase(),
    )
    if (duplicateRaider) return `${trimmedName} is already in the roster.`
    if (plan.raiders.length >= plan.raidSize) return 'The raid roster is full.'
    if (plan.raiders.filter((raider) => raider.group === group).length >= 5) return `Group ${group} is full.`

    updatePlan((currentPlan) => ({
      ...currentPlan,
      raiders: [...currentPlan.raiders, { id: createRaidPlanId(), name: trimmedName, playerClass, role, group }],
    }))
    return null
  }, [plan.raidSize, plan.raiders, updatePlan])

  const moveRaider = useCallback((memberId: string, group: number): string | null => {
    if (plan.raiders.filter((raider) => raider.group === group && raider.id !== memberId).length >= 5) return `Group ${group} is full.`

    updatePlan((currentPlan) => ({
      ...currentPlan,
      raiders: currentPlan.raiders.map((raider) => raider.id === memberId ? { ...raider, group } : raider),
    }))
    return null
  }, [plan.raiders, updatePlan])

  const removeRaider = useCallback((memberId: string) => {
    updatePlan((currentPlan) => ({ ...currentPlan, raiders: currentPlan.raiders.filter((raider) => raider.id !== memberId) }))
  }, [updatePlan])

  const autoBalance = useCallback(() => {
    const groupCount = Math.ceil(plan.raidSize / 5)
    updatePlan((currentPlan) => ({
      ...currentPlan,
      raiders: currentPlan.raiders.map((raider, index) => ({ ...raider, group: (index % groupCount) + 1 })),
    }))
  }, [plan.raidSize, updatePlan])

  const resetPlan = useCallback(() => {
    loadPlan(emptyRaidPlan())
  }, [loadPlan])

  return {
    plan,
    dirty,
    updateField,
    changeRaidSize,
    addRaider,
    moveRaider,
    removeRaider,
    autoBalance,
    loadPlan,
    resetPlan,
  }
}
