export const smoothstep = (from: number, to: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)))
  return t * t * (3 - 2 * t)
}

const PER_PARTICLE = 5
const SCATTER = 320

export type Cloud = { x: number; y: number; w: number; h: number; rot: number; form: number }

function seeded(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

export function createParticles(count: number, seed: number): Float32Array {
  const random = seeded(seed)
  const gauss = () => {
    let sum = 0
    for (let i = 0; i < 6; i++) sum += random()
    return (sum - 3) / 0.707
  }
  const data = new Float32Array(count * PER_PARTICLE)
  for (let i = 0; i < count; i++) {
    const o = i * PER_PARTICLE
    data[o] = random() - 0.5
    data[o + 1] = random() - 0.5
    data[o + 2] = gauss() * SCATTER
    data[o + 3] = gauss() * SCATTER
    data[o + 4] = random() * Math.PI * 2
  }
  return data
}

export type Glyph = { points: Float32Array; width: number; height: number }
export type Gather = { glyph: Glyph; start: number; x: number; y: number; mix: number }
export type Pointer = { x: number; y: number }

const GLYPH_STEP = 4
const REPEL_RADIUS = 130
const REPEL_PUSH = 46

export function createGlyph(text: string, fontSize: number, font: string): Glyph | null {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.font = `italic 400 ${fontSize}px ${font}`
  const width = Math.ceil(ctx.measureText(text).width + fontSize * 0.2)
  const height = Math.ceil(fontSize * 1.05)
  canvas.width = width
  canvas.height = height
  ctx.font = `italic 400 ${fontSize}px ${font}`
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#fff'
  ctx.fillText(text, fontSize * 0.08, fontSize * 0.86)
  const { data } = ctx.getImageData(0, 0, width, height)
  const found: number[] = []
  for (let y = 0; y < height; y += GLYPH_STEP) {
    for (let x = 0; x < width; x += GLYPH_STEP) {
      if (data[(y * width + x) * 4 + 3] > 128) found.push(x, y)
    }
  }
  const random = seeded(text.length * 31 + fontSize)
  for (let i = found.length / 2 - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    for (const k of [0, 1]) {
      const swap = found[i * 2 + k]
      found[i * 2 + k] = found[j * 2 + k]
      found[j * 2 + k] = swap
    }
  }
  return found.length ? { points: Float32Array.from(found), width, height } : null
}

export function drawCloud(
  ctx: CanvasRenderingContext2D,
  particles: Float32Array,
  cloud: Cloud,
  time: number,
  gather?: Gather | null,
  pointer?: Pointer | null,
) {
  const alpha = 1 - smoothstep(0.7, 1, cloud.form)
  if (alpha <= 0.01) return
  const loose = 1 - cloud.form
  const spread = loose * loose
  const angle = (cloud.rot * Math.PI) / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  ctx.globalAlpha = alpha
  for (let o = 0; o < particles.length; o += PER_PARTICLE) {
    const u = particles[o] * cloud.w
    const v = particles[o + 1] * cloud.h
    const phase = particles[o + 4]
    let x =
      cloud.x + u * cos - v * sin + particles[o + 2] * spread + Math.sin(time + phase) * 6 * loose
    let y =
      cloud.y +
      u * sin +
      v * cos +
      particles[o + 3] * spread +
      Math.cos(time * 0.8 + phase) * 6 * loose
    if (gather && gather.mix > 0) {
      const count = gather.glyph.points.length / 2
      const t = ((gather.start + o / PER_PARTICLE) % count) * 2
      const delay = (phase / (Math.PI * 2)) * 0.5
      const mix = smoothstep(delay, delay + 0.5, gather.mix)
      x += (gather.x + gather.glyph.points[t] + Math.sin(time * 1.3 + phase) * 1.5 - x) * mix
      y += (gather.y + gather.glyph.points[t + 1] + Math.cos(time * 1.1 + phase) * 1.5 - y) * mix
    }
    if (pointer) {
      const dx = x - pointer.x
      const dy = y - pointer.y
      const distance = Math.hypot(dx, dy)
      if (distance < REPEL_RADIUS && distance > 0.01) {
        const push = (1 - distance / REPEL_RADIUS) ** 2 * REPEL_PUSH
        x += (dx / distance) * push
        y += (dy / distance) * push
      }
    }
    ctx.fillRect(Math.round(x), Math.round(y), 2, 2)
  }
}

export function drawNoise(
  ctx: CanvasRenderingContext2D,
  noise: Float32Array,
  width: number,
  height: number,
  time: number,
) {
  for (let o = 0; o < noise.length; o += PER_PARTICLE) {
    ctx.globalAlpha = 0.55 + 0.45 * Math.sin(time * 0.6 + noise[o + 4])
    ctx.fillRect(
      Math.round((noise[o] + 0.5) * width),
      Math.round((noise[o + 1] + 0.5) * height),
      2,
      2,
    )
  }
}
