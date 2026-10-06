import { useCallback, useRef, useState } from 'react'
import avatarDensityMap from '@/presentation/assets/avatar-density-map.png'
import meteorDensityMap from '@/presentation/assets/meteor-density-map.png'
import {
  ParticleField,
  type GameControls,
} from '@/presentation/components/ParticleField/ParticleField'
import { ShipControls, type HoldKey } from '@/presentation/components/ShipControls/ShipControls'
import styles from './Hero.module.css'

const CURRENT_YEAR = new Date().getFullYear()

export function Hero() {
  const [particleCount, setParticleCount] = useState<number | null>(null)
  const [playable, setPlayable] = useState(false)
  const [damage, setDamage] = useState(0)
  const controls = useRef<GameControls>({
    up: false,
    down: false,
    left: false,
    right: false,
    fire: false,
    rebuild: false,
  })
  const onPlayable = useCallback(() => setPlayable(true), [])
  const onRestart = useCallback(() => {
    setPlayable(false)
    setDamage(0)
  }, [])
  const onInput = useCallback((key: HoldKey, pressed: boolean) => {
    controls.current[key] = pressed
  }, [])
  const onRebuild = useCallback(() => {
    controls.current.rebuild = true
  }, [])

  return (
    <section className={styles.hero} aria-label="Apresentação">
      <ParticleField
        mapSrc={avatarDensityMap}
        meteorSrc={meteorDensityMap}
        controls={controls}
        onReady={setParticleCount}
        onPlayable={onPlayable}
        onDamage={setDamage}
        onRestart={onRestart}
      />

      <span className={styles.caption}>
        (Fig. 01){' '}
        {particleCount
          ? `Avatar em ${particleCount.toLocaleString('pt-BR')} partículas`
          : 'Avatar em partículas'}
      </span>

      <div className={styles.copy}>
        <p className={styles.bio}>
          Full Stack Software Engineer.
          <br />O que me cativa é construir coisas.
        </p>
        {playable && <span className={styles.hint}>↳ pilote a nave para destruir o avatar</span>}
      </div>

      <h1 className={styles.name}>
        <span className={styles.first}>Davi</span>
        <span className={styles.last}>Varella</span>
      </h1>

      <span className={styles.scroll}>Role (↓)</span>
      <span className={styles.edition}>Portfólio {CURRENT_YEAR}</span>

      {playable && <ShipControls onInput={onInput} onRebuild={onRebuild} damage={damage} />}
    </section>
  )
}
