import type { MouseEvent, PointerEvent } from 'react'
import styles from './ShipControls.module.css'

export type HoldKey = 'up' | 'down' | 'left' | 'right' | 'fire'

type ShipControlsProps = {
  onInput: (key: HoldKey, pressed: boolean) => void
  onRebuild: () => void
  damage: number
}

export function ShipControls({ onInput, onRebuild, damage }: ShipControlsProps) {
  const hold = (key: HoldKey) => ({
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      e.currentTarget.setPointerCapture?.(e.pointerId)
      onInput(key, true)
    },
    onPointerUp: () => onInput(key, false),
    onPointerCancel: () => onInput(key, false),
    onLostPointerCapture: () => onInput(key, false),
    onClick: (e: MouseEvent<HTMLButtonElement>) => {
      if (e.detail !== 0) return
      onInput(key, true)
      window.setTimeout(() => onInput(key, false), 160)
    },
    onContextMenu: (e: MouseEvent<HTMLButtonElement>) => e.preventDefault(),
  })

  const percent = Math.min(100, Math.floor(damage * 100))

  return (
    <div className={styles.controls} role="group" aria-label="Controles da nave">
      <p className={styles.hint}>
        <kbd>←</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>→</kbd> move · <kbd>Espaço</kbd> atira
      </p>
      <div className={styles.row}>
        <div className={styles.pad}>
          <button type="button" className={styles.up} aria-label="Subir" {...hold('up')}>
            ▲
          </button>
          <button type="button" className={styles.left} aria-label="Para trás" {...hold('left')}>
            ◀
          </button>
          <button
            type="button"
            className={styles.right}
            aria-label="Para frente"
            {...hold('right')}
          >
            ▶
          </button>
          <button type="button" className={styles.down} aria-label="Descer" {...hold('down')}>
            ▼
          </button>
        </div>
        <button type="button" className={styles.fire} {...hold('fire')}>
          Fogo
        </button>
      </div>
      <div className={styles.status}>
        <span aria-live="polite">Dano {percent}%</span>
        {percent > 0 && (
          <button type="button" className={styles.rebuild} onClick={onRebuild}>
            Reconstruir
          </button>
        )}
      </div>
    </div>
  )
}
