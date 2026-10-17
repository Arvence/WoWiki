export type BlueRegion = 'US' | 'EU'

export interface BlueAnnouncement {
  id: string
  region: BlueRegion
  title: string
  publishedAt: string
  url?: string
}
