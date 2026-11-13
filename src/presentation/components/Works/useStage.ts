import { useLayoutEffect, useState } from 'react'
import type { RefObject } from 'react'
import { LAYOUTS, MAX_BOOST, MIN_PAPER_SCALE, MOBILE_BELOW, type LayoutName } from './desk'

export type Stage = { layout: LayoutName; scale: number; width: number; boost: number }

const INITIAL: Stage = { layout: 'desktop', scale: 1, width: LAYOUTS.desktop.width, boost: 1 }

function fit(sectionWidth: number, viewportHeight: number): Stage {
  const layout: LayoutName = sectionWidth < MOBILE_BELOW ? 'mobile' : 'desktop'
  const design = LAYOUTS[layout]
  const contained = Math.min(sectionWidth / design.width, viewportHeight / design.height)
  const scale = Math.min(design.maxScale, Math.max(design.minScale, contained))
  const boost = layout === 'desktop' ? Math.min(MAX_BOOST, Math.max(1, MIN_PAPER_SCALE / scale)) : 1
  return { layout, scale, width: Math.max(design.width, sectionWidth / scale), boost }
}

export function useStage(sectionRef: RefObject<HTMLElement | null>): Stage {
  const [stage, setStage] = useState<Stage>(INITIAL)

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const measure = () => {
      const width = section.clientWidth
      if (!width) return
      setStage(fit(width, document.documentElement.clientHeight || Infinity))
    }
    measure()
    window.addEventListener('resize', measure)
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(section)
    return () => {
      window.removeEventListener('resize', measure)
      observer?.disconnect()
    }
  }, [sectionRef])

  return stage
}
