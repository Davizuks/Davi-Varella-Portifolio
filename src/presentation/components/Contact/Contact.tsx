import { ParticleWave } from '@/presentation/components/ParticleWave/ParticleWave'
import { EMAIL, SOCIALS } from './contact'
import { EmailLink } from './EmailLink'
import styles from './Contact.module.css'

export function Contact() {
  return (
    <section id="contato" className={styles.contact} aria-labelledby="contato-titulo">
      <span className={styles.label}>[04] Contato</span>
      <h2 id="contato-titulo" className={styles.title}>
        Tem uma ideia? <em>Vamos conversar.</em>
      </h2>

      <div className={styles.reach}>
        <EmailLink className={styles.email}>
          {EMAIL} <span aria-hidden="true">↗</span>
        </EmailLink>
        <ul className={styles.socials}>
          {SOCIALS.map((social) => (
            <li key={social.label}>
              <a href={social.url} target="_blank" rel="noreferrer">
                {social.label} <span aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.wave}>
        <ParticleWave />
      </div>
    </section>
  )
}
