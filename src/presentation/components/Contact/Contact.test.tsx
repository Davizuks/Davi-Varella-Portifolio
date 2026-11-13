import { render, screen } from '@testing-library/react'
import { Contact } from './Contact'
import { EMAIL, SOCIALS } from './contact'

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = (() => null) as never
})

describe('Contact', () => {
  it('anchors the section for the header navigation', () => {
    render(<Contact />)
    expect(screen.getByRole('region', { name: /Vamos conversar/ })).toHaveAttribute('id', 'contato')
  })

  it('offers the e-mail and every social link', () => {
    render(<Contact />)
    expect(screen.getByRole('link', { name: new RegExp(EMAIL) })).toHaveAttribute(
      'href',
      `mailto:${EMAIL}`,
    )
    for (const social of SOCIALS) {
      expect(screen.getByRole('link', { name: new RegExp(social.label) })).toHaveAttribute(
        'href',
        social.url,
      )
    }
  })
})
