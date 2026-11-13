import { parseProfileCard } from './nowPlayingRepository'

const card = (artist: string, song: string) => `
  <svg xmlns="http://www.w3.org/2000/svg"><foreignObject>
    <div xmlns="http://www.w3.org/1999/xhtml" class="container"><div class="text-container">
      <div class="artist">${artist}</div>
      <div class="song-container">
        <div class="song scrolling">${song}</div>
        <div class="song scrolling" aria-hidden="true">${song}</div>
      </div>
    </div></div>
  </foreignObject></svg>`

describe('parseProfileCard', () => {
  it('reads the track and the artist out of the card', () => {
    expect(parseProfileCard(card('Radiohead', 'Weird Fishes / Arpeggi'))).toEqual({
      title: 'Weird Fishes / Arpeggi',
      artist: 'Radiohead',
    })
  })

  it('decodes escaped characters', () => {
    expect(parseProfileCard(card('Simon &amp; Garfunkel', 'The Boxer'))?.artist).toBe(
      'Simon & Garfunkel',
    )
  })

  it('reports silence when nothing is playing or the card is unreadable', () => {
    expect(parseProfileCard(card('Offline', 'Currently not playing on Spotify'))).toBeNull()
    expect(parseProfileCard('<html></html>')).toBeNull()
  })
})
