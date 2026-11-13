import { fireEvent, render, screen, within } from '@testing-library/react'
import { LAYOUTS, LOOSE_ID, PAPER_IDS, poseOf, type DeskView } from './desk'
import { PROJECTS } from './projects'
import { Works } from './Works'

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = (() => null) as never
})

const paperOf = (title: string) => screen.getByRole('button', { name: `${title} — abrir projeto` })

describe('Works', () => {
  it('anchors the section for the header navigation', () => {
    render(<Works />)
    expect(screen.getByRole('region', { name: /Trabalhos selecionados/ })).toHaveAttribute(
      'id',
      'trabalhos',
    )
  })

  it('lays every project on the desk as a paper', () => {
    render(<Works />)
    for (const project of PROJECTS) expect(paperOf(project.title)).toBeInTheDocument()
  })

  it('opens a project with its details and link, and closes on Escape', () => {
    render(<Works />)
    const [first] = PROJECTS
    fireEvent.click(paperOf(first.title))

    const detail = screen.getByRole('group', { name: first.title })
    expect(within(detail).getByText(first.description)).toBeInTheDocument()
    expect(within(detail).getByRole('link', { name: /Abrir projeto/ })).toHaveAttribute(
      'href',
      first.url,
    )

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByRole('group', { name: PROJECTS[1].title })).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(screen.getByRole('group', { name: first.title })).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('group', { name: first.title })).not.toBeInTheDocument()
  })

  it('walks through the projects in a loop', () => {
    render(<Works />)
    fireEvent.click(paperOf(PROJECTS[0].title))
    fireEvent.click(screen.getByRole('button', { name: /Anterior/ }))
    expect(screen.getByRole('group', { name: PROJECTS.at(-1)!.title })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Próximo/ }))
    expect(screen.getByRole('group', { name: PROJECTS[0].title })).toBeInTheDocument()
  })

  it('swipes between open projects on a narrow touch screen', () => {
    const width = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(390)
    render(<Works />)
    fireEvent.click(paperOf(PROJECTS[0].title))
    const stage = screen.getByRole('group', { name: PROJECTS[0].title }).parentElement!

    fireEvent.pointerDown(stage, { pointerType: 'touch', clientX: 300, clientY: 400 })
    fireEvent.pointerUp(stage, { pointerType: 'touch', clientX: 180, clientY: 410 })
    expect(screen.getByRole('group', { name: PROJECTS[1].title })).toBeInTheDocument()

    fireEvent.pointerDown(stage, { pointerType: 'touch', clientX: 180, clientY: 400 })
    fireEvent.pointerUp(stage, { pointerType: 'touch', clientX: 300, clientY: 395 })
    expect(screen.getByRole('group', { name: PROJECTS[0].title })).toBeInTheDocument()

    fireEvent.pointerDown(stage, { pointerType: 'touch', clientX: 200, clientY: 300 })
    fireEvent.pointerUp(stage, { pointerType: 'touch', clientX: 140, clientY: 520 })
    expect(screen.getByRole('group', { name: PROJECTS[0].title })).toBeInTheDocument()
    width.mockRestore()
  })

  it('sends a paper to the bottom of the pile when dragged away in any direction', () => {
    const width = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(390)
    render(<Works />)
    const top = paperOf(PROJECTS[0].title)
    const others = PROJECTS.slice(1).map((p) => paperOf(p.title))
    const z = (el: HTMLElement) => Number(el.style.zIndex)
    expect(others.every((el) => z(el) < z(top))).toBe(true)

    fireEvent.pointerDown(top, { button: 0, pointerType: 'touch', clientX: 200, clientY: 400 })
    fireEvent.pointerMove(top, { pointerType: 'touch', clientX: 205, clientY: 250 })
    fireEvent.pointerUp(top, { pointerType: 'touch', clientX: 205, clientY: 250 })

    expect(others.every((el) => z(el) > z(top))).toBe(true)
    width.mockRestore()
  })

  it('does not open a paper that was just dragged', () => {
    render(<Works />)
    const paper = paperOf(PROJECTS[0].title)
    fireEvent.pointerDown(paper, { button: 0, clientX: 100, clientY: 100 })
    fireEvent.pointerMove(paper, { clientX: 160, clientY: 130 })
    fireEvent.pointerUp(paper, { clientX: 160, clientY: 130 })
    fireEvent.click(paper)
    expect(screen.queryByRole('group', { name: PROJECTS[0].title })).not.toBeInTheDocument()
  })
})

describe('desk', () => {
  const view = (focus: string | null): DeskView => ({
    layout: 'desktop',
    boost: 1,
    arrived: true,
    width: LAYOUTS.desktop.width,
    positions: LAYOUTS.desktop.slots,
    focus,
    heights: {},
  })

  it('gives every paper a slot in both layouts', () => {
    for (const layout of Object.values(LAYOUTS)) {
      for (const id of PAPER_IDS) expect(layout.slots[id], id).toBeDefined()
      expect([...layout.order].sort()).toEqual([...PAPER_IDS].sort())
    }
  })

  it('can pose every paper in every state of both layouts', () => {
    for (const layout of ['desktop', 'mobile'] as const) {
      for (const arrived of [false, true]) {
        for (const focus of [null, PROJECTS[0].id]) {
          const current = { ...view(focus), layout, arrived, positions: LAYOUTS[layout].slots }
          for (const id of PAPER_IDS) {
            const pose = poseOf(id, current)
            expect(Object.values(pose).every(Number.isFinite), `${layout} ${id}`).toBe(true)
          }
        }
      }
    }
  })

  it('straightens the focused paper and pushes the others away', () => {
    const [first, second] = PROJECTS
    expect(poseOf(first.id, view(first.id))).toMatchObject({ x: 360, y: 560, rot: 0 })
    expect(LAYOUTS.desktop.exile).toContainEqual({
      x: poseOf(second.id, view(first.id)).x,
      y: poseOf(second.id, view(first.id)).y,
    })
    expect(poseOf(LOOSE_ID, view(null))).toMatchObject(LAYOUTS.desktop.slots[LOOSE_ID])
  })
})
