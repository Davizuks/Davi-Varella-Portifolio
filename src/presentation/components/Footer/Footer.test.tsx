import { render, screen, within } from '@testing-library/react'
import { NAV_ITEMS } from '@/presentation/components/Header/navigation'
import { PROJECTS } from '@/presentation/components/Works/projects'
import { Footer } from './Footer'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
})
afterEach(() => vi.unstubAllGlobals())

describe('Footer', () => {
  it('shows what is playing right now', async () => {
    const card = '<div class="artist">Radiohead</div><div class="song">Reckoner</div>'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: async () => card }))
    render(<Footer />)
    expect(screen.getByText('Silêncio no momento.')).toBeInTheDocument()
    expect(await screen.findByText('Reckoner — Radiohead')).toBeInTheDocument()
  })

  it('maps every section of the site', () => {
    render(<Footer />)
    const map = screen.getByRole('navigation', { name: 'Mapa do site' })
    for (const item of NAV_ITEMS) {
      expect(within(map).getByRole('link', { name: item.label })).toHaveAttribute(
        'href',
        `#${item.id}`,
      )
    }
  })

  it('links out to every project', () => {
    render(<Footer />)
    const projects = screen.getByRole('navigation', { name: 'Projetos' })
    for (const project of PROJECTS) {
      expect(within(projects).getByRole('link', { name: project.title })).toHaveAttribute(
        'href',
        project.url,
      )
    }
  })

  it('credits the current year and links back to the top', () => {
    render(<Footer />)
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} Davi Varella`))).toBeVisible()
    expect(screen.getByRole('link', { name: /topo \(↑\)/i })).toHaveAttribute('href', '#topo')
  })
})
