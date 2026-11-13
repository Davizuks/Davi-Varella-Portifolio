import { render, screen, within } from '@testing-library/react'
import { NAV_ITEMS } from '@/presentation/components/Header/navigation'
import { PROJECTS } from '@/presentation/components/Works/projects'
import { Footer } from './Footer'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
})
afterEach(() => vi.unstubAllGlobals())

describe('Footer', () => {
  const card = (artist: string, song: string) => ({
    ok: true,
    text: async () => `<div class="artist">${artist}</div><div class="song">${song}</div>`,
  })

  it('shows what is playing right now', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(card('Radiohead', 'Reckoner')))
    render(<Footer />)
    expect(screen.getByText('Silêncio no momento.')).toBeInTheDocument()
    expect(await screen.findByText('Reckoner — Radiohead')).toBeInTheDocument()
    expect(screen.getByText('Tocando agora')).toBeInTheDocument()
  })

  it('falls back to the last track when nothing is playing', async () => {
    const fetchMock = vi.fn((url: string) =>
      Promise.resolve(url.includes('last-played') ? card('Drake', 'Jungle') : card('Offline', '—')),
    )
    vi.stubGlobal('fetch', fetchMock)
    render(<Footer />)
    expect(await screen.findByText('Jungle — Drake')).toBeInTheDocument()
    expect(screen.getByText('Última que ouvi')).toBeInTheDocument()
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
