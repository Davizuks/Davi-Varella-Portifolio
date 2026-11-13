import { render, screen, within } from '@testing-library/react'
import { NAV_ITEMS } from '@/presentation/components/Header/navigation'
import { PROJECTS } from '@/presentation/components/Works/projects'
import { Footer } from './Footer'

describe('Footer', () => {
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

  it('signs off asking for kindness', () => {
    render(<Footer />)
    expect(screen.getByText('Be kind.')).toBeInTheDocument()
  })
})
