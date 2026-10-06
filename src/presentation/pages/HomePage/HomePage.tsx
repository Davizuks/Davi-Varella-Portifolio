import { useEffect } from 'react'
import { About } from '@/presentation/components/About/About'
import { Header } from '@/presentation/components/Header/Header'
import { Hero } from '@/presentation/components/Hero/Hero'

export function HomePage() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'instant' })
  }, [])

  return (
    <>
      <Header />
      <main id="topo">
        <Hero />
        <About />
      </main>
    </>
  )
}
