import { normalizeRaidPlan, type RaidPlan } from '../types/raidPlan'

const STORAGE_KEY = 'wowiki:raid-planner:v1'

export function readLocalRaidPlan(): RaidPlan | null {
  try {
    const savedValue = window.localStorage.getItem(STORAGE_KEY)
    return savedValue ? normalizeRaidPlan(JSON.parse(savedValue)) : null
  } catch {
    return null
  }
}

export function writeLocalRaidPlan(plan: RaidPlan): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan))
}

export function removeLocalRaidPlan(): void {
  window.localStorage.removeItem(STORAGE_KEY)
}
