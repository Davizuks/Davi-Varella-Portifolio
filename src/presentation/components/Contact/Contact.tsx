import { useState } from 'react'
import { useNowPlaying } from '@/presentation/hooks/useNowPlaying'
import { CREDITS, DEFAULT_FREQUENCY, formatFrequency, stationAt } from './contact'
import styles from './Contact.module.css'
import { EmailLink } from './EmailLink'
import { RadioDial } from './RadioDial'

export function Contact() {
  const [frequency, setFrequency] = useState(DEFAULT_FREQUENCY)
  const listening = useNowPlaying()
  const tuned = stationAt(frequency)
  const readout = (
    <>
      {tuned?.text} <span aria-hidden="true">↗</span>
    </>
  )

  return (
    <section id="contato" className={styles.contact} aria-labelledby="contato-titulo">
      <div className={styles.top}>
        <div>
          <span className={styles.label}>[04] Contato</span>
          <h2 id="contato-titulo" className={styles.title}>
            Fim.
          </h2>
        </div>

        <dl className={styles.credits}>
          {CREDITS.map((credit) => (
            <div key={credit.role}>
              <dt>{credit.role}</dt>
              <dd>{credit.name}</dd>
            </div>
          ))}
          <div aria-live="polite">
            <dt>Trilha · {listening?.live ? 'tocando agora' : 'última que ouvi'} no Spotify</dt>
            <dd>
              {listening
                ? `${listening.track.title} — ${listening.track.artist}`
                : 'Silêncio no momento.'}
            </dd>
          </div>
        </dl>
      </div>

      <div className={styles.tuner} aria-live="polite">
        <p className={styles.status} data-tuned={Boolean(tuned)}>
          {tuned ? 'Sintonizado' : 'Chiado'} · {formatFrequency(frequency)} FM
          {tuned && ` — ${tuned.label}`}
        </p>
        {!tuned && <div className={styles.static} aria-hidden="true" />}
        {tuned?.id === 'email' && <EmailLink className={styles.channel}>{readout}</EmailLink>}
        {tuned && tuned.id !== 'email' && (
          <a className={styles.channel} href={tuned.url} target="_blank" rel="noreferrer">
            {readout}
          </a>
        )}
      </div>

      <RadioDial frequency={frequency} onTune={setFrequency} />

      <p className={styles.hints}>
        <span>Três estações: e-mail, GitHub, LinkedIn</span>
        <span>
          Arraste o dial<span className={styles.wide}> ou use ← →</span>
        </span>
      </p>
    </section>
  )
}
