import { emberHeat, type Ember, type FlamePixel } from './fire'
import type { Particle } from './particleEngine'
import { impactProgress, shipHeight, shipWidth, type Bullet, type Impact, type Ship } from './ship'

export type Painter = {
  ctx: CanvasRenderingContext2D
  dpr: number
  pixel: number
}

export const snapTo = (dpr: number) => (v: number) => Math.round(v * dpr) / dpr

export function clear({ ctx }: Painter, width: number, height: number): void {
  ctx.clearRect(-40, -40, width + 80, height + 80)
  ctx.fillStyle = '#fff'
}

export function drawParticles({ ctx, dpr }: Painter, particles: Particle[]): void {
  const snap = snapTo(dpr)
  for (const p of particles) {
    const size = Math.max(1, Math.round(p.size * dpr)) / dpr
    ctx.fillRect(snap(p.x + p.dx), snap(p.y + p.dy), size, size)
  }
}

function drawSprite(
  { ctx, pixel }: Painter,
  sprite: string[],
  x: number,
  y: number,
  lit: (c: string) => boolean,
  snap: (v: number) => number = (v) => v,
): void {
  sprite.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      if (lit(row[i])) ctx.fillRect(snap(x + i * pixel), snap(y + j * pixel), pixel, pixel)
    }
  })
}

export function drawShip(
  painter: Painter,
  sprite: string[],
  ship: Ship,
  angle: number,
  flame: boolean,
): void {
  const { ctx, dpr, pixel } = painter
  const snap = snapTo(dpr)
  const w = shipWidth(pixel)
  const h = shipHeight(pixel)
  ctx.save()
  ctx.translate(snap(ship.x + w / 2), snap(ship.y + h / 2))
  ctx.rotate(angle)
  drawSprite(painter, sprite, -w / 2, -h / 2, (c) => c === '#' || (c === 'f' && flame))
  ctx.restore()
}

export function drawWarning(painter: Painter, sprite: string[], ship: Ship): void {
  const { pixel, dpr } = painter
  const x = ship.x + shipWidth(pixel) / 2 - (sprite[0].length * pixel) / 2
  const y = ship.y - (sprite.length + 3) * pixel
  drawSprite(painter, sprite, x, y, (c) => c === '#', snapTo(dpr))
}

export function drawBullets({ ctx, dpr, pixel }: Painter, bullets: Bullet[]): void {
  const snap = snapTo(dpr)
  for (const b of bullets) {
    ctx.fillRect(snap(b.x - pixel * 6), snap(b.y - pixel / 4), pixel * 6, pixel / 2)
  }
}

export function drawImpacts({ ctx, dpr, pixel }: Painter, impacts: Impact[]): void {
  const snap = snapTo(dpr)
  for (const impact of impacts) {
    const radius = pixel * 2 + impactProgress(impact) * pixel * 12
    for (let a = 0; a < 12; a++) {
      const angle = (a / 12) * Math.PI * 2
      ctx.fillRect(
        snap(impact.x + Math.cos(angle) * radius),
        snap(impact.y + Math.sin(angle) * radius),
        pixel / 2,
        pixel / 2,
      )
    }
  }
}

export function drawEmbers({ ctx, dpr, pixel }: Painter, embers: Ember[]): void {
  const snap = snapTo(dpr)
  for (const e of embers) {
    const heat = emberHeat(e)
    if (Math.random() > 0.35 + heat * 0.6) continue
    const size = Math.max(1, pixel * heat * (0.6 + Math.random() * 0.8))
    ctx.fillRect(snap(e.x), snap(e.y), size, size)
  }
}

export function drawFlames({ ctx, dpr }: Painter, pixels: FlamePixel[]): void {
  const snap = snapTo(dpr)
  for (const [x, y, size] of pixels) ctx.fillRect(snap(x), snap(y), size, size)
}

export function drawCrashRings(
  { ctx, dpr, pixel }: Painter,
  at: { x: number; y: number },
  progress: number,
  width: number,
): void {
  const snap = snapTo(dpr)
  const reach = Math.max(width, 900) * 0.8
  const count = 48
  for (let ring = 0; ring < 3; ring++) {
    const k = progress - ring * 0.12
    const size = pixel * (1.4 - k)
    if (k <= 0 || size <= 0) continue
    const radius = 30 + k * reach
    for (let a = 0; a < count; a++) {
      const angle = Math.PI + (a / (count - 1)) * Math.PI
      ctx.fillRect(
        snap(at.x + Math.cos(angle) * radius),
        snap(at.y + Math.sin(angle) * radius * 0.3),
        size,
        size,
      )
    }
  }
}
