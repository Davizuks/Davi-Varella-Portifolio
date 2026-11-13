import { render, screen, within } from '@testing-library/react'
import { Experience } from './Experience'
import { EXPERIENCE } from './experience'

describe('Experience', () => {
  it('anchors the section for the header navigation', () => {
    render(<Experience />)
    expect(screen.getByRole('region', { name: /Onde já deixei marcas/ })).toHaveAttribute(
      'id',
      'experiencia',
    )
  })

  it('lists every entry with its period, place and role', () => {
    render(<Experience />)
    const rows = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(rows).toHaveLength(EXPERIENCE.length)
    EXPERIENCE.forEach((entry, i) => {
      expect(within(rows[i]).getByRole('heading', { name: entry.place })).toBeInTheDocument()
      expect(within(rows[i]).getByText(entry.period)).toBeInTheDocument()
      expect(within(rows[i]).getByText(entry.role)).toBeInTheDocument()
    })
  })
})
