import { render, screen, within } from '@testing-library/react'
import { About } from './About'
import { INVENTORY, INVENTORY_SLOTS, spritePath } from './inventory'

describe('About', () => {
  it('lists every inventory item and fills the rest with free slots', () => {
    render(<About />)
    const slots = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(slots).toHaveLength(INVENTORY_SLOTS)
    expect(screen.getAllByText('Slot livre')).toHaveLength(INVENTORY_SLOTS - INVENTORY.length)
    expect(screen.getByText(`${INVENTORY.length}/∞ slots`)).toBeInTheDocument()
  })

  it('anchors the section for the header navigation', () => {
    render(<About />)
    expect(screen.getByRole('region', { name: /no inventário/ })).toHaveAttribute('id', 'sobre')
  })
})

describe('inventory', () => {
  it('keeps every sprite on a 12×12 grid', () => {
    for (const item of INVENTORY) {
      expect(item.sprite, item.id).toHaveLength(12)
      for (const row of item.sprite) expect(row, item.id).toMatch(/^[.#]{12}$/)
    }
  })

  it('turns each filled pixel into a 1×1 square', () => {
    expect(spritePath(['#.', '.#'])).toBe('M0 0h1v1h-1zM1 1h1v1h-1z')
  })
})
