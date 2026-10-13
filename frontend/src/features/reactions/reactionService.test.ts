import { afterEach, describe, expect, it, vi } from 'vitest'
import { getReaction, setReaction, type ReactionTargetType } from './reactionService'

afterEach(() => vi.unstubAllGlobals())

describe('reaction requests', () => {
  it.each<ReactionTargetType>(['news', 'comments'])('loads saved state and sends explicit like/unlike requests for %s', async (targetType) => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ liked: true, likeCount: 2 }))
      .mockResolvedValueOnce(jsonResponse({ id: 'target/1', likeCount: 1 }))
      .mockResolvedValueOnce(jsonResponse({ id: 'target/1', likeCount: 1 }))
      .mockResolvedValueOnce(jsonResponse({ id: 'target/1', likeCount: 2 }))
    vi.stubGlobal('fetch', fetchMock)
    const controller = new AbortController()

    await expect(getReaction(targetType, 'target/1', controller.signal)).resolves.toEqual({ liked: true, likeCount: 2 })
    await expect(setReaction(targetType, 'target/1', false)).resolves.toEqual({ liked: false, likeCount: 1 })
    await expect(setReaction(targetType, 'target/1', false)).resolves.toEqual({ liked: false, likeCount: 1 })
    await expect(setReaction(targetType, 'target/1', true)).resolves.toEqual({ liked: true, likeCount: 2 })

    const url = `/api/${targetType}/target%2F1/like`
    expect(fetchMock).toHaveBeenNthCalledWith(1, url, expect.objectContaining({ method: 'GET', credentials: 'include', signal: controller.signal }))
    expect(fetchMock).toHaveBeenNthCalledWith(2, url, expect.objectContaining({ method: 'POST', credentials: 'include', body: '{"liked":false}' }))
    expect(fetchMock).toHaveBeenNthCalledWith(3, url, expect.objectContaining({ body: '{"liked":false}' }))
    expect(fetchMock).toHaveBeenNthCalledWith(4, url, expect.objectContaining({ body: '{"liked":true}' }))
  })

  it('keeps a failed mutation as an error instead of reporting a successful like', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })))
    await expect(setReaction('comments', '1', true)).rejects.toMatchObject({ status: 500 })
  })
})

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 })
}
