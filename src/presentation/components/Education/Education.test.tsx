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

  it('lists every course with its dates, place and degree', () => {
    render(<Education />)
    const table = within(screen.getByRole('table', { name: 'Cursos' }))
    COURSES.forEach((course) => {
      const row = within(table.getByRole('heading', { name: course.degree }).closest('tr')!)
      expect(row.getByText(course.place)).toBeInTheDocument()
      expect(row.getByText(course.start)).toBeInTheDocument()
      expect(row.getByText(course.end, { exact: false })).toBeInTheDocument()
    })
  })

  it('lists the certificates and the languages', () => {
    render(<Education />)
    const certificates = within(screen.getByRole('list', { name: 'Certificados' }))
    for (const certificate of CERTIFICATES) {
      expect(certificates.getByText(certificate.name)).toBeInTheDocument()
    }
    for (const language of LANGUAGES) {
      expect(
        screen.getByText(
          (_, element) =>
            element?.tagName === 'DD' &&
            element.textContent === `${language.name} ${language.level}`,
        ),
      ).toBeInTheDocument()
    }
  })
})
