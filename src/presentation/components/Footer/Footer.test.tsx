import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('credits the current year and links back to the top', () => {
    render(<Footer />)
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} Davi Varella`))).toBeVisible()
    expect(screen.getByRole('link', { name: /topo/i })).toHaveAttribute('href', '#topo')
  })
})
