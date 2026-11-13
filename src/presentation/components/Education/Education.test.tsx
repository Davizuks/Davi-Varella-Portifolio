import { render, screen, within } from '@testing-library/react'
import { Education } from './Education'
import { CERTIFICATES, COURSES, LANGUAGES } from './education'

describe('Education', () => {
  it('anchors the section for the header navigation', () => {
    render(<Education />)
    expect(screen.getByRole('region', { name: /Onde aprendi a perguntar/ })).toHaveAttribute(
      'id',
      'formacao',
    )
  })

  it('lists every course with its period, place and degree', () => {
    render(<Education />)
    const rows = within(screen.getByRole('list', { name: 'Cursos' })).getAllByRole('listitem')
    expect(rows).toHaveLength(COURSES.length)
    COURSES.forEach((course, i) => {
      expect(within(rows[i]).getByRole('heading', { name: course.place })).toBeInTheDocument()
      expect(within(rows[i]).getByText(course.period)).toBeInTheDocument()
      expect(within(rows[i]).getByText(course.degree)).toBeInTheDocument()
    })
  })

  it('lists the certificates and the languages', () => {
    render(<Education />)
    const certificates = within(screen.getByRole('list', { name: 'Certificados' }))
    for (const certificate of CERTIFICATES) {
      expect(certificates.getByText(certificate.name)).toBeInTheDocument()
    }
    const languages = within(screen.getByRole('list', { name: 'Idiomas' }))
    expect(languages.getAllByRole('listitem')).toHaveLength(LANGUAGES.length)
  })
})
