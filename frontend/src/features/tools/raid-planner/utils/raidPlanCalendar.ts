import type { RaidPlan } from '../types/raidPlan'

export function buildRaidCalendarUrl(plan: RaidPlan): string {
  const parameters = new URLSearchParams({
    action: 'TEMPLATE',
    text: plan.raid ? `WoWiki Raid: ${plan.raid}` : 'WoWiki Raid',
    details: plan.notes || `Raid roster for ${plan.raid || 'WoWiki'}`,
  })

  if (plan.date && plan.startTime) {
    const start = new Date(`${plan.date}T${plan.startTime}:00`)
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000)
    parameters.set('dates', `${formatCalendarDate(start)}/${formatCalendarDate(end)}`)
  }

  return `https://calendar.google.com/calendar/render?${parameters.toString()}`
}

function formatCalendarDate(date: Date): string {
  const calendarDay = `${date.getFullYear()}${twoDigits(date.getMonth() + 1)}${twoDigits(date.getDate())}`
  const calendarTime = `${twoDigits(date.getHours())}${twoDigits(date.getMinutes())}00`
  return `${calendarDay}T${calendarTime}`
}

function twoDigits(value: number): string {
  return String(value).padStart(2, '0')
}
