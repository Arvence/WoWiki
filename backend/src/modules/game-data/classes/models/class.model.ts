export const CLASS_ROLES = ['tank', 'healer', 'damage'] as const
export type ClassRole = (typeof CLASS_ROLES)[number]

export class GameClass {
  id!: string
  name!: string
  roles!: ClassRole[]
  resource!: string
  armor!: string
  description!: string
}
