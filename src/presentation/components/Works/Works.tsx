import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import {
  centerShift,
  detailTop,
  LAYOUTS,
  LOOSE_ID,
  PAPER_IDS,
  PAPER_WIDTH,
  poseOf,
  SWIPE_AWAY,
  type DeskView,
  type LayoutName,
  type Slot,
} from './desk'
import { padIndex } from './format'
import { PaperContent } from './PaperContent'
import { ALL_PROJECTS_COUNT, ALL_PROJECTS_URL, LOOSE_NOTE, PROJECTS } from './projects'
import { useDeskCanvas, type LiveDesk } from './useDeskCanvas'
import { LANDING_STAGGER, useLanding } from './useLanding'
import { useStage } from './useStage'
import styles from './Works.module.css'

const DRAG_THRESHOLD = 5
const SWIPE_STEP = 48

type Drag = {
  id: string
  pointer: number
  startX: number
  startY: number
  origin: Slot
  moved: boolean
}
type Desk = { positions: Record<string, Slot>; order: readonly string[] }

const INITIAL_DESKS: Record<LayoutName, Desk> = {
  desktop: { positions: LAYOUTS.desktop.slots, order: LAYOUTS.desktop.order },
  mobile: { positions: LAYOUTS.mobile.slots, order: LAYOUTS.mobile.order },
}

const neighbour = (index: number, delta: number) =>
  PROJECTS[(index + delta + PROJECTS.length) % PROJECTS.length].id

