export type Ember = { x: number; y: number; vx: number; vy: number; life: number; max: number }

const EMBER_LIFE = 34
const BUOYANCY = 0.08
const EMBER_DRAG = 0.94

export function shedEmbers(
  embers: Ember[],
  x: number,
  y: number,
  vx: number,
  vy: number,
  radius: number,
  count: number,
  random: () => number,
): void {
  const speed = Math.hypot(vx, vy) || 1
  for (let i = 0; i < count; i++) {
    const angle = random() * Math.PI * 2
    const r = Math.sqrt(random()) * radius
    const back = 0.15 + random() * 0.45
    const max = EMBER_LIFE * (0.5 + random() * 0.8)
    embers.push({
      x: x + Math.cos(angle) * r,
      y: y + Math.sin(angle) * r,
      vx: -(vx / speed) * back * speed * 0.35 + (random() - 0.5) * 2.5,
      vy: -(vy / speed) * back * speed * 0.35 + (random() - 0.5) * 2.5 - 0.8,
      life: max,
      max,
    })
  }
}

export function burstEmbers(
  embers: Ember[],
  x: number,
  y: number,
  count: number,
  random: () => number,
): void {
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI * (0.05 + random() * 0.9)
    const speed = 4 + random() * 22
    const max = EMBER_LIFE * (0.8 + random() * 1.2)
    embers.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: max,
      max,
    })
  }
}

export function stepEmbers(embers: Ember[]): void {
  for (let i = embers.length - 1; i >= 0; i--) {
    const e = embers[i]
    e.vx *= EMBER_DRAG
    e.vy = e.vy * EMBER_DRAG - BUOYANCY
    e.x += e.vx
    e.y += e.vy
    if (--e.life <= 0) embers.splice(i, 1)
  }
}

export const emberHeat = (e: Ember) => e.life / e.max

export type FlamePixel = [x: number, y: number, size: number]

const TONGUES = 9

type Point = { x: number; y: number }

function inTriangle(p: Point, a: Point, b: Point, c: Point): boolean {
  const d1 = (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y)
  const d2 = (p.x - c.x) * (b.y - c.y) - (b.x - c.x) * (p.y - c.y)
  const d3 = (p.x - a.x) * (c.y - a.y) - (c.x - a.x) * (p.y - a.y)
  const negative = d1 < 0 || d2 < 0 || d3 < 0
  const positive = d1 > 0 || d2 > 0 || d3 > 0
  return !(negative && positive)
}

export function flamePixels(
  x: number,
  y: number,
  towardX: number,
  towardY: number,
  radius: number,
  t: number,
  pixel: number,
  intensity: number,
  fan = Math.PI * 0.5,
  rise = 0.05,
): FlamePixel[] {
  const out: FlamePixel[] = []
  if (intensity <= 0) return out
  const base = Math.atan2(towardY, towardX)
  const step = Math.max(1, Math.round(pixel * 0.75))
  const seen = new Set<string>()
  for (let i = 0; i < TONGUES; i++) {
    const side = i / (TONGUES - 1) - 0.5
    const angle = base + side * fan
    const centred = 1 - Math.abs(side) * 1.4
    const flicker = 0.7 + 0.3 * Math.sin(t * 17 + i * 2.1) * Math.cos(t * 9 + i * 0.7)
    const length = radius * (1.2 + 3 * centred) * flicker * intensity
    const halfBase = radius * 0.42
    const dirX = Math.cos(angle)
    const dirY = Math.sin(angle)
    const root = { x: x + dirX * radius * 0.45, y: y + dirY * radius * 0.45 }
    const sway = Math.sin(t * 12 + i * 1.9) * radius * 0.3
    const tip = {
      x: root.x + dirX * length - dirY * sway,
      y: root.y + dirY * length + dirX * sway - length * rise,
    }
    const left = { x: root.x - dirY * halfBase, y: root.y + dirX * halfBase }
    const right = { x: root.x + dirY * halfBase, y: root.y - dirX * halfBase }
    const lerp = (a: Point, b: Point, k: number) => ({
      x: a.x + (b.x - a.x) * k,
      y: a.y + (b.y - a.y) * k,
    })
    const innerTip = lerp(root, tip, 0.62)
    const innerLeft = lerp(root, left, 0.45)
    const innerRight = lerp(root, right, 0.45)
    const minX = Math.min(tip.x, left.x, right.x)
    const maxX = Math.max(tip.x, left.x, right.x)
    const minY = Math.min(tip.y, left.y, right.y)
    const maxY = Math.max(tip.y, left.y, right.y)
    for (let py = Math.floor(minY / step) * step; py <= maxY; py += step) {
      for (let px = Math.floor(minX / step) * step; px <= maxX; px += step) {
        const p = { x: px, y: py }
        if (!inTriangle(p, tip, left, right)) continue
        if (i % 2 === 0 && inTriangle(p, innerTip, innerLeft, innerRight)) continue
        const key = `${px},${py}`
        if (seen.has(key)) continue
        seen.add(key)
        out.push([px, py, step])
      }
    }
  }
  return out
}
