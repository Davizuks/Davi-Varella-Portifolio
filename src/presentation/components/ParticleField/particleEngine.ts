export type Target = { x: number; y: number; size: number }

export type Particle = {
  x: number
  y: number
  size: number
  tx: number
  ty: number
  ts: number
  vx: number
  vy: number
  riding: boolean
  free: boolean
  mx: number
  my: number
  delay: number
  hit: boolean
  dx: number
  dy: number
  dvx: number
  dvy: number
}

export type Box = { ox: number; oy: number; width: number; height: number; cell: number }

export const TIMELINE = {
  meteorStart: 0.5,
  meteorImpact: 1.9,
  rebuildStart: 3.15,
  shipEnter: 6.3,
  shipArrive: 7.1,
} as const

export const IMPACT_X = 0.56
const BUILD_UP = 1.6
const LAST_PIECE = 1
const PLACE_SPRING = 0.05
const PLACE_DAMPING = 0.86

const GRAVITY = 0.45
const AIR_DRAG = 0.992
const BOUNCE = 0.35
const FLOOR_FRICTION = 0.8
const IMPACT_RANGE = 7
const IMPACT_FORCE = 30
const BODY_SPRING = 0.07
const BODY_DAMPING = 0.9

const BAYER_8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
]

export function bayer(i: number, j: number): number {
  return (BAYER_8[j & 7][i & 7] + 0.5) / 64
}

const AVATAR_ROWS = 200

export function cellFor(avatarHeight: number, dpr: number): number {
  const raw = Math.min(4, avatarHeight / AVATAR_ROWS)
  const smallest = dpr >= 2 ? Math.ceil(1.5 * dpr) / dpr : 2
  return Math.max(smallest, Math.floor(raw * dpr) / dpr)
}

export function createRandom(seed = 23): () => number {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

export function targetsFromDensity(
  density: (i: number, j: number) => number,
  box: Box,
  random: () => number,
): Target[] {
  const targets: Target[] = []
  const cols = Math.floor(box.width / box.cell)
  const rows = Math.floor(box.height / box.cell)
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const v = density(i, j)
      if (v < 0) continue
      if (Math.min(1, v + (random() - 0.5) * 0.04) > bayer(i, j)) {
        targets.push({ x: box.ox + i * box.cell, y: box.oy + j * box.cell, size: box.cell / 2 })
      }
    }
  }
  return targets
}

export function densityFromImageData(data: Uint8ClampedArray, cols: number) {
  return (i: number, j: number) => {
    const k = (j * cols + i) * 4
    return data[k + 3] < 128 ? -1 : data[k] / 255
  }
}

export function meteorPosition(
  t: number,
  width: number,
  height: number,
  impactX = IMPACT_X,
): { x: number; y: number } {
  const k = Math.max(0, (t - TIMELINE.meteorStart) / (TIMELINE.meteorImpact - TIMELINE.meteorStart))
  const e = k ** 1.6
  return { x: -width * 0.08 + (impactX + 0.08) * width * e, y: -height * 0.15 + height * 1.15 * e }
}

export function meteorHeading(width: number, height: number, impactX = IMPACT_X): number {
  return Math.atan2(height * 1.15, (impactX + 0.08) * width)
}

export function impactPoint(
  width: number,
  height: number,
  impactX = IMPACT_X,
): { x: number; y: number } {
  return meteorPosition(TIMELINE.meteorImpact, width, height, impactX)
}

export function ridingPosition(
  p: Pick<Particle, 'mx' | 'my'>,
  t: number,
  width: number,
  height: number,
  turn = 0,
  impactX = IMPACT_X,
): { x: number; y: number } {
  const centre = meteorPosition(t, width, height, impactX)
  const cos = Math.cos(turn)
  const sin = Math.sin(turn)
  return { x: centre.x + p.mx * cos - p.my * sin, y: centre.y + p.mx * sin + p.my * cos }
}

export function createParticles(
  targets: Target[],
  meteor: Target[],
  width: number,
  height: number,
  random: () => number = Math.random,
  previous: Particle[] = [],
): Particle[] {
  const count = targets.length
  const top = targets.reduce((m, p) => Math.min(m, p.y), Infinity)
  const bottom = targets.reduce((m, p) => Math.max(m, p.y), -Infinity)
  const tall = Math.max(1, bottom - top)
  const particles: Particle[] = []
  for (let k = 0; k < count; k++) {
    const target = targets[k]
    const m = meteor.length ? meteor[Math.floor((k * meteor.length) / count)] : { x: 0, y: 0 }
    const old = previous.length ? previous[k % previous.length] : undefined
    const start = ridingPosition({ mx: m.x, my: m.y }, 0, width, height)
    particles.push({
      x: old ? old.x : start.x,
      y: old ? old.y : start.y,
      size: old ? old.size : target.size,
      tx: target.x,
      ty: target.y,
      ts: target.size,
      vx: old ? old.vx : 0,
      vy: old ? old.vy : 0,
      riding: old ? old.riding : true,
      free: old ? old.free : false,
      mx: m.x,
      my: m.y,
      delay: ((bottom - target.y) / tall) * BUILD_UP + random() * 0.15,
      hit: old ? old.hit : false,
      dx: 0,
      dy: 0,
      dvx: 0,
      dvy: 0,
    })
  }
  return particles
}

export type StepContext = {
  t: number
  width: number
  height: number
  pointerX: number
  pointerY: number
  random: () => number
  turn?: number
  impactX?: number
}

