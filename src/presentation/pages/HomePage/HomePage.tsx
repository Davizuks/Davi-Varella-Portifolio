import { About } from '@/presentation/components/About/About'
import { Header } from '@/presentation/components/Header/Header'
import { Hero } from '@/presentation/components/Hero/Hero'

export function HomePage() {
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
