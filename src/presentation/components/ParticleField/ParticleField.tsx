import { useEffect, useRef, type RefObject } from 'react'
import { burstEmbers, flamePixels, shedEmbers, stepEmbers, type Ember } from './fire'
import {
  avatarBounds,
  avatarBox,
  avatarTargets,
  isPhone,
  loadImage,
  METEOR_DRAWN_HEADING,
  meteorTargets,
  MOBILE_GAME_TOP,
  mobileGameHeight,
} from './layout'
import styles from './ParticleField.module.css'
import {
  createParticles,
  damage,
  explodeFrom,
  IMPACT_X,
  impactPoint,
  meteorHeading,
  meteorPosition,
  rebuild as rebuildAvatar,
  settle,
  stepParticle,
  TIMELINE,
  WARNING_DAMAGE,
  WIN_DAMAGE,
  type Particle,
} from './particleEngine'
import {
  clear,
  drawBullets,
  drawCrashRings,
  drawEmbers,
  drawFlames,
  drawImpacts,
  drawParticles,
  drawShip,
  drawWarning,
  snapTo,
  type Painter,
} from './renderer'
import {
  createShip,
  entranceX,
  hoverX,
  SHIP_SPRITE,
  shipHeight,
  shipWidth,
  steerShip,
  stepBullets,
  stepImpacts,
  WARNING_SPRITE,
  type Bullet,
  type Impact,
  type Ship,
  type ShipInput,
} from './ship'

export type GameControls = ShipInput & { rebuild: boolean }

type ParticleFieldProps = {
  mapSrc: string
  meteorSrc: string
  controls: RefObject<GameControls>
  onReady?: (count: number) => void
  onPlayable?: () => void
  onDamage?: (value: number) => void
  onRestart?: () => void
}

const CRASH_SHAKE = 0.8
const CRASH_RING = 1.2
const CRATER_FIRE = 1.8
const INTRO_DONE = TIMELINE.rebuildStart + 2.4
const SHIP_FALL_GRAVITY = 0.22
const SHIP_FLOOR_GAP = 48
const NOTHING_PRESSED: ShipInput = {
  up: false,
  down: false,
  left: false,
  right: false,
  fire: false,
}

const KEYS: Record<string, keyof ShipInput> = {
  ArrowUp: 'up',
  w: 'up',
  W: 'up',
  ArrowDown: 'down',
  s: 'down',
  S: 'down',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
  ' ': 'fire',
  Enter: 'fire',
}

