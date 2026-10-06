import { INVENTORY, INVENTORY_SLOTS, spritePath } from './inventory'
import styles from './About.module.css'

const MARQUEE = 'Software Engineer ■ Python ■ APIs REST ■ PostgreSQL ■ Docker ■ AWS ■ IA & ML ■ '

const slotNumber = (index: number) => String(index + 1).padStart(2, '0')

export function About() {
  const freeSlots = Array.from({ length: INVENTORY_SLOTS - INVENTORY.length })

  return (
    <section id="sobre" className={styles.about} aria-labelledby="sobre-titulo">
      <div className={styles.inner}>
        <span className={styles.label}>[01] Sobre</span>
        <h2 id="sobre-titulo" className={styles.title}>
          O que eu carrego <em>no inventário.</em>
        </h2>
        <p className={styles.count}>{INVENTORY.length}/∞ slots</p>

        <ul className={styles.grid}>
          {INVENTORY.map((item, i) => (
            <li key={item.id} className={styles.slot}>
              <span className={styles.number}>{slotNumber(i)}</span>
              <svg
                className={styles.icon}
                viewBox="0 0 12 12"
                shapeRendering="crispEdges"
                aria-hidden="true"
              >
                <path d={spritePath(item.sprite)} />
              </svg>
              <span className={styles.name}>
                <span className={styles.full}>{item.label}</span>
                <span className={styles.short}>{item.shortLabel ?? item.label}</span>
              </span>
            </li>
          ))}
          {freeSlots.map((_, i) => (
            <li key={`livre-${i}`} className={`${styles.slot} ${styles.free}`}>
              <span className={styles.number}>{slotNumber(INVENTORY.length + i)}</span>
              <span className={styles.name}>
                <span className={styles.full}>Slot livre</span>
                <span className={styles.short}>Livre</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.track}>
          <span>{MARQUEE.repeat(3)}</span>
          <span>{MARQUEE.repeat(3)}</span>
        </div>
      </div>
    </section>
  )
}
