import { PROJECTS } from './projects'

export type LayoutName = 'desktop' | 'mobile'
export type Slot = { x: number; y: number; rot: number }
export type Pose = Slot & { scale: number }

export const LOOSE_ID = 'nota-solta'
export const PAPER_IDS: readonly string[] = [...PROJECTS.map((p) => p.id), LOOSE_ID]

export const PAPER_WIDTH: Record<string, number> = {
  'troca-ticket': 300,
  'meu-guia-pessoal': 340,
  'urban-chase': 320,
  [LOOSE_ID]: 380,
}

const FALLBACK_HEIGHT = 260

type Layout = {
  width: number
  height: number
  maxScale: number
  minScale: number
  detailLeft: number
  paperScale: number
  slots: Record<string, Slot>
  order: readonly string[]
  focus: { x: number; width: number; y?: number; top?: number }
  exile: readonly { x: number; y: number }[]
}

export const LAYOUTS: Record<LayoutName, Layout> = {
  desktop: {
    width: 1440,
    height: 1100,
    maxScale: 1.15,
    minScale: 0.55,
    detailLeft: 700,
    paperScale: 1,
    slots: {
      'troca-ticket': { x: 300, y: 760, rot: -7 },
      'meu-guia-pessoal': { x: 650, y: 690, rot: 5 },
      'urban-chase': { x: 1040, y: 800, rot: -4 },
      [LOOSE_ID]: { x: 1190, y: 600, rot: 9 },
    },
    order: [LOOSE_ID, 'troca-ticket', 'urban-chase', 'meu-guia-pessoal'],
    focus: { x: 360, y: 560, width: 420 },
    exile: [
      { x: 1260, y: 150 },
      { x: 1330, y: 930 },
      { x: 640, y: 1010 },
    ],
  },
  mobile: {
    width: 390,
    height: 844,
    maxScale: 1.25,
    minScale: 0.75,
    detailLeft: 16,
    paperScale: 0.92,
    slots: {
      'troca-ticket': { x: 190, y: 520, rot: -4 },
      'meu-guia-pessoal': { x: 170, y: 560, rot: 5 },
      'urban-chase': { x: 200, y: 640, rot: -6 },
      [LOOSE_ID]: { x: 210, y: 420, rot: 8 },
    },
    order: [LOOSE_ID, 'urban-chase', 'meu-guia-pessoal', 'troca-ticket'],
    focus: { x: 195, top: 100, width: 358 },
    exile: [
      { x: 360, y: 800 },
      { x: 20, y: 740 },
      { x: 200, y: 860 },
    ],
  },
}

export const MOBILE_BELOW = 900
export const MIN_PAPER_SCALE = 0.95
export const MAX_BOOST = 1.6

export const restScale = (view: DeskView) => LAYOUTS[view.layout].paperScale * view.boost
export const SWIPE_AWAY = 70

export type DeskView = {
  layout: LayoutName
  boost: number
  arrived: boolean
  width: number
  positions: Record<string, Slot>
  focus: string | null
  heights: Record<string, number>
}

export const paperHeight = (view: DeskView, id: string) => view.heights[id] ?? FALLBACK_HEIGHT

export const centerShift = (view: DeskView) => (view.width - LAYOUTS[view.layout].width) / 2

const spreadX = (x: number, view: DeskView) =>
  view.layout === 'desktop' ? (x * view.width) / LAYOUTS.desktop.width : x + centerShift(view)

const THROW: Record<string, Slot> = {
  'troca-ticket': { x: -520, y: -900, rot: -48 },
  'meu-guia-pessoal': { x: 120, y: -1050, rot: 36 },
  'urban-chase': { x: 480, y: -950, rot: -32 },
  [LOOSE_ID]: { x: 760, y: -850, rot: 58 },
}
const THROW_SCALE = 1.3

export function poseOf(id: string, view: DeskView): Pose {
  const layout = LAYOUTS[view.layout]
  const resting = view.positions[id] ?? layout.slots[id]
  if (view.focus === id) {
    const scale = (layout.focus.width / PAPER_WIDTH[id]) * view.boost
    const y = layout.focus.y ?? (layout.focus.top ?? 0) + (paperHeight(view, id) * scale) / 2
    return { x: layout.focus.x + centerShift(view), y, rot: 0, scale }
  }
  if (view.focus) {
    const others = PAPER_IDS.filter((p) => p !== view.focus)
    const spot = layout.exile[others.indexOf(id) % layout.exile.length]
    return { x: spreadX(spot.x, view), y: spot.y, rot: resting.rot, scale: restScale(view) }
  }
  const landed = { ...resting, x: spreadX(resting.x, view), scale: restScale(view) }
  if (view.arrived) return landed
  const from = THROW[id]
  const reach = view.layout === 'desktop' ? 1 : 0.4
  return {
    x: landed.x + from.x * reach,
    y: landed.y + from.y,
    rot: landed.rot + from.rot,
    scale: landed.scale * THROW_SCALE,
  }
}

export function detailTop(view: DeskView): number | undefined {
  const { focus } = LAYOUTS[view.layout]
  if (!view.focus || focus.top === undefined) return undefined
  const scale = (focus.width / PAPER_WIDTH[view.focus]) * view.boost
  return focus.top + paperHeight(view, view.focus) * scale + 28
}
