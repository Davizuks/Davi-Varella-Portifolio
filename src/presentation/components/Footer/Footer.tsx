import { SOCIALS } from '@/presentation/components/Contact/contact'
import { EmailLink } from '@/presentation/components/Contact/EmailLink'
import { NAV_ITEMS } from '@/presentation/components/Header/navigation'
import { PROJECTS } from '@/presentation/components/Works/projects'
import styles from './Footer.module.css'

const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.columns}>
        <div className={styles.brand}>
          <a className={styles.logo} href="#topo" aria-label="DV / Labs, início">
            DV / <em>Labs</em>
          </a>
          <p>
            Full Stack Software Engineer.
            <br />
            São Paulo, Brasil.
          </p>
        </div>

        <nav aria-label="Mapa do site">
          <h2 className={styles.heading}>Mapa</h2>
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Projetos">
          <h2 className={styles.heading}>Projetos</h2>
          <ul>
            {PROJECTS.map((project) => (
              <li key={project.id}>
                <a href={project.url} target="_blank" rel="noreferrer">
                  {project.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Redes">
          <h2 className={styles.heading}>Redes</h2>
          <ul>
            {SOCIALS.map((social) => (
              <li key={social.label}>
                <a href={social.url} target="_blank" rel="noreferrer">
                  {social.label}
                </a>
              </li>
            ))}
            <li>
              <EmailLink>E-mail</EmailLink>
            </li>
          </ul>
        </nav>
      </div>

      <div className={styles.bar}>
        <span>
          © {CURRENT_YEAR} Davi Varella
          <span className={styles.craft}> — VarellaLabs®</span>
        </span>
        <a href="#topo">
          <span className={styles.craft}>Voltar ao </span>topo (↑)
        </a>
      </div>
    </footer>
  )
}
