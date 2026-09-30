import { useEffect, useLayoutEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigationType } from 'react-router-dom'

export default function RootLayout(): JSX.Element {
  const location = useLocation()
  const navigationType = useNavigationType()
  const positions = useRef(new Map<string, number>())
  const currentLocationKey = useRef(location.key)
  const isInitialRender = useRef(true)

  useEffect(() => {
    const saveScrollPosition = () => positions.current.set(currentLocationKey.current, window.scrollY)
    document.addEventListener('scroll', saveScrollPosition, { passive: true })
    return () => document.removeEventListener('scroll', saveScrollPosition)
  }, [])

  useLayoutEffect(() => {
    const isInitial = isInitialRender.current
    isInitialRender.current = false
    if (!isInitial && currentLocationKey.current !== location.key) {
      positions.current.set(currentLocationKey.current, window.scrollY)
    }
    currentLocationKey.current = location.key

    if (location.hash) return

    const position = !isInitial && navigationType === 'POP' ? positions.current.get(location.key) : undefined
    const frame = window.requestAnimationFrame(() => window.scrollTo(0, position ?? 0))
    return () => window.cancelAnimationFrame(frame)
  }, [location.key, location.hash, navigationType])

  return (
    <Outlet />
  )
}
