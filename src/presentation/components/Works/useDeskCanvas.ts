import { useEffect } from 'react'
import type { RefObject } from 'react'
import { prefersReducedMotion } from '@/presentation/utils/motion'
import {
  LAYOUTS,
  PAPER_IDS,
  PAPER_WIDTH,
  paperHeight,
  poseOf,
  restScale,
  type DeskView,
  type LayoutName,
} from './desk'
import { padIndex } from './format'
import {
  createGlyph,
  createParticles,
  drawCloud,
  drawNoise,
  smoothstep,
  type Cloud,
  type Glyph,
  type Pointer,
} from './particles'
import { PROJECTS } from './projects'

const PARTICLES_PER_PAPER = 700
const NOISE_PARTICLES = 420
const MAX_CANVAS_PIXELS = 2_400_000
const DISSOLVED = 0.45
const GLYPH_FONT = "'Instrument Serif', 'Times New Roman', serif"
const GLYPH: Record<LayoutName, { size: number; right: number; bottom: number }> = {
  desktop: { size: 460, right: 70, bottom: 30 },
  mobile: { size: 210, right: 14, bottom: 44 },
}

export type LiveDesk = { view: DeskView; scale: number }

type DeskCanvas = {
  sectionRef: RefObject<HTMLElement | null>
  canvasRef: RefObject<HTMLCanvasElement | null>
  papers: RefObject<Map<string, HTMLElement>>
  live: RefObject<LiveDesk>
}

function pixelRatio(view: DeskView, scale: number): number {
  const ratio = scale * Math.min(window.devicePixelRatio || 1, 2)
  const pixels = view.width * LAYOUTS[view.layout].height * ratio * ratio
  return pixels > MAX_CANVAS_PIXELS ? ratio * Math.sqrt(MAX_CANVAS_PIXELS / pixels) : ratio
}

export function useDeskCanvas({ sectionRef, canvasRef, papers, live }: DeskCanvas): void {
  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!section || !canvas || !ctx) return

    const reduced = prefersReducedMotion()
    const follow = reduced ? 1 : 0.09
    const clouds = PAPER_IDS.map((id, i) => ({
      id,
      particles: createParticles(PARTICLES_PER_PAPER, 7 + i * 13),
      cloud: { x: 0, y: 0, w: 0, h: 0, rot: 0, form: 1 } as Cloud,
      placed: false,
      shown: '',
      interactive: true,
    }))
    const noise = createParticles(NOISE_PARTICLES, 99)

    let frameId = 0
    let running = false
    let visible = true
    let pointer: Pointer | null = null
    let glyph: Glyph | null = null
    let glyphKey = ''
    let gathered = 0

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const rect = section.getBoundingClientRect()
      const { scale } = live.current
      pointer = { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale }
    }
    const onPointerLeave = () => {
      pointer = null
    }
    section.addEventListener('pointermove', onPointerMove)
    section.addEventListener('pointerleave', onPointerLeave)

    const gatherGlyph = (view: DeskView) => {
      const focusNumber = PROJECTS.findIndex((p) => p.id === view.focus) + 1
      const wanted = focusNumber ? `${view.layout}:${focusNumber}` : ''
      if (wanted === glyphKey) {
        gathered += ((wanted ? 1 : 0) - gathered) * (reduced ? 1 : 0.035)
        return
      }
      gathered -= gathered * (reduced ? 1 : 0.12)
      if (gathered >= 0.04) return
      glyphKey = wanted
      glyph = wanted
        ? createGlyph(padIndex(focusNumber), GLYPH[view.layout].size, GLYPH_FONT)
        : null
    }

    const frame = (now: number) => {
      if (!visible) {
        running = false
        return
      }
      const { view, scale } = live.current
      const design = LAYOUTS[view.layout]
      const ratio = pixelRatio(view, scale)
      const width = Math.round(view.width * ratio)
      const height = Math.round(design.height * ratio)
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      const time = reduced ? 0 : now / 1000

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      ctx.clearRect(0, 0, view.width, design.height)
      ctx.fillStyle = '#fff'
      drawNoise(ctx, noise, view.width, design.height, time)

      gatherGlyph(view)
      const spot = GLYPH[view.layout]
      let gatherIndex = 0

      for (const item of clouds) {
        const pose = poseOf(item.id, view)
        const goal = !view.focus || view.focus === item.id ? 1 : DISSOLVED
        const c = item.cloud
        const pull = item.placed ? follow : 1
        c.x += (pose.x - c.x) * pull
        c.y += (pose.y - c.y) * pull
        c.rot += (pose.rot - c.rot) * pull
        c.w = PAPER_WIDTH[item.id] * restScale(view)
        c.h = paperHeight(view, item.id) * restScale(view)
        c.form += (goal - c.form) * (reduced ? 1 : 0.07)
        item.placed = true

        const gather =
          glyph && view.focus !== item.id
            ? {
                glyph,
                start: gatherIndex++ * PARTICLES_PER_PAPER,
                x: view.width - glyph.width - spot.right,
                y: design.height - glyph.height - spot.bottom,
                mix: gathered,
              }
            : null
        drawCloud(ctx, item.particles, c, time, gather, pointer)

        const opacity = smoothstep(0.7, 1, c.form).toFixed(2)
        const el = papers.current.get(item.id)
        const interactive = c.form > 0.6
        if (el && opacity !== item.shown) {
          item.shown = opacity
          el.style.opacity = opacity
        }
        if (el && interactive !== item.interactive) {
          item.interactive = interactive
          el.style.pointerEvents = interactive ? '' : 'none'
        }
      }
      ctx.globalAlpha = 1
      frameId = requestAnimationFrame(frame)
    }
    const start = () => {
      if (running) return
      running = true
      frameId = requestAnimationFrame(frame)
    }

    let observer: IntersectionObserver | null = null
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
        if (visible) start()
      })
      observer.observe(section)
    }
    start()

    return () => {
      cancelAnimationFrame(frameId)
      observer?.disconnect()
      section.removeEventListener('pointermove', onPointerMove)
      section.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [sectionRef, canvasRef, papers, live])
}
