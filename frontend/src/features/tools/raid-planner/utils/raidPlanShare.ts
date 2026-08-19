import { normalizeRaidPlan, type RaidPlan } from '../types/raidPlan'

export function encodeRaidPlan(plan: RaidPlan): string {
  const bytes = new TextEncoder().encode(JSON.stringify(plan))
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

export function readSharedRaidPlan(hash: string): RaidPlan | null {
  const sharedValue = new URLSearchParams(hash.replace(/^#/, '')).get('plan')
  if (!sharedValue) return null

  const base64 = sharedValue.replaceAll('-', '+').replaceAll('_', '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
  const sharedPlan = normalizeRaidPlan(JSON.parse(new TextDecoder().decode(bytes)))
  return sharedPlan ? { ...sharedPlan, id: null, updatedAt: null } : null
}
