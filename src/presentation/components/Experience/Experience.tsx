import { EXPERIENCE } from './experience'
import styles from './Experience.module.css'

export function Experience() {
  return (
    <section id="experiencia" className={styles.experience} aria-labelledby="experiencia-titulo">
      <div className={styles.head}>
        <span className={styles.label}>[03] Experiência</span>
        <h2 id="experiencia-titulo" className={styles.title}>
          Onde já <br />
          deixei marcas.
        </h2>
      </div>

      <ol className={styles.list}>
        {EXPERIENCE.map((entry) => (
          <li key={entry.id} className={styles.row}>
            <span className={styles.period}>{entry.period}</span>
            <div className={styles.body}>
              <div>
                <h3 className={styles.place}>{entry.place}</h3>
                <p className={styles.role}>{entry.role}</p>
              </div>
              <p className={styles.description}>{entry.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
