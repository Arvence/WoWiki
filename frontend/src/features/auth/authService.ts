import { http } from '../../shared/api/http'
import type { AuthUser } from './types'

export const register = (input: { displayName: string; email: string; password: string }) => http.post<AuthUser>('/api/auth/register', input, { errorMessage: 'Could not create account' })
export const login = (input: { email: string; password: string }) => http.post<AuthUser>('/api/auth/login', { ...input, rememberMe: true }, { errorMessage: 'Invalid email or password' })
export const logout = () => http.post<void>('/api/auth/logout')
export const fetchCurrentUser = () => http.get<AuthUser>('/api/auth/me')
export const updateProfile = (input: { displayName: string; email: string }) => http.patch<AuthUser>('/api/auth/me', input)
