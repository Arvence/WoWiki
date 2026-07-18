export type AuthUser = {
  id: string
  displayName: string
  email: string
  createdAtUtc: string
  roles: string[]
}

export type AuthenticatedRequest = Request & { user: AuthUser }
