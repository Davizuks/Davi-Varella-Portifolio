import styles from './Footer.module.css'

const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className={styles.footer}>
      <span>
        © {CURRENT_YEAR} Davi Varella<span className={styles.craft}> — feito à mão em React</span>
      </span>
      <a href="#topo">
        <span className={styles.craft}>Voltar ao </span>topo (↑)
      </a>
    </footer>
  )
}
