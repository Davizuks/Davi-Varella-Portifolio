import { useEffect, useRef, useState } from 'react'
import { useLocalTime } from '@/presentation/hooks/useLocalTime'
import styles from './Header.module.css'

const NAV_ITEMS = [
  { id: 'trabalhos', label: 'Trabalhos' },
  { id: 'sobre', label: 'Sobre' },
  { id: 'experiencia', label: 'Experiência' },
  { id: 'contato', label: 'Contato' },
]

function Logo() {
  return (
    <span className={styles.logo}>
      DV / <em>Labs</em>
    </span>
  )
}

export function Header() {
  const time = useLocalTime()
  const [menu, setMenu] = useState<'closed' | 'open' | 'closing'>('closed')
  const menuOpen = menu === 'open'
  const closeRef = useRef<HTMLButtonElement>(null)

  const closeMenu = () => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    setMenu(reduced ? 'closed' : 'closing')
  }

  useEffect(() => {
    if (menu !== 'closing') return
    const id = window.setTimeout(() => setMenu('closed'), 320)
    return () => window.clearTimeout(id)
  }, [menu])

  useEffect(() => {
    if (!menuOpen) return
    closeRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <>
      <header className={styles.header}>
        <a className={styles.home} href="#topo" aria-label="DV / Labs, início">
          <Logo />
        </a>
        <nav className={styles.nav} aria-label="Principal">
          {NAV_ITEMS.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
        </nav>
        <span className={styles.status}>
          <i aria-hidden="true" />
          Disponível · BR {time}
        </span>
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-controls="menu-mobile"
          onClick={() => setMenu('open')}
        >
          Menu
        </button>
      </header>

      <div
        id="menu-mobile"
        className={styles.sheet}
        hidden={menu === 'closed'}
        data-state={menu}
        onAnimationEnd={(e) => {
          if (menu === 'closing' && e.target === e.currentTarget) setMenu('closed')
        }}
      >
        <div className={styles.sheetTop}>
          <Logo />
          <button ref={closeRef} type="button" onClick={closeMenu}>
            Fechar
          </button>
        </div>
        <nav aria-label="Menu">
          {NAV_ITEMS.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={closeMenu}
              style={{ animationDelay: `${120 + i * 60}ms` }}
            >
              <span>{String(i + 1).padStart(2, '0')}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <p className={styles.sheetCta}>Vamos conversar.</p>
      </div>
    </>
  )
}
