import { BadRequestException } from '@nestjs/common'

process.env.TZ = 'Europe/Berlin'

const localMinute = new Intl.DateTimeFormat('sv-SE', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
})
const hourMs = 60 * 60 * 1000

export function resolveEuScheduleTime(local: string): string {
  const calendarDate = new Date(`${local}Z`)
  if (!Number.isFinite(calendarDate.getTime()) || calendarDate.toISOString().slice(0, 16) !== local) {
    throw new BadRequestException('Choose a valid local date and time')
  }

  const instant = new Date(local)
  const expected = local.replace('T', ' ')
  if (localMinute.format(instant) !== expected || localMinute.format(instant.getTime() + hourMs) === expected) {
    throw new BadRequestException('This local time is skipped or repeated when the clocks change. Choose another time.')
  }
  return instant.toISOString()
}
