import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchCurrentUser, login as loginRequest, logout as logoutRequest, register as registerRequest, updateProfile as updateProfileRequest } from './authService'
import type { AuthUser } from './types'

type Credentials = { email: string; password: string }
type AuthContextValue = { user: AuthUser | null; loading: boolean; login(input: Credentials): Promise<void>; register(input: Credentials & { displayName: string }): Promise<void>; updateProfile(input: { displayName: string; email: string }): Promise<void>; logout(): Promise<void> }
const AuthContext = createContext<AuthContextValue | null>(null)
export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchCurrentUser().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false))
  }, [])
  useEffect(() => {
    const expire = () => setUser(null)
    window.addEventListener('wowiki:auth-expired', expire)
    return () => window.removeEventListener('wowiki:auth-expired', expire)
  }, [])
  const value = useMemo<AuthContextValue>(() => ({
    user, loading,
    async login(input) { setUser(await loginRequest(input)) },
    async register(input) { setUser(await registerRequest(input)) },
    async updateProfile(input) { setUser(await updateProfileRequest(input)) },
    async logout() { try { await logoutRequest() } finally { setUser(null) } },
  }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within AuthProvider')
  return value
}
