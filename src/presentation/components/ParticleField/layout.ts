import {
  cellFor,
  createRandom,
  densityFromImageData,
  targetsFromDensity,
  type Box,
  type Target,
} from './particleEngine'

export const MOBILE_BREAKPOINT = 760
export const MOBILE_GAME_TOP = 64

const METEOR_ROCK = { x: 0.736, y: 0.712, radius: 0.186 }
export const METEOR_DRAWN_HEADING = Math.atan2(0.617, 0.656)

export const isPhone = (width: number) => width < MOBILE_BREAKPOINT

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function mobileGameHeight(viewportHeight: number): number {
  return Math.round(Math.min(470, Math.max(340, viewportHeight * 0.56)))
}

export function avatarBox(width: number, height: number, dpr: number, gameHeight: number): Box {
  if (isPhone(width)) {
    const boxHeight = gameHeight - MOBILE_GAME_TOP
    return {
      ox: Math.round(width * 0.2),
      oy: MOBILE_GAME_TOP,
      width: width * 0.8,
      height: boxHeight,
      cell: cellFor(boxHeight * 0.98, dpr),
    }
  }
  const boxHeight = height - 40
  return {
    ox: Math.round(width * 0.39),
    oy: 40,
    width: width * 0.61,
    height: boxHeight,
    cell: cellFor(boxHeight * 0.78, dpr),
  }
}

type DrawInto = (ctx: CanvasRenderingContext2D) => void

function readDensity(cols: number, rows: number, draw: DrawInto) {
  const off = document.createElement('canvas')
  off.width = cols
  off.height = rows
  const o = off.getContext('2d', { willReadFrequently: true })
  if (!o) return null
  draw(o)
  return densityFromImageData(o.getImageData(0, 0, cols, rows).data, cols)
}

export function avatarTargets(img: HTMLImageElement, box: Box, phone: boolean): Target[] {
  const cols = Math.floor(box.width / box.cell)
  const rows = Math.floor(box.height / box.cell)
  const scale = (rows * (phone ? 0.98 : 0.78)) / (img.height * 0.8)
  const w = img.width * scale
  const h = img.height * scale
  const density = readDensity(cols, rows, (o) =>
    o.drawImage(img, cols * (phone ? 0.52 : 0.5) - w * 0.41, rows - h * 0.8, w, h),
  )
  return density ? targetsFromDensity(density, box, createRandom()) : []
}

export function meteorTargets(img: HTMLImageElement, rock: number, cell: number): Target[] {
  const size = rock / METEOR_ROCK.radius
  const cols = Math.floor(size / cell)
  const density = readDensity(cols, cols, (o) => o.drawImage(img, 0, 0, cols, cols))
  if (!density) return []
  const box = {
    ox: -METEOR_ROCK.x * cols * cell,
    oy: -METEOR_ROCK.y * cols * cell,
    width: cols * cell,
    height: cols * cell,
    cell,
  }
  return targetsFromDensity(density, box, createRandom(7))
}

export type AvatarBounds = {
  top: number
  left: number
  centerY: number
  headCenterX: number
}

export function avatarBounds(targets: Target[]): AvatarBounds {
  let top = Infinity
  let bottom = -Infinity
  let left = Infinity
  let sumY = 0
  for (const p of targets) {
    top = Math.min(top, p.y)
    bottom = Math.max(bottom, p.y)
    left = Math.min(left, p.x)
    sumY += p.y
  }
  const headLimit = top + (bottom - top) * 0.45
  let headLeft = Infinity
  let headRight = -Infinity
  for (const p of targets) {
    if (p.y >= headLimit) continue
    headLeft = Math.min(headLeft, p.x)
    headRight = Math.max(headRight, p.x)
  }
  return { top, left, centerY: sumY / targets.length, headCenterX: (headLeft + headRight) / 2 }
}
