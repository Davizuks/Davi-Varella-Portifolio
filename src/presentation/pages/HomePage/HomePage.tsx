import { useEffect } from 'react'
import { About } from '@/presentation/components/About/About'
import { Contact } from '@/presentation/components/Contact/Contact'
import { Experience } from '@/presentation/components/Experience/Experience'
import { Footer } from '@/presentation/components/Footer/Footer'
import { Header } from '@/presentation/components/Header/Header'
import { Hero } from '@/presentation/components/Hero/Hero'
import { Works } from '@/presentation/components/Works/Works'

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
        <Works />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