const POINTER_RADIUS = 110

function stepLoose(p: Particle, width: number, height: number): void {
  p.vx *= AIR_DRAG
  p.vy = p.vy * AIR_DRAG + GRAVITY
  p.x += p.vx
  p.y += p.vy
  const floor = height - p.size
  if (p.y > floor) {
    p.y = floor
    p.vy = Math.abs(p.vy) < 1.5 ? 0 : -p.vy * BOUNCE
    p.vx *= FLOOR_FRICTION
  }
  if (p.x < 0 || p.x > width - p.size) {
    p.x = Math.min(Math.max(p.x, 0), width - p.size)
    p.vx = -p.vx * 0.5
  }
}

export function stepBody(p: Particle): void {
  p.dvx = (p.dvx - p.dx * BODY_SPRING) * BODY_DAMPING
  p.dvy = (p.dvy - p.dy * BODY_SPRING) * BODY_DAMPING
  p.dx += p.dvx
  p.dy += p.dvy
}

export function stepParticle(p: Particle, ctx: StepContext): void {
  if (p.hit) {
    stepLoose(p, ctx.width, ctx.height)
    return
  }

  if (p.riding) {
    const next = ridingPosition(p, ctx.t, ctx.width, ctx.height, ctx.turn, ctx.impactX)
    const floor = ctx.height - p.size
    if (next.y < floor && ctx.t < TIMELINE.meteorImpact + LAST_PIECE) {
      p.x = next.x
      p.y = next.y
      return
    }
    p.riding = false
    p.free = true
    p.x = next.x
    p.y = Math.min(next.y, floor)
    const angle = -Math.PI * (0.05 + ctx.random() * 0.9)
    const toX = p.tx - p.x
    const toY = p.ty - p.y
    const toLen = Math.hypot(toX, toY) || 1
    const speed = 12 + ctx.random() * 20
    p.vx = (Math.cos(angle) * 0.45 + (toX / toLen) * 0.55) * speed
    p.vy = (Math.sin(angle) * 0.45 + (toY / toLen) * 0.55) * speed
  }

  if (p.free) {
    if (ctx.t < TIMELINE.rebuildStart + p.delay) {
      stepLoose(p, ctx.width, ctx.height)
      return
    }
    p.free = false
  }

  p.vx = (p.vx + (p.tx - p.x) * PLACE_SPRING) * PLACE_DAMPING
  p.vy = (p.vy + (p.ty - p.y) * PLACE_SPRING) * PLACE_DAMPING
  p.x += p.vx
  p.y += p.vy
  p.size += (p.ts - p.size) * 0.08

  const ddx = p.x + p.dx - ctx.pointerX
  const ddy = p.y + p.dy - ctx.pointerY
  const d2 = ddx * ddx + ddy * ddy
  if (d2 < POINTER_RADIUS * POINTER_RADIUS) {
    const d = Math.sqrt(d2) || 1
    const f = (1 - d / POINTER_RADIUS) * 3
    p.dvx += (ddx / d) * f
    p.dvy += (ddy / d) * f
  }
  stepBody(p)
}

export function blast(
  particles: Particle[],
  x: number,
  y: number,
  radius: number,
  random: () => number,
): number {
  let count = 0
  const r2 = radius * radius
  const range = radius * IMPACT_RANGE
  for (const p of particles) {
    if (p.hit || p.riding || p.free) continue
    const dx = p.x - x
    const dy = p.y - y
    const d2 = dx * dx + dy * dy
    if (d2 > r2) {
      if (d2 < range * range) {
        const d = Math.sqrt(d2)
        const falloff = (1 - d / range) ** 2
        p.dvx += ((dx / d) * 0.6 + 0.8) * IMPACT_FORCE * falloff
        p.dvy += (dy / d) * 0.6 * IMPACT_FORCE * falloff
      }
      continue
    }
    const d = Math.sqrt(d2) || 1
    const force = (1 - d / radius) * 10 + 4 + random() * 8
    p.hit = true
    p.vx = (dx / d) * force + 3 + random() * 4
    p.vy = (dy / d) * force - (3 + random() * 6)
    count++
  }
  return count
}

export function rebuild(particles: Particle[]): void {
  for (const p of particles) {
    p.hit = false
    p.vx = 0
    p.vy = 0
  }
}

export const WIN_DAMAGE = 0.97
export const WARNING_DAMAGE = 0.96

export function explodeFrom(
  particles: Particle[],
  x: number,
  y: number,
  random: () => number,
): void {
  for (const p of particles) {
    const angle = random() * Math.PI * 2
    const speed = 6 + random() * 18
    p.hit = false
    p.riding = false
    p.free = true
    p.x = x + (random() - 0.5) * 20
    p.y = y + (random() - 0.5) * 20
    p.vx = Math.cos(angle) * speed
    p.vy = Math.sin(angle) * speed - 4
    p.dx = p.dy = p.dvx = p.dvy = 0
  }
}

export function damage(particles: Particle[], reachY = Infinity): number {
  let total = 0
  let loose = 0
  for (const p of particles) {
    if (p.ty > reachY) continue
    total++
    if (p.hit) loose++
  }
  return total ? loose / total : 0
}

export function settle(particles: Particle[]): void {
  for (const p of particles) {
    p.x = p.tx
    p.y = p.ty
    p.size = p.ts
    p.vx = 0
    p.vy = 0
    p.riding = false
    p.free = false
    p.hit = false
  }
}
