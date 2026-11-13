import { useEffect, useState } from 'react'
import type { RefObject } from 'react'
import { prefersReducedMotion } from '@/presentation/utils/motion'

export type Phase = 'waiting' | 'landing' | 'settled'

export const LANDING_STAGGER = 130
const LANDING_TIME = 1700
const LANDING_AT = 0.35

export function useLanding(sectionRef: RefObject<HTMLElement | null>, onLeave: () => void): Phase {
  const [phase, setPhase] = useState<Phase>('waiting')

  useEffect(() => {
    const section = sectionRef.current
    if (!section || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      setPhase('settled')
      return
    }
    let timer = 0
    let waiting = true
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          window.clearTimeout(timer)
          waiting = true
          onLeave()
          setPhase('waiting')
        } else if (waiting && entry.intersectionRatio >= LANDING_AT) {
          waiting = false
          setPhase('landing')
          timer = window.setTimeout(() => setPhase('settled'), LANDING_TIME)
        }
      },
      { threshold: [0, LANDING_AT] },
    )
    observer.observe(section)
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [sectionRef, onLeave])

  return phase
}
