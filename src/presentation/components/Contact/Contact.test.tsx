import { fireEvent, render, screen } from '@testing-library/react'
import { Contact } from './Contact'
import { EMAIL, formatFrequency, stationAt, STATIONS } from './contact'

const card = (artist: string, song: string) => ({
  ok: true,
  text: async () => `<div class="artist">${artist}</div><div class="song">${song}</div>`,
})

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
})
afterEach(() => vi.unstubAllGlobals())

const dial = () => screen.getByRole('slider', { name: 'Sintonizar canal de contato' })

describe('Contact', () => {
  it('anchors the section for the header navigation', () => {
    render(<Contact />)
    expect(screen.getByRole('region', { name: 'Fim.' })).toHaveAttribute('id', 'contato')
  })

  it('starts tuned to the e-mail and copies it on click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<Contact />)
    const link = screen.getByRole('link', { name: new RegExp(EMAIL) })
    expect(link).toHaveAttribute('href', `mailto:${EMAIL}`)
    fireEvent.click(link)
    expect(writeText).toHaveBeenCalledWith(EMAIL)
    expect(await screen.findByText('Copiado ✓')).toBeInTheDocument()
  })

  it('tunes every station and hisses in between', () => {
    render(<Contact />)
    for (const station of STATIONS.slice(1)) {
      fireEvent.change(dial(), { target: { value: String(station.frequency) } })
      expect(screen.getByRole('link', { name: new RegExp(station.text) })).toHaveAttribute(
        'href',
        station.url,
      )
    }
    fireEvent.change(dial(), { target: { value: '94.6' } })
    expect(screen.getByText(/Chiado · 94,6 FM/)).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('jumps from station to station with the arrow keys', () => {
    render(<Contact />)
    fireEvent.keyDown(dial(), { key: 'ArrowRight' })
    expect(
      screen.getByText(new RegExp(`${formatFrequency(STATIONS[1].frequency)} FM`)),
    ).toBeVisible()
    fireEvent.keyDown(dial(), { key: 'ArrowLeft' })
    expect(
      screen.getByText(new RegExp(`${formatFrequency(STATIONS[0].frequency)} FM`)),
    ).toBeVisible()
  })

  it('credits what is playing, or the last track heard', async () => {
    const fetchMock = vi.fn((url: string) =>
      Promise.resolve(url.includes('last-played') ? card('Drake', 'Jungle') : card('Offline', '—')),
    )
    vi.stubGlobal('fetch', fetchMock)
    render(<Contact />)
    expect(screen.getByText('Silêncio no momento.')).toBeInTheDocument()
    expect(await screen.findByText('Jungle — Drake')).toBeInTheDocument()
    expect(screen.getByText(/última que ouvi no Spotify/)).toBeInTheDocument()
  })
})

describe('stations', () => {
  it('only counts as tuned close to a station', () => {
    expect(stationAt(91.6)?.id).toBe('email')
    expect(stationAt(94.6)).toBeNull()
  })
})