export function Works() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const papers = useRef(new Map<string, HTMLElement>())
  const drag = useRef<Drag | null>(null)
  const suppressClick = useRef(false)
  const swipe = useRef<{ x: number; y: number } | null>(null)

  const [desks, setDesks] = useState(INITIAL_DESKS)
  const [focus, setFocus] = useState<string | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [heights, setHeights] = useState<Record<string, number>>({})

  const stage = useStage(sectionRef)
  const closeFocus = useCallback(() => setFocus(null), [setFocus])
  const phase = useLanding(sectionRef, closeFocus)
  const { positions, order } = desks[stage.layout]
  const arrange = (change: (desk: Desk) => Desk) =>
    setDesks((prev) => ({ ...prev, [stage.layout]: change(prev[stage.layout]) }))
  const layout = LAYOUTS[stage.layout]
  const isMobile = stage.layout === 'mobile'
  const arrived = phase !== 'waiting'

  const view: DeskView = useMemo(
    () => ({
      layout: stage.layout,
      width: stage.width,
      boost: stage.boost,
      arrived,
      positions,
      focus,
      heights,
    }),
    [stage.layout, stage.width, stage.boost, arrived, positions, focus, heights],
  )
  const live = useRef<LiveDesk>({ view, scale: stage.scale })
  useLayoutEffect(() => {
    live.current = { view, scale: stage.scale }
  })
  useDeskCanvas({ sectionRef, canvasRef, papers, live })

  useLayoutEffect(() => {
    const measure = () => {
      const next: Record<string, number> = {}
      for (const [id, el] of papers.current) next[id] = el.offsetHeight
      setHeights((prev) =>
        PAPER_IDS.every((id) => prev[id] === next[id]) || !Object.values(next).some(Boolean)
          ? prev
          : next,
      )
    }
    measure()
    document.fonts?.ready.then(measure).catch(() => {})
  }, [stage.layout])

  const opened = useRef<string | null>(null)
  useEffect(() => {
    const previous = opened.current
    opened.current = focus
    if (focus && !previous) closeRef.current?.focus({ preventScroll: true })
    if (!focus && previous) papers.current.get(previous)?.focus({ preventScroll: true })
  }, [focus])

  useEffect(() => {
    if (!focus) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocus(null)
      const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
      const elsewhere =
        e.target instanceof Element &&
        e.target.closest('input, textarea, select, [contenteditable="true"]')
      if (!delta || e.altKey || e.ctrlKey || e.metaKey || elsewhere) return
      e.preventDefault()
      setFocus(
        neighbour(
          PROJECTS.findIndex((p) => p.id === focus),
          delta,
        ),
      )
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [focus])

  const onPointerDown = (e: PointerEvent<HTMLElement>, id: string) => {
    if (focus || phase !== 'settled' || e.button !== 0 || drag.current) return
    suppressClick.current = false
    e.currentTarget.setPointerCapture?.(e.pointerId)
    drag.current = {
      id,
      pointer: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origin: positions[id] ?? layout.slots[id],
      moved: false,
    }
    if (!isMobile)
      arrange((desk) => ({ ...desk, order: [...desk.order.filter((p) => p !== id), id] }))
  }

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current
    if (!d || d.pointer !== e.pointerId) return
    const dx = (e.clientX - d.startX) / stage.scale
    const dy = (e.clientY - d.startY) / stage.scale
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
    d.moved = true
    setDragging(d.id)
    const spread = isMobile ? 1 : stage.width / layout.width
    const x = Math.min(layout.width, Math.max(0, d.origin.x + dx / spread))
    const y = Math.min(layout.height, Math.max(0, d.origin.y + dy))
    arrange((desk) => ({
      ...desk,
      positions: { ...desk.positions, [d.id]: { ...d.origin, x, y } },
    }))
  }

  const endDrag = (e: PointerEvent<HTMLElement>, cancelled: boolean) => {
    const d = drag.current
    if (!d || d.pointer !== e.pointerId) return
    drag.current = null
    setDragging(null)
    if (!d.moved) return
    suppressClick.current = !cancelled
    if (!isMobile) return
    const dx = (e.clientX - d.startX) / stage.scale
    const dy = (e.clientY - d.startY) / stage.scale
    const sentBack = !cancelled && Math.hypot(dx, dy) > SWIPE_AWAY
    arrange((desk) => ({
      positions: { ...desk.positions, [d.id]: d.origin },
      order: sentBack ? [d.id, ...desk.order.filter((p) => p !== d.id)] : desk.order,
    }))
  }

  const open = (id: string) => {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    setFocus(id)
  }

  const paperProps = (id: string) => {
    const pose = poseOf(id, view)
    return {
      ref: (el: HTMLElement | null) => {
        if (el) papers.current.set(id, el)
        else papers.current.delete(id)
      },
      'data-dragging': dragging === id,
      'data-focused': focus === id,
      style: {
        width: PAPER_WIDTH[id],
        zIndex: focus === id ? 10 : order.indexOf(id) + 2,
        transitionDelay:
          phase === 'landing' ? `${order.indexOf(id) * LANDING_STAGGER}ms` : undefined,
        transform: `translate(${pose.x}px, ${pose.y}px) translate(-50%, -50%) rotate(${pose.rot}deg) scale(${pose.scale})`,
      },
      onPointerDown: (e: PointerEvent<HTMLElement>) => onPointerDown(e, id),
      onPointerMove,
      onPointerUp: (e: PointerEvent<HTMLElement>) => endDrag(e, false),
      onPointerCancel: (e: PointerEvent<HTMLElement>) => endDrag(e, true),
    }
  }

  const focusIndex = PROJECTS.findIndex((p) => p.id === focus)
  const focused = focusIndex >= 0 ? PROJECTS[focusIndex] : null
  const step = (delta: number) => setFocus(neighbour(focusIndex, delta))

  const onSwipeStart = (e: PointerEvent<HTMLElement>) => {
    swipe.current =
      focused && isMobile && e.pointerType !== 'mouse' ? { x: e.clientX, y: e.clientY } : null
  }
  const onSwipeEnd = (e: PointerEvent<HTMLElement>) => {
    const start = swipe.current
    swipe.current = null
    if (!start || !focused) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.abs(dx) < SWIPE_STEP || Math.abs(dx) < Math.abs(dy) * 1.5) return
    step(dx < 0 ? 1 : -1)
  }

  const topProject = [...order].reverse().find((id) => id !== LOOSE_ID)
  const topIndex = PROJECTS.findIndex((p) => p.id === topProject)
  const total = padIndex(PROJECTS.length)
  const stageStyle = {
    width: stage.width,
    height: layout.height,
    zoom: stage.scale,
    '--scale': stage.scale,
  } as CSSProperties

  return (
    <section
      id="trabalhos"
      ref={sectionRef}
      className={styles.works}
      aria-labelledby="trabalhos-titulo"
      style={{ height: layout.height * stage.scale }}
    >
      <div
        className={styles.stage}
        data-layout={stage.layout}
        data-focus={Boolean(focus)}
        data-phase={phase}
        onPointerDown={onSwipeStart}
        onPointerUp={onSwipeEnd}
        onPointerCancel={() => {
          swipe.current = null
        }}
        style={stageStyle}
      >
        <span className={styles.label}>[02] Trabalhos</span>
        <h2 id="trabalhos-titulo" className={`${styles.title} ${styles.fade}`}>
          Trabalhos <em>selecionados</em>
        </h2>
        <span className={`${styles.count} ${styles.fade}`} aria-hidden="true">
          ({total})
        </span>

        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

        {PROJECTS.map((project, i) => (
          <button
            key={project.id}
            type="button"
            className={`${styles.paper} ${styles[project.kind]}`}
            aria-label={`${project.title} — abrir projeto`}
            aria-expanded={focus === project.id}
            onClick={() => open(project.id)}
            {...paperProps(project.id)}
          >
            <span className={styles.sheet} aria-hidden="true" />
            <PaperContent project={project} index={i} />
          </button>
        ))}
        <div
          className={`${styles.paper} ${styles.loose}`}
          aria-hidden="true"
          {...paperProps(LOOSE_ID)}
        >
          <span className={styles.sheet} aria-hidden="true" />
          <span className={styles.tag}>s/n — nota solta</span>
          <span className={styles.quote}>{LOOSE_NOTE}</span>
        </div>

        <span className={`${styles.hint} ${styles.fade}`}>
          <span className={styles.full}>Arraste os papéis. A ordem é sua.</span>
          <span className={styles.short}>Arraste o de cima. Toque para abrir.</span>
        </span>
        <span className={`${styles.pile} ${styles.fade}`} aria-hidden="true">
          {padIndex(topIndex + 1)} / {total}
        </span>
        <a
          className={`${styles.all} ${styles.fade}`}
          href={ALL_PROJECTS_URL}
          target="_blank"
          rel="noreferrer"
        >
          Todos os projetos ({ALL_PROJECTS_COUNT}) →
        </a>

        {focused && (
          <>
            <button
              ref={closeRef}
              type="button"
              className={styles.close}
              onClick={() => setFocus(null)}
            >
              <span className={styles.full}>Fechar (Esc) ×</span>
              <span className={styles.short}>Fechar ×</span>
            </button>
            <div
              className={styles.detail}
              style={{ top: detailTop(view), left: layout.detailLeft + centerShift(view) }}
              role="group"
              aria-label={focused.title}
            >
              <p className={styles.detailMeta}>
                <span>
                  {padIndex(focusIndex + 1)} / {total}
                </span>
                <span className={styles.short}>
                  {focused.shortTags} · {focused.year}
                </span>
              </p>
              <h3 className={styles.detailTitle}>{focused.title}</h3>
              <p className={`${styles.detailTags} ${styles.full}`}>
                {focused.tags} · {focused.year}
              </p>
              <p className={styles.description}>{focused.description}</p>
              <a className={styles.link} href={focused.url} target="_blank" rel="noreferrer">
                Abrir projeto <span aria-hidden="true">↗</span>
              </a>
            </div>
            <button
              type="button"
              className={`${styles.step} ${styles.prev}`}
              onClick={() => step(-1)}
            >
              ← Anterior
            </button>
            <button
              type="button"
              className={`${styles.step} ${styles.next}`}
              onClick={() => step(1)}
            >
              Próximo →
            </button>
          </>
        )}
      </div>
    </section>
  )
}
