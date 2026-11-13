import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/presentation/utils/motion'
import styles from './ParticleWave.module.css'

const ROWS = 44
const MAX_PIXEL_RATIO = 1.5

function drawWave(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  ctx.clearRect(0, 0, width, height)
  for (let row = 0; row < ROWS; row++) {
    const depth = row / (ROWS - 1)
    const half = width * (0.34 + 0.72 * depth)
    const gap = 5 + 7 * depth
    const size = 1.2 + 1.3 * depth
    const count = Math.floor((2 * half) / gap)
    for (let i = 0; i <= count; i++) {
      const u = (i / count) * 2 - 1
      const hill = Math.exp(-u * u * 2.2) * (1 - depth) * height * 0.42
      const swell = 0.75 + 0.25 * Math.sin(u * 5 + time * 0.5 + depth * 4)
      const ripple = 6 * Math.sin(u * 9 - time * 0.8 + row * 0.5) * (1 - depth * 0.5)
      const x = width / 2 + u * half
      if (x < -size || x > width) continue
      ctx.fillRect(x, height * (0.42 + 0.58 * depth) - hill * swell - ripple, size, size)
    }
  }
}

export function ParticleWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const still = prefersReducedMotion()
    let frameId = 0
    let visible = true
    let running = false

    const frame = (now: number) => {
      const ratio = Math.min(MAX_PIXEL_RATIO, window.devicePixelRatio || 1)
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (
        canvas.width !== Math.round(width * ratio) ||
        canvas.height !== Math.round(height * ratio)
      ) {
        canvas.width = Math.round(width * ratio)
        canvas.height = Math.round(height * ratio)
      }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      ctx.fillStyle = getComputedStyle(canvas).color
      drawWave(ctx, width, height, still ? 0 : now / 1000)
      running = visible && !still
      if (running) frameId = requestAnimationFrame(frame)
    }
    const start = () => {
      if (running) return
      running = true
      frameId = requestAnimationFrame(frame)
    }

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting
            if (visible) start()
          })
    observer?.observe(canvas)
    window.addEventListener('resize', start)
    start()

    return () => {
      cancelAnimationFrame(frameId)
      observer?.disconnect()
      window.removeEventListener('resize', start)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.wave} aria-hidden="true" />
}