export function ParticleField({
  mapSrc,
  meteorSrc,
  controls,
  onReady,
  onPlayable,
  onDamage,
  onRestart,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const loaderRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    const ctx = canvas?.getContext('2d')
    if (!canvas || !host || !ctx) return

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const painter: Painter = { ctx, dpr: 1, pixel: 6 }
    const pointer = { x: -9999, y: -9999 }
    let maps: { avatar: HTMLImageElement; meteor: HTMLImageElement } | null = null
    let particles: Particle[] = []
    let width = 0
    let height = 0
    let gameHeight = 0

    let rock = 40
    let turn = 0
    let impactX = IMPACT_X
    const embers: Ember[] = []
    let crashed = false
    let blastPoint: { x: number; y: number } | null = null
    const crashPoint = () => blastPoint ?? impactPoint(width, height, impactX)

    let ship: Ship | null = null
    let shipHomeY = 0
    let shipAngle = 0
    let parkX = 0
    let avatarTop = 0
    const bullets: Bullet[] = []
    const impacts: Impact[] = []
    let playing = false
    let diving = false
    let currentDamage = 0
    let lastDamage = -1

    let startedAt = performance.now()
    let frameCount = 0
    let frameId = 0
    let running = false
    let visible = true
    let disposed = false

    const shipMaxY = () =>
      (isPhone(width) ? gameHeight : height - SHIP_FLOOR_GAP) - shipHeight(painter.pixel)
    const reachY = () => shipMaxY() + shipHeight(painter.pixel) / 2 + painter.pixel * 5

    const layout = () => {
      painter.dpr = Math.min(2, window.devicePixelRatio || 1)
      width = host.clientWidth
      height = host.clientHeight
      canvas.width = width * painter.dpr
      canvas.height = height * painter.dpr
      ctx.setTransform(painter.dpr, 0, 0, painter.dpr, 0, 0)
      if (!maps) return

      const phone = isPhone(width)
      gameHeight = phone ? mobileGameHeight(window.innerHeight, width) : height
      host.style.setProperty('--game-height', `${gameHeight}px`)
      const box = avatarBox(width, height, painter.dpr, gameHeight)
      const targets = avatarTargets(maps.avatar, box, phone)
      if (!targets.length) return
      const bounds = avatarBounds(targets)

      rock = Math.min(80, Math.max(36, width * 0.055))
      impactX = bounds.headCenterX / width
      turn = meteorHeading(width, height, impactX) - METEOR_DRAWN_HEADING
      const meteor = meteorTargets(maps.meteor, rock, box.cell)
      particles = createParticles(targets, meteor, width, height, Math.random, particles)

      painter.pixel = snapTo(painter.dpr)(Math.max(4.5, box.cell * 1.5))
      avatarTop = bounds.top
      parkX = hoverX(bounds.left, painter.pixel)
      shipHomeY = bounds.centerY - shipHeight(painter.pixel) / 2
      if (!ship) ship = createShip(painter.pixel, shipHomeY)
      else ship.pixel = painter.pixel

      onReady?.(targets.length)
      if (reduceMotion) {
        settle(particles)
        clear(painter, width, height)
        drawParticles(painter, particles)
      }
    }

    const flyShip = (t: number, input: GameControls) => {
      if (!ship) return
      if (diving) {
        ship.vy += SHIP_FALL_GRAVITY
        ship.vx *= 0.99
        ship.x += ship.vx
        ship.y += ship.vy
        shipAngle = Math.atan2(ship.vy, Math.max(1.5, ship.vx))
        const h = shipHeight(painter.pixel)
        const cx = ship.x + shipWidth(painter.pixel) / 2
        shedEmbers(embers, cx, ship.y + h / 2, ship.vx, ship.vy, h / 2, 8, Math.random)
      } else if (playing) {
        const phone = isPhone(width)
        const bullet = steerShip(ship, input, {
          minX: 12,
          maxX: phone ? width * 0.5 : width - shipWidth(painter.pixel) - 16,
          minY: phone ? MOBILE_GAME_TOP : Math.max(56, avatarTop - shipHeight(painter.pixel)),
          maxY: shipMaxY(),
        })
        if (bullet) bullets.push(bullet)
      } else {
        ship.x = entranceX(t, parkX, painter.pixel)
      }
    }

    const crashShip = (now: number) => {
      if (!ship) return
      const x = ship.x + shipWidth(painter.pixel) / 2
      blastPoint = { x, y: height }
      explodeFrom(particles, x, height - 10, Math.random)
      startedAt = now - TIMELINE.meteorImpact * 1000
      crashed = false
      playing = false
      diving = false
      shipAngle = 0
      impacts.length = 0
      ship = createShip(painter.pixel, shipHomeY)
      lastDamage = -1
      onRestart?.()
    }

    const updateFire = (t: number) => {
      if (t >= TIMELINE.meteorStart && t < TIMELINE.meteorImpact) {
        const head = meteorPosition(t, width, height, impactX)
        const ahead = meteorPosition(t + 1 / 60, width, height, impactX)
        shedEmbers(
          embers,
          head.x,
          head.y,
          ahead.x - head.x,
          ahead.y - head.y,
          rock,
          22,
          Math.random,
        )
      } else if (t >= TIMELINE.meteorImpact && !crashed) {
        crashed = true
        const at = crashPoint()
        burstEmbers(embers, at.x, at.y, 600, Math.random)
      }
      stepEmbers(embers)
    }

    const render = (t: number) => {
      const sinceCrash = t - TIMELINE.meteorImpact
      const shaking = sinceCrash >= 0 && sinceCrash < CRASH_SHAKE
      if (shaking) {
        const k = 1 - sinceCrash / CRASH_SHAKE
        const snap = snapTo(painter.dpr)
        ctx.save()
        ctx.translate(snap((Math.random() - 0.5) * 28 * k), snap((Math.random() - 0.5) * 28 * k))
      }
      clear(painter, width, height)
      drawParticles(painter, particles)
      if (sinceCrash >= 0 && sinceCrash < CRATER_FIRE) {
        const at = crashPoint()
        const intensity = 1.6 * (1 - sinceCrash / CRATER_FIRE)
        drawFlames(
          painter,
          flamePixels(
            at.x,
            at.y,
            0,
            -1,
            rock * 0.85,
            t,
            painter.pixel,
            intensity,
            Math.PI * 1.1,
            0,
          ),
        )
      }
      drawEmbers(painter, embers)
      if (sinceCrash >= 0 && sinceCrash < CRASH_RING) {
        drawCrashRings(painter, crashPoint(), sinceCrash / CRASH_RING, width)
      }
      if (shaking) ctx.restore()

      if (ship && t >= TIMELINE.shipEnter) {
        drawShip(painter, SHIP_SPRITE, ship, shipAngle, Math.floor(t * 20) % 2 === 0)
        const blinkOn = Math.floor(t * 4) % 2 === 0
        if ((currentDamage >= WARNING_DAMAGE || diving) && blinkOn) {
          drawWarning(painter, WARNING_SPRITE, ship)
        }
      }
      drawBullets(painter, bullets)
      drawImpacts(painter, impacts)
    }

    const report = (t: number) => {
      if (++frameCount % 15 === 0 && onDamage) {
        const value = Math.floor(currentDamage * 1000) / 1000
        if (value !== lastDamage) {
          lastDamage = value
          onDamage(value)
        }
      }
      if (loaderRef.current) {
        const pct = Math.min(100, Math.floor((t / INTRO_DONE) * 100))
        loaderRef.current.textContent = `Carregando ${String(pct).padStart(3, '0')}%`
        loaderRef.current.dataset.done = String(pct >= 100)
      }
    }

    const frame = (now: number) => {
      const t = (now - startedAt) / 1000
      const input = controls.current

      if (!playing && t >= TIMELINE.shipArrive) {
        playing = true
        onPlayable?.()
      }
      flyShip(t, input)

      currentDamage = playing ? damage(particles, reachY()) : 0
      if (playing && !diving && currentDamage >= WIN_DAMAGE && ship) {
        diving = true
        ship.vx = Math.max(ship.vx, 3)
        ship.vy = Math.min(ship.vy, -2)
        bullets.length = 0
        Object.assign(input, NOTHING_PRESSED)
      }
      if (diving && ship && ship.y + shipHeight(painter.pixel) * 0.6 >= height) {
        crashShip(now)
        frameId = requestAnimationFrame(frame)
        return
      }
      if (input.rebuild) {
        input.rebuild = false
        rebuildAvatar(particles)
      }

      const step = {
        t,
        width,
        height,
        pointerX: pointer.x,
        pointerY: pointer.y,
        random: Math.random,
        turn,
        impactX,
      }
      for (const p of particles) stepParticle(p, step)
      updateFire(t)
      impacts.push(...stepBullets(bullets, particles, width, painter.pixel * 5, Math.random))
      stepImpacts(impacts)

      render(t)
      report(t)
      if (visible && !disposed) frameId = requestAnimationFrame(frame)
      else running = false
    }

    const start = () => {
      if (reduceMotion || running || disposed) return
      running = true
      frameId = requestAnimationFrame(frame)
    }

    const setKey = (e: KeyboardEvent, down: boolean) => {
      if (down && (!playing || !visible)) return
      const target = e.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return
      const key = KEYS[e.key]
      if (!key || (key === 'fire' && target?.closest('button, a'))) return
      controls.current[key] = down
      e.preventDefault()
    }
    const onKeyDown = (e: KeyboardEvent) => setKey(e, true)
    const onKeyUp = (e: KeyboardEvent) => setKey(e, false)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    const onPointerMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer.x = e.clientX - r.left
      pointer.y = e.clientY - r.top
    }
    const onPointerLeave = () => {
      pointer.x = pointer.y = -9999
    }
    host.addEventListener('pointermove', onPointerMove)
    host.addEventListener('pointerleave', onPointerLeave)

    let resizeTimer = 0
    const resizeObserver =
      'ResizeObserver' in window
        ? new ResizeObserver(() => {
            window.clearTimeout(resizeTimer)
            resizeTimer = window.setTimeout(layout, 150)
          })
        : null
    resizeObserver?.observe(host)

    const visibilityObserver =
      'IntersectionObserver' in window
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting
            if (visible) start()
          })
        : null
    visibilityObserver?.observe(host)

    Promise.all([loadImage(mapSrc), loadImage(meteorSrc)])
      .then(([avatar, meteor]) => {
        if (disposed) return
        maps = { avatar, meteor }
        layout()
        const skip = new URLSearchParams(window.location.search).has('skip-intro')
        startedAt = performance.now() - (skip ? TIMELINE.shipArrive * 1000 : 0)
        start()
      })
      .catch(() => {})

    layout()

    return () => {
      disposed = true
      cancelAnimationFrame(frameId)
      window.clearTimeout(resizeTimer)
      resizeObserver?.disconnect()
      visibilityObserver?.disconnect()
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      host.removeEventListener('pointermove', onPointerMove)
      host.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [mapSrc, meteorSrc, controls, onReady, onPlayable, onDamage, onRestart])

  return (
    <>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <span ref={loaderRef} className={styles.loader} aria-hidden="true" data-done="false">
        Carregando 000%
      </span>
    </>
  )
}
