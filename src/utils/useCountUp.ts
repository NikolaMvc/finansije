import { useState, useEffect, useRef } from 'react'

// Animates from 0 to target on mount only. Instant updates after that.
export function useCountUp(target: number, duration = 650): number {
  const [value, setValue] = useState(0)
  const didMount = useRef(false)

  useEffect(() => {
    if (didMount.current) {
      setValue(target)
      return
    }
    didMount.current = true

    let cancelled = false
    let start: number | null = null

    function step(ts: number) {
      if (cancelled) return
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setValue(target * eased)
      if (progress < 1) requestAnimationFrame(step)
      else setValue(target)
    }

    requestAnimationFrame(step)
    return () => { cancelled = true }
  }, [target, duration])

  return value
}
