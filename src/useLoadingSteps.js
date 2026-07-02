import { useState, useEffect, useRef } from 'react'

// Cycles through `steps` every `intervalMs` while `active` is true — stops
// (and resets) as soon as `active` goes false, cleared on unmount.
export function useLoadingSteps(steps, active, intervalMs = 2500) {
  const [index, setIndex] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!active) {
      setIndex(0)
      return
    }
    timerRef.current = setInterval(() => {
      setIndex(i => (i + 1 < steps.length ? i + 1 : i))
    }, intervalMs)
    return () => clearInterval(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  return steps[index]
}
