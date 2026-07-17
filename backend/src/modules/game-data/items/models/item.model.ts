export const ITEM_QUALITIES = ['poor', 'common', 'uncommon', 'rare', 'epic', 'legendary'] as const
export type ItemQuality = (typeof ITEM_QUALITIES)[number]
export class Item {
  id!: string
  name!: string
  quality!: ItemQuality
  type!: string
  itemLevel!: number
  requiredLevel!: number
  source!: string
  description!: string
}
