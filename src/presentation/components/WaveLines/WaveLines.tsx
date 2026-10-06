import { useEffect, useRef } from 'react'
import styles from './WaveLines.module.css'

const ROWS = 11
const DOT = 2
const BOAT_ROW = 5
const BOAT_PIXEL = 4
const BOAT_MAX_TILT = 0.35
const BOAT_SPRITE = [
  '......#......',
  '......##.....',
  '......###....',
  '......####...',
  '......#####..',
  '......#......',
  '#############',
  '.###########.',
  '..#########..',
]

export function WaveLines() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const color = getComputedStyle(canvas).color
    let width = 0
    let height = 0
    let frameId = 0
    const startedAt = performance.now()

    const layout = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const waveY = (row: number, x: number, t: number) => {
      const depth = row / (ROWS - 1)
      const amp = 14 + 30 * depth
      const speed = 0.9 + 0.4 * depth
      return (
        height * (0.28 + 0.5 * depth) +
        amp * Math.sin(x * 0.016 + t * speed + row * 0.35) +
        amp * 0.25 * Math.sin(x * 0.034 - t * speed * 0.7 + row * 0.5)
      )
    }

    const drawRow = (row: number, t: number) => {
      const gap = 6 - 3 * (row / (ROWS - 1))
      for (let x = 0; x < width + gap; x += gap) {
        ctx.fillRect(x, waveY(row, x, t), DOT, DOT)
      }
    }

    const drawBoat = (t: number) => {
      const x = width / 2
      const y = waveY(BOAT_ROW, x, t)
      const slope = (waveY(BOAT_ROW, x + 24, t) - waveY(BOAT_ROW, x - 24, t)) / 48
      const cols = BOAT_SPRITE[0].length
      const rows = BOAT_SPRITE.length
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(Math.max(-BOAT_MAX_TILT, Math.min(BOAT_MAX_TILT, Math.atan(slope))))
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (BOAT_SPRITE[r][c] !== '#') continue
          ctx.fillRect(
            (c - cols / 2) * BOAT_PIXEL,
            (r - rows + 1) * BOAT_PIXEL,
            BOAT_PIXEL - 0.5,
            BOAT_PIXEL - 0.5,
          )
        }
      }
      ctx.restore()
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = color
      for (let row = 0; row < ROWS; row++) {
        drawRow(row, t)
        if (row === BOAT_ROW) drawBoat(t)
      }
    }

    const frame = (now: number) => {
      draw((now - startedAt) / 1000)
      frameId = requestAnimationFrame(frame)
    }

    const resizeObserver =
      'ResizeObserver' in window
        ? new ResizeObserver(() => {
            layout()
            if (reduceMotion) draw(0)
          })
        : null
    resizeObserver?.observe(canvas)

    layout()
    if (reduceMotion) draw(0)
    else frameId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver?.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.waves} aria-hidden="true" />
}
