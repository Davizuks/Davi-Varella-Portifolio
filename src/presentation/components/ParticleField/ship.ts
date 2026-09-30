import { blast, TIMELINE, type Particle } from './particleEngine'

export const SHIP_SPRITE = [
  '....##.........',
  '....###........',
  'ff.#######.....',
  '.f##########...',
  'ff#############',
  '.f##########...',
  'ff.#######.....',
  '....###........',
  '....##.........',
]

export const WARNING_SPRITE = [
  '.....#.....',
  '....###....',
  '....#.#....',
  '...#.#.#...',
  '...#.#.#...',
  '..#..#..#..',
  '..#..#..#..',
  '.#.......#.',
  '.#...#...#.',
  '###########',
]

export const SHIP_COLS = SHIP_SPRITE[0].length
export const SHIP_ROWS = SHIP_SPRITE.length

const SHIP_ACCEL = 1.1
const SHIP_MAX_SPEED = 8
const SHIP_DRAG = 0.82
const FIRE_COOLDOWN = 9
const BULLET_SPEED = 18
const IMPACT_FRAMES = 26

export type ShipInput = {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  fire: boolean
}

export type Ship = {
  x: number
  y: number
  vx: number
  vy: number
  cooldown: number
  pixel: number
}

export type ShipBounds = { minX: number; maxX: number; minY: number; maxY: number }
export type Bullet = { x: number; y: number }
export type Impact = { x: number; y: number; age: number }

export const shipWidth = (pixel: number) => SHIP_COLS * pixel
export const shipHeight = (pixel: number) => SHIP_ROWS * pixel

export function hoverX(avatarLeft: number, pixel: number): number {
  return Math.max(16, avatarLeft - shipWidth(pixel) - 40)
}

export function createShip(pixel: number, y: number): Ship {
  return { x: -shipWidth(pixel) - 40, y, vx: 0, vy: 0, cooldown: 0, pixel }
}

const easeOut = (x: number) => 1 - (1 - x) ** 3

export function entranceX(t: number, parkX: number, pixel: number): number {
  const start = -shipWidth(pixel) - 40
  const k = Math.min(
    1,
    Math.max(0, (t - TIMELINE.shipEnter) / (TIMELINE.shipArrive - TIMELINE.shipEnter)),
  )
  return start + (parkX - start) * easeOut(k)
}

export function steerShip(ship: Ship, input: ShipInput, bounds: ShipBounds): Bullet | null {
  if (input.up) ship.vy -= SHIP_ACCEL
  if (input.down) ship.vy += SHIP_ACCEL
  if (input.left) ship.vx -= SHIP_ACCEL
  if (input.right) ship.vx += SHIP_ACCEL
  ship.vx = Math.max(-SHIP_MAX_SPEED, Math.min(SHIP_MAX_SPEED, ship.vx * SHIP_DRAG))
  ship.vy = Math.max(-SHIP_MAX_SPEED, Math.min(SHIP_MAX_SPEED, ship.vy * SHIP_DRAG))
  ship.x = Math.max(bounds.minX, Math.min(bounds.maxX, ship.x + ship.vx))
  ship.y = Math.max(bounds.minY, Math.min(bounds.maxY, ship.y + ship.vy))
  ship.cooldown = Math.max(0, ship.cooldown - 1)
  if (!input.fire || ship.cooldown > 0) return null
  ship.cooldown = FIRE_COOLDOWN
  return { x: ship.x + shipWidth(ship.pixel), y: ship.y + shipHeight(ship.pixel) / 2 }
}

export function stepBullets(
  bullets: Bullet[],
  particles: Particle[],
  width: number,
  blastRadius: number,
  random: () => number,
): Impact[] {
  const impacts: Impact[] = []
  for (let b = bullets.length - 1; b >= 0; b--) {
    const bullet = bullets[b]
    const from = bullet.x
    bullet.x += BULLET_SPEED
    let hitAt: number | null = null
    for (const p of particles) {
      if (p.hit || p.riding || p.x < from || p.x > bullet.x || Math.abs(p.y - bullet.y) > 5) {
        continue
      }
      if (hitAt === null || p.x < hitAt) hitAt = p.x
    }
    if (hitAt !== null) {
      blast(particles, hitAt, bullet.y, blastRadius, random)
      impacts.push({ x: hitAt, y: bullet.y, age: 0 })
      bullets.splice(b, 1)
    } else if (bullet.x > width + 40) {
      bullets.splice(b, 1)
    }
  }
  return impacts
}

export function stepImpacts(impacts: Impact[]): void {
  for (let i = impacts.length - 1; i >= 0; i--) {
    impacts[i].age++
    if (impacts[i].age > IMPACT_FRAMES) impacts.splice(i, 1)
  }
}

export const impactProgress = (impact: Impact) => impact.age / IMPACT_FRAMES
