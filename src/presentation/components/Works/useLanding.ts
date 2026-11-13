import { useEffect, useState } from 'react'
import type { RefObject } from 'react'
import { prefersReducedMotion } from '@/presentation/utils/motion'

export type Phase = 'waiting' | 'landing' | 'settled'

export const LANDING_STAGGER = 130
const LANDING_TIME = 1700
const LANDING_AT = 0.35

const canAnimate = () => typeof IntersectionObserver !== 'undefined' && !prefersReducedMotion()

export function useLanding(sectionRef: RefObject<HTMLElement | null>, onLeave: () => void): Phase {
  const [phase, setPhase] = useState<Phase>(() => (canAnimate() ? 'waiting' : 'settled'))

  useEffect(() => {
    const section = sectionRef.current
    if (!section || typeof IntersectionObserver === 'undefined') return
    const still = !canAnimate()
    let timer = 0
    let waiting = true
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          window.clearTimeout(timer)
          waiting = true
          onLeave()
          if (!still) setPhase('waiting')
        } else if (!still && waiting && entry.intersectionRatio >= LANDING_AT) {
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
