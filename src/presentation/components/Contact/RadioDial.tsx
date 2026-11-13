import type { KeyboardEvent } from 'react'
import { BAND, formatFrequency, stationAt, STATIONS } from './contact'
import styles from './RadioDial.module.css'

const TICKS = 200
const SPAN = BAND.max - BAND.min
const MARKS = Array.from({ length: SPAN / 2 + 1 }, (_, i) => BAND.min + i * 2)
const SCALE_PATH = Array.from({ length: TICKS + 1 }, (_, i) => {
  const height = i % 10 === 0 ? 26 : i % 5 === 0 ? 16 : 9
  return `M${i * 10} ${26 - height}V26`
}).join('')

const position = (frequency: number) => `${((frequency - BAND.min) / SPAN) * 100}%`

type RadioDialProps = { frequency: number; onTune: (frequency: number) => void }

export function RadioDial({ frequency, onTune }: RadioDialProps) {
  const tuned = stationAt(frequency)

  const settle = () => {
    if (tuned) onTune(tuned.frequency)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const direction = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!direction) return
    e.preventDefault()
    const next =
      direction > 0
        ? STATIONS.find((station) => station.frequency > frequency + 0.01)
        : [...STATIONS].reverse().find((station) => station.frequency < frequency - 0.01)
    if (next) onTune(next.frequency)
  }

  return (
    <div className={styles.dial}>
      {STATIONS.map((station) => (
        <span
          key={station.id}
          className={styles.station}
          data-tuned={station.id === tuned?.id}
          style={{ left: position(station.frequency) }}
        >
          {station.label}
        </span>
      ))}
      <svg
        className={styles.scale}
        viewBox={`0 0 ${TICKS * 10} 26`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={SCALE_PATH} />
      </svg>
      <div className={styles.marks} aria-hidden="true">
        {MARKS.map((mark) => (
          <span key={mark} style={{ left: position(mark) }}>
            {mark}
          </span>
        ))}
      </div>
      <span className={styles.needle} style={{ left: position(frequency) }} aria-hidden="true" />
      <input
        className={styles.range}
        type="range"
        min={BAND.min}
        max={BAND.max}
        step={0.1}
        value={frequency}
        aria-label="Sintonizar canal de contato"
        aria-valuetext={`${tuned ? tuned.label : 'Chiado'}, ${formatFrequency(frequency)} FM`}
        onChange={(e) => onTune(Number(e.target.value))}
        onPointerUp={settle}
        onKeyDown={onKeyDown}
      />
    </div>
  )
}
