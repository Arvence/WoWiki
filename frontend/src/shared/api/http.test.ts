import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchCurrentUser, login, logout, register, updateProfile } from '../../features/auth/authService'
import { deleteBookmark, getBookmarks, saveBookmark } from '../../features/bookmarks/api/bookmarkService'
import { createCommunityComment } from '../../features/community/api/communityService'
import { getRaidPlans } from '../../features/tools/raid-planner/api/raidPlanService'
import { AUTH_EXPIRED_EVENT, http, HttpError } from './http'

const credentials = { email: 'user@example.com', password: 'ClassicWow1' }

beforeEach(() => {
  vi.stubGlobal('window', new EventTarget())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('session expiry', () => {
  it.each([
    ['load bookmarks', () => getBookmarks()],
    ['save a bookmark', () => saveBookmark('news', '1')],
    ['delete a bookmark', () => deleteBookmark('news', '1')],
    ['post a comment', () => createCommunityComment('1', { content: 'A comment' })],
    ['load raid plans', () => getRaidPlans()],
    ['load the current user', () => fetchCurrentUser()],
    ['update the profile', () => updateProfile({ displayName: 'User', email: credentials.email })],
    ['log out', () => logout()],
    ['change a password', () => http.post('/api/auth/change-password', { currentPassword: credentials.password, newPassword: 'AnotherPassword1' })],
    ['request a download', () => http.postForResponse('/api/pdf/article', {})],
  ])('expires the session once when trying to %s with a rejected session', async (_, request) => {
    const expired = vi.fn()
    window.addEventListener(AUTH_EXPIRED_EVENT, expired)
    const response = { statusCode: 401, message: 'Session expired' }
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 401 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(request()).rejects.toMatchObject({ name: 'HttpError', status: 401, message: 'Session expired', response })

    expect(expired).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ credentials: 'include' }))
    expect(fetchMock.mock.calls[0][1]).not.toHaveProperty('expireSessionOnUnauthorized')
  })

  it.each([
    ['login', () => login(credentials)],
    ['registration', () => register({ ...credentials, displayName: 'User' })],
  ])('keeps credential rejection during %s separate from session expiry', async (_, request) => {
    const expired = vi.fn()
    window.addEventListener(AUTH_EXPIRED_EVENT, expired)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })))

    await expect(request()).rejects.toBeInstanceOf(HttpError)

    expect(expired).not.toHaveBeenCalled()
  })

  it.each([400, 403, 500])('does not expire the session for HTTP %s', async (status) => {
    const expired = vi.fn()
    window.addEventListener(AUTH_EXPIRED_EVENT, expired)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status })))

    await expect(getBookmarks()).rejects.toMatchObject({ status })

    expect(expired).not.toHaveBeenCalled()
  })

  it('does not expire the session for a network failure', async () => {
    const expired = vi.fn()
    window.addEventListener(AUTH_EXPIRED_EVENT, expired)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network unavailable')))

    await expect(getBookmarks()).rejects.toMatchObject({ status: 0 })

    expect(expired).not.toHaveBeenCalled()
  })

  it('expires the session even if the unauthorized response body cannot be read', async () => {
    const expired = vi.fn()
    window.addEventListener(AUTH_EXPIRED_EVENT, expired)
    const response = new Response(null, { status: 401 })
    vi.spyOn(response, 'text').mockRejectedValue(new Error('Response body unavailable'))
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))

    await expect(getBookmarks()).rejects.toThrow('Response body unavailable')

    expect(expired).toHaveBeenCalledTimes(1)
  })

  it('preserves field validation messages without expiring the session', async () => {
    const expired = vi.fn()
    window.addEventListener(AUTH_EXPIRED_EVENT, expired)
    const problem = { status: 400, errors: { email: ['Enter a valid email address.'], password: ['Password is required.'] } }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(problem), { status: 400 })))

    await expect(login(credentials)).rejects.toMatchObject({
      status: 400,
      message: 'Enter a valid email address. Password is required.',
      response: problem,
    })

    expect(expired).not.toHaveBeenCalled()
  })

  it('keeps a successful authenticated request unchanged', async () => {
    const expired = vi.fn()
    window.addEventListener(AUTH_EXPIRED_EVENT, expired)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('[]', { status: 200 })))

    await expect(getBookmarks()).resolves.toEqual([])

    expect(expired).not.toHaveBeenCalled()
  })
})
