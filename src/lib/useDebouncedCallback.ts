import { useCallback, useEffect, useRef } from 'react'

export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number,
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)
  const pendingArgsRef = useRef<Args | null>(null)

  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(
    () => () => {
      // Flush, don't drop: if the component unmounts (e.g. navigating away)
      // while a debounced save is still pending, fire it immediately instead
      // of silently discarding whatever the user just typed.
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        if (pendingArgsRef.current) callbackRef.current(...pendingArgsRef.current)
      }
    },
    [],
  )

  return useCallback(
    (...args: Args) => {
      pendingArgsRef.current = args
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        pendingArgsRef.current = null
        callbackRef.current(...args)
      }, delayMs)
    },
    [delayMs],
  )
}
