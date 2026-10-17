import { blueTrackerSamples } from '../data/blueTrackerSamples'
import type { BlueAnnouncement } from '../types/announcement'

export async function fetchBlueAnnouncements(): Promise<BlueAnnouncement[]> {
  return blueTrackerSamples.map((announcement) => ({ ...announcement }))
}
